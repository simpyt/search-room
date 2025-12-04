'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { CriteriaForm } from '@/components/criteria';
import type { SearchCriteria, CriteriaWeights, RoomContext } from '@/lib/types';
import { toast } from 'sonner';

type Step = 'name' | 'context' | 'criteria';

const CONTEXT_PLACEHOLDER = `e.g., We are a family of 4 looking for a quiet place near Fribourg. I work in Bulle and need good public transport access. We enjoy hiking and want outdoor space for the kids.`;

export default function NewRoomPage() {
  const router = useRouter();
  const [roomName, setRoomName] = useState('');
  const [contextDescription, setContextDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [step, setStep] = useState<Step>('name');
  
  // Prefilled criteria from AI
  const [prefilledCriteria, setPrefilledCriteria] = useState<SearchCriteria | undefined>();
  const [prefilledWeights, setPrefilledWeights] = useState<CriteriaWeights | undefined>();
  const [extractedContext, setExtractedContext] = useState<Omit<RoomContext, 'updatedAt' | 'updatedByUserId'> | undefined>();
  // Key to force CriteriaForm remount when prefilling
  const [criteriaFormKey, setCriteriaFormKey] = useState(0);

  const handleContextContinue = async () => {
    if (!contextDescription.trim()) {
      // Skip to criteria without AI prefill
      setStep('criteria');
      return;
    }

    setAiLoading(true);
    try {
      const res = await fetch('/api/rooms/context-extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: contextDescription }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || 'Failed to analyze description');
        // Still proceed to criteria, just without prefill
        setStep('criteria');
        return;
      }

      // Set prefilled values
      setPrefilledCriteria(data.criteria);
      setPrefilledWeights(data.weights);
      setExtractedContext(data.context);
      setCriteriaFormKey((k) => k + 1); // Force form remount
      
      toast.success('Criteria prefilled from your description!');
      setStep('criteria');
    } catch {
      toast.error('An unexpected error occurred');
      setStep('criteria');
    } finally {
      setAiLoading(false);
    }
  };

  const handleCreateRoom = async (
    criteria: SearchCriteria,
    weights: CriteriaWeights
  ) => {
    if (!roomName.trim()) {
      toast.error('Please enter a room name');
      setStep('name');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: roomName,
          searchType: criteria.offerType,
          criteria,
          weights,
          context: extractedContext,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || 'Failed to create room');
        return;
      }

      toast.success('Room created successfully!');
      router.push(`/rooms/${data.room.roomId}`);
    } catch {
      toast.error('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const goBack = () => {
    if (step === 'context') setStep('name');
    else if (step === 'criteria') setStep('context');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-sky-900/20 via-transparent to-transparent" />

      <div className="relative container max-w-2xl mx-auto py-12 px-4">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 to-indigo-600 shadow-lg shadow-sky-500/25">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-8 w-8 text-white"
            >
              <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white">Create Search Room</h1>
          <p className="mt-2 text-slate-400">
            Start your collaborative property search
          </p>
          
          {/* Step indicator */}
          <div className="flex justify-center gap-2 mt-6">
            {(['name', 'context', 'criteria'] as const).map((s, i) => (
              <div
                key={s}
                className={`h-2 w-8 rounded-full transition-colors ${
                  step === s
                    ? 'bg-sky-500'
                    : ['name', 'context', 'criteria'].indexOf(step) > i
                    ? 'bg-sky-700'
                    : 'bg-slate-700'
                }`}
              />
            ))}
          </div>
        </div>

        {step === 'name' && (
          <Card className="border-slate-700/50 bg-slate-900/80 backdrop-blur-xl shadow-2xl">
            <CardHeader>
              <CardTitle className="text-white">Name Your Room</CardTitle>
              <CardDescription className="text-slate-400">
                Give your search room a memorable name
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="roomName" className="text-slate-300">
                  Room Name
                </Label>
                <Input
                  id="roomName"
                  placeholder="e.g., Our Dream Home in Fribourg"
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                  className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500"
                  autoFocus
                />
              </div>
              <Button
                onClick={() => {
                  if (!roomName.trim()) {
                    toast.error('Please enter a room name');
                    return;
                  }
                  setStep('context');
                }}
                className="w-full bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700"
              >
                Continue
              </Button>
            </CardContent>
          </Card>
        )}

        {step === 'context' && (
          <Card className="border-slate-700/50 bg-slate-900/80 backdrop-blur-xl shadow-2xl">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-white">Tell Us About Your Search</CardTitle>
                  <CardDescription className="text-slate-400">
                    Describe your situation in your own words — we&apos;ll use AI to set up your initial criteria
                  </CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={goBack}
                  className="text-slate-400 hover:text-white"
                >
                  ← Back
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="contextDescription" className="text-slate-300">
                  Your Situation
                </Label>
                <Textarea
                  id="contextDescription"
                  placeholder={CONTEXT_PLACEHOLDER}
                  value={contextDescription}
                  onChange={(e) => setContextDescription(e.target.value)}
                  className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 min-h-[150px] resize-none"
                  autoFocus
                />
                <p className="text-xs text-slate-500">
                  Include details like: family size, work location, commute needs, lifestyle preferences, budget range, must-haves
                </p>
              </div>
              
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setStep('criteria')}
                  disabled={aiLoading}
                  className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-white"
                >
                  Skip
                </Button>
                <Button
                  onClick={handleContextContinue}
                  disabled={aiLoading}
                  className="flex-1 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700"
                >
                  {aiLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Analyzing...
                    </>
                  ) : (
                    'Continue'
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 'criteria' && (
          <Card className="border-slate-700/50 bg-slate-900/80 backdrop-blur-xl shadow-2xl">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-white">Initial Search Criteria</CardTitle>
                  <CardDescription className="text-slate-400">
                    {prefilledCriteria
                      ? 'We prefilled these based on your description — adjust as needed'
                      : 'Set your starting preferences (you can adjust later)'}
                  </CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={goBack}
                  className="text-slate-400 hover:text-white"
                >
                  ← Back
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <CriteriaForm
                key={criteriaFormKey}
                initialCriteria={prefilledCriteria}
                initialWeights={prefilledWeights}
                onSubmit={handleCreateRoom}
                submitLabel="Create Search Room"
                loading={loading}
              />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
