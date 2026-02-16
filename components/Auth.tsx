import React, { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { signInWithGoogle } from '../services/firebase';
import Card from './ui/Card';
import Button from './ui/Button';
import { AGENTS, ROLES } from '../constants';
import { GameRole } from '../types';
import { AlertTriangle } from 'lucide-react';

const Auth = () => {
  const { completeRegistration, themeMode, pendingAuthUser, allUsers } = useGame();
  
  // Auth Flow State
  const [step, setStep] = useState<'start' | 'registration_details'>('start');
  
  // Registration Data
  const [regUsername, setRegUsername] = useState('');
  const [regPrimary, setRegPrimary] = useState<GameRole>(GameRole.DUELIST);
  const [regSecondary, setRegSecondary] = useState<GameRole>(GameRole.FLEX);
  const [regAgents, setRegAgents] = useState<string[]>([]);
  const [regError, setRegError] = useState<string | null>(null);

  useEffect(() => {
      if (pendingAuthUser) {
          setStep('registration_details');
          if (pendingAuthUser.email) {
              setRegUsername(pendingAuthUser.email.split('@')[0]);
          }
      }
  }, [pendingAuthUser]);

  const handleAgentToggle = (agent: string) => {
    if (regAgents.includes(agent)) {
        setRegAgents(prev => prev.filter(a => a !== agent));
    } else {
        if (regAgents.length < 3) {
            setRegAgents(prev => [...prev, agent]);
        }
    }
  };

  const handleGoogleClick = async () => {
      try {
          await signInWithGoogle();
          // GameContext onAuthStateChanged listener handles the rest
      } catch (error) {
          console.error("Login failed:", error);
      }
  };

  const handleRegistrationSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      setRegError(null);
      
      if (!regUsername.trim()) {
          setRegError("Please enter a username.");
          return;
      }
      if (regPrimary === regSecondary) {
          setRegError("Primary and Secondary roles cannot be the same.");
          return;
      }
      if (regAgents.length !== 3) {
          setRegError("Please select exactly 3 agents.");
          return;
      }

      // CHECK IF USERNAME IS TAKEN
      const isTaken = allUsers.some(u => u.username.toLowerCase() === regUsername.toLowerCase());
      if (isTaken) {
          setRegError("Username is already taken. Please choose another.");
          return;
      }

      if (!pendingAuthUser || !pendingAuthUser.email) {
          setRegError("Authentication error. Please try logging in again.");
          setStep('start');
          return;
      }

      completeRegistration({
          email: pendingAuthUser.email,
          username: regUsername,
          primaryRole: regPrimary,
          secondaryRole: regSecondary,
          topAgents: regAgents
      });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] animate-in fade-in zoom-in duration-500 py-10">
      <div className="mb-8 text-center">
        <h1 className={`text-6xl font-display font-bold tracking-tighter flex items-center justify-center ${themeMode === 'dark' ? 'text-white' : 'text-black'}`}>
          VBO
           {/* Bolt replacing the L - Rotated 12 degrees right to look like an L */}
           <svg 
            viewBox="0 0 24 24" 
            fill="currentColor" 
            className={`h-24 w-14 mx-[-4px] translate-x-0.5 translate-y-0.5 rotate-12 ${themeMode === 'dark' ? 'text-white' : 'text-black'}`}
          >
             <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" />
          </svg>
          T<span className="text-rose-500">.</span>
        </h1>
        <p className="text-zinc-500 tracking-widest uppercase text-sm mt-2">VALORANT HUB</p>
      </div>

      <Card className="w-full max-w-lg">
        
        {step === 'start' && (
             <div className="flex flex-col items-center space-y-6 py-8">
                 <p className="text-zinc-400 text-center mb-4">Connect your account to start playing.</p>
                 <button 
                    onClick={handleGoogleClick}
                    className="flex items-center justify-center space-x-3 w-full max-w-sm bg-white text-black py-4 rounded-xl font-bold shadow-lg hover:bg-gray-100 transition-colors"
                 >
                     <svg className="w-6 h-6" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                     </svg>
                     <span>Continue with Google</span>
                 </button>
                 
                 {/* ⭐ REMOVIDO: Botão "Entrar como Convidado" */}

                 <div className="text-xs text-zinc-600 mt-2 text-center">
                     By connecting, you agree to our Terms of Service.
                 </div>
             </div>
        )}

        {step === 'registration_details' && (
            <form onSubmit={handleRegistrationSubmit} className="space-y-6">
                <div className="text-center mb-6">
                    <h3 className="text-xl font-bold">Complete Profile</h3>
                    <p className="text-sm text-zinc-500">Set up your Valorant identity</p>
                </div>

                <div>
                    <label className="block text-xs text-zinc-500 uppercase mb-2">Username</label>
                    <input 
                        type="text" 
                        value={regUsername}
                        onChange={(e) => setRegUsername(e.target.value)}
                        className={`w-full rounded-2xl p-3 font-display outline-none border transition-all
                            ${themeMode === 'dark' ? 'bg-black/20 border-white/10 text-white' : 'bg-zinc-100 border-zinc-200 text-black'}
                        `}
                        required
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs text-zinc-500 uppercase mb-2">Primary Role</label>
                        <select 
                            value={regPrimary}
                            onChange={(e) => setRegPrimary(e.target.value as GameRole)}
                            className={`w-full rounded-2xl p-3 outline-none border appearance-none cursor-pointer bg-zinc-900 border-white/10 text-white`}
                        >
                            {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs text-zinc-500 uppercase mb-2">Secondary Role</label>
                        <select 
                            value={regSecondary}
                            onChange={(e) => setRegSecondary(e.target.value as GameRole)}
                            className={`w-full rounded-2xl p-3 outline-none border appearance-none cursor-pointer bg-zinc-900 border-white/10 text-white`}
                        >
                            {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                    </div>
                </div>

                <div>
                    <label className="block text-xs text-zinc-500 uppercase mb-2">Select Top 3 Agents ({regAgents.length}/3)</label>
                    <div className="flex flex-wrap gap-2 max-h-[150px] overflow-y-auto custom-scrollbar p-1">
                        {AGENTS.map(agent => (
                            <button
                                key={agent}
                                type="button"
                                onClick={() => handleAgentToggle(agent)}
                                className={`
                                    px-2 py-1.5 rounded-lg text-xs border transition-all
                                    ${regAgents.includes(agent) 
                                        ? `bg-rose-500 text-white border-rose-500` 
                                        : `border-transparent text-zinc-500 ${themeMode === 'dark' ? 'bg-white/5 hover:bg-white/10' : 'bg-black/5 hover:bg-black/10'}`}
                                `}
                            >
                                {agent}
                            </button>
                        ))}
                    </div>
                </div>

                {regError && (
                    <div className="flex items-center justify-center p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-500 text-sm">
                        <AlertTriangle className="w-4 h-4 mr-2" />
                        {regError}
                    </div>
                )}

                <Button type="submit" className="w-full py-4 mt-4">
                    Finish Setup
                </Button>
            </form>
        )}

      </Card>
    </div>
  );
};

export default Auth;
