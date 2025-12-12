import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchExplore } from "../features/postsSlice";
import CreatePostModal from "../components/CreatePostModal";
import PostCard from "../components/PostCard";
import { Loader, Plus } from "lucide-react";

const Explore = () => {
  const dispatch = useDispatch();
  const { posts, loading, error } = useSelector((state) => state.posts);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchExplore({ page: 1 }));
  }, [dispatch]);

  // Loading state for initial fetch (if posts are empty)
  if (loading && posts.length === 0) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader className="animate-spin text-violet-600" size={40} />
      </div>
    );
  }

  // Error state
  if (error && posts.length === 0) {
    return (
      <div className="text-center p-8 text-red-500">
        <p>Error loading explore feed: {error}</p>
        <button
          onClick={() => dispatch(fetchExplore({ page: 1 }))}
          className="mt-4 px-4 py-2 bg-violet-600 text-white rounded hover:bg-violet-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="sticky top-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md z-10 p-4 border-b border-gray-200 dark:border-gray-800">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          Explore
        </h2>
      </div>

      <div className="pb-20">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}

        {posts.length === 0 && !loading && (
          <div className="text-center p-8 text-gray-500">
            No posts to explore yet.
          </div>
        )}
      </div>

      {/* Floating Action Button */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-20 right-8 md:bottom-8 bg-violet-600 hover:bg-violet-700 text-white p-4 rounded-full shadow-lg transition-transform hover:scale-110 active:scale-95 z-40"
      >
        <Plus size={24} />
      </button>

      <CreatePostModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
};

export default Explore;
