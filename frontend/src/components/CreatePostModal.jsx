import { useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createPost } from "../features/postsSlice";
import { Image, X, Loader } from "lucide-react";
import { useDropzone } from "react-dropzone";
import { toast } from "react-toastify";

const CreatePostModal = ({ isOpen, onClose }) => {
  const [content, setContent] = useState("");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onDrop = useCallback((acceptedFiles) => {
    const selectedFile = acceptedFiles[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
    }
  }, []);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".png", ".jpg", ".gif"],
    },
    maxFiles: 1,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() && !file) return;

    setIsSubmitting(true);
    const formData = new FormData();
    formData.append("content", content);
    if (file) {
      formData.append("image", file);
    }

    try {
      await dispatch(createPost(formData)).unwrap();
      setContent("");
      setFile(null);
      setPreview(null);
      toast.success("Post created successfully!");
      onClose();
    } catch (error) {
      toast.error(error || "Failed to create post");
    } finally {
      setIsSubmitting(false);
    }
  };

  const removeImage = () => {
    setFile(null);
    setPreview(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in pb-16 md:pb-0">
      {/* Modal Container - Proper sizing */}
      <div className="bg-white dark:bg-black w-full max-h-[calc(100vh-96px)] md:max-h-[90vh] sm:max-w-lg sm:rounded-2xl shadow-xl overflow-hidden mx-0 sm:mx-4 animate-slide-up flex flex-col">
        {/* Header - Sticky on mobile */}
        <div className="flex items-center justify-between p-3 sm:p-4 border-b border-gray-200 dark:border-gray-800 flex-shrink-0 bg-white dark:bg-black">
          <button
            onClick={onClose}
            className="p-2 -ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Close"
          >
            <X size={20} className="sm:w-5 sm:h-5" />
          </button>
          <button
            onClick={handleSubmit}
            disabled={(!content.trim() && !file) || isSubmitting}
            className="px-4 sm:px-5 py-2 sm:py-2.5 bg-violet-600 text-white font-bold rounded-full disabled:opacity-50 disabled:cursor-not-allowed hover:bg-violet-700 active:scale-95 transition-all flex items-center min-h-[44px] shadow-sm"
          >
            {isSubmitting ? (
              <>
                <Loader className="animate-spin mr-2" size={16} /> Posting...
              </>
            ) : (
              "Post"
            )}
          </button>
        </div>

        {/* Content Area - Scrollable but limited */}
        <div className="flex-1 overflow-y-auto min-h-0">
          <div className="p-3 sm:p-4 flex gap-2 sm:gap-3">
            {/* Avatar */}
            <img
              src={user?.avatar || "https://via.placeholder.com/40"}
              alt="Avatar"
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover flex-shrink-0"
            />

            {/* Input Section */}
            <div className="flex-1 min-w-0">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="What's happening?"
                className="w-full bg-transparent border-none focus:ring-0 text-base sm:text-lg resize-none placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white outline-none"
                rows={window.innerWidth < 640 ? 6 : 4}
                autoFocus
                style={{ minHeight: "120px" }}
              />

              {/* Image Preview */}
              {preview && (
                <div className="relative mt-3 mb-2">
                  <img
                    src={preview}
                    alt="Preview"
                    className="rounded-xl sm:rounded-2xl max-h-60 sm:max-h-80 w-full object-cover"
                  />
                  <button
                    onClick={removeImage}
                    className="absolute top-2 right-2 bg-gray-900/70 hover:bg-gray-900/90 text-white rounded-full p-2 transition min-h-[36px] min-w-[36px] flex items-center justify-center"
                    aria-label="Remove image"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer - Toolbar with Upload Button - Always visible */}
        <div className="border-t-2 border-gray-300 dark:border-gray-700 p-4 flex-shrink-0 bg-gray-50 dark:bg-gray-900">
          <div className="flex items-center gap-3">
            {/* Upload Button - Prominent on mobile */}
            <button
              type="button"
              onClick={() =>
                document.querySelector('input[type="file"]')?.click()
              }
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 hover:bg-violet-200 dark:hover:bg-violet-900/50 rounded-full transition-all min-h-[44px] font-semibold shadow-sm"
            >
              <input {...getInputProps()} className="hidden" />
              <Image size={20} />
              <span className="text-sm">Photo</span>
            </button>

            {/* Character Counter */}
            <div className="flex-1 text-right text-sm text-gray-500">
              {content.length > 0 && (
                <span className={content.length > 280 ? "text-red-500" : ""}>
                  {content.length}/280
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatePostModal;
