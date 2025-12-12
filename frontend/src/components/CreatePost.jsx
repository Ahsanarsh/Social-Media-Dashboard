import { useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createPost } from "../features/postsSlice";
import { Image, X, Loader } from "lucide-react";
import { useDropzone } from "react-dropzone";
import { toast } from "react-toastify";

const CreatePost = () => {
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
      formData.append("image", file); // Must match backend field 'image' or 'file'
    }

    try {
      await dispatch(createPost(formData)).unwrap();
      setContent("");
      setFile(null);
      setPreview(null);
      toast.success("Post created successfully!");
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

  return (
    <div className="border-b border-gray-200 dark:border-gray-800 p-4 bg-white dark:bg-gray-900 transition-colors">
      <div className="flex space-x-4">
        <img
          src={user?.avatar || "https://via.placeholder.com/40"}
          alt="Avatar"
          className="w-10 h-10 rounded-full object-cover"
        />
        <div className="flex-1">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's happening?"
            className="w-full bg-transparent border-none focus:ring-0 text-lg resize-none placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white"
            rows="3"
          />

          {preview && (
            <div className="relative mt-2 mb-2">
              <img
                src={preview}
                alt="Preview"
                className="rounded-xl max-h-80 w-full object-cover"
              />
              <button
                onClick={removeImage}
                className="absolute top-2 right-2 bg-gray-900/50 hover:bg-gray-900/70 text-white rounded-full p-1 transition"
              >
                <X size={16} />
              </button>
            </div>
          )}

          <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100 dark:border-gray-800">
            <div
              {...getRootProps()}
              className="cursor-pointer text-blue-500 hover:text-blue-600 p-2 rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
            >
              <input {...getInputProps()} />
              <Image size={20} />
            </div>

            <button
              onClick={handleSubmit}
              disabled={(!content.trim() && !file) || isSubmitting}
              className="px-4 py-2 bg-blue-500 text-white font-bold rounded-full disabled:opacity-50 hover:bg-blue-600 transition-colors flex items-center"
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
        </div>
      </div>
    </div>
  );
};

export default CreatePost;
