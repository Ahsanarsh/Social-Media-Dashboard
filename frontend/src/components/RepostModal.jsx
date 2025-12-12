import { useState } from "react";
import { X, Repeat, Loader } from "lucide-react";
import { useSelector } from "react-redux";
import api from "../api/api";
import { toast } from "react-toastify";
import Avatar from "./Avatar";

const RepostModal = ({ isOpen, onClose, post, onRepost }) => {
  const { user } = useSelector((state) => state.auth);
  const [quoteText, setQuoteText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [repostType, setRepostType] = useState("repost"); // 'repost' or 'quote'

  const handleRepost = async () => {
    try {
      setIsSubmitting(true);
      await api.post(`/posts/${post.id}/repost`, {
        quote_text: repostType === "quote" ? quoteText : null,
      });

      toast.success(repostType === "quote" ? "Post quoted!" : "Post reposted!");
      onRepost?.();
      onClose();
      setQuoteText("");
      setRepostType("repost");
    } catch (error) {
      console.error("Repost error:", error);
      toast.error(error.response?.data?.message || "Failed to repost");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 w-full max-w-lg mx-4 rounded-2xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Repeat size={20} className="text-green-600" />
            Repost
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Type Selection */}
        <div className="p-4 space-y-4">
          <div className="flex gap-2">
            <button
              onClick={() => setRepostType("repost")}
              className={`flex-1 py-2 px-4 rounded-full font-semibold transition ${
                repostType === "repost"
                  ? "bg-green-600 text-white"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
              }`}
            >
              <Repeat size={16} className="inline mr-2" />
              Repost
            </button>
            <button
              onClick={() => setRepostType("quote")}
              className={`flex-1 py-2 px-4 rounded-full font-semibold transition ${
                repostType === "quote"
                  ? "bg-green-600 text-white"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
              }`}
            >
              Quote
            </button>
          </div>

          {/* Quote Input */}
          {repostType === "quote" && (
            <div>
              <div className="flex gap-3 mb-4">
                <Avatar src={user?.avatar} name={user?.name} size="md" />
                <textarea
                  value={quoteText}
                  onChange={(e) => setQuoteText(e.target.value)}
                  placeholder="Add your thoughts..."
                  className="flex-1 p-3 bg-gray-100 dark:bg-gray-800 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-white"
                  rows={3}
                  maxLength={280}
                />
              </div>
              <div className="text-right text-sm text-gray-500">
                {quoteText.length}/280
              </div>
            </div>
          )}

          {/* Original Post Preview */}
          <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-3 bg-gray-50 dark:bg-gray-800/50">
            <div className="flex gap-3">
              <Avatar src={post.avatar} name={post.name} size="sm" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-900 dark:text-white text-sm">
                    {post.name}
                  </span>
                  <span className="text-gray-500 text-sm">
                    @{post.username}
                  </span>
                </div>
                <p className="text-gray-900 dark:text-white text-sm mt-1 line-clamp-3">
                  {post.content}
                </p>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <button
            onClick={handleRepost}
            disabled={
              isSubmitting || (repostType === "quote" && !quoteText.trim())
            }
            className="w-full py-3 bg-green-600 text-white font-bold rounded-full hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader className="animate-spin" size={16} />
                {repostType === "quote" ? "Quoting..." : "Reposting..."}
              </>
            ) : (
              <>
                <Repeat size={16} />
                {repostType === "quote" ? "Quote Post" : "Repost"}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RepostModal;
