import { Search, User, FileText, Loader, Hash, UserPlus } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useDebounce } from "../hooks/useDebounce";
import api from "../api/api";
import Avatar from "./Avatar";

const RightPanel = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState({ users: [], posts: [] });
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [trendingHashtags, setTrendingHashtags] = useState([]);
  const [suggestedUsers, setSuggestedUsers] = useState([]);
  const [followingIds, setFollowingIds] = useState(new Set());
  const debouncedSearch = useDebounce(searchTerm, 300);
  const searchRef = useRef(null);
  const navigate = useNavigate();

  // Fetch trending hashtags on mount
  useEffect(() => {
    const fetchTrendingHashtags = async () => {
      try {
        const response = await api.get("/trending/hashtags");
        setTrendingHashtags(response.data.data || []);
      } catch (error) {
        console.error("Failed to fetch trending hashtags:", error);
      }
    };
    fetchTrendingHashtags();
  }, []);

  // Fetch follow suggestions
  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        const response = await api.get("/trending/suggestions/users");
        setSuggestedUsers(response.data.data || []);
      } catch (error) {
        console.error("Failed to fetch suggestions:", error);
      }
    };
    fetchSuggestions();
  }, []);

  // Close results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Perform search when debounced search changes
  useEffect(() => {
    const performSearch = async () => {
      if (debouncedSearch.trim().length < 2) {
        setSearchResults({ users: [], posts: [] });
        setShowResults(false);
        return;
      }

      setIsSearching(true);
      setShowResults(true);

      try {
        const response = await api.get(
          `/search?q=${encodeURIComponent(debouncedSearch)}`
        );
        setSearchResults(response.data.data || { users: [], posts: [] });
      } catch (error) {
        console.error("Search error:", error);
        setSearchResults({ users: [], posts: [] });
      } finally {
        setIsSearching(false);
      }
    };

    performSearch();
  }, [debouncedSearch]);

  const handleUserClick = (username) => {
    navigate(`/profile/${username}`);
    setSearchTerm("");
    setShowResults(false);
  };

  const handlePostClick = (username) => {
    // Navigate to the author's profile where the post is visible
    navigate(`/profile/${username}`);
    setSearchTerm("");
    setShowResults(false);
  };

  const handleClearSearch = () => {
    setSearchTerm("");
    setSearchResults({ users: [], posts: [] });
    setShowResults(false);
  };

  const handleFollow = async (userId) => {
    try {
      if (followingIds.has(userId)) {
        // Unfollow
        await api.delete(`/users/${userId}/follow`);
        setFollowingIds((prev) => {
          const newSet = new Set(prev);
          newSet.delete(userId);
          return newSet;
        });
      } else {
        // Follow
        await api.post(`/users/${userId}/follow`);
        setFollowingIds((prev) => new Set([...prev, userId]));
      }
    } catch (error) {
      console.error("Follow/Unfollow error:", error);
    }
  };

  const hasResults =
    searchResults.users.length > 0 || searchResults.posts.length > 0;

  return (
    <div className="hidden md:block w-80 lg:w-96 sticky top-0 h-screen p-4 transition-colors overflow-y-auto">
      {/* Search Bar */}
      <div className="relative mb-4" ref={searchRef}>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => searchTerm.length >= 2 && setShowResults(true)}
          placeholder="Search users and posts..."
          className="w-full bg-gray-100 dark:bg-gray-800 rounded-full py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-violet-600 transition-all text-gray-900 dark:text-gray-100 placeholder-gray-500"
        />
        <Search className="absolute left-3 top-2.5 text-gray-500" size={18} />

        {/* Search Results Dropdown */}
        {showResults && searchTerm.length >= 2 && (
          <div className="absolute top-full mt-2 w-full bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-200 dark:border-gray-800 max-h-96 overflow-y-auto z-50 animate-slide-up">
            {isSearching ? (
              <div className="flex items-center justify-center p-8">
                <Loader className="animate-spin text-violet-600" size={24} />
              </div>
            ) : hasResults ? (
              <>
                {/* Users Results */}
                {searchResults.users.length > 0 && (
                  <div className="p-2">
                    <p className="px-3 py-2 text-xs font-bold text-gray-500 uppercase">
                      Users
                    </p>
                    {searchResults.users.map((user) => (
                      <button
                        key={user.id}
                        onClick={() => handleUserClick(user.username)}
                        className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors text-left"
                      >
                        <Avatar src={user.avatar} name={user.name} size="sm" />
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-sm text-gray-900 dark:text-white truncate">
                            {user.name}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            @{user.username}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {/* Posts Results */}
                {searchResults.posts.length > 0 && (
                  <div className="p-2 border-t border-gray-200 dark:border-gray-800">
                    <p className="px-3 py-2 text-xs font-bold text-gray-500 uppercase">
                      Posts
                    </p>
                    {searchResults.posts.map((post) => (
                      <div
                        key={post.id}
                        onClick={() => handlePostClick(post.username)}
                        className="p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors cursor-pointer"
                      >
                        <div className="flex items-start gap-2">
                          <FileText
                            size={16}
                            className="text-gray-500 mt-0.5 flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-gray-500">
                              @{post.username}
                            </p>
                            <p className="text-sm text-gray-900 dark:text-white line-clamp-2">
                              {post.content}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="p-8 text-center text-gray-500 text-sm">
                No results found for "{searchTerm}"
              </div>
            )}
          </div>
        )}
      </div>

      {/* Trending Hashtags Section */}
      <div className="bg-white dark:bg-gray-900 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-800">
        <h2 className="font-bold text-xl mb-4 text-gray-900 dark:text-white flex items-center gap-2">
          <Hash size={20} className="text-violet-600" />
          Trending Hashtags
        </h2>
        <div className="space-y-3">
          {trendingHashtags.length > 0 ? (
            trendingHashtags.slice(0, 5).map((hashtag, index) => (
              <div
                key={hashtag.id}
                onClick={() =>
                  navigate(`/hashtag/${hashtag.tag.replace("#", "")}`)
                }
                className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 p-3 rounded-lg transition group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                      #{index + 1} Trending
                    </p>
                    <p className="font-bold text-gray-900 dark:text-white group-hover:text-violet-600 transition">
                      {hashtag.tag}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {hashtag.posts_count || 0} posts
                    </p>
                  </div>
                  <Hash
                    size={18}
                    className="text-violet-600 opacity-0 group-hover:opacity-100 transition"
                  />
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500 text-center py-4">
              No trending hashtags yet
            </p>
          )}
        </div>
      </div>

      {/* Who to follow Section */}
      <div className="bg-white dark:bg-gray-900 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-800 mt-4">
        <h2 className="font-bold text-xl mb-4 text-gray-900 dark:text-white flex items-center gap-2">
          <UserPlus size={20} className="text-violet-600" />
          Who to follow
        </h2>
        <div className="space-y-3">
          {suggestedUsers.length > 0 ? (
            suggestedUsers.slice(0, 3).map((suggestedUser) => (
              <div
                key={suggestedUser.id}
                className="flex items-center justify-between p-2 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-lg transition"
              >
                <div
                  className="flex items-center gap-3 flex-1 cursor-pointer"
                  onClick={() => navigate(`/profile/${suggestedUser.username}`)}
                >
                  <Avatar
                    src={suggestedUser.avatar}
                    name={suggestedUser.name}
                    size="md"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 dark:text-white truncate">
                      {suggestedUser.name}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      @{suggestedUser.username}
                    </p>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleFollow(suggestedUser.id);
                  }}
                  className={`px-4 py-1.5 rounded-full font-semibold text-sm transition-colors shrink-0 ${
                    followingIds.has(suggestedUser.id)
                      ? "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600"
                      : "bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200"
                  }`}
                >
                  {followingIds.has(suggestedUser.id) ? "Following" : "Follow"}
                </button>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500 text-center py-4">
              No suggestions available
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default RightPanel;
