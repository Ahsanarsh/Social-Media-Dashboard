import { useState, useEffect } from "react";
import { X, Send, Heart } from "lucide-react";
import { useSelector } from "react-redux";
import api from "../api/api";
import { formatDistanceToNow } from "date-fns";
import Avatar from "./Avatar";

const CommentModal = ({ isOpen, onClose, post, onCommentAdded }) => {
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useSelector((state) => state.auth);
  const [comments, setComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(false);

  // Fetch comments when modal opens
  useEffect(() => {
    if (isOpen && post) {
      setLoadingComments(true);
      api
        .get(`/posts/${post.id}/comments`)
        .then((res) => {
          setComments(res.data.data || []);
        })
        .catch((err) => console.error("Failed to fetch comments", err))
        .finally(() => setLoadingComments(false));
    }
  }, [isOpen, post]);

  if (!isOpen || !post) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;

    setIsSubmitting(true);
    try {
      const { data } = await api.post(`/posts/${post.id}/comments`, {
        content,
      });

      // Optimistic update or refetch
      const newComment = {
        ...data.data,
        name: user.name,
        username: user.username,
        avatar: user.avatar,
        likes_count: 0,
        is_liked: false,
      };

      setComments((prev) => [...prev, newComment]);
      setContent("");
      if (onCommentAdded) onCommentAdded();
    } catch (error) {
      console.error("Failed to add comment:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLikeComment = async (commentId, isLiked) => {
    // Optimistic update
    setComments((prev) =>
      prev.map((c) =>
        c.id === commentId
          ? {
              ...c,
              is_liked: !isLiked,
              likes_count: isLiked ? c.likes_count - 1 : c.likes_count + 1,
            }
          : c
      )
    );

    try {
      if (isLiked) {
        await api.delete(`/comments/${commentId}/like`);
      } else {
        await api.post(`/comments/${commentId}/like`);
      }
    } catch (error) {
      console.error("Failed to like/unlike comment:", error);
      // Revert on error
      setComments((prev) =>
        prev.map((c) =>
          c.id === commentId
            ? {
                ...c,
                is_liked: isLiked,
                likes_count: isLiked ? c.likes_count + 1 : c.likes_count - 1,
              }
            : c
        )
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div
        className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800">
          <h3 className="font-bold text-lg dark:text-white">Reply</h3>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Comments List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Original Post Snippet */}
          <div className="flex space-x-3 mb-6 relative">
            <div className="w-0.5 bg-gray-200 dark:bg-gray-800 absolute left-5 top-12 bottom-[-16px] z-0"></div>
            <Avatar src={post.avatar} name={post.name} size="md" />
            <div>
              <div className="flex items-baseline space-x-2">
                <span className="font-bold dark:text-white">{post.name}</span>
                <span className="text-gray-500 text-sm">@{post.username}</span>
                <span className="text-gray-500 text-sm">
                  · {formatDistanceToNow(new Date(post.created_at))} ago
                </span>
              </div>
              <p className="text-gray-800 dark:text-gray-200 mt-1">
                {post.content}
              </p>
            </div>
          </div>

          {loadingComments ? (
            <div className="text-center py-4 text-gray-500">
              Loading comments...
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center py-4 text-gray-500 italic">
              No comments yet. Be the first!
            </div>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className="flex space-x-3">
                <Avatar
                  src={comment.avatar || comment.user?.avatar}
                  name={comment.name || comment.user?.name}
                  size="sm"
                />
                <div className="flex-1 bg-gray-50 dark:bg-gray-800/50 p-3 rounded-xl rounded-tl-none">
                  <div className="flex items-baseline justify-between">
                    <span className="font-bold text-sm dark:text-white">
                      {comment.name || comment.user?.name}
                    </span>
                    <span className="text-xs text-gray-500">
                      {formatDistanceToNow(new Date(comment.created_at), {
                        addSuffix: true,
                      })}
                    </span>
                  </div>
                  <p className="text-gray-800 dark:text-gray-200 text-sm mt-1">
                    {comment.content}
                  </p>
                  {/* Like Button */}
                  <div className="flex items-center gap-1 mt-2">
                    <button
                      onClick={() =>
                        handleLikeComment(comment.id, comment.is_liked)
                      }
                      className="group flex items-center gap-1 text-gray-500 hover:text-red-500 transition-colors"
                    >
                      <Heart
                        size={14}
                        className={`transition-all ${
                          comment.is_liked
                            ? "fill-red-500 text-red-500"
                            : "group-hover:fill-red-100"
                        }`}
                      />
                      {comment.likes_count > 0 && (
                        <span
                          className={`text-xs ${
                            comment.is_liked ? "text-red-500 font-medium" : ""
                          }`}
                        >
                          {comment.likes_count}
                        </span>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Input Area */}
        <form
          onSubmit={handleSubmit}
          className="p-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-black/20"
        >
          <div className="flex items-center space-x-3">
            <img
              src={user?.avatar || "https://via.placeholder.com/40"}
              alt={user?.name}
              className="w-8 h-8 rounded-full object-cover"
            />
            <div className="flex-1 relative">
              <input
                type="text"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Tweet your reply"
                className="w-full bg-tranparent border-none focus:ring-0 text-gray-900 dark:text-white placeholder-gray-500 bg-white dark:bg-gray-800 rounded-full px-4 py-2"
              />
            </div>
            <button
              type="submit"
              disabled={!content.trim() || isSubmitting}
              className="p-2 bg-violet-600 text-white rounded-full disabled:opacity-50 disabled:cursor-not-allowed hover:bg-violet-700 transition"
            >
              <Send size={18} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CommentModal;
