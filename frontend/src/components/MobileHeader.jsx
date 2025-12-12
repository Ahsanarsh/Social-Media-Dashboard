import { useRef, useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { LogOut, Moon, Sun, User, Search, X, FileText } from "lucide-react";
import { toggleTheme } from "../features/themeSlice";
import { logoutUser } from "../features/authSlice";
import { useOnClickOutside } from "../hooks/useOnClickOutside";
import Avatar from "./Avatar";
import api from "../api/api";

const MobileHeader = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { mode } = useSelector((state) => state.theme);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState({ users: [], posts: [] });
  const [isSearching, setIsSearching] = useState(false);

  const menuRef = useRef();
  const searchRef = useRef();
  const searchInputRef = useRef();

  useOnClickOutside(menuRef, () => setIsMenuOpen(false));
  useOnClickOutside(searchRef, () => {
    setIsSearchOpen(false);
    setSearchTerm("");
    setSearchResults({ users: [], posts: [] });
  });

  // Auto-focus when search opens
  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  // Search API call with debounce
  useEffect(() => {
    const performSearch = async () => {
      if (searchTerm.trim().length < 2) {
        setSearchResults({ users: [], posts: [] });
        return;
      }

      setIsSearching(true);
      try {
        const response = await api.get(
          `/search?q=${encodeURIComponent(searchTerm)}`
        );
        setSearchResults(response.data.data || { users: [], posts: [] });
      } catch (error) {
        console.error("Search failed:", error);
      } finally {
        setIsSearching(false);
      }
    };

    const debounceTimer = setTimeout(performSearch, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchTerm]);

  const handleUserClick = (username) => {
    navigate(`/profile/${username}`);
    setIsSearchOpen(false);
    setSearchTerm("");
  };

  const handlePostClick = (username) => {
    navigate(`/profile/${username}`);
    setIsSearchOpen(false);
    setSearchTerm("");
  };

  const hasResults =
    searchResults.users.length > 0 || searchResults.posts.length > 0;

  return (
    <>
      <header className="sticky top-0 z-30 flex items-center justify-between px-4 py-3 bg-white/80 dark:bg-black/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 md:hidden">
        {/* User Avatar / Menu Trigger */}
        <div className="relative" ref={menuRef}>
          <button onClick={() => setIsMenuOpen(!isMenuOpen)}>
            <Avatar
              src={user?.avatar}
              name={user?.name}
              size="sm"
              className="ring-2 ring-gray-100 dark:ring-gray-800"
            />
          </button>

          {isMenuOpen && (
            <div className="absolute top-10 left-0 w-48 bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-100 dark:border-gray-800 z-50 overflow-hidden py-1">
              <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
                <p className="font-bold text-gray-900 dark:text-white truncate">
                  {user?.name}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  @{user?.username}
                </p>
              </div>
              <Link
                to={`/profile/${user?.username}`}
                className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800"
                onClick={() => setIsMenuOpen(false)}
              >
                <User size={16} />
                <span>Profile</span>
              </Link>
              <button
                onClick={() => {
                  dispatch(toggleTheme());
                  setIsMenuOpen(false);
                }}
                className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 text-left"
              >
                {mode === "dark" ? <Sun size={16} /> : <Moon size={16} />}
                <span>{mode === "dark" ? "Light Mode" : "Dark Mode"}</span>
              </button>
              <button
                onClick={() => {
                  dispatch(logoutUser());
                  setIsMenuOpen(false);
                }}
                className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 text-left"
              >
                <LogOut size={16} />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>

        {/* Logo */}
        <h1 className="text-xl font-bold text-violet-600">SocialApp</h1>

        {/* Search Icon */}
        <button
          onClick={() => setIsSearchOpen(!isSearchOpen)}
          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <Search size={20} className="text-gray-700 dark:text-gray-300" />
        </button>
      </header>

      {/* Search Panel - Slides down from top */}
      <div
        className={`md:hidden fixed top-[57px] left-0 right-0 z-20 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-lg transition-all duration-300 ease-in-out ${
          isSearchOpen
            ? "translate-y-0 opacity-100"
            : "-translate-y-full opacity-0 pointer-events-none"
        }`}
        ref={searchRef}
      >
        <div className="p-4">
          {/* Search Input */}
          <div className="relative">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              ref={searchInputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search users and posts..."
              className="w-full pl-10 pr-10 py-2.5 bg-gray-100 dark:bg-gray-800 rounded-full focus:outline-none focus:ring-2 focus:ring-violet-500 text-gray-900 dark:text-white placeholder-gray-500"
            />
            {searchTerm && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setSearchResults({ users: [], posts: [] });
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X size={18} />
              </button>
            )}
          </div>

          {/* Search Results */}
          {searchTerm.trim().length >= 2 && (
            <div className="mt-4 max-h-96 overflow-y-auto">
              {isSearching ? (
                <div className="text-center py-8 text-gray-500">
                  Searching...
                </div>
              ) : hasResults ? (
                <div className="space-y-4">
                  {/* Users */}
                  {searchResults.users.length > 0 && (
                    <div>
                      <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">
                        Users
                      </h3>
                      <div className="space-y-2">
                        {searchResults.users.map((user) => (
                          <div
                            key={user.id}
                            onClick={() => handleUserClick(user.username)}
                            className="flex items-center gap-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg cursor-pointer"
                          >
                            <Avatar
                              src={user.avatar}
                              name={user.name}
                              size="sm"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-sm text-gray-900 dark:text-white truncate">
                                {user.name}
                              </p>
                              <p className="text-xs text-gray-500 truncate">
                                @{user.username}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Posts */}
                  {searchResults.posts.length > 0 && (
                    <div>
                      <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">
                        Posts
                      </h3>
                      <div className="space-y-2">
                        {searchResults.posts.map((post) => (
                          <div
                            key={post.id}
                            onClick={() => handlePostClick(post.username)}
                            className="p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg cursor-pointer"
                          >
                            <div className="flex items-start gap-2">
                              <FileText
                                size={16}
                                className="text-gray-500 mt-0.5 shrink-0"
                              />
                              <div className="flex-1 min-w-0">
                                <p className="text-xs text-gray-500 truncate">
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
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No results found for "{searchTerm}"
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default MobileHeader;
