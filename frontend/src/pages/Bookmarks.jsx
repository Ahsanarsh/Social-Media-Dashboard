import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Bookmark, Loader } from "lucide-react";
import api from "../api/api";
import PostCard from "../components/PostCard";

const Bookmarks = () => {
  const { user } = useSelector((state) => state.auth);
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBookmarks = async () => {
      if (!user) return;

      setLoading(true);
      setError(null);
      try {
        const response = await api.get(`/users/${user.id}/bookmarks`);
        setBookmarks(response.data.data || []);
      } catch (err) {
        console.error("Error fetching bookmarks:", err);
        setError("Failed to load bookmarks");
      } finally {
        setLoading(false);
      }
    };

    fetchBookmarks();
  }, [user]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader className="animate-spin text-violet-600" size={40} />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 p-4">
        <div className="flex items-center gap-3">
          <Bookmark className="text-violet-600" size={24} />
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              Bookmarks
            </h1>
            <p className="text-sm text-gray-500">@{user?.username}</p>
          </div>
        </div>
      </div>

      {/* Bookmarks List */}
      <div>
        {error ? (
          <div className="p-8 text-center text-red-500">{error}</div>
        ) : bookmarks.length > 0 ? (
          bookmarks.map((post) => <PostCard key={post.id} post={post} />)
        ) : (
          <div className="p-8 text-center">
            <Bookmark size={64} className="mx-auto mb-4 text-gray-300" />
            <h2 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">
              No bookmarks yet
            </h2>
            <p className="text-gray-500">
              Save posts to easily find them later
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Bookmarks;
