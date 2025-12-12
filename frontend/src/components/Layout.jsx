import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import RightPanel from "./RightPanel";
import BottomNav from "./BottomNav";
import MobileHeader from "./MobileHeader";

const Layout = () => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-black transition-colors duration-300">
      {/* Mobile Header */}
      <MobileHeader />

      <div className="flex w-full mx-auto max-w-7xl flex-1">
        {/* Sidebar (Desktop) */}
        <Sidebar />

        {/* Main Feed Area */}
        <main className="flex-1 border-x border-gray-200 dark:border-gray-800 min-h-screen w-full max-w-2xl mx-auto pb-16 md:pb-0">
          <Outlet />
        </main>

        {/* Right Panel (Desktop) */}
        <RightPanel />
      </div>

      {/* Bottom Nav (Mobile) */}
      <BottomNav />
    </div>
  );
};

export default Layout;
