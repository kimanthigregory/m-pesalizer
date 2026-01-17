import React, { useState, useEffect, useMemo } from "react";
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";

// Route & Layout Imports
import LandingPage from "./routes/landingPage";
import DashboardLayout from "./components/DashboardLayout";

// Page Imports
import OverviewPage from "./pages/OverviewPage";
import TransactionsPage from "./pages/TransactionsPage";
import TrendsPage from "./pages/TrendsPage";
import FeesPage from "./pages/FeesPage";
import RecurringPage from "./pages/RecurringPage";
import RecipientsPage from "./pages/RecipientsPage";
import ExportPage from "./pages/ExportPage";

export default function App() {
  const [mpesaData, setMpesaData] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true);

  // 1. Initial Load from LocalStorage
  useEffect(() => {
    const saved = localStorage.getItem("mpesaData");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && Array.isArray(parsed)) {
          setMpesaData(parsed);
        }
      } catch (e) {
        console.error("Failed to parse storage data", e);
        localStorage.removeItem("mpesaData");
      }
    }
    setIsInitializing(false);
  }, []);

  // 2. Centralized State Updater (Used by LandingPage / Demo Mode)
  // This ensures state and storage stay in sync instantly
  const handleSetData = (data) => {
    if (data) {
      localStorage.setItem("mpesaData", JSON.stringify(data));
      setMpesaData(data);
    }
  };

  // 3. Clear Data Handler
  const handleClearData = () => {
    localStorage.removeItem("mpesaData");
    setMpesaData(null);
  };

  // 4. Reactive Router Configuration
  const router = useMemo(() => {
    return createBrowserRouter([
      {
        path: "/",
        element: mpesaData ? (
          <Navigate to="/dashboard" replace />
        ) : (
          <LandingPage setMpesaData={handleSetData} />
        ),
      },
      {
        path: "/dashboard",
        element: mpesaData ? (
          <DashboardLayout
            mpesaData={mpesaData}
            onClearData={handleClearData}
          />
        ) : (
          <Navigate to="/" replace />
        ),
        children: [
          { index: true, element: <OverviewPage rawData={mpesaData} /> },
          {
            path: "transactions",
            element: <TransactionsPage rawData={mpesaData} />,
          },
          { path: "trends", element: <TrendsPage rawData={mpesaData} /> },
          { path: "fees", element: <FeesPage rawData={mpesaData} /> },
          { path: "recurring", element: <RecurringPage rawData={mpesaData} /> },
          {
            path: "recipients",
            element: <RecipientsPage rawData={mpesaData} />,
          },
          { path: "export", element: <ExportPage rawData={mpesaData} /> },
        ],
      },
      { path: "*", element: <Navigate to="/" replace /> },
    ]);
  }, [mpesaData]);

  if (isInitializing) {
    return (
      <div className="h-screen bg-[#020617] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-emerald-500"></div>
      </div>
    );
  }

  // key={mpesaData ? ...} forces the Provider to unmount/remount
  // This is the strongest way to handle instant route switching in v6
  return (
    <RouterProvider
      key={mpesaData ? "authenticated" : "anonymous"}
      router={router}
    />
  );
}
