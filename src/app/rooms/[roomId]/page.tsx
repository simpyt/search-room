'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TogetherView } from '@/components/views/TogetherView';
import { MyView } from '@/components/views/MyView';
import { useRoom } from './layout';

export default function RoomPage() {
  const { room, user } = useRoom();
  const [activeTab, setActiveTab] = useState('together');

  if (!room || !user) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2 bg-slate-800/50">
          <TabsTrigger
            value="together"
            className="data-[state=active]:bg-sky-600 data-[state=active]:text-white"
          >
            Together
          </TabsTrigger>
          <TabsTrigger
            value="my-view"
            className="data-[state=active]:bg-sky-600 data-[state=active]:text-white"
          >
            My View ({user.name})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="together" className="mt-6">
          <TogetherView />
        </TabsContent>

        <TabsContent value="my-view" className="mt-6">
          <MyView />
        </TabsContent>
      </Tabs>
    </div>
  );
}

