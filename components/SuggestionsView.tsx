import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import Card from './ui/Card';
import Button from './ui/Button';
import { Send, Lightbulb, Heart, Trash2, Tag, TrendingUp, Code, CheckCircle } from 'lucide-react';

const SuggestionsView = () => {
  const { themeMode, submitTicket, allUsers, currentUser, updateTicket } = useGame();
  const { tickets } = useGame();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;
    setSending(true);
    try {
      await submitTicket(
        'suggestion',
        title.trim(),
        description.trim(),
        {}
      );
      setTitle('');
      setDescription('');
    } finally {
      setSending(false);
    }
  };

  const handleLike = async (ticketId: string, currentLikes: string[]) => {
    if (!currentUser || currentLikes.includes(currentUser.id)) return;
    
    try {
      await updateTicket(ticketId, {
        likes: [...currentLikes, currentUser.id]
      });
    } catch (error) {
      console.error('Error liking suggestion:', error);
    }
  };

  const handleCategoryChange = async (ticketId: string, category: string) => {
    try {
      await updateTicket(ticketId, {
        category: category
      });
    } catch (error) {
      console.error('Error updating category:', error);
    }
  };

  const handleDeleteSuggestion = async (ticketId: string) => {
    if (!confirm('Are you sure you want to delete this suggestion?')) return;
    
    try {
      await updateTicket(ticketId, {
        deleted: true
      });
    } catch (error) {
      console.error('Error deleting suggestion:', error);
    }
  };

  const isAdmin = currentUser?.role === 'owner' || currentUser?.role === 'mod' || currentUser?.role === 'dev' || currentUser?.role === 'helper';
  const categories = ['Priority', 'In Development', 'Completed'];

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Priority':
        return 'bg-red-500/10 text-red-400 border-red-500/20';
      case 'In Development':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'Completed':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      default:
        return 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Priority':
        return <TrendingUp className="w-3 h-3" />;
      case 'In Development':
        return <Code className="w-3 h-3" />;
      case 'Completed':
        return <CheckCircle className="w-3 h-3" />;
      default:
        return <Tag className="w-3 h-3" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8 text-center">
        <h2 className={`text-4xl font-display font-bold ${themeMode === 'dark' ? 'text-white' : 'text-black'}`}>
          Suggestions
        </h2>
        <p className="text-zinc-500 uppercase tracking-widest text-xs mt-2">Share your ideas for the site</p>
      </div>

      <Card className="mb-8">
        <div className="flex items-center gap-2 mb-6 text-zinc-400">
          <Lightbulb className="w-5 h-5" />
          <h3 className="text-sm font-bold uppercase tracking-widest">Submit a suggestion</h3>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={`block text-xs uppercase tracking-wider mb-2 ${themeMode === 'dark' ? 'text-zinc-500' : 'text-zinc-600'}`}>
              Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Short title for your suggestion"
              maxLength={120}
              className={`w-full rounded-xl p-3 border outline-none transition-colors ${themeMode === 'dark' ? 'bg-black/20 border-white/10 text-white placeholder:text-zinc-500 focus:border-rose-500' : 'bg-white border-zinc-200 text-zinc-900 placeholder:text-zinc-400 focus:border-rose-500'
                }`}
            />
          </div>
          <div>
            <label className={`block text-xs uppercase tracking-wider mb-2 ${themeMode === 'dark' ? 'text-zinc-500' : 'text-zinc-600'}`}>
              Description *
            </label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Describe your suggestion in detail..."
              rows={4}
              className={`w-full rounded-xl p-3 border outline-none resize-none transition-colors ${themeMode === 'dark' ? 'bg-black/20 border-white/10 text-white placeholder:text-zinc-500 focus:border-rose-500' : 'bg-white border-zinc-200 text-zinc-900 placeholder:text-zinc-400 focus:border-rose-500'
                }`}
            />
          </div>
          <Button type="submit" disabled={sending || !title.trim() || !description.trim()} className="w-full sm:w-auto">
            {sending ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Sending...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <Send className="w-4 h-4" />
                Submit suggestion
              </span>
            )}
          </Button>
        </form>
        <p className="text-xs text-zinc-500 mt-4">
          Your username will be visible to staff. Suggestions appear in the admin dashboard.
        </p>
      </Card>

      {/* Suggestions List */}
      <Card>
        <div className="flex items-center gap-2 mb-6 text-zinc-400">
          <Lightbulb className="w-5 h-5" />
          <h3 className="text-sm font-bold uppercase tracking-widest">All suggestions</h3>
        </div>
        
        {tickets && tickets.filter(t => t.type === 'suggestion' && !t.deleted).length > 0 ? (
          <div className="space-y-4">
            {tickets
              .filter(t => t.type === 'suggestion' && !t.deleted)
              .sort((a, b) => b.timestamp - a.timestamp)
              .map(t => {
                const author = allUsers.find(u => u.id === t.userId);
                const likes = t.likes || [];
                const category = t.category || 'Suggestion';
                const isLiked = currentUser && likes.includes(currentUser.id);
                
                return (
                  <div key={t.id} className={`relative group p-4 rounded-xl border transition-all duration-300 ${themeMode === 'dark' ? 'bg-white/5 border-white/10 hover:bg-white/10' : 'bg-black/5 border-black/10 hover:bg-black/10'}`}>
                    {/* Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-rose-500/20 to-purple-500/20 p-0.5">
                          <div className="w-full h-full rounded-full bg-zinc-900 flex items-center justify-center overflow-hidden">
                            {author?.avatarUrl ? (
                              <img src={author.avatarUrl} alt={t.username} className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-white font-bold text-xs">{t.username[0]}</span>
                            )}
                          </div>
                        </div>
                        <div>
                          <div className="font-semibold text-sm">{t.username}</div>
                          <div className={`text-xs ${themeMode === 'dark' ? 'text-zinc-500' : 'text-zinc-600'}`}>
                            {new Date(t.timestamp).toLocaleDateString()} at {new Date(t.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </div>
                      
                      {/* Category Badge */}
                      <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-medium uppercase tracking-wider ${getCategoryColor(category)}`}>
                        {getCategoryIcon(category)}
                        {category}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="mb-4">
                      <h4 className={`text-lg font-bold mb-2 ${themeMode === 'dark' ? 'text-white' : 'text-black'}`}>
                        {t.subject || 'Suggestion'}
                      </h4>
                      <p className={`text-sm ${themeMode === 'dark' ? 'text-zinc-300' : 'text-zinc-700'}`}>
                        {t.message}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        {/* Like Button */}
                        <button
                          onClick={() => handleLike(t.id, likes)}
                          disabled={!currentUser || isLiked}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all text-xs font-medium ${
                            isLiked 
                              ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' 
                              : 'bg-white/5 text-zinc-400 border border-white/10 hover:bg-rose-500/10 hover:text-rose-400 hover:border-rose-500/20'
                          }`}
                        >
                          <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-current' : ''}`} />
                          {likes.length}
                        </button>
                      </div>

                      {/* Admin Actions */}
                      {isAdmin && (
                        <div className="flex items-center gap-2">
                          {/* Category Selector */}
                          <select
                            value={category}
                            onChange={(e) => handleCategoryChange(t.id, e.target.value)}
                            className={`text-xs px-2 py-1 rounded-lg border outline-none ${themeMode === 'dark' ? 'bg-black/20 border-white/10 text-white' : 'bg-white border-zinc-200 text-black'}`}
                          >
                            <option value="Suggestion">Suggestion</option>
                            {categories.map(cat => (
                              <option key={cat} value={cat}>{cat}</option>
                            ))}
                          </select>
                          
                          {/* Delete Button */}
                          <button
                            onClick={() => handleDeleteSuggestion(t.id)}
                            className="p-1.5 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-all"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>
        ) : (
          <p className="text-xs text-zinc-500 text-center py-8">No suggestions yet.</p>
        )}
      </Card>
    </div>
  );
};

export default SuggestionsView;
