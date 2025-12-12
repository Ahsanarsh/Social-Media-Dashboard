import { Link, useLocation } from "react-router-dom";
import { Home, Hash, User, Bell, LogOut, Moon, Sun } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { logoutUser } from "../features/authSlice";
import { toggleTheme } from "../features/themeSlice";
import { useTranslation } from "react-i18next";
import classNames from "classnames";
import Avatar from "./Avatar";
import LanguageSwitcher from "./LanguageSwitcher";

const Sidebar = () => {
  const { pathname } = useLocation();
  const dispatch = useDispatch();
  const { mode } = useSelector((state) => state.theme);
  const { user } = useSelector((state) => state.auth);
  const { t } = useTranslation();

  const navItems = [
    { name: t("common.home"), icon: Home, path: "/" },
    { name: t("common.explore"), icon: Hash, path: "/explore" },
    { name: t("common.notifications"), icon: Bell, path: "/notifications" },
    {
      name: t("common.profile"),
      icon: User,
      path: `/profile/${user?.username}`,
    },
  ];

  const handleLogout = () => {
    dispatch(logoutUser());
  };

  return (
    <div className="hidden md:flex flex-col md:w-20 lg:w-64 xl:w-80 h-screen sticky top-0 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 z-10">
      <div className="p-6 lg:flex items-center justify-between hidden">
        <h1 className="text-2xl font-bold text-violet-600">SocialApp</h1>
        <button
          onClick={() => dispatch(toggleTheme())}
          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          {mode === "dark" ? (
            <Sun size={20} className="text-yellow-500" />
          ) : (
            <Moon size={20} className="text-gray-700" />
          )}
        </button>
      </div>

      {/* Logo icon for md screens */}
      <div className="p-4 lg:hidden flex items-center justify-center">
        <div className="w-10 h-10 rounded-full bg-violet-600 flex items-center justify-center">
          <span className="text-white font-bold">S</span>
        </div>
      </div>

      <nav className="flex-1 px-3 lg:px-4">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={classNames(
              "flex items-center gap-4 p-3 lg:p-4 rounded-full mb-2 transition-all hover:bg-violet-50 dark:hover:bg-violet-900/20 group",
              {
                "bg-violet-50 dark:bg-violet-900/20 text-violet-600":
                  pathname === item.path,
              }
            )}
          >
            <item.icon
              size={24}
              className={classNames("transition-colors lg:flex-shrink-0", {
                "text-violet-600": pathname === item.path,
                "text-gray-700 dark:text-gray-300 group-hover:text-violet-600":
                  pathname !== item.path,
              })}
            />
            <span
              className={classNames("text-lg font-medium hidden lg:block", {
                "text-violet-600": pathname === item.path,
                "text-gray-900 dark:text-white group-hover:text-violet-600":
                  pathname !== item.path,
              })}
            >
              {item.name}
            </span>
          </Link>
        ))}
      </nav>

      {/* Profile Section */}
      <div className="p-3 lg:p-4 border-t border-gray-200 dark:border-gray-800">
        <Link
          to={`/profile/${user?.username}`}
          className="flex items-center gap-3 p-2 lg:p-3 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <Avatar src={user.avatar} name={user.name} size="md" />
          <div className="flex-col hidden lg:flex">
            <span className="font-bold text-gray-900 dark:text-white text-sm">
              {user.name}
            </span>
            <span className="text-gray-500 text-xs">@{user.username}</span>
          </div>
        </Link>

        <button
          onClick={handleLogout}
          className="flex items-center gap-3 p-2 lg:p-3 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 transition-all w-full mt-2 justify-center lg:justify-start"
        >
          <LogOut size={20} />
          <span className="font-medium hidden lg:block">
            {t("common.logout")}
          </span>
        </button>

        {/* Language Switcher */}
        <div className="mt-2">
          <LanguageSwitcher />
        </div>

        {/* Theme toggle for md screens */}
        <button
          onClick={() => dispatch(toggleTheme())}
          className="lg:hidden flex items-center justify-center w-full p-3 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors mt-2"
        >
          {mode === "dark" ? (
            <Sun size={20} className="text-yellow-500" />
          ) : (
            <Moon size={20} className="text-gray-700" />
          )}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
