import React from 'react';
import { useGame } from '../context/GameContext';
import { Users, Zap, Shield, AlertTriangle, Swords, ChevronRight } from 'lucide-react';

const Queue = () => {
    const { queue, joinQueue, leaveQueue, currentUser, testFillQueue, createTestMatchDirect, themeMode, isAdmin, setViewProfileId } = useGame();

    const isInQueue = queue.some(u => u.id === currentUser.id);
    const hasRiotAccount = !!(currentUser.riotId && currentUser.riotTag);
    const progress = Math.round((queue.length / 10) * 100);

    const getRoleIcon = (role: string) => {
        if (role.toLowerCase().includes('duelist')) return <Zap className="w-3 h-3 text-yellow-400" />;
        if (role.toLowerCase().includes('sentinel')) return <Shield className="w-3 h-3 text-blue-400" />;
        return <Users className="w-3 h-3 text-zinc-400" />;
    };

    // 10 slots for the visual grid
    const slots = Array.from({ length: 10 }, (_, i) => queue[i] || null);

    return (
        <div className="max-w-6xl mx-auto animate-in fade-in duration-500 flex flex-col gap-5">

            {/* Top banner */}
            <div className="relative rounded-[2rem] overflow-hidden border border-rose-900/40 min-h-[220px] flex items-end">
                {/* Deep dark red background */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#1a0205] via-[#0d0105] to-[#000000]"></div>
                {/* Grid overlay */}
                <div className="absolute inset-0 opacity-[0.07]" style={{ backgroundImage: 'linear-gradient(rgba(244,63,94,1) 1px, transparent 1px), linear-gradient(90deg, rgba(244,63,94,1) 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
                {/* Dynamic glow */}
                <div className={`absolute top-0 right-0 w-[400px] h-[300px] rounded-full blur-[100px] transition-all duration-1000 ${isInQueue ? 'bg-rose-500/20' : 'bg-rose-900/10'}`}></div>
                <div className="absolute bottom-0 left-0 w-[300px] h-[200px] rounded-full blur-[80px] bg-rose-900/20"></div>

                <div className="relative z-10 w-full p-6 lg:p-8 flex flex-col md:flex-row items-start md:items-end justify-between gap-4">
                    <div>
                        {/* Status */}
                        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-[10px] font-bold uppercase tracking-widest mb-4 transition-all duration-500 ${isInQueue ? 'bg-rose-500/20 border-rose-500/40 text-rose-300' : 'bg-white/5 border-white/10 text-zinc-400'
                            }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${isInQueue ? 'bg-rose-400 animate-pulse' : 'bg-zinc-600'}`}></span>
                            {isInQueue ? `In Queue — Searching for players` : 'Queue Inactive — Ready to play?'}
                        </div>

                        {/* Main title */}
                        <h1 className="text-4xl lg:text-5xl font-display font-black text-white tracking-tighter leading-none flex items-center gap-2">
                            Play
                            <Swords className={`w-8 h-8 lg:w-10 lg:h-10 transition-all duration-500 ${isInQueue ? 'text-rose-400 drop-shadow-[0_0_12px_rgba(244,63,94,0.8)]' : 'text-zinc-600'}`} />
                        </h1>
                        <p className="text-zinc-500 mt-2 text-sm font-medium max-w-sm">
                            {isInQueue
                                ? `${queue.length} of 10 players ready. Match launches when the lobby fills.`
                                : 'Enter the competitive queue and prove your skill against the best.'}
                        </p>
                    </div>

                    {/* CTA */}
                    <div className="flex flex-col items-start md:items-end gap-3 w-full md:w-auto">
                        {isInQueue ? (
                            <button
                                onClick={leaveQueue}
                                className="group flex items-center justify-center gap-2 px-8 py-4 rounded-2xl border border-red-500/40 bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:border-red-400/60 font-bold uppercase tracking-widest text-sm transition-all w-full md:w-auto min-w-[200px]"
                            >
                                Leave Queue
                            </button>
                        ) : hasRiotAccount ? (
                            <button
                                onClick={joinQueue}
                                className="group flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-black uppercase tracking-widest text-sm transition-all shadow-[0_0_30px_rgba(244,63,94,0.4)] hover:shadow-[0_0_50px_rgba(244,63,94,0.7)] hover:scale-[1.02] active:scale-95 w-full md:w-auto min-w-[200px]"
                            >
                                <Swords className="w-4 h-4" />
                                Join Queue
                                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </button>
                        ) : (
                            <div className="flex flex-col gap-2 w-full md:w-auto">
                                <button disabled className="flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-zinc-800 text-zinc-600 font-bold uppercase tracking-widest text-sm cursor-not-allowed opacity-50 min-w-[200px]">
                                    <Swords className="w-4 h-4" />
                                    Join Queue
                                </button>
                                <div className="flex items-center gap-2 text-xs text-rose-400/80 bg-rose-500/10 px-3 py-2 rounded-xl border border-rose-500/20">
                                    <AlertTriangle className="w-3 h-3 flex-shrink-0" />
                                    Link your Riot Account in Profile
                                </div>
                            </div>
                        )}

                        {isAdmin && (
                            <div className="flex gap-4 text-[10px] text-zinc-600 uppercase">
                                <button onClick={testFillQueue} className="hover:text-rose-500 transition-colors">[Fill Queue]</button>
                                <button onClick={createTestMatchDirect} disabled={!isInQueue} className={`transition-colors ${isInQueue ? 'hover:text-rose-500' : 'opacity-30 cursor-not-allowed'}`}>[Test Match]</button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Bottom section: 10-slot grid + progress */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

                {/* Slots grid */}
                <div className={`lg:col-span-2 rounded-[2rem] border overflow-hidden flex flex-col ${themeMode === 'dark' ? 'bg-white/[0.02] border-white/5' : 'bg-white border-zinc-200'} min-h-0`}>
                    <div className={`px-6 py-4 border-b flex items-center justify-between ${themeMode === 'dark' ? 'border-white/5' : 'border-zinc-100'}`}>
                        <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-zinc-500" />
                            <span className="text-xs font-bold uppercase tracking-widest text-zinc-500">Lobby</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${queue.length > 0 ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' : (themeMode === 'dark' ? 'bg-white/5 border-white/10 text-zinc-500' : 'bg-zinc-100 border-zinc-200 text-zinc-500')
                                }`}>
                                {queue.length} / 10 players
                            </span>
                        </div>
                    </div>

                    {/* 10-slot grid */}
                    <div className="flex-1 p-5 grid grid-cols-2 sm:grid-cols-5 gap-2">
                        {slots.map((player, idx) => (
                            <div
                                key={idx}
                                onClick={() => player && setViewProfileId(player.id)}
                                className={`relative flex flex-col items-center justify-center gap-2 p-3 rounded-2xl border transition-all duration-300 text-center ${player
                                    ? `cursor-pointer ${themeMode === 'dark' ? 'bg-rose-500/5 border-rose-500/20 hover:bg-rose-500/10 hover:border-rose-500/40' : 'bg-rose-50 border-rose-200 hover:border-rose-300'}`
                                    : (themeMode === 'dark' ? 'border-white/5 bg-white/[0.01]' : 'border-zinc-100 bg-zinc-50/50')
                                    }`}
                            >
                                <span className="absolute top-2 left-2.5 text-[9px] font-mono text-zinc-700">{idx + 1}</span>

                                {player ? (
                                    <>
                                        <div className="w-9 h-9 rounded-full bg-zinc-800 border border-rose-500/30 flex items-center justify-center overflow-hidden text-white text-xs font-bold mt-1">
                                            {player.avatarUrl ? <img src={player.avatarUrl} alt="" className="w-full h-full object-cover" /> : player.username[0].toUpperCase()}
                                        </div>
                                        <span className={`text-[10px] font-bold truncate w-full text-center ${themeMode === 'dark' ? 'text-zinc-200' : 'text-zinc-800'}`}>{player.username}</span>
                                        <div className="flex items-center gap-1 text-[9px] text-zinc-500">
                                            {getRoleIcon(player.primaryRole)}
                                            <span>{Math.floor(player.points)}</span>
                                        </div>
                                        {player.id === currentUser.id && (
                                            <span className="text-[8px] font-black bg-rose-500/20 text-rose-400 px-1.5 py-0.5 rounded border border-rose-500/20 uppercase tracking-widest">You</span>
                                        )}
                                    </>
                                ) : (
                                    <div className="w-9 h-9 rounded-full border border-dashed border-white/10 mt-1 flex items-center justify-center">
                                        <span className="text-zinc-700 text-lg font-thin">+</span>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right: stats + progress */}
                <div className="flex flex-col gap-4">
                    {/* Progress card */}
                    <div className={`rounded-[2rem] border p-6 flex flex-col gap-4 ${themeMode === 'dark' ? 'bg-white/[0.02] border-white/5' : 'bg-white border-zinc-200'}`}>
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold uppercase tracking-widest text-zinc-500">Match Progress</span>
                            <span className="text-xs font-mono text-zinc-500">{progress}%</span>
                        </div>

                        {/* Big progress ring */}
                        <div className="flex flex-col items-center gap-4">
                            <div className="relative w-28 h-28">
                                <svg className="absolute inset-0 w-full h-full -rotate-90">
                                    <circle cx="56" cy="56" r="48" stroke={themeMode === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.06)'} strokeWidth="7" fill="none" />
                                    <circle
                                        cx="56" cy="56" r="48"
                                        stroke="rgba(244,63,94,0.8)"
                                        strokeWidth="7"
                                        fill="none"
                                        strokeDasharray={`${2 * Math.PI * 48}`}
                                        strokeDashoffset={`${2 * Math.PI * 48 * (1 - progress / 100)}`}
                                        strokeLinecap="round"
                                        className="transition-all duration-700"
                                        style={progress > 0 ? { filter: 'drop-shadow(0 0 6px rgba(244,63,94,0.6))' } : {}}
                                    />
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className={`text-2xl font-black font-mono ${themeMode === 'dark' ? 'text-white' : 'text-black'}`}>{queue.length}</span>
                                    <span className="text-[10px] text-zinc-600 uppercase tracking-widest">/ 10</span>
                                </div>
                            </div>

                            <div className="w-full">
                                <div className="flex justify-between mb-2">
                                    <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-medium">Match starts when full</span>
                                </div>
                                <div className={`h-2 w-full rounded-full overflow-hidden ${themeMode === 'dark' ? 'bg-white/5' : 'bg-zinc-100'}`}>
                                    <div
                                        className="h-full bg-rose-500 rounded-full transition-all duration-700"
                                        style={{
                                            width: `${progress}%`,
                                            boxShadow: progress > 0 ? '0 0 12px rgba(244,63,94,0.6)' : 'none'
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className={`rounded-[2rem] border p-6 flex flex-col gap-3.5 ${themeMode === 'dark' ? 'bg-white/[0.02] border-white/5' : 'bg-white border-zinc-200'}`}>
                        <span className="text-xs font-bold uppercase tracking-widest text-zinc-500">How it works</span>
                        <div className="flex flex-col gap-3.5">
                            {[
                                { num: '01', text: 'Join the queue with your linked Riot account' },
                                { num: '02', text: '10 players required to start a match' },
                                { num: '03', text: 'Captains are selected and teams are drafted' },
                                { num: '04', text: 'Play and report your score after the match' },
                            ].map(item => (
                                <div key={item.num} className="flex items-start gap-3">
                                    <span className="text-[10px] font-black font-mono text-rose-500 mt-0.5 flex-shrink-0">{item.num}</span>
                                    <span className={`text-xs leading-relaxed ${themeMode === 'dark' ? 'text-zinc-400' : 'text-zinc-600'}`}>{item.text}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Queue;
