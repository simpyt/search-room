'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { CriteriaForm } from '@/components/criteria';
import type { SearchCriteria, CriteriaWeights } from '@/lib/types';
import { toast } from 'sonner';

export default function NewRoomPage() {
  const router = useRouter();
  const [roomName, setRoomName] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'name' | 'criteria'>('name');

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
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || 'Failed to create room');
        return;
      }

      toast.success('Room created successfully!');
      router.push(`/rooms/${data.room.roomId}`);
    } catch (error) {
      toast.error('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
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
        </div>

        {step === 'name' ? (
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
                  setStep('criteria');
                }}
                className="w-full bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700"
              >
                Continue to Search Criteria
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-slate-700/50 bg-slate-900/80 backdrop-blur-xl shadow-2xl">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-white">Initial Search Criteria</CardTitle>
                  <CardDescription className="text-slate-400">
                    Set your starting preferences (you can adjust later)
                  </CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setStep('name')}
                  className="text-slate-400 hover:text-white"
                >
                  ← Back
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <CriteriaForm
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

