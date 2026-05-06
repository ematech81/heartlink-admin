'use client';
import { useEffect, useState, useCallback } from 'react';
import { Search, Trash2, Star, ChevronLeft, ChevronRight, Play, Heart, Eye } from 'lucide-react';
import Header from '@/components/Header';
import { AdminAPI } from '@/lib/api';
import clsx from 'clsx';

const LIMIT = 18;

export default function CommunityPage() {
  const [posts,      setPosts]      = useState([]);
  const [total,      setTotal]      = useState(0);
  const [page,       setPage]       = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading,    setLoading]    = useState(true);
  const [search,     setSearch]     = useState('');
  const [sort,       setSort]       = useState('recent');
  const [actionId,   setActionId]   = useState(null);

  const load = useCallback(async (pg = 1) => {
    setLoading(true);
    try {
      const data = await AdminAPI.getPosts({ page: pg, limit: LIMIT, sort, search });
      setPosts(data.posts);
      setTotal(data.total);
      setTotalPages(data.totalPages);
      setPage(pg);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [sort, search]);

  useEffect(() => { load(1); }, [sort]);

  const deletePost = async (post) => {
    if (!confirm('Delete this post?')) return;
    setActionId(post._id);
    try {
      await AdminAPI.deletePost(post._id);
      setPosts(prev => prev.filter(p => p._id !== post._id));
      setTotal(t => t - 1);
    } catch (err) { alert(err.message); }
    finally { setActionId(null); }
  };

  const featurePost = async (post) => {
    setActionId(post._id);
    try { await AdminAPI.featurePost(post._id); load(page); }
    catch (err) { alert(err.message); }
    finally { setActionId(null); }
  };

  return (
    <>
      <Header title="Community" subtitle={`${total.toLocaleString()} posts`} />
      <main className="flex-1 p-6 space-y-4 overflow-y-auto">
        <div className="card p-4 flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input className="input pl-9" placeholder="Search captions…" value={search}
              onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && load(1)} />
          </div>
          {['recent', 'trending', 'liked'].map(s => (
            <button key={s} onClick={() => setSort(s)}
              className={clsx('px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors',
                sort === s ? 'bg-primary text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200')}>
              {s}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <span className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20 text-slate-400">No posts found</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
            {posts.map(post => (
              <PostCard key={post._id} post={post} onDelete={deletePost} onFeature={featurePost} actionId={actionId} />
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-3">
            <button onClick={() => load(page - 1)} disabled={page === 1} className="p-2 rounded-lg hover:bg-slate-100 disabled:opacity-30"><ChevronLeft className="w-4 h-4" /></button>
            <span className="text-sm text-slate-600">{page} / {totalPages}</span>
            <button onClick={() => load(page + 1)} disabled={page === totalPages} className="p-2 rounded-lg hover:bg-slate-100 disabled:opacity-30"><ChevronRight className="w-4 h-4" /></button>
          </div>
        )}
      </main>
    </>
  );
}

function PostCard({ post, onDelete, onFeature, actionId }) {
  const isVideo = post.mediaType === 'video';
  const busy    = actionId === post._id;
  return (
    <div className="card overflow-hidden group">
      <div className="relative aspect-[4/5] bg-slate-100">
        {post.mediaUrl ? (
          isVideo ? (
            <><video src={post.mediaUrl} className="w-full h-full object-cover" muted playsInline />
              <div className="absolute inset-0 flex items-center justify-center bg-black/20"><Play className="w-8 h-8 text-white opacity-80" /></div></>
          ) : <img src={post.mediaUrl} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-300 text-xs p-2 text-center">{post.caption || 'No media'}</div>
        )}
        {post.isFeatured && <div className="absolute top-2 left-2"><span className="badge bg-yellow-400 text-yellow-900">★ Featured</span></div>}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between p-2">
          <button onClick={() => onFeature(post)} disabled={busy} className="p-1.5 rounded-lg bg-yellow-400 text-yellow-900 hover:bg-yellow-500 transition-colors" title={post.isFeatured ? 'Unfeature' : 'Feature'}>
            <Star className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => onDelete(post)} disabled={busy} className="p-1.5 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
      <div className="p-2">
        <p className="text-xs font-medium text-slate-700 truncate">{post.author?.name || 'Unknown'}</p>
        <div className="flex items-center gap-2 mt-1">
          <span className="flex items-center gap-0.5 text-xs text-slate-400"><Heart className="w-3 h-3" /> {post.likes?.length || 0}</span>
          <span className="flex items-center gap-0.5 text-xs text-slate-400"><Eye className="w-3 h-3" /> {post.viewCount || 0}</span>
        </div>
        {post.caption && <p className="text-xs text-slate-400 mt-1 truncate">{post.caption}</p>}
      </div>
    </div>
  );
}
