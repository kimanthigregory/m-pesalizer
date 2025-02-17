import { createBrowserRouter, RouterProvider } from "react-router-dom";
import SidebarContent from "./components/sidebaBody";
import LandingPage from "./routes/landingPage";

const router = createBrowserRouter([
  {
    path: "/",
    element: <LandingPage />,
  },
  {
    path: "dashboard",
    element: <SidebarContent />,
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
