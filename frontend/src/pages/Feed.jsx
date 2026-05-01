import { useContext, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  FiHeart, FiMessageCircle, FiSend, FiTrash2, FiTag, FiPlus,
} from 'react-icons/fi';
import { API_ENDPOINTS, apiCall } from '../config/api';
import { AuthContext } from '../context/AuthContext';
import '../styles/feed.css';

const KIND_OPTIONS = [
  { value: 'general',   label: 'Update' },
  { value: 'milestone', label: 'Milestone' },
  { value: 'launch',    label: 'Launch' },
  { value: 'looking',   label: 'Looking for help' },
];

const KIND_TINTS = {
  general:   'rgba(99, 102, 241, 0.16)',
  milestone: 'rgba(110, 231, 183, 0.16)',
  launch:    'rgba(168, 85, 247, 0.16)',
  looking:   'rgba(251, 191, 36, 0.16)',
  update:    'rgba(99, 102, 241, 0.16)',
};

const formatTimeAgo = (date) => {
  const ms = Date.now() - new Date(date).getTime();
  const s = Math.floor(ms / 1000);
  if (s < 60)        return 'just now';
  const m = Math.floor(s / 60);
  if (m < 60)        return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24)        return `${h}h`;
  const d = Math.floor(h / 24);
  if (d < 7)         return `${d}d`;
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const Feed = () => {
  const { user, profileData } = useContext(AuthContext);
  const userId = user?.id || user?._id;

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Composer state
  const [content, setContent]               = useState('');
  const [kind, setKind]                     = useState('general');
  const [myProjects, setMyProjects]         = useState([]);
  const [relatedProject, setRelatedProject] = useState('');
  const [submitting, setSubmitting]         = useState(false);

  // Comment state — { [postId]: text }
  const [commentTexts, setCommentTexts] = useState({});
  const [openComments, setOpenComments] = useState({});

  useEffect(() => {
    fetchFeed(1);
    fetchMyProjects();
  }, []);

  const fetchFeed = async (p = 1) => {
    try {
      setLoading(true);
      const data = await apiCall(`${API_ENDPOINTS.posts}?page=${p}&limit=10`);
      const fresh = data?.data?.posts || [];
      setPosts(p === 1 ? fresh : [...posts, ...fresh]);
      setTotalPages(data?.totalPages || 1);
      setPage(p);
    } catch (err) {
      toast.error('Failed to load feed');
    } finally {
      setLoading(false);
    }
  };

  const fetchMyProjects = async () => {
    try {
      const data = await apiCall(`${API_ENDPOINTS.userProjects}?page=1&limit=20`);
      setMyProjects(data?.data?.projects || []);
    } catch {
      // non-fatal — composer will just not show project options
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    setSubmitting(true);
    try {
      const data = await apiCall(API_ENDPOINTS.posts, {
        method: 'POST',
        body: JSON.stringify({
          content: content.trim(),
          kind,
          relatedProject: relatedProject || undefined,
        }),
      });
      const newPost = data?.data?.post;
      if (newPost) setPosts((prev) => [newPost, ...prev]);
      setContent('');
      setRelatedProject('');
      setKind('general');
      toast.success('Posted!');
    } catch (err) {
      toast.error(err.message || 'Failed to post');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLike = async (postId) => {
    // optimistic
    setPosts((prev) => prev.map((p) => {
      if (p._id !== postId) return p;
      const liked = p.likes?.some((id) => id?.toString?.() === userId || id === userId);
      const nextLikes = liked
        ? p.likes.filter((id) => (id?.toString?.() ?? id) !== userId)
        : [...(p.likes || []), userId];
      return { ...p, likes: nextLikes };
    }));
    try {
      await apiCall(API_ENDPOINTS.postLike(postId), { method: 'POST' });
    } catch {
      // revert on failure — refetch this post indirectly by full refresh
      toast.error('Failed to update like');
    }
  };

  const handleAddComment = async (postId) => {
    const text = (commentTexts[postId] || '').trim();
    if (!text) return;
    try {
      const data = await apiCall(API_ENDPOINTS.postComment(postId), {
        method: 'POST',
        body: JSON.stringify({ text }),
      });
      const newComments = data?.data?.comments;
      setPosts((prev) => prev.map((p) =>
        p._id === postId ? { ...p, comments: newComments || p.comments } : p,
      ));
      setCommentTexts((prev) => ({ ...prev, [postId]: '' }));
    } catch (err) {
      toast.error(err.message || 'Failed to comment');
    }
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm('Delete this post?')) return;
    try {
      await apiCall(API_ENDPOINTS.post(postId), { method: 'DELETE' });
      setPosts((prev) => prev.filter((p) => p._id !== postId));
      toast.success('Post deleted');
    } catch (err) {
      toast.error(err.message || 'Failed to delete');
    }
  };

  const isLikedByMe = (post) =>
    post.likes?.some((id) => (id?.toString?.() ?? id) === userId);

  const myInitial = (profileData?.userName || user?.userName || user?.email || '?')
    .charAt(0)
    .toUpperCase();

  return (
    <div className="feed-page">
      <div className="feed-container">
        <header className="feed-header">
          <h1>Feed</h1>
          <p>Share updates, milestones, and what you're building.</p>
        </header>

        {/* ── Composer ── */}
        <form className="feed-composer" onSubmit={handleCreatePost}>
          <div className="feed-composer-top">
            <div className="feed-composer-avatar">
              {profileData?.profileImage ? (
                <img src={profileData.profileImage} alt="You" />
              ) : (
                <span>{myInitial}</span>
              )}
            </div>
            <textarea
              className="feed-composer-input"
              placeholder="Share an update, milestone, or what you're looking for…"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              maxLength={2000}
              rows={3}
            />
          </div>
          <div className="feed-composer-bottom">
            <div className="feed-composer-options">
              <select
                className="feed-composer-select"
                value={kind}
                onChange={(e) => setKind(e.target.value)}
              >
                {KIND_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
              {myProjects.length > 0 && (
                <select
                  className="feed-composer-select"
                  value={relatedProject}
                  onChange={(e) => setRelatedProject(e.target.value)}
                >
                  <option value="">Link a project (optional)</option>
                  {myProjects.map((p) => (
                    <option key={p._id} value={p._id}>{p.title}</option>
                  ))}
                </select>
              )}
            </div>
            <button
              type="submit"
              className="feed-composer-submit"
              disabled={submitting || !content.trim()}
            >
              <FiPlus size={14} /> {submitting ? 'Posting…' : 'Post'}
            </button>
          </div>
        </form>

        {/* ── Feed list ── */}
        <div className="feed-list">
          {loading && posts.length === 0 && (
            <div className="feed-loading"><div className="feed-spinner" /> Loading…</div>
          )}

          {!loading && posts.length === 0 && (
            <div className="feed-empty">
              <p>No posts yet. Be the first to share an update.</p>
            </div>
          )}

          {posts.map((post) => {
            const liked = isLikedByMe(post);
            const isMine = (post.author?._id?.toString?.() ?? post.author?._id) === userId;
            const commentsOpen = !!openComments[post._id];
            const tint = KIND_TINTS[post.kind] || KIND_TINTS.general;

            return (
              <article key={post._id} className="feed-post" style={{ '--kind-tint': tint }}>
                <header className="feed-post-header">
                  <Link to={`/profile/${post.author?._id}`} className="feed-post-avatar">
                    {post.author?.profilePicture && !post.author.profilePicture.includes('placeholder') ? (
                      <img src={post.author.profilePicture} alt={post.author?.userName} />
                    ) : (
                      <span>{(post.author?.userName || '?').charAt(0).toUpperCase()}</span>
                    )}
                  </Link>
                  <div className="feed-post-meta">
                    <Link to={`/profile/${post.author?._id}`} className="feed-post-author">
                      {post.author?.userName || 'User'}
                    </Link>
                    <div className="feed-post-sub">
                      {post.author?.fieldOfStudy || post.author?.school || ''}
                      {post.author?.fieldOfStudy && post.author?.school ? ' · ' : ''}
                      {post.author?.school && post.author?.fieldOfStudy ? post.author.school : ''}
                      <span className="feed-dot">·</span>
                      <span>{formatTimeAgo(post.createdAt)}</span>
                    </div>
                  </div>
                  {post.kind && post.kind !== 'general' && (
                    <span className="feed-post-kind">
                      {KIND_OPTIONS.find((o) => o.value === post.kind)?.label || post.kind}
                    </span>
                  )}
                  {isMine && (
                    <button
                      className="feed-post-delete"
                      onClick={() => handleDeletePost(post._id)}
                      title="Delete post"
                    >
                      <FiTrash2 size={14} />
                    </button>
                  )}
                </header>

                <div className="feed-post-body">
                  <p className="feed-post-content">{post.content}</p>
                  {post.relatedProject && (
                    <Link to={`/profile/${post.author?._id}`} className="feed-post-project">
                      <FiTag size={12} />
                      <span>{post.relatedProject.title}</span>
                      {post.relatedProject.category && (
                        <span className="feed-post-project-cat">{post.relatedProject.category}</span>
                      )}
                    </Link>
                  )}
                </div>

                <footer className="feed-post-actions">
                  <button
                    className={`feed-action${liked ? ' feed-action-liked' : ''}`}
                    onClick={() => handleLike(post._id)}
                  >
                    <FiHeart size={15} fill={liked ? 'currentColor' : 'none'} />
                    <span>{post.likes?.length || 0}</span>
                  </button>
                  <button
                    className="feed-action"
                    onClick={() => setOpenComments((prev) => ({ ...prev, [post._id]: !commentsOpen }))}
                  >
                    <FiMessageCircle size={15} />
                    <span>{post.comments?.length || 0}</span>
                  </button>
                </footer>

                {commentsOpen && (
                  <div className="feed-comments">
                    {post.comments?.map((c) => (
                      <div key={c._id} className="feed-comment">
                        <Link to={`/profile/${c.user?._id}`} className="feed-comment-avatar">
                          {c.user?.profilePicture && !c.user.profilePicture.includes('placeholder') ? (
                            <img src={c.user.profilePicture} alt={c.user?.userName} />
                          ) : (
                            <span>{(c.user?.userName || '?').charAt(0).toUpperCase()}</span>
                          )}
                        </Link>
                        <div className="feed-comment-body">
                          <div className="feed-comment-name">{c.user?.userName || 'User'}</div>
                          <div className="feed-comment-text">{c.text}</div>
                        </div>
                        <span className="feed-comment-time">{formatTimeAgo(c.createdAt)}</span>
                      </div>
                    ))}
                    <div className="feed-comment-compose">
                      <input
                        type="text"
                        className="feed-comment-input"
                        placeholder="Write a comment…"
                        value={commentTexts[post._id] || ''}
                        onChange={(e) => setCommentTexts((prev) => ({ ...prev, [post._id]: e.target.value }))}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleAddComment(post._id);
                          }
                        }}
                      />
                      <button
                        className="feed-comment-send"
                        onClick={() => handleAddComment(post._id)}
                        disabled={!commentTexts[post._id]?.trim()}
                      >
                        <FiSend size={14} />
                      </button>
                    </div>
                  </div>
                )}
              </article>
            );
          })}

          {!loading && page < totalPages && (
            <button className="feed-load-more" onClick={() => fetchFeed(page + 1)}>
              Load more
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Feed;
