import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import api from "../api/api";
import {
  Loader,
  MapPin,
  Link as LinkIcon,
  Calendar,
  Plus,
  Bookmark,
  CheckCircle2,
} from "lucide-react";
import PostCard from "../components/PostCard";
import EditProfileModal from "../components/EditProfileModal";
import CreatePostModal from "../components/CreatePostModal";
import { followUser, unfollowUser } from "../features/usersSlice";

const Profile = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [likedPosts, setLikedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("posts");
  const [mutualFollowers, setMutualFollowers] = useState([]);

  useEffect(() => {
    const fetchProfileData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch profile info
        const profileRes = await api.get(`/users/${username}`);
        setProfile(profileRes.data.data);

        // Fetch user posts
        const userId = profileRes.data.data.id;
        const postsRes = await api.get(`/users/${userId}/posts`);
        setPosts(postsRes.data.data);

        // Fetch liked posts
        try {
          const likedRes = await api.get(`/users/${userId}/liked`);
          setLikedPosts(likedRes.data.data);
        } catch (err) {
          console.error("Error fetching liked posts:", err);
          setLikedPosts([]);
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
        setError("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    if (username) {
      fetchProfileData();
    }
  }, [username]);

  const handleFollow = async () => {
    if (!profile) return;

    // Optimistic update
    const isFollowingNow = profile.is_following;
    setProfile((prev) => ({
      ...prev,
      is_following: !isFollowingNow,
      followers_count:
        parseInt(prev.followers_count) + (isFollowingNow ? -1 : 1),
    }));

    try {
      if (isFollowingNow) {
        await dispatch(unfollowUser(profile.id)).unwrap();
      } else {
        await dispatch(followUser(profile.id)).unwrap();
      }
    } catch (error) {
      console.error("Follow action failed:", error);
      // Revert on failure
      setProfile((prev) => ({
        ...prev,
        is_following: isFollowingNow,
        followers_count:
          parseInt(prev.followers_count) + (isFollowingNow ? 1 : -1),
      }));
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader className="animate-spin text-violet-600" size={40} />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="text-center p-8 text-red-500">
        <p>{error || "User not found"}</p>
      </div>
    );
  }

  const isOwnProfile = currentUser?.username === profile.username;

  return (
    <div className="pb-20 md:pb-0">
      {/* Cover Photo - Responsive height */}
      <div className="h-32 sm:h-48 md:h-56 bg-gradient-to-r from-violet-500 to-purple-600 dark:from-violet-700 dark:to-purple-800 relative">
        {profile.cover_photo && (
          <img
            src={profile.cover_photo}
            alt="Cover"
            className="w-full h-full object-cover"
          />
        )}
      </div>

      {/* Profile Info - Responsive padding and spacing */}
      <div className="px-3 sm:px-4 md:px-6 pb-3 sm:pb-4">
        {/* Profile Image & Action Button */}
        <div className="relative -mt-12 sm:-mt-16 mb-3 sm:mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3 sm:gap-0">
          <div className="relative">
            <img
              src={profile.avatar || "https://via.placeholder.com/120"}
              alt={profile.name}
              className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-full border-4 border-white dark:border-gray-900 object-cover bg-white dark:bg-gray-800 shadow-lg"
            />
          </div>

          {/* Action Button - Full width on mobile, auto on desktop */}
          {isOwnProfile ? (
            <button
              onClick={() => setIsEditOpen(true)}
              className="w-full sm:w-auto px-4 py-2 sm:px-5 sm:py-2.5 border-2 border-gray-300 dark:border-gray-600 rounded-full font-bold hover:bg-gray-50 dark:hover:bg-gray-800 transition-all bg-white dark:bg-black text-gray-900 dark:text-white shadow-sm min-h-[44px]"
            >
              Edit Profile
            </button>
          ) : (
            <button
              onClick={handleFollow}
              className={`w-full sm:w-auto px-4 py-2 sm:px-5 sm:py-2.5 rounded-full font-bold transition-all shadow-sm min-h-[44px] ${
                profile.is_following
                  ? "bg-transparent border-2 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 hover:border-red-600"
                  : "bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200"
              }`}
            >
              {profile.is_following ? "Following" : "Follow"}
            </button>
          )}
        </div>

        <div className="space-y-0.5 sm:space-y-1">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-1.5 sm:gap-2">
            <span className="break-words">{profile.name}</span>
            {profile.verified && (
              <CheckCircle2
                className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500 shrink-0"
                strokeWidth={2.5}
              />
            )}
          </h1>
          <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400">
            @{profile.username}
          </p>
        </div>

        {/* Bio */}
        {profile.bio && (
          <p className="mt-2 sm:mt-3 text-sm sm:text-base text-gray-900 dark:text-gray-100 break-words">
            {profile.bio}
          </p>
        )}

        {/* Metadata - Location, Website, Join Date */}
        <div className="flex flex-wrap gap-x-3 sm:gap-x-4 gap-y-1.5 sm:gap-y-2 mt-2 sm:mt-3 text-gray-500 text-xs sm:text-sm">
          {profile.location && (
            <div className="flex items-center gap-1">
              <MapPin size={14} className="sm:w-4 sm:h-4 flex-shrink-0" />
              <span className="truncate max-w-[150px] sm:max-w-none">
                {profile.location}
              </span>
            </div>
          )}
          {profile.website && (
            <div className="flex items-center gap-1">
              <LinkIcon size={14} className="sm:w-4 sm:h-4 flex-shrink-0" />
              <a
                href={profile.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline truncate max-w-[150px] sm:max-w-none"
              >
                {profile.website.replace(/^https?:\/\//, "")}
              </a>
            </div>
          )}
          <div className="flex items-center gap-1">
            <Calendar size={14} className="sm:w-4 sm:h-4 flex-shrink-0" />
            <span>
              Joined{" "}
              {new Date(profile.created_at).toLocaleDateString("en-US", {
                month: "short",
                year: "numeric",
              })}
            </span>
          </div>
        </div>

        {/* Follower Counts - Touch-friendly on mobile */}
        <div className="flex gap-3 sm:gap-4 mt-3 sm:mt-4 text-sm sm:text-base">
          <div className="flex gap-1 hover:underline cursor-pointer min-h-[44px] sm:min-h-0 items-center">
            <span className="font-bold text-gray-900 dark:text-white">
              {profile.following_count}
            </span>
            <span className="text-gray-500">Following</span>
          </div>
          <div className="flex gap-1 hover:underline cursor-pointer min-h-[44px] sm:min-h-0 items-center">
            <span className="font-bold text-gray-900 dark:text-white">
              {profile.followers_count}
            </span>
            <span className="text-gray-500">Followers</span>
          </div>
          {currentUser && currentUser.id === profile.id && (
            <div
              onClick={() => navigate("/bookmarks")}
              className="flex gap-1 hover:underline cursor-pointer min-h-[44px] sm:min-h-0 items-center text-violet-600 hover:text-violet-700"
            >
              <Bookmark size={16} />
              <span>Bookmarks</span>
            </div>
          )}
        </div>
      </div>

      {/* Tabs - Horizontal scrolling on mobile */}
      <div className="border-b border-gray-200 dark:border-gray-800 overflow-x-auto scrollbar-hide">
        <div className="flex min-w-max sm:min-w-0">
          <button
            onClick={() => setActiveTab("posts")}
            className={`flex-1 sm:flex-initial py-3 sm:py-4 px-4 sm:px-6 text-center text-sm sm:text-base transition-colors min-h-[52px] whitespace-nowrap ${
              activeTab === "posts"
                ? "font-bold text-gray-900 dark:text-white border-b-4 border-violet-500"
                : "font-medium text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800"
            }`}
          >
            Posts
          </button>
          <button
            onClick={() => setActiveTab("replies")}
            className={`flex-1 sm:flex-initial py-3 sm:py-4 px-4 sm:px-6 text-center text-sm sm:text-base transition-colors min-h-[52px] whitespace-nowrap ${
              activeTab === "replies"
                ? "font-bold text-gray-900 dark:text-white border-b-4 border-violet-500"
                : "font-medium text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800"
            }`}
          >
            Replies
          </button>
          <button
            onClick={() => setActiveTab("media")}
            className={`flex-1 sm:flex-initial py-3 sm:py-4 px-4 sm:px-6 text-center text-sm sm:text-base transition-colors min-h-[52px] whitespace-nowrap ${
              activeTab === "media"
                ? "font-bold text-gray-900 dark:text-white border-b-4 border-violet-500"
                : "font-medium text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800"
            }`}
          >
            Media
          </button>
          <button
            onClick={() => setActiveTab("likes")}
            className={`flex-1 sm:flex-initial py-3 sm:py-4 px-4 sm:px-6 text-center text-sm sm:text-base transition-colors min-h-[52px] whitespace-nowrap ${
              activeTab === "likes"
                ? "font-bold text-gray-900 dark:text-white border-b-4 border-violet-500"
                : "font-medium text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800"
            }`}
          >
            Likes
          </button>
        </div>
      </div>

      {/* Content based on active tab */}
      <div>
        {activeTab === "posts" && (
          <>
            {posts.filter((post) => !post.parent_id).length > 0 ? (
              posts
                .filter((post) => !post.parent_id)
                .map((post) => <PostCard key={post.id} post={post} />)
            ) : (
              <div className="p-6 sm:p-8 text-center text-sm sm:text-base text-gray-500">
                No posts yet
              </div>
            )}
          </>
        )}

        {activeTab === "replies" && (
          <>
            {posts.filter((post) => post.parent_id).length > 0 ? (
              posts
                .filter((post) => post.parent_id)
                .map((post) => <PostCard key={post.id} post={post} />)
            ) : (
              <div className="p-6 sm:p-8 text-center text-sm sm:text-base text-gray-500">
                No replies yet
              </div>
            )}
          </>
        )}

        {activeTab === "media" && (
          <>
            {posts.filter((post) => post.image_url).length > 0 ? (
              posts
                .filter((post) => post.image_url)
                .map((post) => <PostCard key={post.id} post={post} />)
            ) : (
              <div className="p-6 sm:p-8 text-center text-sm sm:text-base text-gray-500">
                No media posts yet
              </div>
            )}
          </>
        )}

        {activeTab === "likes" && (
          <>
            {likedPosts.length > 0 ? (
              likedPosts.map((post) => <PostCard key={post.id} post={post} />)
            ) : (
              <div className="p-6 sm:p-8 text-center text-sm sm:text-base text-gray-500">
                No liked posts yet
              </div>
            )}
          </>
        )}
      </div>

      {isOwnProfile && profile && (
        <EditProfileModal
          isOpen={isEditOpen}
          onClose={() => setIsEditOpen(false)}
          user={profile}
          onUpdate={(updatedData) =>
            setProfile((prev) => ({ ...prev, ...updatedData }))
          }
        />
      )}

      {/* Floating Action Button */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-20 right-8 md:bottom-8 bg-violet-600 hover:bg-violet-700 text-white p-4 rounded-full shadow-lg transition-transform hover:scale-110 active:scale-95 z-40"
        aria-label="Create post"
      >
        <Plus size={24} />
      </button>

      <CreatePostModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};

export default Profile;
