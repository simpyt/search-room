import OpenAI from 'openai';
import type {
  SearchCriteria,
  CriteriaWeights,
  UserCriteria,
  CombinedCriteria,
  CompatibilitySnapshot,
  RoomContext,
} from '@/lib/types';

// Lazy-load OpenAI client to avoid errors during build
let openaiClient: OpenAI | null = null;

function getOpenAI(): OpenAI {
  if (!openaiClient) {
    openaiClient = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY || '',
    });
  }
  return openaiClient;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface AIContext {
  usersCriteria: Record<string, UserCriteria | null>;
  combinedCriteria: CombinedCriteria | null;
  compatibility: CompatibilitySnapshot | null;
  favoritesCount: number;
  userMessage: string;
  roomContext?: RoomContext;
  conversationHistory?: ChatMessage[];
}

export async function generateAIResponse(
  context: AIContext,
  userName: string
): Promise<string> {
  // Build room context section if available
  let roomContextSection = '';
  if (context.roomContext) {
    const rc = context.roomContext;
    const contextParts: string[] = [];
    if (rc.description) contextParts.push(`Search description: "${rc.description}"`);
    if (rc.familySize) contextParts.push(`Family size: ${rc.familySize} people`);
    if (rc.profession) contextParts.push(`Profession: ${rc.profession}`);
    if (rc.workLocation) contextParts.push(`Work location: ${rc.workLocation}`);
    if (rc.preferences?.length) contextParts.push(`Preferences: ${rc.preferences.join(', ')}`);
    if (contextParts.length > 0) {
      roomContextSection = `\nSearcher profile:\n${contextParts.join('\n')}`;
    }
  }

  const systemPrompt = `You are an AI Co-pilot for Search Room, a collaborative property search application. 
You help two partners (Pierre and Marie) find their perfect home together.

Your capabilities:
- Explain compatibility between their search criteria
- Suggest compromises when they disagree
- Summarize the current search status
- Answer questions about the property search process
- Be helpful, friendly, and concise

Current context:
- User asking: ${userName}
- Number of favorites saved: ${context.favoritesCount}
${context.compatibility ? `- Current compatibility: ${context.compatibility.scorePercent}% (${context.compatibility.level})` : '- Compatibility: Not yet calculated'}
${context.combinedCriteria ? `- Combined criteria set: Yes` : '- Combined criteria: Not yet set'}${roomContextSection}

Keep responses concise and helpful. If asked about specific criteria or compatibility details, provide clear explanations. Use the searcher profile information to provide more personalized and relevant suggestions.`;

  const userCriteriaInfo = Object.entries(context.usersCriteria)
    .map(([userId, crit]) => {
      if (!crit) return `${userId}: No criteria set`;
      const c = crit.criteria;
      return `${userId}: Location: ${c.location || 'Any'}, Price: ${c.priceFrom || 0}-${c.priceTo || 'Any'} CHF, Rooms: ${c.roomsFrom || 'Any'}-${c.roomsTo || 'Any'}`;
    })
    .join('\n');

  try {
    // Build messages array with conversation history
    const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
      { role: 'system', content: systemPrompt },
    ];

    // Add conversation history (if any)
    if (context.conversationHistory?.length) {
      messages.push(...context.conversationHistory);
    }

    // Add current user message with criteria context
    messages.push({
      role: 'user',
      content: `User criteria summary:\n${userCriteriaInfo}\n\nUser's question: ${context.userMessage}`,
    });

    const response = await getOpenAI().chat.completions.create({
      model: 'gpt-5-mini',
      messages,
      max_completion_tokens: 40000,
    });

    console.log('OpenAI response:', JSON.stringify(response.choices[0], null, 2));
    
    const message = response.choices[0]?.message;
    // Handle potential refusal
    if (message?.refusal) {
      return `I'm sorry, I cannot help with that request.`;
    }
    return message?.content || 'I apologize, I could not generate a response.';
  } catch (error) {
    console.error('OpenAI API error:', error);
    return 'I apologize, I encountered an error processing your request. Please try again.';
  }
}

export async function generateCriteriaFromPrompt(
  prompt: string,
  existingCriteria?: SearchCriteria
): Promise<{ criteria: SearchCriteria; weights: CriteriaWeights; explanation: string }> {
  const systemPrompt = `You are a helpful assistant that converts natural language property search descriptions into structured search criteria.

Available fields:
- location (string): City or area name
- radius (number): Search radius in km
- offerType: "buy" or "rent"
- category: "apartment", "house", "plot", "parking", "commercial"
- priceFrom, priceTo (number): Price range in CHF
- roomsFrom, roomsTo (number): Number of rooms (can be decimal like 3.5)
- livingSpaceFrom, livingSpaceTo (number): Living space in m²
- features (array): balcony, terrace, elevator, wheelchair_access, parking, garage, minergie, new_building, old_building, swimming_pool

For weights, use:
- 1 for "nice to have" / trivial preferences
- 2 for "nice to have" preferences
- 3 for "important" preferences  
- 4 for "very important" preferences
- 5 for "must have" / essential requirements

Respond with a JSON object containing:
{
  "criteria": { ... structured criteria ... },
  "weights": { ... field weights ... },
  "explanation": "Brief explanation of what was extracted"
}`;

  try {
    const response = await getOpenAI().chat.completions.create({
      model: 'gpt-5-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        {
          role: 'user',
          content: existingCriteria
            ? `Current criteria: ${JSON.stringify(existingCriteria)}\n\nUpdate with: ${prompt}`
            : prompt,
        },
      ],
      response_format: { type: 'json_object' },
      max_completion_tokens: 8000,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response from AI');
    }

    const result = JSON.parse(content);
    
    // Ensure offerType defaults to 'buy'
    if (!result.criteria.offerType) {
      result.criteria.offerType = 'buy';
    }

    return {
      criteria: result.criteria,
      weights: result.weights || {},
      explanation: result.explanation || 'Criteria extracted from your description.',
    };
  } catch (error) {
    console.error('OpenAI criteria generation error:', error);
    throw new Error('Failed to generate criteria from prompt');
  }
}

export type ExtractedContext = Omit<RoomContext, 'updatedAt' | 'updatedByUserId'>;

export async function generateCriteriaAndContextFromDescription(
  description: string
): Promise<{
  criteria: SearchCriteria;
  weights: CriteriaWeights;
  context: ExtractedContext;
  explanation: string;
}> {
  const systemPrompt = `You are a helpful assistant that analyzes a natural language description of someone's property search needs. You extract:
1. Structured search criteria for property search
2. Profile/context information about the searchers

Available criteria fields:
- location (string): City or area name
- radius (number): Search radius in km
- offerType: "buy" or "rent" (default to "buy" if not specified)
- category: "apartment", "house", "plot", "parking", "commercial"
- priceFrom, priceTo (number): Price range in CHF
- roomsFrom, roomsTo (number): Number of rooms (can be decimal like 3.5)
- livingSpaceFrom, livingSpaceTo (number): Living space in m²
- features (array): balcony, terrace, elevator, wheelchair_access, parking, garage, minergie, new_building, old_building, swimming_pool

For weights, use:
- 1 for "nice to have" / trivial preferences
- 2 for "nice to have" preferences
- 3 for "important" preferences  
- 4 for "very important" preferences
- 5 for "must have" / essential requirements

Profile/context fields to extract:
- familySize (number): Number of people in the household
- profession (string): Job/occupation mentioned
- workLocation (string): Workplace location if mentioned
- preferences (array of strings): Lifestyle preferences, hobbies, requirements (e.g., "quiet neighborhood", "near hiking trails", "good schools", "pet-friendly")

Respond with a JSON object containing:
{
  "criteria": { ... structured search criteria ... },
  "weights": { ... field weights ... },
  "context": {
    "description": "The original description provided",
    "familySize": number or null,
    "profession": "string or null",
    "workLocation": "string or null",
    "preferences": ["array", "of", "preferences"]
  },
  "explanation": "Brief summary of what was understood and extracted"
}`;

  try {
    const response = await getOpenAI().chat.completions.create({
      model: 'gpt-5-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: description },
      ],
      response_format: { type: 'json_object' },
      max_completion_tokens: 8000,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response from AI');
    }

    const result = JSON.parse(content);

    // Ensure offerType defaults to 'buy'
    if (!result.criteria.offerType) {
      result.criteria.offerType = 'buy';
    }

    // Build context with original description
    const context: ExtractedContext = {
      description,
      ...(result.context.familySize && { familySize: result.context.familySize }),
      ...(result.context.profession && { profession: result.context.profession }),
      ...(result.context.workLocation && { workLocation: result.context.workLocation }),
      ...(result.context.preferences?.length && { preferences: result.context.preferences }),
    };

    return {
      criteria: result.criteria,
      weights: result.weights || {},
      context,
      explanation: result.explanation || 'Information extracted from your description.',
    };
  } catch (error) {
    console.error('OpenAI context extraction error:', error);
    throw new Error('Failed to extract information from description');
  }
}

export async function computeCompatibility(
  criteriaA: UserCriteria,
  criteriaB: UserCriteria
): Promise<{ scorePercent: number; comment: string }> {
  const systemPrompt = `You are an assistant that analyzes compatibility between two property search criteria.

Compare the criteria and weights of two users and determine:
1. How well their requirements align (0-100%)
2. Where they agree and disagree

Consider:
- Location overlap
- Price range overlap
- Room requirements overlap
- Feature preferences
- Importance weights (1=trivial, 3=nice-to-have, 5=must-have)

Higher weights mean the criterion is more important to that user.
When users have conflicting must-haves, compatibility should be lower.
When they agree on must-haves but differ on nice-to-haves, compatibility can still be high.

Respond with JSON:
{
  "scorePercent": number (0-100),
  "comment": "Brief explanation of where they align and differ"
}`;

  try {
    const response = await getOpenAI().chat.completions.create({
      model: 'gpt-5-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        {
          role: 'user',
          content: `User A criteria: ${JSON.stringify(criteriaA.criteria)}\nUser A weights: ${JSON.stringify(criteriaA.weights)}\n\nUser B criteria: ${JSON.stringify(criteriaB.criteria)}\nUser B weights: ${JSON.stringify(criteriaB.weights)}`,
        },
      ],
      response_format: { type: 'json_object' },
      max_completion_tokens: 4000,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response from AI');
    }

    const result = JSON.parse(content);
    return {
      scorePercent: Math.max(0, Math.min(100, result.scorePercent || 50)),
      comment: result.comment || 'Compatibility analysis complete.',
    };
  } catch (error) {
    console.error('OpenAI compatibility error:', error);
    // Return a default response if AI fails
    return {
      scorePercent: 50,
      comment: 'Unable to compute detailed compatibility. Please try again.',
    };
  }
}

export async function suggestCompromise(
  criteriaA: UserCriteria,
  criteriaB: UserCriteria
): Promise<{ criteria: SearchCriteria; weights: CriteriaWeights; explanation: string }> {
  const systemPrompt = `You are an assistant that suggests compromise criteria between two property searchers.

Given two users' criteria and weights, suggest a compromise that:
1. Prioritizes must-haves (weight 5) from both users
2. Tries to include nice-to-haves (weight 3) when possible
3. Relaxes constraints where users strongly disagree
4. Proposes a middle ground for numerical ranges

Focus on finding solutions that both users can accept, even if not perfect for either.

Respond with JSON:
{
  "criteria": { ... compromise criteria ... },
  "weights": { ... suggested weights based on shared importance ... },
  "explanation": "Explanation of the compromise and trade-offs made"
}`;

  try {
    const response = await getOpenAI().chat.completions.create({
      model: 'gpt-5-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        {
          role: 'user',
          content: `User A criteria: ${JSON.stringify(criteriaA.criteria)}\nUser A weights: ${JSON.stringify(criteriaA.weights)}\n\nUser B criteria: ${JSON.stringify(criteriaB.criteria)}\nUser B weights: ${JSON.stringify(criteriaB.weights)}`,
        },
      ],
      response_format: { type: 'json_object' },
      max_completion_tokens: 8000,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response from AI');
    }

    const result = JSON.parse(content);
    
    // Ensure offerType
    if (!result.criteria.offerType) {
      result.criteria.offerType = criteriaA.criteria.offerType || 'buy';
    }

    return {
      criteria: result.criteria,
      weights: result.weights || {},
      explanation: result.explanation || 'Compromise criteria suggested.',
    };
  } catch (error) {
    console.error('OpenAI compromise error:', error);
    throw new Error('Failed to generate compromise suggestion');
  }
}

