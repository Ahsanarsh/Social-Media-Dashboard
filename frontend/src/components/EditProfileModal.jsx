import { useState, useRef, useEffect } from "react";
import { X, Camera, Loader } from "lucide-react";
import api from "../api/api";
import { useDispatch } from "react-redux";
import { fetchCurrentUser } from "../features/authSlice";

const EditProfileModal = ({ isOpen, onClose, user, onUpdate }) => {
  const [formData, setFormData] = useState({
    name: user.name || "",
    bio: user.bio || "",
    location: user.location || "",
    website: user.website || "",
  });
  const [avatar, setAvatar] = useState(null);
  const [cover, setCover] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(user.avatar);
  const [coverPreview, setCoverPreview] = useState(user.cover_photo);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const avatarInputRef = useRef(null);
  const coverInputRef = useRef(null);
  const dispatch = useDispatch();

  useEffect(() => {
    if (isOpen && user) {
      setFormData({
        name: user.name || "",
        bio: user.bio || "",
        location: user.location || "",
        website: user.website || "",
      });
      setAvatarPreview(user.avatar);
      setCoverPreview(user.cover_photo);
      setAvatar(null);
      setCover(null);
    }
  }, [isOpen, user]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      if (type === "avatar") {
        setAvatar(file);
        setAvatarPreview(URL.createObjectURL(file));
      } else {
        setCover(file);
        setCoverPreview(URL.createObjectURL(file));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const data = new FormData();
      data.append("name", formData.name);
      data.append("bio", formData.bio);
      data.append("location", formData.location);
      data.append("website", formData.website);
      if (avatar) data.append("avatar", avatar);
      if (cover) data.append("cover_photo", cover);

      const response = await api.put("/users/profile", data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      onUpdate(response.data.data);
      dispatch(fetchCurrentUser()); // Update auth state
      onClose();
    } catch (err) {
      console.error("Error updating profile:", err);
      setError(err.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-black w-full max-w-lg rounded-2xl shadow-xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 px-6 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-4">
            <button
              onClick={onClose}
              className="p-2 -ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <X size={20} />
            </button>
            <h2 className="text-xl font-bold">Edit Profile</h2>
          </div>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-4 py-1.5 bg-black dark:bg-white text-white dark:text-black font-bold rounded-full hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? <Loader className="animate-spin" size={20} /> : "Save"}
          </button>
        </div>

        {/* Form Content */}
        <div className="overflow-y-auto p-0 flex-1">
          {error && (
            <div className="p-4 bg-red-50 text-red-500 text-center text-sm">
              {error}
            </div>
          )}

          {/* Cover Photo */}
          <div className="relative h-32 bg-gray-200 dark:bg-gray-800 group">
            {coverPreview && (
              <img
                src={coverPreview}
                alt="Cover"
                className="w-full h-full object-cover opacity-80"
              />
            )}
            <div className="absolute inset-0 flex items-center justify-center gap-4">
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  coverInputRef.current?.click();
                }}
                className="p-2 bg-black/50 rounded-full text-white hover:bg-black/60 transition-colors"
                aria-label="Change cover photo"
              >
                <Camera size={20} />
              </button>
            </div>
            <input
              type="file"
              ref={coverInputRef}
              onChange={(e) => handleFileChange(e, "cover")}
              className="hidden"
              accept="image/*"
            />
          </div>

          {/* Avatar */}
          <div className="px-4 relative -mt-16 mb-4">
            <div className="relative inline-block">
              <img
                src={avatarPreview || "https://via.placeholder.com/120"}
                alt="Avatar"
                className="w-28 h-28 rounded-full border-4 border-white dark:border-black object-cover bg-white dark:bg-gray-800"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    avatarInputRef.current?.click();
                  }}
                  className="p-2 bg-black/50 rounded-full text-white hover:bg-black/60 transition-colors"
                  aria-label="Change profile picture"
                >
                  <Camera size={20} />
                </button>
              </div>
              <input
                type="file"
                ref={avatarInputRef}
                onChange={(e) => handleFileChange(e, "avatar")}
                className="hidden"
                accept="image/*"
              />
            </div>
          </div>

          {/* Fields */}
          <form className="space-y-4 px-4 pb-8">
            <div className="border border-gray-300 dark:border-gray-700 rounded-md px-3 py-2 focus-within:ring-2 focus-within:ring-blue-500">
              <label className="block text-xs text-gray-500">Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full bg-transparent outline-none text-gray-900 dark:text-white"
              />
            </div>

            <div className="border border-gray-300 dark:border-gray-700 rounded-md px-3 py-2 focus-within:ring-2 focus-within:ring-blue-500">
              <label className="block text-xs text-gray-500">Bio</label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                className="w-full bg-transparent outline-none text-gray-900 dark:text-white resize-none"
                rows="3"
              />
            </div>

            <div className="border border-gray-300 dark:border-gray-700 rounded-md px-3 py-2 focus-within:ring-2 focus-within:ring-blue-500">
              <label className="block text-xs text-gray-500">Location</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className="w-full bg-transparent outline-none text-gray-900 dark:text-white"
              />
            </div>

            <div className="border border-gray-300 dark:border-gray-700 rounded-md px-3 py-2 focus-within:ring-2 focus-within:ring-blue-500">
              <label className="block text-xs text-gray-500">Website</label>
              <input
                type="text"
                name="website"
                value={formData.website}
                onChange={handleChange}
                className="w-full bg-transparent outline-none text-red-500 dark:text-blue-500" // Not actually validating here but keeping styling consistent
              />
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditProfileModal;
