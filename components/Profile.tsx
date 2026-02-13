
import React, { useRef, useState, useMemo } from 'react';
import { useGame } from '../context/GameContext';
import { AGENTS, ROLES, AGENT_IMAGES, AGENT_BANNERS, MAP_IMAGES, MAPS } from '../constants';
import { getRankInfo, getLevelProgress } from '../services/gameService';
import Card from './ui/Card';
import Button from './ui/Button';
import { Camera, Edit2, Save, X, User as UserIcon, Award, Flame, Star, Shield, Crown, ThumbsUp, TrendingUp, Map as MapIcon, Activity, Users } from 'lucide-react';

interface BadgeType {
  id: string;
  name: string;
  icon: React.ReactNode;
  active: boolean;
  desc: string;
  requirement: string;
  glowColor: string; 
}

const Profile = () => {
  const { currentUser, updateProfile, themeMode, allUsers, viewProfileId, isAdmin, resetSeason, matchHistory } = useGame();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Determine which user to show
  const profileUser = viewProfileId 
    ? allUsers.find(u => u.id === viewProfileId) || currentUser 
    : currentUser;

  const isOwnProfile = profileUser.id === currentUser.id;
  const [isEditing, setIsEditing] = useState(false);
  const [activeBadge, setActiveBadge] = useState<BadgeType | null>(null);

  const [editTopAgents, setEditTopAgents] = useState<string[]>(profileUser.topAgents);

  const rank = getRankInfo(profileUser.points);

  const totalGames = profileUser.wins + profileUser.losses;
  const winrate = totalGames > 0 ? ((profileUser.wins / totalGames) * 100).toFixed(1) : "0.0";
  const favoriteAgent = profileUser.topAgents[0] || 'Jett';
  const bannerUrl = AGENT_BANNERS[favoriteAgent] || AGENT_BANNERS['Jett'];

  // XP Progress Calculation using scaling logic
  const { level: calculatedLevel, currentLevelXP, xpForNextLevel } = getLevelProgress(profileUser.xp || 0);
  const displayLevel = profileUser.level || calculatedLevel; // Fallback or sync
  const xpPercent = (currentLevelXP / xpForNextLevel) * 100;

  // --- STATS CALCULATION ---
  const userMatches = useMemo(() => {
    return matchHistory.filter(m => 
        m.teamAIds.includes(profileUser.id) || m.teamBIds.includes(profileUser.id)
    );
  }, [matchHistory, profileUser.id]);

  const recentForm = useMemo(() => {
      // Get last 4 matches
      // Match History is assumed to be Newest First ([0] is most recent)
      return userMatches.slice(0, 4).map(m => {
          const myTeam = m.teamAIds.includes(profileUser.id) ? 'A' : 'B';
          return m.winner === myTeam ? 'W' : 'L';
      });
  }, [userMatches, profileUser.id]);

  const mapStats = useMemo(() => {
      const stats: Record<string, { played: number, wins: number }> = {};
      
      userMatches.forEach(m => {
          if (!stats[m.map]) stats[m.map] = { played: 0, wins: 0 };
          stats[m.map].played += 1;
          
          const myTeam = m.teamAIds.includes(profileUser.id) ? 'A' : 'B';
          if (m.winner === myTeam) stats[m.map].wins += 1;
      });

      // Convert to array and sort by winrate then games played
      return Object.entries(stats)
          .map(([map, data]) => ({
              map,
              ...data,
              winrate: data.played > 0 ? (data.wins / data.played) * 100 : 0
          }))
          .sort((a, b) => b.played - a.played) // Sort by most played first
          .slice(0, 3); // Top 3 maps
  }, [userMatches, profileUser.id]);

  // --- BADGE LOGIC ---
  const badges: BadgeType[] = [
    {
      id: 'veteran',
      name: 'Veteran',
      icon: <Award className="w-8 h-8 text-amber-400" />,
      active: totalGames > 20,
      desc: 'You are a seasoned veteran of the hub.',
      requirement: 'Play more than 20 matches.',
      glowColor: 'shadow-amber-400/50 bg-amber-400/10'
    },
    {
      id: 'onfire',
      name: 'On Fire',
      icon: <Flame className="w-8 h-8 text-orange-500" />,
      active: profileUser.winstreak >= 5,
      desc: 'You are absolutely crushing the competition.',
      requirement: 'Achieve a winstreak of 5 or more.',
      glowColor: 'shadow-orange-500/50 bg-orange-500/10'
    },
    {
      id: 'highroller',
      name: 'High Roller',
      icon: <Crown className="w-8 h-8 text-purple-400" />,
      active: profileUser.points >= 1200,
      desc: 'You have reached the elite ranks.',
      requirement: 'Reach Ascendant rank (1200 MMR) or higher.',
      glowColor: 'shadow-purple-400/50 bg-purple-400/10'
    },
    {
        id: 'ironwill',
        name: 'Iron Will',
        icon: <Shield className="w-8 h-8 text-blue-400" />,
        active: profileUser.losses - profileUser.wins > 3, 
        desc: 'You never give up, even when odds are against you.',
        requirement: 'Have 3 more losses than wins (Persistence).',
        glowColor: 'shadow-blue-400/50 bg-blue-400/10' 
    },
    {
        id: 'leader',
        name: 'Leader',
        icon: <ThumbsUp className="w-8 h-8 text-emerald-400" />,
        active: (profileUser.reputation || 0) > 20, 
        desc: 'The community loves playing with you.',
        requirement: 'Receive 20+ Commendations.',
        glowColor: 'shadow-emerald-400/50 bg-emerald-400/10' 
    },
    {
        id: 'og',
        name: 'OG',
        icon: <Star className="w-8 h-8 text-yellow-300" />,
        active: allUsers.findIndex(u => u.id === profileUser.id) < 10 || profileUser.username === 'txger.', 
        desc: 'You were here from the very beginning.',
        requirement: 'Be one of the first 10 registered users.',
        glowColor: 'shadow-yellow-300/50 bg-yellow-300/10'
    }
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0] && isOwnProfile) {
      const url = URL.createObjectURL(e.target.files[0]);
      updateProfile({ avatarUrl: url });
    }
  };

  const toggleAgent = (agent: string) => {
    if (editTopAgents.includes(agent)) {
      setEditTopAgents(prev => prev.filter(a => a !== agent));
    } else {
      if (editTopAgents.length < 3) {
        setEditTopAgents(prev => [...prev, agent]);
      }
    }
  };

  const saveChanges = () => {
      updateProfile({ topAgents: editTopAgents });
      setIsEditing(false);
  };

  const cancelChanges = () => {
      setEditTopAgents(profileUser.topAgents);
      setIsEditing(false);
  };

  const handleResetSeason = () => {
      if (confirm("ARE YOU SURE? This will reset everyone's points to 1000.")) {
          resetSeason();
      }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      
      {/* Badge Modal */}
      {activeBadge && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={() => setActiveBadge(null)}>
              <div className="max-w-sm w-full animate-in zoom-in duration-200" onClick={(e) => e.stopPropagation()}>
                  <Card className="text-center relative overflow-hidden">
                      {/* Background Glow in Modal */}
                      <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 blur-[60px] rounded-full ${activeBadge.active ? activeBadge.glowColor.split(' ')[1].replace('/10', '/40') : 'bg-transparent'}`}></div>

                      <button onClick={() => setActiveBadge(null)} className="absolute top-4 right-4 text-zinc-500 hover:text-white z-10">
                          <X className="w-5 h-5" />
                      </button>
                      <div className="flex justify-center mb-6 mt-4 relative z-10">
                          <div className={`p-6 rounded-full transition-all duration-500 ${activeBadge.active ? `${activeBadge.glowColor} shadow-[0_0_30px_rgba(0,0,0,0)]` : 'bg-black/40 grayscale opacity-50'}`}>
                              {activeBadge.icon}
                          </div>
                      </div>
                      <h3 className={`text-2xl font-display font-bold mb-2 relative z-10 ${activeBadge.active ? 'text-white' : 'text-zinc-500'}`}>{activeBadge.name}</h3>
                      <p className="text-zinc-400 text-sm mb-6 relative z-10">{activeBadge.desc}</p>
                      
                      <div className="bg-white/5 rounded-xl p-4 border border-white/5 relative z-10">
                          <p className="text-[10px] uppercase text-zinc-500 tracking-widest mb-1">Requirement</p>
                          <p className={`text-sm font-medium ${activeBadge.active ? 'text-white' : 'text-zinc-300'}`}>{activeBadge.requirement}</p>
                      </div>
                      
                      {!activeBadge.active && (
                          <div className="mt-4 text-xs text-zinc-500 italic relative z-10">
                              Keep playing to unlock this badge.
                          </div>
                      )}
                  </Card>
              </div>
          </div>
      )}

      {/* Hero Banner */}
      <div className="relative rounded-3xl overflow-hidden min-h-[250px] shadow-2xl border border-white/5">
        <div 
            className="absolute inset-0 bg-cover bg-[center_top_20%] opacity-40 transform scale-105 transition-transform duration-1000 hover:scale-100"
            style={{ backgroundImage: `url(${bannerUrl})` }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/40 to-black/90"></div>

        <div className="absolute bottom-0 left-0 w-full p-8 flex items-end space-x-6 z-10">
            <div className="relative group">
                <div className="w-28 h-28 rounded-3xl bg-zinc-800 border-4 border-black/50 overflow-hidden shadow-2xl flex items-center justify-center">
                    {profileUser.avatarUrl ? (
                        <img src={profileUser.avatarUrl} alt="avatar" className="w-full h-full object-cover" />
                    ) : (
                        <span className="text-4xl font-display font-bold text-white/20">{profileUser.username.substring(0,2).toUpperCase()}</span>
                    )}
                </div>
                {isOwnProfile && (
                    <>
                        <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                        <button onClick={() => fileInputRef.current?.click()} className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-3xl cursor-pointer">
                            <Camera className="text-white w-8 h-8" />
                        </button>
                    </>
                )}
            </div>

            <div className="mb-2">
                <div className="flex items-center space-x-3 mb-1">
                    <h1 className="text-4xl font-display font-bold text-white shadow-black drop-shadow-lg">{profileUser.username}</h1>
                    <span 
                        className="px-3 py-1 rounded-full text-xs font-bold text-white uppercase border border-white/20 shadow-lg"
                        style={{ backgroundColor: rank.color, textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}
                    >
                        {rank.name}
                    </span>
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-zinc-800 text-zinc-300 uppercase border border-white/10 shadow-lg">
                        Lvl {displayLevel}
                    </span>
                </div>
                <div className="flex space-x-4 text-sm text-zinc-300 font-medium">
                    <span>{profileUser.primaryRole}</span>
                    <span className="text-zinc-500">•</span>
                    <span>{profileUser.secondaryRole}</span>
                </div>
                
                {/* XP Bar */}
                <div className="mt-4 w-full max-w-xs">
                    <div className="flex justify-between text-[10px] text-zinc-400 mb-1 uppercase tracking-wider font-bold">
                         <span>XP Progress</span>
                         <span>{currentLevelXP} / {xpForNextLevel}</span>
                    </div>
                    <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500" style={{ width: `${xpPercent}%` }}></div>
                    </div>
                </div>
            </div>
            
            {/* Admin Reset Button */}
            {isAdmin && isOwnProfile && (
                <div className="ml-auto mb-2">
                    <Button variant="danger" size="sm" onClick={handleResetSeason}>
                        [Admin] Reset Season
                    </Button>
                </div>
            )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Column (Stats + Identity) */}
        <div className="space-y-6 md:col-span-2">
            
            {/* Quick Stats Row */}
            <div className="grid grid-cols-3 gap-4">
                <Card noPadding className="p-4 flex flex-col items-center justify-center bg-black/40">
                    <span className="text-zinc-500 text-[10px] uppercase tracking-widest mb-1">MMR</span>
                    <span className="text-2xl font-display font-bold text-white">{Math.floor(profileUser.points)}</span>
                </Card>
                <Card noPadding className="p-4 flex flex-col items-center justify-center bg-black/40">
                     <span className="text-zinc-500 text-[10px] uppercase tracking-widest mb-1">Winrate</span>
                    <span className={`text-2xl font-display font-bold ${Number(winrate) > 50 ? 'text-emerald-400' : 'text-zinc-200'}`}>{winrate}%</span>
                </Card>
                <Card noPadding className="p-4 flex flex-col items-center justify-center bg-black/40">
                     <span className="text-zinc-500 text-[10px] uppercase tracking-widest mb-1">Games Played</span>
                    <span className="text-2xl font-display font-bold text-white">{totalGames}</span>
                </Card>
            </div>
            
            {/* Identity */}
            <Card>
                <div className="flex items-center space-x-2 mb-6 text-zinc-400">
                    <UserIcon className="w-5 h-5" />
                    <h3 className="text-sm font-bold uppercase tracking-widest">Player Identity</h3>
                </div>
                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <label className="block text-xs text-zinc-500 uppercase mb-2">Username</label>
                        <input 
                            type="text" 
                            value={profileUser.username}
                            readOnly={!isOwnProfile}
                            onChange={(e) => isOwnProfile && updateProfile({ username: e.target.value })}
                            className={`w-full rounded-xl p-3 bg-black/20 border border-white/10 text-white outline-none ${isOwnProfile ? 'focus:border-rose-500' : 'cursor-default opacity-70'}`}
                        />
                    </div>
                    <div>
                        <label className="block text-xs text-zinc-500 uppercase mb-2">Primary Role</label>
                        <select 
                            value={profileUser.primaryRole}
                            disabled={!isOwnProfile}
                            onChange={(e) => updateProfile({ primaryRole: e.target.value as any })}
                            className={`w-full rounded-xl p-3 bg-black/20 border border-white/10 text-white outline-none appearance-none ${!isOwnProfile ? 'cursor-default opacity-70' : 'focus:border-rose-500'}`}
                        >
                            {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                    </div>
                </div>
            </Card>

            {/* Map Statistics */}
            <Card>
                <div className="flex items-center space-x-2 mb-6 text-zinc-400">
                    <MapIcon className="w-5 h-5" />
                    <h3 className="text-sm font-bold uppercase tracking-widest">Most Played Maps</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {mapStats.length > 0 ? (
                        mapStats.map(stat => (
                            <div key={stat.map} className="relative h-24 rounded-xl overflow-hidden group border border-white/5">
                                <div 
                                    className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110 opacity-60"
                                    style={{ backgroundImage: `url(${MAP_IMAGES[stat.map as keyof typeof MAP_IMAGES]})` }}
                                ></div>
                                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
                                <div className="absolute bottom-0 left-0 p-3 w-full">
                                    <div className="flex justify-between items-end">
                                        <div>
                                            <span className="block text-xs font-bold text-white uppercase tracking-wider">{stat.map}</span>
                                            <span className="text-[10px] text-zinc-400">{stat.wins}W - {stat.played - stat.wins}L</span>
                                        </div>
                                        <div className={`text-lg font-bold font-mono ${stat.winrate >= 50 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                            {stat.winrate.toFixed(0)}%
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-3 text-center py-4 text-zinc-500 text-sm italic">
                            No match data available yet.
                        </div>
                    )}
                </div>
            </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
            
            {/* Recent Form */}
            <Card>
                <div className="flex items-center space-x-2 mb-6 text-zinc-400">
                    <Activity className="w-5 h-5" />
                    <h3 className="text-sm font-bold uppercase tracking-widest">Recent Form</h3>
                </div>
                <div className="flex items-center justify-center gap-6">
                    {recentForm.length > 0 ? (
                        recentForm.map((result, i) => (
                            <div key={i} className="flex flex-col items-center">
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-xl transition-all duration-300 hover:scale-110 ${result === 'W' ? 'bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.5)]' : 'bg-rose-500/20 text-rose-500 border border-rose-500/30'}`}>
                                    {result}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="w-full text-center text-zinc-500 text-sm italic py-2">
                            Play matches to see form.
                        </div>
                    )}
                </div>
            </Card>

            {/* Agent Pool */}
            <Card className="h-auto">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-400">Agent Pool</h3>
                    {isOwnProfile && !isEditing && (
                        <Button size="sm" variant="ghost" onClick={() => setIsEditing(true)}>
                            <Edit2 className="w-3 h-3" />
                        </Button>
                    )}
                    {isEditing && (
                        <div className="flex space-x-2">
                            <Button size="sm" variant="ghost" onClick={cancelChanges}>
                                <X className="w-3 h-3" />
                            </Button>
                            <Button size="sm" variant="primary" onClick={saveChanges}>
                                <Save className="w-3 h-3" />
                            </Button>
                        </div>
                    )}
                </div>
                
                {!isEditing ? (
                    <div className="grid grid-cols-1 gap-3">
                        {profileUser.topAgents.map((agent, index) => (
                            <div key={agent} className="relative overflow-hidden rounded-xl border border-white/5 bg-white/5 p-3 flex items-center transition-all hover:bg-white/10">
                                <img src={AGENT_IMAGES[agent]} alt={agent} className="w-10 h-10 rounded-full bg-zinc-900 border border-white/10 object-cover mr-4" />
                                <div>
                                    <span className="block text-sm font-bold text-white">{agent}</span>
                                    <span className="text-[10px] text-zinc-500 uppercase tracking-wider">{index === 0 ? 'Main' : 'Pick'}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col space-y-4">
                        <span className="text-xs text-rose-500 font-bold uppercase">{editTopAgents.length}/3 Selected</span>
                        <div className="grid grid-cols-4 gap-2 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
                            {AGENTS.map(agent => (
                                <button
                                    key={agent}
                                    onClick={() => toggleAgent(agent)}
                                    className={`flex flex-col items-center justify-center p-2 rounded-xl border transition-all duration-200 aspect-square ${editTopAgents.includes(agent) ? `bg-rose-500/20 border-rose-500` : `border-transparent bg-white/5 hover:bg-white/10`}`}
                                >
                                    <img src={AGENT_IMAGES[agent]} alt={agent} className="w-8 h-8 rounded-full mb-1" />
                                    <span className={`text-[9px] font-bold ${editTopAgents.includes(agent) ? 'text-rose-400' : 'text-zinc-500'}`}>{agent}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </Card>
        </div>

      </div>

      {/* Badges Section - Clickable & Clean */}
      <Card>
          <div className="text-center mb-8">
              <h3 className="text-2xl font-display font-bold tracking-tight text-white">ACHIEVEMENTS</h3>
              <p className="text-xs text-zinc-500 uppercase tracking-widest mt-1">Click a badge for details</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
              {badges.map(badge => (
                  <button 
                      key={badge.id}
                      onClick={() => setActiveBadge(badge)}
                      className={`
                          flex flex-col items-center justify-center p-6 rounded-2xl border transition-all duration-300 text-center
                          ${badge.active 
                              ? `bg-gradient-to-b from-white/10 to-white/5 border-white/20 hover:scale-105 hover:bg-white/10` 
                              : `bg-transparent border-white/5 opacity-40 grayscale hover:opacity-60 hover:scale-105 cursor-pointer`}
                      `}
                  >
                      <div className={`p-4 rounded-full mb-3 transition-shadow duration-300 ${badge.active ? `${badge.glowColor} shadow-[0_0_20px_rgba(0,0,0,0)]` : 'bg-white/5'}`}>
                          {React.cloneElement(badge.icon as React.ReactElement<{ className?: string }>, { className: "w-6 h-6" })}
                      </div>
                      <span className={`text-sm font-bold mb-1 ${badge.active ? 'text-white' : 'text-zinc-500'}`}>{badge.name}</span>
                  </button>
              ))}
          </div>
      </Card>

    </div>
  );
};

export default Profile;
