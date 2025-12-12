import { Link, useLocation } from "react-router-dom";
import { Home, Hash, Bell, User } from "lucide-react";
import { useSelector } from "react-redux";
import classNames from "classnames";

const BottomNav = () => {
  const { pathname } = useLocation();
  const { user } = useSelector((state) => state.auth);

  const navItems = [
    { name: "Home", icon: Home, path: "/" },
    { name: "Explore", icon: Hash, path: "/explore" },
    { name: "Notifications", icon: Bell, path: "/notifications" },
    { name: "Profile", icon: User, path: `/profile/${user?.username}` },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-black border-t border-gray-200 dark:border-gray-800 flex justify-around items-center h-16 md:hidden z-50 pb-safe">
      {navItems.map((item) => (
        <Link
          key={item.name}
          to={item.path}
          className={classNames("p-3 rounded-full transition-colors", {
            "text-violet-600 bg-violet-50 dark:bg-violet-900/10":
              pathname === item.path,
            "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-900":
              pathname !== item.path,
          })}
        >
          <item.icon
            size={26}
            fill={pathname === item.path ? "currentColor" : "none"}
          />
        </Link>
      ))}
    </nav>
  );
};

export default BottomNav;
