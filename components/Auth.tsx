import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import Card from './ui/Card';
import Button from './ui/Button';
import { AGENTS, ROLES } from '../constants';
import { GameRole } from '../types';

const Auth = () => {
  const { login, register, themeMode } = useGame();
  const [isLogin, setIsLogin] = useState(true);
  
  // Login State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register State
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regPrimary, setRegPrimary] = useState<GameRole>(GameRole.DUELIST);
  const [regSecondary, setRegSecondary] = useState<GameRole>(GameRole.FLEX);
  const [regAgents, setRegAgents] = useState<string[]>([]);

  const handleAgentToggle = (agent: string) => {
    if (regAgents.includes(agent)) {
        setRegAgents(prev => prev.filter(a => a !== agent));
    } else {
        if (regAgents.length < 3) {
            setRegAgents(prev => [...prev, agent]);
        }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isLogin) {
      if (!loginEmail.trim() || !loginPassword.trim()) return;
      login(loginEmail, loginPassword);
    } else {
      // Validation
      if (!regEmail.trim() || !regUsername.trim() || !regPassword.trim()) {
          alert("Please fill in all fields");
          return;
      }
      if (regPrimary === regSecondary) {
          alert("Primary and Secondary roles cannot be the same.");
          return;
      }
      if (regAgents.length !== 3) {
          alert("Please select exactly 3 agents.");
          return;
      }

      register({
          email: regEmail,
          password: regPassword,
          username: regUsername,
          primaryRole: regPrimary,
          secondaryRole: regSecondary,
          topAgents: regAgents
      });
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] animate-in fade-in zoom-in duration-500 py-10">
      <div className="mb-8 text-center">
        <h1 className={`text-6xl font-display font-bold tracking-tighter ${themeMode === 'dark' ? 'text-white' : 'text-black'}`}>
          HUB-PT<span className="text-rose-500">.</span>
        </h1>
        <p className="text-zinc-500 tracking-widest uppercase text-sm mt-2">PORTUGUESE VALORANT HUB</p>
      </div>

      <Card className="w-full max-w-lg">
        <div className="flex justify-center space-x-4 mb-8">
            <button 
                onClick={() => setIsLogin(true)}
                className={`text-sm uppercase tracking-widest pb-2 border-b-2 transition-colors ${isLogin ? 'border-rose-500 text-rose-500' : 'border-transparent text-zinc-500'}`}
            >
                Login
            </button>
            <button 
                onClick={() => setIsLogin(false)}
                className={`text-sm uppercase tracking-widest pb-2 border-b-2 transition-colors ${!isLogin ? 'border-rose-500 text-rose-500' : 'border-transparent text-zinc-500'}`}
            >
                Register
            </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
            
            {isLogin ? (
                <>
                    <div>
                        <label className="block text-xs text-zinc-500 uppercase mb-2">Email</label>
                        <input 
                            type="email" 
                            value={loginEmail}
                            onChange={(e) => setLoginEmail(e.target.value)}
                            className={`w-full rounded-2xl p-4 font-display outline-none border transition-all
                                ${themeMode === 'dark' 
                                    ? 'bg-black/20 border-white/10 text-white focus:border-rose-500' 
                                    : 'bg-zinc-100 border-zinc-200 text-black focus:border-rose-500'
                                }
                            `}
                            placeholder="Enter your email"
                        />
                    </div>
                    <div>
                        <label className="block text-xs text-zinc-500 uppercase mb-2">Password</label>
                        <input 
                            type="password" 
                            value={loginPassword}
                            onChange={(e) => setLoginPassword(e.target.value)}
                            className={`w-full rounded-2xl p-4 font-display outline-none border transition-all
                                ${themeMode === 'dark' 
                                    ? 'bg-black/20 border-white/10 text-white focus:border-rose-500' 
                                    : 'bg-zinc-100 border-zinc-200 text-black focus:border-rose-500'
                                }
                            `}
                            placeholder="Enter your password"
                        />
                    </div>
                </>
            ) : (
                <div className="space-y-4">
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
                            <label className="block text-xs text-zinc-500 uppercase mb-2">Email</label>
                            <input 
                                type="email" 
                                value={regEmail}
                                onChange={(e) => setRegEmail(e.target.value)}
                                className={`w-full rounded-2xl p-3 font-display outline-none border transition-all
                                    ${themeMode === 'dark' ? 'bg-black/20 border-white/10 text-white' : 'bg-zinc-100 border-zinc-200 text-black'}
                                `}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs text-zinc-500 uppercase mb-2">Password</label>
                            <input 
                                type="password" 
                                value={regPassword}
                                onChange={(e) => setRegPassword(e.target.value)}
                                className={`w-full rounded-2xl p-3 font-display outline-none border transition-all
                                    ${themeMode === 'dark' ? 'bg-black/20 border-white/10 text-white' : 'bg-zinc-100 border-zinc-200 text-black'}
                                `}
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs text-zinc-500 uppercase mb-2">Primary Role</label>
                            <select 
                                value={regPrimary}
                                onChange={(e) => setRegPrimary(e.target.value as GameRole)}
                                className={`w-full rounded-2xl p-3 outline-none border appearance-none ${themeMode === 'dark' ? 'bg-black/20 border-white/10 text-white' : 'bg-zinc-100 border-zinc-200 text-black'}`}
                            >
                                {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs text-zinc-500 uppercase mb-2">Secondary Role</label>
                            <select 
                                value={regSecondary}
                                onChange={(e) => setRegSecondary(e.target.value as GameRole)}
                                className={`w-full rounded-2xl p-3 outline-none border appearance-none ${themeMode === 'dark' ? 'bg-black/20 border-white/10 text-white' : 'bg-zinc-100 border-zinc-200 text-black'}`}
                            >
                                {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                            </select>
                            {regPrimary === regSecondary && <p className="text-red-500 text-[10px] mt-1">Roles must be different.</p>}
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
                </div>
            )}

            <Button type="submit" className="w-full py-4 mt-4">
                {isLogin ? 'Enter Hub' : 'Create Account'}
            </Button>
        </form>
      </Card>
    </div>
  );
};

export default Auth;
