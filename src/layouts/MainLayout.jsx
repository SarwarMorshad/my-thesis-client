// src/layouts/MainLayout.jsx
import { Outlet } from "react-router-dom";

import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";

const MainLayout = () => {
  return (
    <div className="min-h-screen bg-[#005F50]">
      <Navbar />
      {/* Main content outlet */}
      <Outlet />

      <Footer />
    </div>
  );
};

export default MainLayout;
