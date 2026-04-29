import React, { useEffect, useState } from 'react';
import { 
  LiveKitRoom, 
  RoomAudioRenderer, 
  VoiceAssistantControlBar,
  BarVisualizer,
  useVoiceAssistant
} from '@livekit/components-react';
import '@livekit/components-styles';
import { fetchSessionEvents } from '../lib/api';
import type { ConversationEvent } from '../lib/api';
import { Activity, TerminalSquare, UserRound, PhoneOff } from 'lucide-react';

interface ActiveCallProps {
  livekitUrl: string;
  token: string;
  sessionId: string;
  onEndCall: () => void;
}

// Separate component for the assistant visualization to use LiveKit hooks
const AgentVisualizer = () => {
  const { state, audioTrack } = useVoiceAssistant();
  
  return (
    <div className="flex flex-col items-center justify-center h-full space-y-8">
      {/* Avatar Placeholder Area */}
      <div className="relative">
        <div className={`w-48 h-48 rounded-full bg-primary/10 border-4 border-primary/20 flex items-center justify-center transition-all duration-300 ${
          state === 'speaking' ? 'shadow-[0_0_50px_rgba(15,118,110,0.5)] scale-105' : 'shadow-none scale-100'
        }`}>
          <UserRound size={80} className="text-primary/50" />
        </div>
        {/* Placeholder label for Tavus/Beyond Presence integration */}
        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-surface border border-border px-4 py-1 rounded-full shadow-sm text-xs text-muted whitespace-nowrap">
          Avatar Integration Ready
        </div>
      </div>

      <div className="flex flex-col items-center space-y-4">
        <h2 className="text-2xl font-semibold text-foreground">Front-Desk Agent</h2>
        <div className="flex items-center space-x-2 text-sm">
          <div className={`w-2 h-2 rounded-full ${
            state === 'listening' ? 'bg-green-500' :
            state === 'speaking' ? 'bg-blue-500 animate-pulse' :
            state === 'thinking' ? 'bg-yellow-500' : 'bg-gray-500'
          }`} />
          <span className="text-muted capitalize">Status: {state || 'connecting...'}</span>
        </div>
        
        {/* Audio Visualizer */}
        <div className="h-24 w-64 flex items-center justify-center bg-background rounded-xl border border-border p-4">
          {audioTrack ? (
            <BarVisualizer state={state} trackRef={audioTrack} className="w-full h-full" />
          ) : (
            <span className="text-xs text-muted">Waiting for audio track...</span>
          )}
        </div>
      </div>
    </div>
  );
};

export const ActiveCall: React.FC<ActiveCallProps> = ({ livekitUrl, token, sessionId, onEndCall }) => {
  const [events, setEvents] = useState<ConversationEvent[]>([]);

  // Polling for tool events
  useEffect(() => {
    let mounted = true;
    const pollEvents = async () => {
      try {
        const fetchedEvents = await fetchSessionEvents(sessionId);
        if (mounted) {
          // Filter for tool events
          const toolEvents = fetchedEvents.filter(
            e => e.event_type === 'TOOL_STARTED' || e.event_type === 'TOOL_SUCCEEDED'
          );
          setEvents(toolEvents);
        }
      } catch (error) {
        console.error("Error fetching events:", error);
      }
    };

    pollEvents(); // Initial fetch
    const intervalId = setInterval(pollEvents, 1500); // Poll every 1.5s

    return () => {
      mounted = false;
      clearInterval(intervalId);
    };
  }, [sessionId]);

  return (
    <div className="h-screen w-full bg-background flex flex-col md:flex-row overflow-hidden">
      
      {/* LiveKit Provider & Main Content */}
      <div className="flex-1 h-full relative">
        <LiveKitRoom
          serverUrl={livekitUrl}
          token={token}
          connect={true}
          audio={true}
          video={false}
          className="h-full flex flex-col"
          onDisconnected={onEndCall}
        >
          <div className="flex-1 p-8">
            <AgentVisualizer />
          </div>
          
          <div className="p-6 bg-surface border-t border-border flex justify-center pb-8">
            <VoiceAssistantControlBar controls={{ leave: false }} />
            <button 
              onClick={onEndCall}
              className="ml-4 flex items-center space-x-2 bg-red-50 hover:bg-red-100 text-red-600 px-6 py-2 rounded-xl transition-colors border border-red-200"
            >
              <PhoneOff size={20} />
              <span className="font-medium">End Call</span>
            </button>
          </div>
          <RoomAudioRenderer />
        </LiveKitRoom>
      </div>

      {/* Side Panel for Tool Events Logging */}
      <div className="w-full md:w-96 border-l border-border bg-surface h-full flex flex-col shadow-[-10px_0_30px_rgba(0,0,0,0.02)] z-10">
        <div className="p-6 border-b border-border bg-background/50">
          <div className="flex items-center space-x-3 text-foreground">
            <TerminalSquare size={24} className="text-primary" />
            <h3 className="font-semibold text-lg">Agent Actions</h3>
          </div>
          <p className="text-sm text-muted mt-1">Live system actions and tool calls</p>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {events.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-muted opacity-50 space-y-3">
              <Activity size={32} />
              <p className="text-sm">Waiting for agent actions...</p>
            </div>
          ) : (
            events.map((event, idx) => {
              const isSuccess = event.event_type === 'TOOL_SUCCEEDED';
              return (
                <div 
                  key={event.id || idx} 
                  className={`p-4 rounded-xl border text-sm animate-in slide-in-from-right-4 fade-in duration-300 ${
                    isSuccess 
                      ? 'bg-green-50/50 border-green-200' 
                      : 'bg-blue-50/50 border-blue-200'
                  }`}
                >
                  <div className="flex items-center space-x-2 mb-2">
                    <div className={`w-2 h-2 rounded-full ${isSuccess ? 'bg-green-500' : 'bg-blue-500 animate-pulse'}`} />
                    <span className={`font-medium ${isSuccess ? 'text-green-700' : 'text-blue-700'}`}>
                      {event.event_name}
                    </span>
                  </div>
                  
                  <div className="bg-white/60 rounded-lg p-2 overflow-x-auto text-xs text-slate-600 border border-black/5 font-mono">
                    <pre>{JSON.stringify(event.payload_json, null, 2)}</pre>
                  </div>
                  
                  <div className="mt-2 text-[10px] text-muted flex justify-end">
                    {new Date(event.created_at).toLocaleTimeString()}
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  );
};
