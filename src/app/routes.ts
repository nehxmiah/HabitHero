import { createBrowserRouter } from "react-router";
import { Root } from "./components/Root";
import { DailyView } from "./components/DailyView";
import { MonthlyView } from "./components/MonthlyView";
import { YearlyView } from "./components/YearlyView";
import { AnalyticsView } from "./components/AnalyticsView";
import { AuthPage } from "./components/AuthPage";
import { ProtectedRoute } from "./components/ProtectedRoute";

export const router = createBrowserRouter([
  // Public routes
  { path: "/login", Component: AuthPage },

  // Protected app routes — redirects to /login if not authenticated
  {
    Component: ProtectedRoute,
    children: [
      {
        path: "/",
        Component: Root,
        children: [
          { index: true, Component: DailyView },
          { path: "monthly", Component: MonthlyView },
          { path: "yearly", Component: YearlyView },
          { path: "analytics", Component: AnalyticsView },
        ],
      },
    ],
  },
]);
