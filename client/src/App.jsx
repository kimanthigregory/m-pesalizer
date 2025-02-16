import React from "react";
import { Sidebar, SidebarBody } from "./components/sidebar"; // Adjust path if needed

function App() {
  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <Sidebar>
        <SidebarBody>
          <p className="text-neutral-700 dark:text-neutral-200">Test Sidebar</p>
        </SidebarBody>
      </Sidebar>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center">
        <h1 className="text-2xl font-bold">Dashboard</h1>
      </div>
    </div>
  );
}

export default App;
