import React from "react";
import { Outlet } from "react-router-dom";
import BuyerSidebarLayout from "./BuyerSidebarLayout";
import Header from "./Header";

const BuyerDashboardLayout: React.FC = () => {
  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <BuyerSidebarLayout />

      {/* Main Content */}
      <main className="flex-1 flex flex-col bg-gray-50 overflow-y-auto">
        {/* Header at the top */}
        <Header />

        {/* Routed pages */}
        <div className="p-6 flex-1">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default BuyerDashboardLayout;
