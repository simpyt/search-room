'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { isHomegateTheme } from '@/lib/theme';
import {
  QUIZ_QUESTIONS,
  QUIZ_TRAITS,
  CATEGORY_INFO,
  type QuizQuestion,
  type QuizOption,
} from './quizData';

interface CompatibilityQuizProps {
  onClose?: () => void;
  onOpenFullPage?: () => void;
  isFullPage?: boolean;
}

interface TraitScore {
  trait: string;
  score: number;
  maxScore: number;
  percentage: number;
}

export default function CompatibilityQuiz({
  onClose,
  onOpenFullPage,
  isFullPage = false,
}: CompatibilityQuizProps) {
  const hg = isHomegateTheme();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showResults, setShowResults] = useState(false);

  const currentQuestion = QUIZ_QUESTIONS[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / QUIZ_QUESTIONS.length) * 100;
  const isLastQuestion = currentQuestionIndex === QUIZ_QUESTIONS.length - 1;

  const handleAnswer = (question: QuizQuestion, option: QuizOption) => {
    setAnswers((prev) => ({ ...prev, [question.id]: option.id }));

    if (isLastQuestion) {
      setShowResults(true);
    } else {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  const handleRestart = () => {
    setAnswers({});
    setCurrentQuestionIndex(0);
    setShowResults(false);
  };

  // Calculate trait scores from answers
  const traitScores = useMemo((): TraitScore[] => {
    const scores: Record<string, { total: number; count: number }> = {};

    // Initialize scores
    QUIZ_TRAITS.forEach((t) => {
      scores[t.trait] = { total: 0, count: 0 };
    });

    // Accumulate scores from answers
    Object.entries(answers).forEach(([questionId, optionId]) => {
      const question = QUIZ_QUESTIONS.find((q) => q.id === questionId);
      const option = question?.options.find((o) => o.id === optionId);

      if (option) {
        Object.entries(option.traits).forEach(([trait, value]) => {
          if (scores[trait]) {
            scores[trait].total += value;
            scores[trait].count += 1;
          }
        });
      }
    });

    // Convert to percentages
    return QUIZ_TRAITS.map((t) => {
      const s = scores[t.trait];
      const avgScore = s.count > 0 ? s.total / s.count : 5;
      return {
        trait: t.trait,
        score: avgScore,
        maxScore: 10,
        percentage: (avgScore / 10) * 100,
      };
    });
  }, [answers]);

  const getTraitInsight = (trait: string, percentage: number): string => {
    const insights: Record<string, { low: string; mid: string; high: string }> = {
      schedule: {
        low: "You're a night owl who thrives when the world sleeps. Look for roommates with similar nocturnal tendencies.",
        mid: 'You have a flexible schedule that can adapt to different routines. This makes you compatible with many people!',
        high: "Early bird gets the worm! You value morning productivity. Find someone who won't disturb your beauty sleep.",
      },
      tidiness: {
        low: "You believe lived-in spaces have character. Make sure your roommate shares this... relaxed approach.",
        mid: "You're balanced about cleanliness - not obsessive, not chaotic. Most people can work with that!",
        high: 'Cleanliness is next to godliness for you. Be upfront about expectations to avoid future friction.',
      },
      social: {
        low: 'Home is your sanctuary from social demands. Look for someone who respects quiet time and personal space.',
        mid: 'You enjoy occasional social activities but also value downtime. A flexible roommate would be ideal.',
        high: "You love having people over and creating memories at home. Find someone who's equally social!",
      },
      independence: {
        low: 'You enjoy spending time with your roommate and doing things together. Community living at its finest!',
        mid: "You balance togetherness with alone time well. You're adaptable to different roommate styles.",
        high: 'Your room is your kingdom. Clear boundaries and personal space are essential for your wellbeing.',
      },
      communication: {
        low: 'You tend to avoid confrontation. Consider finding a roommate who naturally picks up on non-verbal cues.',
        mid: 'You communicate when needed but prefer keeping things chill. Balance is good!',
        high: "You tackle issues head-on with clear communication. This is a superpower in shared living!",
      },
    };

    const insight = insights[trait];
    if (!insight) return '';

    if (percentage < 35) return insight.low;
    if (percentage > 65) return insight.high;
    return insight.mid;
  };

  if (showResults) {
    return (
      <div className={`${isFullPage ? 'max-w-2xl mx-auto' : ''}`}>
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🎯</span>
              <span
                className={`text-sm font-medium px-2 py-1 rounded-full ${
                  hg ? 'bg-pink-100 text-pink-700' : 'bg-pink-500/20 text-pink-400'
                }`}
              >
                Quiz Results
              </span>
            </div>
            {!isFullPage && (onOpenFullPage || onClose) && (
              <div className="flex items-center gap-2">
                {onOpenFullPage && (
                  <Button
                    onClick={onOpenFullPage}
                    variant="outline"
                    size="sm"
                    className={
                      hg
                        ? 'border-gray-300 text-gray-700 hover:bg-gray-100'
                        : 'border-slate-600 text-slate-300 hover:bg-slate-800'
                    }
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-4 w-4 mr-1.5"
                    >
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                      <polyline points="15 3 21 3 21 9" />
                      <line x1="10" x2="21" y1="14" y2="3" />
                    </svg>
                    Open Full Page
                  </Button>
                )}
                {onClose && (
                  <Button
                    onClick={onClose}
                    variant="outline"
                    size="sm"
                    className={
                      hg
                        ? 'border-gray-300 text-gray-700 hover:bg-gray-100'
                        : 'border-slate-600 text-slate-300 hover:bg-slate-800'
                    }
                  >
                    Close
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-4 w-4 ml-1"
                    >
                      <line x1="18" x2="6" y1="6" y2="18" />
                      <line x1="6" x2="18" y1="6" y2="18" />
                    </svg>
                  </Button>
                )}
              </div>
            )}
          </div>
          <h2
            className={`text-2xl font-bold mb-2 ${
              hg ? 'text-gray-900' : 'text-white'
            }`}
          >
            Your Roommate Profile
          </h2>
          <p className={hg ? 'text-gray-600' : 'text-slate-400'}>
            Here&apos;s what makes you tick as a roommate
          </p>
        </div>

        {/* Trait Results */}
        <div className="space-y-6 mb-8">
          {QUIZ_TRAITS.map((traitInfo) => {
            const score = traitScores.find((s) => s.trait === traitInfo.trait);
            if (!score) return null;

            return (
              <div key={traitInfo.trait}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{traitInfo.icon}</span>
                    <span
                      className={`font-medium ${
                        hg ? 'text-gray-900' : 'text-white'
                      }`}
                    >
                      {traitInfo.label}
                    </span>
                  </div>
                  <span
                    className={`text-sm ${
                      hg ? 'text-gray-500' : 'text-slate-400'
                    }`}
                  >
                    {Math.round(score.percentage)}%
                  </span>
                </div>

                {/* Progress bar with labels */}
                <div className="relative">
                  <div className="flex justify-between text-xs mb-1">
                    <span className={hg ? 'text-gray-400' : 'text-slate-500'}>
                      {traitInfo.lowLabel}
                    </span>
                    <span className={hg ? 'text-gray-400' : 'text-slate-500'}>
                      {traitInfo.highLabel}
                    </span>
                  </div>
                  <div
                    className={`h-3 rounded-full ${
                      hg ? 'bg-gray-200' : 'bg-slate-700'
                    }`}
                  >
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        hg
                          ? 'bg-gradient-to-r from-[#e5007d] to-[#ff6b9d]'
                          : 'bg-gradient-to-r from-sky-500 to-indigo-500'
                      }`}
                      style={{ width: `${score.percentage}%` }}
                    />
                  </div>
                </div>

                {/* Insight */}
                <p
                  className={`text-sm mt-2 ${
                    hg ? 'text-gray-600' : 'text-slate-400'
                  }`}
                >
                  {getTraitInsight(traitInfo.trait, score.percentage)}
                </p>
              </div>
            );
          })}
        </div>

        {/* Summary Card */}
        <Card
          className={`mb-6 ${
            hg
              ? 'bg-gradient-to-br from-[#fff0f7] to-white border-[#e5007d]/20'
              : 'bg-gradient-to-br from-sky-900/20 to-slate-900 border-sky-500/20'
          }`}
        >
          <CardContent className="pt-6">
            <h3
              className={`font-semibold mb-2 ${
                hg ? 'text-gray-900' : 'text-white'
              }`}
            >
              💡 Pro Tips for Your Next Roommate Search
            </h3>
            <ul
              className={`space-y-2 text-sm ${
                hg ? 'text-gray-600' : 'text-slate-300'
              }`}
            >
              <li>• Share this quiz with potential roommates to compare results</li>
              <li>• Discuss your biggest differences upfront before moving in</li>
              <li>• Create a roommate agreement covering your key concerns</li>
              <li>• Remember: some differences can complement each other!</li>
            </ul>
          </CardContent>
        </Card>

        {/* Action buttons */}
        <div className="flex flex-wrap gap-3">
          <Button
            onClick={handleRestart}
            variant="outline"
            className={
              hg
                ? 'border-gray-300 text-gray-700 hover:bg-gray-100'
                : 'border-slate-600 text-slate-300 hover:bg-slate-800'
            }
          >
            Take Quiz Again
          </Button>
        </div>
      </div>
    );
  }

  const categoryInfo = CATEGORY_INFO[currentQuestion.category];

  return (
    <div className={`${isFullPage ? 'max-w-2xl mx-auto' : ''}`}>
      {/* Header with buttons */}
      {!isFullPage && (onOpenFullPage || onClose) && (
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🎯</span>
            <span
              className={`text-sm font-medium px-2 py-1 rounded-full ${
                hg ? 'bg-pink-100 text-pink-700' : 'bg-pink-500/20 text-pink-400'
              }`}
            >
              Quiz
            </span>
          </div>
          <div className="flex items-center gap-2">
            {onOpenFullPage && (
              <Button
                onClick={onOpenFullPage}
                variant="outline"
                size="sm"
                className={
                  hg
                    ? 'border-gray-300 text-gray-700 hover:bg-gray-100'
                    : 'border-slate-600 text-slate-300 hover:bg-slate-800'
                }
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4 mr-1.5"
                >
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                  <polyline points="15 3 21 3 21 9" />
                  <line x1="10" x2="21" y1="14" y2="3" />
                </svg>
                Open Full Page
              </Button>
            )}
            {onClose && (
              <Button
                onClick={onClose}
                variant="outline"
                size="sm"
                className={
                  hg
                    ? 'border-gray-300 text-gray-700 hover:bg-gray-100'
                    : 'border-slate-600 text-slate-300 hover:bg-slate-800'
                }
              >
                Close
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4 ml-1"
                >
                  <line x1="18" x2="6" y1="6" y2="18" />
                  <line x1="6" x2="18" y1="6" y2="18" />
                </svg>
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Progress header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-lg">{categoryInfo.icon}</span>
            <span
              className={`text-sm font-medium ${
                hg ? 'text-gray-500' : 'text-slate-400'
              }`}
            >
              {categoryInfo.label}
            </span>
          </div>
          <span
            className={`text-sm ${hg ? 'text-gray-500' : 'text-slate-400'}`}
          >
            {currentQuestionIndex + 1} of {QUIZ_QUESTIONS.length}
          </span>
        </div>
        <div className={`h-2 rounded-full ${hg ? 'bg-gray-200' : 'bg-slate-700'}`}>
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              hg
                ? 'bg-gradient-to-r from-[#e5007d] to-[#ff6b9d]'
                : 'bg-gradient-to-r from-sky-500 to-indigo-500'
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Question */}
      <div className="mb-8">
        <h2
          className={`text-xl md:text-2xl font-bold mb-2 ${
            hg ? 'text-gray-900' : 'text-white'
          }`}
        >
          {currentQuestion.question}
        </h2>
        {currentQuestion.subtitle && (
          <p className={`text-sm ${hg ? 'text-gray-500' : 'text-slate-400'}`}>
            {currentQuestion.subtitle}
          </p>
        )}
      </div>

      {/* Options */}
      <div className="space-y-3 mb-6">
        {currentQuestion.options.map((option) => {
          const isSelected = answers[currentQuestion.id] === option.id;

          return (
            <button
              key={option.id}
              onClick={() => handleAnswer(currentQuestion, option)}
              className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                isSelected
                  ? hg
                    ? 'border-[#e5007d] bg-[#fff0f7]'
                    : 'border-sky-500 bg-sky-500/10'
                  : hg
                  ? 'border-gray-200 bg-white hover:border-[#e5007d]/50 hover:bg-gray-50'
                  : 'border-slate-700 bg-slate-800/50 hover:border-sky-500/50 hover:bg-slate-800'
              }`}
            >
              <span
                className={`${
                  isSelected
                    ? hg
                      ? 'text-gray-900'
                      : 'text-white'
                    : hg
                    ? 'text-gray-700'
                    : 'text-slate-200'
                }`}
              >
                {option.text}
              </span>
            </button>
          );
        })}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          onClick={handleBack}
          variant="ghost"
          disabled={currentQuestionIndex === 0}
          className={
            hg
              ? 'text-gray-500 hover:text-gray-700 disabled:opacity-50'
              : 'text-slate-400 hover:text-white disabled:opacity-50'
          }
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4 w-4 mr-2"
          >
            <path d="m15 18-6-6 6-6" />
          </svg>
          Back
        </Button>

        <div className="flex gap-2">
          {!isFullPage && onOpenFullPage && (
            <Button
              onClick={onOpenFullPage}
              variant="outline"
              size="sm"
              className={
                hg
                  ? 'border-gray-300 text-gray-600 hover:bg-gray-100'
                  : 'border-slate-600 text-slate-400 hover:bg-slate-800'
              }
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4"
              >
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" x2="21" y1="14" y2="3" />
              </svg>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
