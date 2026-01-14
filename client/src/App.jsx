import { createBrowserRouter, RouterProvider } from "react-router-dom";
import LandingPage from "./routes/landingPage";
import DashboardLayout from "./components/DashboardLayout";
import OverviewPage from "./pages/OverviewPage";
import TransactionsPage from "./pages/TransactionsPage";
import TrendsPage from "./pages/TrendsPage";
import FeesPage from "./pages/FeesPage";
import RecurringPage from "./pages/RecurringPage";
import RecipientsPage from "./pages/RecipientsPage";

// 1. Import your data
import mpesaData from "./data/mpesaData.json";

const router = createBrowserRouter([
  {
    path: "/",
    element: <LandingPage />,
  },
  {
    path: "/dashboard",
    element: <DashboardLayout />,
    children: [
      {
        index: true,
        // 2. Pass the imported data as a prop
        element: <OverviewPage rawData={mpesaData} />,
      },
      {
        path: "transactions",
        // 3. Pass it here too
        element: <TransactionsPage rawData={mpesaData} />,
      },
      {
        path: "trends",
        element: <TrendsPage rawData={mpesaData} />,
      },
      {
        path: "fees",
        element: <FeesPage rawData={mpesaData} />,
      },
      {
        path: "recurring",
        element: <RecurringPage rawData={mpesaData} />,
      },
      {
        path: "recipients",
        element: <RecipientsPage rawData={mpesaData} />,
      },
    ],
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
