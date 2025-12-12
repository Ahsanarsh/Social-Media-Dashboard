import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Hash, Loader, TrendingUp } from "lucide-react";
import api from "../api/api";
import PostCard from "../components/PostCard";

const HashtagPage = () => {
  const { tag } = useParams();
  const [posts, setPosts] = useState([]);
  const [hashtag, setHashtag] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHashtagPosts = async () => {
      setLoading(true);
      setError(null);

      try {
        // Fetch posts with this hashtag
        const response = await api.get(
          `/search?q=${encodeURIComponent("#" + tag)}`
        );
        setPosts(response.data.data?.posts || []);

        // Fetch hashtag info
        const hashtagResponse = await api.get(`/trending/hashtags`);
        const hashtagData = hashtagResponse.data.data?.find(
          (h) => h.tag.toLowerCase() === "#" + tag.toLowerCase()
        );
        setHashtag(hashtagData);
      } catch (err) {
        console.error("Error fetching hashtag data:", err);
        setError("Failed to load posts");
      } finally {
        setLoading(false);
      }
    };

    fetchHashtagPosts();
  }, [tag]);

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
          <div className="p-3 bg-violet-100 dark:bg-violet-900/30 rounded-full">
            <Hash className="text-violet-600" size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              #{tag}
            </h1>
            {hashtag && (
              <p className="text-sm text-gray-500 flex items-center gap-1">
                <TrendingUp size={14} />
                {hashtag.posts_count || 0} posts
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Posts */}
      <div>
        {error ? (
          <div className="p-8 text-center text-red-500">{error}</div>
        ) : posts.length > 0 ? (
          posts.map((post) => <PostCard key={post.id} post={post} />)
        ) : (
          <div className="p-8 text-center">
            <Hash size={64} className="mx-auto mb-4 text-gray-300" />
            <h2 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">
              No posts found
            </h2>
            <p className="text-gray-500">Be the first to post with #{tag}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default HashtagPage;
