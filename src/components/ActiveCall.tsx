import React, { useEffect, useRef, useState } from 'react';
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

// Human-readable labels for tool events
const TOOL_LABELS: Record<string, { started: string; succeeded: string }> = {
  identify_user:        { started: '🔍 Identifying user...', succeeded: '👤 User identified ✅' },
  fetch_slots:          { started: '📅 Fetching available slots...', succeeded: '📅 Slots fetched ✅' },
  book_appointment:     { started: '📝 Booking appointment...', succeeded: '🎉 Booking confirmed ✅' },
  retrieve_appointments:{ started: '📋 Retrieving appointments...', succeeded: '📋 Appointments retrieved ✅' },
  cancel_appointment:   { started: '❌ Cancelling appointment...', succeeded: '❌ Appointment cancelled ✅' },
  modify_appointment:   { started: '✏️ Modifying appointment...', succeeded: '✏️ Appointment modified ✅' },
  end_conversation:     { started: '🔚 Ending conversation...', succeeded: '✅ Conversation ended' },
};

const getToolLabel = (eventName: string | null, eventType: string): string => {
  if (!eventName) return eventType;
  const labels = TOOL_LABELS[eventName];
  if (!labels) return eventName;
  return eventType === 'tool_started' ? labels.started : labels.succeeded;
};

// Inner component using LiveKit hooks
const AgentVisualizer = () => {
  const { state, audioTrack } = useVoiceAssistant();
  
  return (
    <div className="flex flex-col items-center justify-center h-full space-y-8">
      <div className="relative">
        <div className={`w-48 h-48 rounded-full bg-primary/10 border-4 border-primary/20 flex items-center justify-center transition-all duration-300 ${
          state === 'speaking' ? 'shadow-[0_0_50px_rgba(15,118,110,0.5)] scale-105' : 'shadow-none scale-100'
        }`}>
          <UserRound size={80} className="text-primary/50" />
        </div>
        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-surface border border-border px-4 py-1 rounded-full shadow-sm text-xs text-muted whitespace-nowrap">
          Avatar Integration Ready
        </div>
      </div>

      <div className="flex flex-col items-center space-y-4">
        <h2 className="text-2xl font-semibold text-foreground">Front-Desk Agent</h2>
        <div className="flex items-center space-x-2 text-sm">
          <div className={`w-2 h-2 rounded-full ${
            state === 'listening' ? 'bg-green-500' :
            state === 'speaking'  ? 'bg-blue-500 animate-pulse' :
            state === 'thinking'  ? 'bg-yellow-500' : 'bg-gray-500'
          }`} />
          <span className="text-muted capitalize">Status: {state || 'connecting...'}</span>
        </div>
        
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
  const endingRef = useRef(false); // guard against double-trigger

  useEffect(() => {
    let mounted = true;

    const pollEvents = async () => {
      try {
        const fetched = await fetchSessionEvents(sessionId);
        if (!mounted) return;

        // Fix: backend uses lowercase event_type values (StrEnum)
        const toolEvents = fetched.filter(
          e => e.event_type === 'tool_started' || e.event_type === 'tool_succeeded'
        );
        setEvents(toolEvents);

        // Auto-detect when agent calls end_conversation
        const conversationEnded = fetched.some(
          e => e.event_type === 'tool_succeeded' && e.event_name === 'end_conversation'
        );
        if (conversationEnded && !endingRef.current) {
          endingRef.current = true;
          // Small delay so user can see the final event before navigating
          setTimeout(onEndCall, 1500);
        }
      } catch (error) {
        console.error('Error fetching events:', error);
      }
    };

    pollEvents();
    const intervalId = setInterval(pollEvents, 1500);
    return () => {
      mounted = false;
      clearInterval(intervalId);
    };
  }, [sessionId, onEndCall]);

  const handleManualEnd = () => {
    if (endingRef.current) return; // already ending
    endingRef.current = true;
    onEndCall();
  };

  // Only fire onEndCall for a true LOCAL disconnect, not agent-side disconnects
  const handleDisconnected = () => {
    if (!endingRef.current) {
      endingRef.current = true;
      onEndCall();
    }
  };

  return (
    <div className="h-screen w-full bg-background flex flex-col md:flex-row overflow-hidden">
      
      {/* LiveKit Room & Avatar */}
      <div className="flex-1 h-full relative">
        <LiveKitRoom
          serverUrl={livekitUrl}
          token={token}
          connect={true}
          audio={true}
          video={false}
          className="h-full flex flex-col"
          onDisconnected={handleDisconnected}
        >
          <div className="flex-1 p-8">
            <AgentVisualizer />
          </div>
          
          <div className="p-6 bg-surface border-t border-border flex justify-center pb-8">
            <VoiceAssistantControlBar controls={{ leave: false }} />
            <button 
              onClick={handleManualEnd}
              className="ml-4 flex items-center space-x-2 bg-red-50 hover:bg-red-100 text-red-600 px-6 py-2 rounded-xl transition-colors border border-red-200"
            >
              <PhoneOff size={20} />
              <span className="font-medium">End Call</span>
            </button>
          </div>
          <RoomAudioRenderer />
        </LiveKitRoom>
      </div>

      {/* Side Panel — Live Tool Events */}
      <div className="w-full md:w-96 border-l border-border bg-surface h-full flex flex-col z-10">
        <div className="p-6 border-b border-border bg-background/50">
          <div className="flex items-center space-x-3 text-foreground">
            <TerminalSquare size={24} className="text-primary" />
            <h3 className="font-semibold text-lg">Agent Actions</h3>
          </div>
          <p className="text-sm text-muted mt-1">Live system actions and tool calls</p>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {events.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-muted opacity-50 space-y-3">
              <Activity size={32} />
              <p className="text-sm">Waiting for agent actions...</p>
            </div>
          ) : (
            events.map((event, idx) => {
              const isSuccess = event.event_type === 'tool_succeeded';
              const label = getToolLabel(event.event_name, event.event_type);
              return (
                <div
                  key={event.id || idx}
                  className={`p-4 rounded-xl border text-sm ${
                    isSuccess
                      ? 'bg-green-50/50 border-green-200'
                      : 'bg-blue-50/50 border-blue-200'
                  }`}
                >
                  <div className="flex items-center space-x-2 mb-1">
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                      isSuccess ? 'bg-green-500' : 'bg-blue-500 animate-pulse'
                    }`} />
                    <span className={`font-medium text-sm ${
                      isSuccess ? 'text-green-700' : 'text-blue-700'
                    }`}>
                      {label}
                    </span>
                  </div>
                  <div className="mt-2 text-[10px] text-muted flex justify-end">
                    {new Date(event.created_at).toLocaleTimeString()}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
