import { useEffect, useState } from "react";
import api from "../api/api";
import {
  Loader,
  Heart,
  MessageCircle,
  UserPlus,
  Star,
  Trash2,
  Plus,
} from "lucide-react";
import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import CreatePostModal from "../components/CreatePostModal";

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchNotifications = async () => {
    try {
      const response = await api.get("/notifications");
      setNotifications(response.data.data);

      // Mark as read after fetching
      if (response.data.data.some((n) => !n.is_read)) {
        await api.put("/notifications/read");
      }
    } catch (err) {
      console.error("Error fetching notifications:", err);
      setError("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleDelete = async (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await api.delete(`/notifications/${id}`);
      setNotifications(notifications.filter((n) => n.id !== id));
    } catch (err) {
      console.error("Error deleting notification:", err);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case "like":
        return (
          <Heart className="text-pink-500" size={20} fill="currentColor" />
        );
      case "comment":
        return (
          <MessageCircle
            className="text-blue-500"
            size={20}
            fill="currentColor"
          />
        );
      case "follow":
        return (
          <UserPlus className="text-purple-500" size={20} fill="currentColor" />
        );
      default:
        return (
          <Star className="text-yellow-500" size={20} fill="currentColor" />
        );
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader className="animate-spin text-violet-600" size={40} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8 text-red-500">
        <p>{error}</p>
        <button
          onClick={fetchNotifications}
          className="mt-4 px-4 py-2 bg-violet-600 text-white rounded hover:bg-violet-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="pb-20 md:pb-0">
      {/* Header - Glassmorphism sticky header */}
      <div className="sticky top-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md z-10 p-3 sm:p-4 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center">
        <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
          Notifications
        </h2>
      </div>

      {/* Notifications List - Full width on mobile */}
      <div className="divide-y divide-gray-200 dark:divide-gray-800">
        {notifications.length > 0 ? (
          notifications.map((notification) => (
            <div
              key={notification.id}
              className={`p-3 sm:p-4 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors flex gap-2 sm:gap-3 md:gap-4 ${
                !notification.is_read ? "bg-blue-50/50 dark:bg-blue-900/10" : ""
              }`}
            >
              {/* Icon - Responsive sizing */}
              <div className="mt-1 flex-shrink-0">
                {getIcon(notification.type)}
              </div>

              {/* Content - Flexible with responsive spacing */}
              <div className="flex-1 min-w-0">
                {/* User info with avatar */}
                <Link
                  to={`/profile/${notification.actor_username}`}
                  className="flex items-center gap-2 mb-1.5 sm:mb-2 group"
                >
                  <img
                    src={
                      notification.actor_avatar ||
                      "https://via.placeholder.com/40"
                    }
                    alt={notification.actor_name}
                    className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover flex-shrink-0"
                  />
                  <span className="font-bold text-sm sm:text-base text-gray-900 dark:text-gray-100 group-hover:underline truncate">
                    {notification.actor_name}
                  </span>
                </Link>

                {/* Notification message - Responsive text */}
                <div className="text-xs sm:text-sm md:text-base text-gray-800 dark:text-gray-200">
                  <span className="break-words">{notification.content}</span>
                  {notification.post_content && (
                    <span className="text-gray-500 dark:text-gray-400 ml-1 block sm:inline mt-1 sm:mt-0">
                      : "{notification.post_content.substring(0, 50)}
                      {notification.post_content.length > 50 ? "..." : ""}"
                    </span>
                  )}
                  {notification.comment_content && (
                    <span className="text-gray-500 dark:text-gray-400 ml-1 block sm:inline mt-1 sm:mt-0">
                      : "{notification.comment_content.substring(0, 50)}
                      {notification.comment_content.length > 50 ? "..." : ""}"
                    </span>
                  )}
                </div>

                {/* Timestamp - Smaller on mobile */}
                <div className="mt-1 sm:mt-1.5 text-xs sm:text-sm text-gray-500">
                  {formatDistanceToNow(new Date(notification.created_at), {
                    addSuffix: true,
                  })}
                </div>
              </div>

              {/* Delete button - Touch-friendly */}
              <button
                onClick={(e) => handleDelete(e, notification.id)}
                className="text-gray-400 hover:text-red-500 active:scale-95 transition-all self-start p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 min-h-[44px] min-w-[44px] flex items-center justify-center flex-shrink-0"
                title="Delete notification"
                aria-label="Delete notification"
              >
                <Trash2 size={16} className="sm:w-4 sm:h-4" />
              </button>
            </div>
          ))
        ) : (
          <div className="p-6 sm:p-8 md:p-12 text-center text-sm sm:text-base text-gray-500">
            No notifications yet
          </div>
        )}
      </div>

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

export default Notifications;
