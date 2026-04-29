import { useState } from 'react';
import { WelcomeScreen } from './components/WelcomeScreen';
import { ActiveCall } from './components/ActiveCall';
import { SummaryScreen } from './components/SummaryScreen';
import { createSession, endSession, getSessionSummary } from './lib/api';
import type { SessionCreateResponse, SummaryResponse } from './lib/api';

type AppState = 'welcome' | 'active' | 'summary';

function App() {
  const [appState, setAppState] = useState<AppState>('welcome');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionData, setSessionData] = useState<SessionCreateResponse | null>(null);
  const [summaryData, setSummaryData] = useState<SummaryResponse | null>(null);

  const handleStart = async (name: string) => {
    try {
      setIsLoading(true);
      const data = await createSession({ participant_name: name });
      setSessionData(data);
      setAppState('active');
    } catch (error) {
      console.error("Failed to start session:", error);
      alert("Failed to connect to the agent. Ensure the backend is running.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEndCall = async () => {
    if (!sessionData) return;
    setAppState('summary'); // show summary screen immediately (loading state)
    try {
      // Try GET /summary first — agent may have already ended the session
      const summary = await getSessionSummary(sessionData.session_id);
      setSummaryData(summary);
    } catch {
      try {
        // Fall back to POST /end if no summary exists yet
        const summary = await endSession(sessionData.session_id);
        setSummaryData(summary);
      } catch (error) {
        console.error('Failed to retrieve summary:', error);
        // Show summary screen anyway with null — let SummaryScreen handle it
      }
    }
  };

  const handleRestart = () => {
    setAppState('welcome');
    setSessionData(null);
    setSummaryData(null);
  };

  return (
    <div className="w-full min-h-screen bg-background font-sans text-foreground">
      {appState === 'welcome' && (
        <WelcomeScreen onStart={handleStart} isLoading={isLoading} />
      )}
      
      {appState === 'active' && sessionData && (
        <ActiveCall 
          livekitUrl={sessionData.livekit_url} 
          token={sessionData.participant_token} 
          sessionId={sessionData.session_id}
          onEndCall={handleEndCall}
        />
      )}

      {appState === 'summary' && (
        <SummaryScreen 
          summary={summaryData} 
          onRestart={handleRestart} 
        />
      )}
    </div>
  );
}

export default App;
