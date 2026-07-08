import React, { useState } from 'react';
import { BLOG_POSTS } from '../data/blog';
import { BlogPost } from '../types';
import { Calendar, User, Tag, ArrowLeft, Send } from 'lucide-react';

interface BlogViewProps {
  onBack: () => void;
}

export default function BlogView({ onBack }: BlogViewProps) {
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [posts, setPosts] = useState<BlogPost[]>(BLOG_POSTS);
  const [commentName, setCommentName] = useState('');
  const [commentText, setCommentText] = useState('');

  const handleAddComment = (e: React.FormEvent, postId: string) => {
    e.preventDefault();
    if (!commentName || !commentText) return;

    const updatedPosts = posts.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          comments: [
            ...post.comments,
            {
              author: commentName,
              text: commentText,
              date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
            }
          ]
        };
      }
      return post;
    });

    setPosts(updatedPosts);
    const postToUpdate = updatedPosts.find(p => p.id === postId);
    if (postToUpdate) {
      setSelectedPost(postToUpdate);
    }
    setCommentName('');
    setCommentText('');
  };

  if (selectedPost) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4">
        <button
          onClick={() => setSelectedPost(null)}
          className="flex items-center gap-2 text-purple-400 hover:text-purple-300 mb-6 font-display font-medium transition-colors"
        >
          <ArrowLeft size={16} />
          Back to all articles
        </button>

        <img
          src={selectedPost.imageUrl}
          alt={selectedPost.title}
          className="w-full h-80 object-cover rounded-2xl border border-slate-800 shadow-xl mb-8"
        />

        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 font-mono mb-4">
          <span className="flex items-center gap-1.5 bg-slate-900 border border-slate-800/60 px-3 py-1.5 rounded-full text-purple-300">
            <Tag size={12} />
            {selectedPost.category}
          </span>
          <span className="flex items-center gap-1">
            <Calendar size={12} />
            {selectedPost.date}
          </span>
          <span className="flex items-center gap-1">
            <User size={12} />
            Published by Dream Records Editorial
          </span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-bold font-display text-white tracking-tight mb-6">
          {selectedPost.title}
        </h1>

        <div className="prose prose-invert max-w-none text-slate-300 space-y-6 leading-relaxed">
          {selectedPost.content.split('\n\n').map((paragraph, idx) => {
            if (paragraph.trim().startsWith('###')) {
              return (
                <h3 key={idx} className="text-xl font-bold font-display text-white pt-4">
                  {paragraph.replace('###', '').trim()}
                </h3>
              );
            }
            if (paragraph.trim().startsWith('*')) {
              return (
                <ul key={idx} className="list-disc pl-6 space-y-2">
                  {paragraph.split('\n').map((item, id) => (
                    <li key={id}>{item.replace('*', '').trim()}</li>
                  ))}
                </ul>
              );
            }
            return <p key={idx}>{paragraph.trim()}</p>;
          })}
        </div>

        {/* Tags */}
        <div className="flex gap-2 flex-wrap border-t border-b border-slate-800 py-6 my-8">
          {selectedPost.tags.map((tag) => (
            <span key={tag} className="text-xs bg-slate-900/60 border border-slate-800 text-slate-400 px-2.5 py-1 rounded-md">
              #{tag}
            </span>
          ))}
        </div>

        {/* Comment Section */}
        <div className="mt-12 bg-slate-900/40 rounded-xl border border-slate-800/60 p-6 sm:p-8">
          <h4 className="text-lg font-bold font-display text-white mb-6">
            Reader Comments ({selectedPost.comments.length})
          </h4>

          <div className="space-y-4 mb-8">
            {selectedPost.comments.map((comment, idx) => (
              <div key={idx} className="p-4 rounded-lg bg-slate-950/60 border border-slate-800/40">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-purple-300 font-display">{comment.author}</span>
                  <span className="text-[10px] text-slate-500 font-mono">{comment.date}</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">{comment.text}</p>
              </div>
            ))}
            {selectedPost.comments.length === 0 && (
              <p className="text-sm text-slate-500 italic font-mono text-center py-4">No comments yet. Be the first to start the conversation!</p>
            )}
          </div>

          <form onSubmit={(e) => handleAddComment(e, selectedPost.id)} className="space-y-4">
            <h5 className="text-xs font-semibold uppercase tracking-wider text-slate-400 font-mono">Join the Discussion</h5>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <input
                  type="text"
                  required
                  placeholder="Your Name / Handle"
                  value={commentName}
                  onChange={(e) => setCommentName(e.target.value)}
                  className="w-full py-2 px-3 bg-slate-950 border border-slate-800 rounded-lg text-white text-xs placeholder-slate-600 focus:outline-none focus:border-purple-500 transition-colors"
                />
              </div>
              <div className="sm:col-span-2">
                <textarea
                  required
                  rows={3}
                  placeholder="Type your comment regarding this article..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  className="w-full py-2 px-3 bg-slate-950 border border-slate-800 rounded-lg text-white text-xs placeholder-slate-600 focus:outline-none focus:border-purple-500 transition-colors"
                />
              </div>
            </div>
            <button
              type="submit"
              className="py-2 px-4 bg-purple-600 hover:bg-purple-500 text-white font-medium rounded-lg text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              Post Comment
              <Send size={12} />
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-12 px-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
        <div>
          <h2 className="text-3xl font-bold font-display text-white tracking-tight">Dream Records Editorial</h2>
          <p className="text-sm text-slate-400 mt-1">Pro distribution advice, streaming insights, and platform optimization strategies.</p>
        </div>
        <button
          onClick={onBack}
          className="py-2 px-4 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs transition-all flex items-center gap-1.5"
        >
          <ArrowLeft size={14} />
          Return to Portal
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {posts.map((post) => (
          <div
            key={post.id}
            onClick={() => setSelectedPost(post)}
            className="group rounded-2xl overflow-hidden border border-slate-800/60 bg-slate-900/30 hover:bg-slate-900/50 hover:border-purple-500/30 transition-all cursor-pointer shadow-lg flex flex-col h-full"
          >
            <div className="relative h-48 overflow-hidden">
              <img
                src={post.imageUrl}
                alt={post.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <span className="absolute top-3 left-3 bg-purple-600/90 backdrop-blur-sm text-white text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded">
                {post.category}
              </span>
            </div>
            <div className="p-6 flex flex-col flex-grow">
              <div className="flex items-center gap-3 text-[10px] text-slate-500 font-mono mb-3">
                <span className="flex items-center gap-1">
                  <Calendar size={10} />
                  {post.date}
                </span>
                <span>•</span>
                <span>{post.comments.length} Comments</span>
              </div>
              <h3 className="text-base font-bold font-display text-white group-hover:text-purple-400 transition-colors line-clamp-2 mb-2 leading-snug">
                {post.title}
              </h3>
              <p className="text-xs text-slate-400 line-clamp-3 mb-4 leading-relaxed">
                {post.summary}
              </p>
              <div className="mt-auto flex items-center text-xs text-purple-400 font-bold font-display group-hover:text-purple-300 transition-colors">
                Read article
                <span className="ml-1 group-hover:translate-x-1 transition-transform inline-block">→</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
