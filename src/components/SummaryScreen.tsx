import React from 'react';
import { Calendar, Clock, CheckCircle2, FileText, Settings2, Loader2 } from 'lucide-react';
import type { SummaryResponse } from '../lib/api';

interface SummaryScreenProps {
  summary: SummaryResponse | null;
  onRestart: () => void;
}

export const SummaryScreen: React.FC<SummaryScreenProps> = ({ summary, onRestart }) => {
  // Loading state — summary not yet fetched
  if (!summary) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center space-y-4">
        <Loader2 size={40} className="text-primary animate-spin" />
        <p className="text-muted text-lg">Generating your conversation summary...</p>
      </div>
    );
  }

  const hasPreferences =
    summary.preferences && Object.keys(summary.preferences).length > 0;

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 text-green-600 mb-2">
            <CheckCircle2 size={32} />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">Call Completed</h1>
          {summary.generated_at && (
            <p className="text-sm text-muted flex items-center justify-center space-x-1">
              <Clock size={14} />
              <span>
                Summary generated at{' '}
                {new Date(summary.generated_at).toLocaleString('en-IN', {
                  dateStyle: 'medium',
                  timeStyle: 'short',
                })}
              </span>
            </p>
          )}
          {summary.model_name && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
              Summarized by {summary.model_name}
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Conversation Summary */}
          <div className="bg-surface rounded-2xl border border-border p-6 shadow-sm">
            <div className="flex items-center space-x-3 mb-4 text-primary">
              <FileText size={22} />
              <h2 className="text-xl font-semibold text-foreground">Conversation Summary</h2>
            </div>
            <p className="text-foreground leading-relaxed whitespace-pre-wrap text-sm">
              {summary.summary_text}
            </p>
          </div>

          {/* Appointments */}
          <div className="bg-surface rounded-2xl border border-border p-6 shadow-sm">
            <div className="flex items-center space-x-3 mb-4 text-primary">
              <Calendar size={22} />
              <h2 className="text-xl font-semibold text-foreground">Appointments</h2>
            </div>
            {summary.appointments && summary.appointments.length > 0 ? (
              <div className="space-y-3">
                {summary.appointments.map((apt) => (
                  <div key={apt.id} className="flex items-start p-4 rounded-xl bg-background border border-border">
                    <div className="mt-1 bg-primary/10 p-2 rounded-lg text-primary mr-4">
                      <Clock size={18} />
                    </div>
                    <div>
                      <p className="font-medium text-foreground text-sm">
                        {apt.date
                          ? new Date(apt.date).toLocaleDateString('en-US', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })
                          : 'Date not available'}
                      </p>
                      <p className="text-muted text-sm mt-0.5">
                        Time: {apt.time ? apt.time.slice(0, 5) : 'N/A'}
                      </p>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-2 ${
                          apt.status === 'booked'
                            ? 'bg-green-100 text-green-800'
                            : apt.status === 'cancelled'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {apt.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted bg-background rounded-xl border border-border text-sm">
                No appointments booked during this call.
              </div>
            )}
          </div>
        </div>

        {/* User Preferences */}
        {hasPreferences && (
          <div className="bg-surface rounded-2xl border border-border p-6 shadow-sm">
            <div className="flex items-center space-x-3 mb-4 text-primary">
              <Settings2 size={22} />
              <h2 className="text-xl font-semibold text-foreground">User Preferences</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {Object.entries(summary.preferences!).map(([key, value]) => (
                <div key={key} className="bg-background rounded-xl border border-border p-3">
                  <p className="text-xs text-muted capitalize">{key.replace(/_/g, ' ')}</p>
                  <p className="text-sm font-medium text-foreground mt-0.5">
                    {String(value)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-center pt-4">
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
