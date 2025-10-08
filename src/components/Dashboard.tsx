import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import { useParams, Link } from "react-router-dom";
import { reviewData } from "../data/dummyData";
import type { Review, OTAFilter, DateRangeFilter } from "../types";
import { AREA_CATEGORIES } from "../types";
import {
  FaChartPie,
  FaRegSmile,
  FaRegFrown,
  FaFilter,
  FaArrowLeft,
  FaStar,
} from "react-icons/fa";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";

import { Bar, Doughnut, Line } from "react-chartjs-2";
import "../App.css";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// Chart default settings
ChartJS.defaults.font.family = "'Segoe UI', 'Roboto', 'Oxygen', sans-serif";
ChartJS.defaults.color = "#666";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ComponentType<{ size: number }>;
  color: string;
  trend?: string | null;
}

interface ChartCardProps {
  title: string;
  children: ReactNode;
  className?: string;
}

// Helper functions
function groupByCategory(data: Review[]) {
  return data.reduce((acc: Record<string, number>, { category }) => {
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {});
}

function groupByDateAndCategory(data: Review[]) {
  const res: Record<
    string,
    { Positive: number; Neutral: number; Negative: number }
  > = {};
  data.forEach(({ date, category }) => {
    if (!res[date]) res[date] = { Positive: 0, Neutral: 0, Negative: 0 };
    res[date][category]++;
  });
  return res;
}

function avgSeverityByCategory(data: Review[]) {
  const totals = { Positive: 0, Negative: 0 };
  const counts = { Positive: 0, Negative: 0 };
  data.forEach(({ category, severityScore }) => {
    totals[category] += severityScore;
    counts[category]++;
  });
  return {
    labels: Object.keys(totals),
    data: Object.keys(totals).map((cat) =>
      counts[cat as keyof typeof counts]
        ? totals[cat as keyof typeof totals] /
          counts[cat as keyof typeof counts]
        : 0
    ),
  };
}

function countByAreaOfInconvenience(data: Review[]) {
  const map: Record<string, number> = {};
  AREA_CATEGORIES.forEach((area) => (map[area] = 0));

  data.forEach(({ areaOfInconvenience }) => {
    areaOfInconvenience.forEach((area) => {
      // Check if area exists in predefined categories
      const areaCategories = AREA_CATEGORIES as readonly string[];
      if (areaCategories.includes(area)) {
        map[area] = (map[area] || 0) + 1;
      }
    });
  });
  return map;
}

function filterByDateRange(data: Review[], range: string) {
  const now = new Date();
  const cutoffDate = new Date();

  switch (range) {
    case "7days":
      cutoffDate.setDate(now.getDate() - 7);
      break;
    case "30days":
      cutoffDate.setDate(now.getDate() - 30);
      break;
    case "3months":
      cutoffDate.setMonth(now.getMonth() - 3);
      break;
    case "6months":
      cutoffDate.setMonth(now.getMonth() - 6);
      break;
    default:
      return data;
  }

  return data.filter((review) => new Date(review.date) >= cutoffDate);
}

export default function Dashboard() {
  const { hotelName } = useParams<{ hotelName: string }>();
  const [otaFilter, setOtaFilter] = useState<OTAFilter>("All");
  const [dateRange, setDateRange] = useState<DateRangeFilter>("all");

  // Filter data based on hotel name, OTA, and date range
  const filteredData = useMemo(() => {
    let data = reviewData;

    // Filter by hotel name (skip if "all")
    if (hotelName && hotelName.toLowerCase() !== "all") {
      data = data.filter(
        (r) => r.hotelName.toLowerCase() === hotelName.toLowerCase()
      );
    }

    // Filter by OTA
    if (otaFilter !== "All") {
      data = data.filter((r) => r.OTA === otaFilter);
    }

    // Filter by date range
    data = filterByDateRange(data, dateRange);

    return data;
  }, [hotelName, otaFilter, dateRange]);

  // Calculate stats and chart data
  const categoryCounts = useMemo(
    () => groupByCategory(filteredData),
    [filteredData]
  );

  const trendsData = useMemo(() => {
    const grouped = groupByDateAndCategory(filteredData);
    const sortedDates = Object.keys(grouped).sort();
    return {
      labels: sortedDates,
      datasets: [
        {
          label: "Positive",
          data: sortedDates.map((date) => grouped[date].Positive),
          borderColor: "#4caf50",
          backgroundColor: "rgba(76, 175, 80, 0.1)",
          fill: false,
        },
        {
          label: "Negative",
          data: sortedDates.map((date) => grouped[date].Negative),
          borderColor: "#f44336",
          backgroundColor: "rgba(244, 67, 54, 0.1)",
          fill: false,
        },
      ],
    };
  }, [filteredData]);

  const severityData = useMemo(
    () => avgSeverityByCategory(filteredData),
    [filteredData]
  );

  const areaCounts = useMemo(
    () => countByAreaOfInconvenience(filteredData),
    [filteredData]
  );

  const areaChartData = useMemo(() => {
    return {
      labels: Object.keys(areaCounts),
      datasets: [
        {
          label: "Count",
          data: Object.values(areaCounts),
          backgroundColor: [
            "#FF6384",
            "#36A2EB",
            "#FFCE56",
            "#4BC0C0",
            "#9966FF",
            "#FF9F40",
            "#FF6384",
            "#C9CBCF",
            "#4BC0C0",
          ],
          borderRadius: 4,
        },
      ],
    };
  }, [areaCounts]);

  const pieData = useMemo(
    () => ({
      labels: Object.keys(categoryCounts),
      datasets: [
        {
          data: Object.values(categoryCounts),
          backgroundColor: ["#4caf50", "#f44336"],
        },
      ],
    }),
    [categoryCounts]
  );

  const goodCount = filteredData.filter(
    (r) => r.category === "Positive"
  ).length;

  const badCount = filteredData.filter((r) => r.category === "Negative").length;

  const averageSeverity =
    filteredData.reduce((acc, review) => acc + review.severityScore, 0) /
    filteredData.length;

  // Card component for better organization
  const StatCard = ({
    title,
    value,
    icon: Icon,
    color,
    trend = null,
  }: StatCardProps) => (
    <div className="stat-card" style={{ borderTop: `4px solid ${color}` }}>
      <div className="stat-icon" style={{ color }}>
        <Icon size={24} />
      </div>
      <div className="stat-content">
        <h3>{title}</h3>
        <p className="stat-value">{value}</p>
        {trend && <span className="stat-trend">{trend}</span>}
      </div>
    </div>
  );

  // Chart wrapper component for consistent styling
  const ChartCard = ({ title, children, className = "" }: ChartCardProps) => (
    <div className={`chart-card ${className}`}>
      <h3>{title}</h3>
      <div className="chart-container">{children}</div>
    </div>
  );

  return (
    <div className="dashboard">
      <Link to="/" className="back-button">
        <FaArrowLeft /> Back to Home
      </Link>
      <header className="dashboard-header">
        <h1>
          {hotelName && hotelName.toLowerCase() !== "all"
            ? `${hotelName.charAt(0).toUpperCase() + hotelName.slice(1)} Hotel`
            : "All Hotels"}{" "}
          - Review Analytics
        </h1>
        <div className="filters-container">
          <div className="filter-group">
            <FaFilter className="filter-icon" />
            <select
              value={otaFilter}
              onChange={(e) => setOtaFilter(e.target.value as OTAFilter)}
              className="filter-select"
            >
              <option value="All">All OTAs</option>
              <option value="Booking.com">Booking.com</option>
              <option value="TripAdvisor">TripAdvisor</option>
            </select>
          </div>
          <div className="filter-group">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value as DateRangeFilter)}
              className="filter-select"
            >
              <option value="all">All Time</option>
              <option value="7days">Last 7 Days</option>
              <option value="30days">Last 30 Days</option>
              <option value="3months">Last 3 Months</option>
              <option value="6months">Last 6 Months</option>
            </select>
          </div>
        </div>
      </header>

      <div className="stats-grid">
        <StatCard
          title="Rating"
          value={`${averageSeverity.toFixed(2)}/10`}
          icon={FaStar}
          color="#FFCE56"
        />
        <StatCard
          title="Total Reviews"
          value={filteredData.length}
          icon={FaChartPie}
          color="#9966FF"
        />
        <StatCard
          title="Positive"
          value={goodCount}
          icon={FaRegSmile}
          color="#4caf50"
        />
        <StatCard
          title="Negative"
          value={badCount}
          icon={FaRegFrown}
          color="#f44336"
        />
      </div>

      <div className="main-content">
        <div className="chart-row">
          <ChartCard title="Review Distribution" className="pie-chart">
            <Doughnut
              data={pieData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: "right",
                  },
                },
              }}
            />
          </ChartCard>

          <ChartCard title="Average Severity by Category" className="bar-chart">
            <Bar
              data={{
                labels: severityData.labels,
                datasets: [
                  {
                    label: "Severity Score",
                    data: severityData.data,
                    backgroundColor: ["#4caf50", "#f44336"],
                    borderRadius: 4,
                  },
                ],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  y: {
                    beginAtZero: true,
                    max: 10,
                    grid: {
                      display: false,
                    },
                  },
                  x: {
                    grid: {
                      display: false,
                    },
                  },
                },
                plugins: {
                  legend: {
                    display: false,
                  },
                },
              }}
            />
          </ChartCard>
        </div>

        <div className="chart-row">
          <ChartCard title="Areas of Inconvenience" className="full-width">
            <Bar
              data={areaChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                indexAxis: "x",
                scales: {
                  x: {
                    grid: {
                      display: false,
                    },
                  },
                  y: {
                    beginAtZero: true,
                    grid: {
                      display: false,
                    },
                  },
                },
                plugins: {
                  legend: {
                    display: false,
                  },
                },
              }}
            />
          </ChartCard>
        </div>

        <div className="chart-row">
          <ChartCard title="Review Trends Over Time" className="full-width">
            <Line
              data={trendsData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  y: {
                    beginAtZero: true,
                    grid: {
                      display: false,
                    },
                  },
                  x: {
                    grid: {
                      display: false,
                    },
                  },
                },
                plugins: {
                  legend: {
                    position: "top",
                  },
                },
                elements: {
                  line: {
                    tension: 0.4,
                    borderWidth: 2,
                  },
                  point: {
                    radius: 4,
                    hoverRadius: 6,
                  },
                },
              }}
            />
          </ChartCard>
        </div>
      </div>
    </div>
  );
}
