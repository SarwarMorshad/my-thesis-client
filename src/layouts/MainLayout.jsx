// src/layouts/MainLayout.jsx
import { Outlet } from "react-router-dom";

import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import BottomNav from "../components/common/BottomNav";
import ScrollToTop from "../components/common/ScrollToTop";

const MainLayout = () => {
  return (
    <div className="min-h-screen bg-[#E6E6E6]">
      <ScrollToTop />
      <Navbar />
      {/* Main content outlet */}
      <Outlet />
      <BottomNav />
      <div className="h-20"></div>
      <Footer />
    </div>
  );
};

export default MainLayout;
