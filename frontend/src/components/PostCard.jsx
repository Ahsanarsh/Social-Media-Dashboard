import { useNavigate } from "react-router-dom";
import { useRef, useState, memo } from "react";
import { formatDistanceToNow } from "date-fns";
import { useDispatch, useSelector } from "react-redux";
import { likePost, unlikePost, repostPost } from "../features/postsSlice";
import { Heart, MessageCircle, Repeat, Share, Bookmark } from "lucide-react";
import classNames from "classnames";
import CommentModal from "./CommentModal";
import RepostModal from "./RepostModal";
import api from "../api/api";

const PostCard = memo(({ post }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  // Local state for optimistic updates / immediate feedback
  const [isLiked, setIsLiked] = useState(post.is_liked);
  const [likesCount, setLikesCount] = useState(parseInt(post.likes_count) || 0);
  const [isReposted, setIsReposted] = useState(post.is_reposted);
  const [repostsCount, setRepostsCount] = useState(
    parseInt(post.reposts_count) || 0
  );
  const [commentsCount, setCommentsCount] = useState(
    parseInt(post.comments_count) || 0
  );
  const [isBookmarked, setIsBookmarked] = useState(post.is_bookmarked);

  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);
  const [isRepostModalOpen, setIsRepostModalOpen] = useState(false);

  const handleLike = () => {
    if (isLiked) {
      dispatch(unlikePost(post.id));
      setLikesCount((prev) => Math.max(0, prev - 1));
      setIsLiked(false);
    } else {
      dispatch(likePost(post.id));
      setLikesCount((prev) => prev + 1);
      setIsLiked(true);
    }
  };

  const handleRepost = (e) => {
    e.stopPropagation();
    if (isReposted) return; // Prevent double reposting for now, as backend treats it as unique

    dispatch(repostPost(post.id));
    setIsReposted(true);
    setRepostsCount((prev) => prev + 1);
  };

  const handleBookmark = async () => {
    const previousState = isBookmarked;
    setIsBookmarked(!isBookmarked);

    try {
      if (isBookmarked) {
        await api.delete(`/posts/${post.id}/bookmark`);
      } else {
        await api.post(`/posts/${post.id}/bookmark`);
      }
    } catch (error) {
      console.error("Failed to bookmark/unbookmark:", error);
      setIsBookmarked(previousState); // Revert on error
    }
  };

  const handleProfileClick = (e) => {
    e.stopPropagation();
    navigate(`/profile/${post.username}`);
  };

  const handlePostClick = () => {
    navigate(`/post/${post.id}`);
  };

  return (
    <>
      <article
        className="border-b border-gray-200 dark:border-gray-800 p-3 sm:p-4 md:p-5 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors cursor-pointer"
        onClick={handlePostClick}
      >
        <div className="flex gap-2 sm:gap-3">
          {/* Avatar - Responsive sizing */}
          <img
            src={post.avatar || "https://via.placeholder.com/40"}
            alt={post.name}
            className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover hover:opacity-80 transition-opacity cursor-pointer shrink-0"
            onClick={handleProfileClick}
          />

          <div className="flex-1 min-w-0">
            {/* User metadata - Responsive text sizing */}
            <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
              <span
                className="font-bold text-sm sm:text-base text-gray-900 dark:text-gray-100 hover:underline cursor-pointer truncate max-w-[120px] sm:max-w-none"
                onClick={handleProfileClick}
              >
                {post.name}
              </span>
              <span
                className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm hover:underline cursor-pointer truncate max-w-[100px] sm:max-w-none"
                onClick={handleProfileClick}
              >
                @{post.username}
              </span>
              <span className="text-gray-500 text-xs sm:text-sm">·</span>
              <span className="text-gray-500 text-xs sm:text-sm hover:underline">
                {formatDistanceToNow(new Date(post.created_at), {
                  addSuffix: true,
                })}
              </span>
            </div>

            {/* Post content - Fluid text sizing */}
            <p className="mt-1.5 sm:mt-2 text-sm sm:text-base text-gray-900 dark:text-gray-100 whitespace-pre-wrap wrap-break-word">
              {post.content}
            </p>

            {/* Post image - Fluid scaling on all devices */}
            {post.image_url && (
              <div className="mt-2 sm:mt-3 -mx-1 sm:mx-0 bg-gray-100 dark:bg-gray-800 rounded-lg sm:rounded-xl overflow-hidden">
                <img
                  src={post.image_url}
                  alt="Post content"
                  className="w-full h-auto object-cover max-h-[300px] sm:max-h-[400px] md:max-h-[500px]"
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                  onLoad={(e) => {
                    e.target.style.opacity = "1";
                  }}
                  style={{ opacity: 0, transition: "opacity 0.3s ease-in" }}
                />
              </div>
            )}

            {/* Interaction buttons - Larger tap targets on mobile */}
            <div className="flex justify-between items-center mt-3 sm:mt-4 max-w-full sm:max-w-md text-gray-500">
              {/* Comment button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsCommentModalOpen(true);
                }}
                className="flex items-center gap-1 sm:gap-2 group hover:text-blue-500 transition-colors min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 justify-center sm:justify-start"
              >
                <div className="p-2 sm:p-2 rounded-full group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20 transition-colors">
                  <MessageCircle
                    size={18}
                    className="sm:w-[18px] sm:h-[18px] w-5 h-5"
                  />
                </div>
                <span className="text-xs sm:text-sm font-medium">
                  {commentsCount}
                </span>
              </button>

              {/* Repost button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsRepostModalOpen(true);
                }}
                className={classNames(
                  "flex items-center gap-1 sm:gap-2 group transition-colors min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 justify-center sm:justify-start",
                  {
                    "text-green-500": isReposted,
                    "hover:text-green-500": !isReposted,
                  }
                )}
              >
                <div className="p-2 sm:p-2 rounded-full group-hover:bg-green-50 dark:group-hover:bg-green-900/20 transition-colors">
                  <Repeat
                    size={18}
                    className="sm:w-[18px] sm:h-[18px] w-5 h-5"
                  />
                </div>
                <span className="text-xs sm:text-sm font-medium">
                  {repostsCount}
                </span>
              </button>

              {/* Like button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleLike();
                }}
                className={classNames(
                  "flex items-center gap-1 sm:gap-2 group transition-colors min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 justify-center sm:justify-start",
                  {
                    "text-pink-500": isLiked,
                    "hover:text-pink-500": !isLiked,
                  }
                )}
              >
                <div className="p-2 sm:p-2 rounded-full group-hover:bg-pink-50 dark:group-hover:bg-pink-900/20 transition-colors">
                  <Heart
                    size={18}
                    fill={isLiked ? "currentColor" : "none"}
                    className="sm:w-[18px] sm:h-[18px] w-5 h-5"
                  />
                </div>
                <span className="text-xs sm:text-sm font-medium">
                  {likesCount}
                </span>
              </button>

              {/* Bookmark button - Hidden on very small screens */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleBookmark();
                }}
                className={classNames(
                  "flex items-center gap-1 sm:gap-2 group transition-colors min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 justify-center sm:justify-start",
                  {
                    "text-blue-500": isBookmarked,
                    "hover:text-blue-500": !isBookmarked,
                  }
                )}
              >
                <div className="p-2 sm:p-2 rounded-full group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20 transition-colors">
                  <Bookmark
                    size={18}
                    className={classNames(
                      "sm:w-[18px] sm:h-[18px] w-5 h-5 transition-all",
                      {
                        "fill-blue-500": isBookmarked,
                      }
                    )}
                  />
                </div>
              </button>

              {/* Share button - Hidden on very small screens */}
              <button
                onClick={(e) => e.stopPropagation()}
                className="hidden xs:flex items-center gap-1 sm:gap-2 group hover:text-blue-500 transition-colors min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 justify-center sm:justify-start"
              >
                <div className="p-2 sm:p-2 rounded-full group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20 transition-colors">
                  <Share
                    size={18}
                    className="sm:w-[18px] sm:h-[18px] w-5 h-5"
                  />
                </div>
              </button>
            </div>
          </div>
        </div>
      </article>

      {isCommentModalOpen && (
        <CommentModal
          isOpen={isCommentModalOpen}
          onClose={() => setIsCommentModalOpen(false)}
          post={post}
          onCommentAdded={() => setCommentsCount((prev) => prev + 1)}
        />
      )}

      {/* Repost Modal */}
      <RepostModal
        isOpen={isRepostModalOpen}
        onClose={() => setIsRepostModalOpen(false)}
        post={post}
        onRepost={() => {
          setIsReposted(true);
          setRepostsCount((prev) => prev + 1);
        }}
      />
    </>
  );
});

PostCard.displayName = "PostCard";

export default PostCard;
