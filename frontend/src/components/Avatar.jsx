import { User } from "lucide-react";

const Avatar = ({ src, name, size = "md", className = "" }) => {
  const sizeClasses = {
    xs: "w-6 h-6 text-xs",
    sm: "w-8 h-8 text-sm",
    md: "w-10 h-10 text-base",
    lg: "w-12 h-12 text-lg",
    xl: "w-16 h-16 text-xl",
    "2xl": "w-20 h-20 text-2xl",
    "3xl": "w-24 h-24 text-3xl",
    "4xl": "w-32 h-32 text-4xl",
  };

  // Get initials from name
  const getInitials = (name) => {
    if (!name) return "";
    const parts = name.trim().split(" ");
    if (parts.length === 1) {
      return parts[0].charAt(0).toUpperCase();
    }
    return (
      parts[0].charAt(0).toUpperCase() +
      parts[parts.length - 1].charAt(0).toUpperCase()
    );
  };

  // Generate a consistent color based on the name
  const getColorFromName = (name) => {
    if (!name) return "from-violet-500 to-purple-600";

    const colors = [
      "from-violet-500 to-purple-600",
      "from-blue-500 to-cyan-600",
      "from-green-500 to-emerald-600",
      "from-orange-500 to-red-600",
      "from-pink-500 to-rose-600",
      "from-indigo-500 to-blue-600",
      "from-teal-500 to-green-600",
      "from-amber-500 to-orange-600",
    ];

    // Simple hash function to get consistent color
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  const initials = getInitials(name);
  const gradient = getColorFromName(name);

  // If there's a valid image source, show the image
  if (src && src !== "https://via.placeholder.com/40" && src.trim() !== "") {
    return (
      <img
        src={src}
        alt={name || "User avatar"}
        className={`${sizeClasses[size]} rounded-full object-cover ${className}`}
        onError={(e) => {
          // If image fails to load, hide it and show fallback
          e.target.style.display = "none";
          e.target.nextSibling.style.display = "flex";
        }}
      />
    );
  }

  // Fallback: Show initials or icon
  return (
    <div
      className={`${sizeClasses[size]} rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center font-bold text-white shadow-sm ${className}`}
    >
      {initials || (
        <User
          size={
            size === "xs"
              ? 12
              : size === "sm"
              ? 16
              : size === "md"
              ? 20
              : size === "lg"
              ? 24
              : 32
          }
        />
      )}
    </div>
  );
};

export default Avatar;
