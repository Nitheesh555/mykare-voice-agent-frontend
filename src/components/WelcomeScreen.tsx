import React, { useState } from 'react';
import { Stethoscope, ArrowRight, Loader2 } from 'lucide-react';

interface WelcomeScreenProps {
  onStart: (name: string) => Promise<void>;
  isLoading: boolean;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onStart, isLoading }) => {
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onStart(name.trim());
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />

      <div className="max-w-md w-full bg-surface border border-border/50 rounded-2xl shadow-xl p-8 relative z-10 backdrop-blur-sm">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center">
            <Stethoscope size={32} />
          </div>
        </div>
        
        <h1 className="text-3xl font-bold text-center text-foreground mb-2">
          Mykare Voice AI
        </h1>
        <p className="text-center text-muted mb-8">
          Your intelligent front-desk assistant for booking and managing healthcare appointments.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
              Please enter your name
            </label>
            <input
              id="name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. John Doe"
              className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              disabled={isLoading}
            />
          </div>

          <button
            type="submit"
            disabled={!name.trim() || isLoading}
            className="w-full flex items-center justify-center space-x-2 bg-primary hover:bg-primary/90 text-primary-foreground py-3 px-4 rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <>
                <span>Start Conversation</span>
                <ArrowRight size={20} />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
