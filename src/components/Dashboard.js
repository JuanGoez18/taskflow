import { useState } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import Stats from "./Stats";
import TasksList from "./TasksList";

const Dashboard = () => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <Header />
        
        <div className="p-6">
          <Stats />
          <TasksList />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
