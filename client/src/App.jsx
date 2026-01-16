import React, { useState, useEffect, useMemo } from "react";
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";

// Imports
import LandingPage from "./routes/landingPage";
import DashboardLayout from "./components/DashboardLayout";
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

  useEffect(() => {
    const saved = localStorage.getItem("mpesaData");
    if (saved) {
      try {
        setMpesaData(JSON.parse(saved));
      } catch (e) {
        localStorage.removeItem("mpesaData");
      }
    }
    setIsInitializing(false);
  }, []);

  const handleClearData = () => {
    localStorage.removeItem("mpesaData");
    setMpesaData(null);
  };

  const router = useMemo(() => {
    return createBrowserRouter([
      {
        path: "/",
        element: mpesaData ? (
          <Navigate to="/dashboard" replace />
        ) : (
          <LandingPage setMpesaData={setMpesaData} />
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

  // THE SECRET: Adding a 'key' prop here forces the Provider to re-mount
  // immediately when mpesaData changes from [Array] to [null]
  return (
    <RouterProvider
      key={mpesaData ? "data-active" : "data-cleared"}
      router={router}
    />
  );
}
