import { createBrowserRouter } from "react-router";
import { Root } from "./components/Root";
import { DailyView } from "./components/DailyView";
import { MonthlyView } from "./components/MonthlyView";
import { YearlyView } from "./components/YearlyView";
import { AnalyticsView } from "./components/AnalyticsView";

export const router = createBrowserRouter([
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
]);
