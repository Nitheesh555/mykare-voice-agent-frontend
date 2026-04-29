import axios from 'axios';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';

export const api = axios.create({
  baseURL: `${BACKEND_URL}/api/v1`,
});

export interface SessionCreateRequest {
  participant_name: string;
}

export interface SessionCreateResponse {
  session_id: string;
  livekit_url: string;
  room_name: string;
  participant_token: string;
  expires_at: number;
}

export interface ConversationEvent {
  id: string;
  session_id: string;
  event_type: 'tool_started' | 'tool_succeeded' | 'tool_failed' | 'system' | string;
  event_name: string | null;
  payload_json: any;
  created_at: string;
}

export interface Appointment {
  id: string;
  date: string;           // backend returns 'date'
  time: string;           // backend returns 'time'
  appointment_date?: string; // fallback alias
  appointment_time?: string; // fallback alias
  status: string;
}

export interface SummaryResponse {
  session_id: string;
  summary_text: string;
  appointments: Appointment[];
  preferences?: Record<string, any>;
  generated_at?: string;
  model_name?: string;
}

export const createSession = async (data: SessionCreateRequest): Promise<SessionCreateResponse> => {
  const response = await api.post<SessionCreateResponse>('/sessions', data);
  return response.data;
};

export const endSession = async (sessionId: string): Promise<SummaryResponse> => {
  const response = await api.post<SummaryResponse>(`/sessions/${sessionId}/end`);
  return response.data;
};

export const fetchSessionEvents = async (sessionId: string): Promise<ConversationEvent[]> => {
  const response = await api.get<ConversationEvent[]>(`/sessions/${sessionId}/events`);
  return response.data;
};

export const getSessionSummary = async (sessionId: string): Promise<SummaryResponse> => {
  const response = await api.get<SummaryResponse>(`/sessions/${sessionId}/summary`);
  return response.data;
};
