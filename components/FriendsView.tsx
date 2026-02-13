
import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import Card from './ui/Card';
import Button from './ui/Button';
import { UserPlus, Check, X, UserMinus, Search } from 'lucide-react';

const FriendsView = () => {
  const { currentUser, allUsers, sendFriendRequest, acceptFriendRequest, rejectFriendRequest, removeFriend, themeMode, setViewProfileId } = useGame();
  const [searchTerm, setSearchTerm] = useState('');

  const friends = allUsers.filter(u => currentUser.friends?.includes(u.id));
  const pendingRequests = currentUser.friendRequests || [];

  const searchResults = searchTerm.length > 2 
    ? allUsers.filter(u => 
        u.id !== currentUser.id && 
        !currentUser.friends?.includes(u.id) &&
        u.username.toLowerCase().includes(searchTerm.toLowerCase())
    ) 
    : [];

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8 text-center">
        <h2 className={`text-4xl font-display font-bold ${themeMode === 'dark' ? 'text-white' : 'text-black'}`}>FRIENDS</h2>
        <p className="text-zinc-500 uppercase tracking-widest text-xs mt-2">Connect with other players</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Left Column: Friends List */}
          <Card className="h-[500px] flex flex-col">
              <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-500 mb-4">Your Friends ({friends.length})</h3>
              <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2">
                  {friends.length === 0 ? (
                      <div className="text-center text-zinc-500 italic mt-10">You haven't added any friends yet.</div>
                  ) : (
                      friends.map(friend => (
                          <div key={friend.id} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                              <div 
                                className="flex items-center space-x-3 cursor-pointer"
                                onClick={() => setViewProfileId(friend.id)}
                              >
                                  <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-white overflow-hidden">
                                      {friend.avatarUrl ? <img src={friend.avatarUrl} className="w-full h-full object-cover"/> : friend.username[0]}
                                  </div>
                                  <div>
                                      <span className="block font-bold text-sm text-zinc-200">{friend.username}</span>
                                      <span className="text-[10px] text-zinc-500">Lvl {friend.level || 1} • {Math.floor(friend.points)} MMR</span>
                                  </div>
                              </div>
                              <button 
                                onClick={() => removeFriend(friend.id)}
                                className="p-2 text-zinc-500 hover:text-red-500 transition-colors"
                                title="Remove Friend"
                              >
                                  <UserMinus className="w-4 h-4" />
                              </button>
                          </div>
                      ))
                  )}
              </div>
          </Card>

          {/* Right Column: Requests & Search */}
          <div className="space-y-6">
              
              {/* Requests */}
              <Card className="max-h-[240px] flex flex-col">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-500 mb-4">Pending Requests ({pendingRequests.length})</h3>
                  <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2">
                      {pendingRequests.length === 0 ? (
                          <div className="text-center text-zinc-500 italic text-sm">No pending requests.</div>
                      ) : (
                          pendingRequests.map(req => {
                              const sender = allUsers.find(u => u.id === req.fromId);
                              if (!sender) return null;
                              return (
                                  <div key={req.fromId} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                                      <div className="flex items-center space-x-2">
                                          <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-white text-xs overflow-hidden">
                                              {sender.avatarUrl ? <img src={sender.avatarUrl} className="w-full h-full object-cover"/> : sender.username[0]}
                                          </div>
                                          <span className="text-sm font-bold text-zinc-300">{sender.username}</span>
                                      </div>
                                      <div className="flex space-x-2">
                                          <button 
                                            onClick={() => acceptFriendRequest(req.fromId)}
                                            className="p-1.5 bg-emerald-500/20 text-emerald-500 rounded hover:bg-emerald-500/30"
                                          >
                                              <Check className="w-4 h-4" />
                                          </button>
                                          <button 
                                            onClick={() => rejectFriendRequest(req.fromId)}
                                            className="p-1.5 bg-rose-500/20 text-rose-500 rounded hover:bg-rose-500/30"
                                          >
                                              <X className="w-4 h-4" />
                                          </button>
                                      </div>
                                  </div>
                              )
                          })
                      )}
                  </div>
              </Card>

              {/* Search */}
              <Card className="h-[240px] flex flex-col">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-500 mb-4">Add Friends</h3>
                  <div className="relative mb-4">
                      <input 
                        type="text" 
                        placeholder="Search username..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-black/20 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-sm outline-none focus:border-rose-500 text-white"
                      />
                      <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
                  </div>
                  
                  <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2">
                      {searchTerm.length > 0 && searchResults.length === 0 && (
                          <div className="text-center text-zinc-500 text-xs">No users found.</div>
                      )}
                      {searchResults.map(user => (
                          <div key={user.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-white/5 transition-colors">
                              <div className="flex items-center space-x-2">
                                  <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-white text-xs overflow-hidden">
                                      {user.avatarUrl ? <img src={user.avatarUrl} className="w-full h-full object-cover"/> : user.username[0]}
                                  </div>
                                  <span className="text-sm text-zinc-300">{user.username}</span>
                              </div>
                              {currentUser.friendRequests?.some(r => r.toId === user.id) ? (
                                  <span className="text-[10px] text-zinc-500 uppercase">Sent</span>
                              ) : (
                                  <button 
                                    onClick={() => sendFriendRequest(user.id)}
                                    className="p-1.5 bg-zinc-700/50 text-zinc-300 rounded hover:bg-rose-500 hover:text-white transition-colors"
                                  >
                                      <UserPlus className="w-3 h-3" />
                                  </button>
                              )}
                          </div>
                      ))}
                  </div>
              </Card>

          </div>
      </div>
    </div>
  );
};

export default FriendsView;
