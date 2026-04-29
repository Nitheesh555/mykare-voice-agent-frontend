import React from 'react';
import { Calendar, Clock, CheckCircle2, FileText } from 'lucide-react';
import type { SummaryResponse } from '../lib/api';

interface SummaryScreenProps {
  summary: SummaryResponse | null;
  onRestart: () => void;
}

export const SummaryScreen: React.FC<SummaryScreenProps> = ({ summary, onRestart }) => {
  if (!summary) return null;

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 text-green-600 mb-4">
            <CheckCircle2 size={32} />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">Call Completed</h1>
          <p className="text-lg text-muted">Here is a summary of your conversation.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-surface rounded-2xl border border-border p-6 shadow-sm">
            <div className="flex items-center space-x-3 mb-4 text-primary">
              <FileText size={24} />
              <h2 className="text-xl font-semibold text-foreground">Conversation Summary</h2>
            </div>
            <p className="text-foreground leading-relaxed whitespace-pre-wrap">
              {summary.summary_text}
            </p>
          </div>

          <div className="bg-surface rounded-2xl border border-border p-6 shadow-sm">
            <div className="flex items-center space-x-3 mb-4 text-primary">
              <Calendar size={24} />
              <h2 className="text-xl font-semibold text-foreground">Your Appointments</h2>
            </div>
            
            {summary.appointments && summary.appointments.length > 0 ? (
              <div className="space-y-4">
                {summary.appointments.map((apt) => (
                  <div key={apt.id} className="flex items-start p-4 rounded-xl bg-background border border-border">
                    <div className="mt-1 bg-primary/10 p-2 rounded-lg text-primary mr-4">
                      <Clock size={20} />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">
                        {new Date(apt.appointment_date).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                      <p className="text-muted text-sm mt-1">
                        Time: {apt.appointment_time.slice(0, 5)}
                      </p>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 mt-2">
                        {apt.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted bg-background rounded-xl border border-border">
                No appointments found or booked.
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-center pt-8">
          <button
            onClick={onRestart}
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 rounded-xl font-medium transition-colors"
          >
            Start New Conversation
          </button>
        </div>
      </div>
    </div>
  );
};
