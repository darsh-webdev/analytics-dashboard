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
  TimeScale,
} from "chart.js";
import "chartjs-adapter-date-fns";

import { Bar, Doughnut, Line, Scatter } from "react-chartjs-2";
import "../App.css";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  TimeScale,
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

function severityByDate(data: Review[]) {
  return data.map((review) => ({
    x: review.date, // x-axis as date
    y: review.severityScore, // y-axis as score
  }));
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

// function avgSeverityByCategory(data: Review[]) {
//   const totals = { Positive: 0, Negative: 0 };
//   const counts = { Positive: 0, Negative: 0 };
//   data.forEach(({ category, severityScore }) => {
//     totals[category] += severityScore;
//     counts[category]++;
//   });
//   return {
//     labels: Object.keys(totals),
//     data: Object.keys(totals).map((cat) =>
//       counts[cat as keyof typeof counts]
//         ? totals[cat as keyof typeof totals] /
//           counts[cat as keyof typeof counts]
//         : 0
//     ),
//   };
// }

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
  const [otaFilter, setOtaFilter] = useState<OTAFilter[]>(["All"]);
  const [dateRange, setDateRange] = useState<DateRangeFilter>("all");
  const [isOtaDropdownOpen, setIsOtaDropdownOpen] = useState(false);

  const otaPlatforms: OTAFilter[] = [
    "All",
    "Booking.com",
    "TripAdvisor",
    "Expedia",
    "Hotels.com",
    "Agoda",
    "Airbnb",
    "MakeMyTrip",
    "Goibibo",
  ];

  // Handle OTA filter toggle
  const handleOtaToggle = (ota: OTAFilter) => {
    if (ota === "All") {
      setOtaFilter(["All"]);
    } else {
      setOtaFilter((prev) => {
        const filtered = prev.filter((o) => o !== "All");
        if (filtered.includes(ota)) {
          const updated = filtered.filter((o) => o !== ota);
          return updated.length === 0 ? ["All"] : updated;
        } else {
          return [...filtered, ota];
        }
      });
    }
  };

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
    if (!otaFilter.includes("All")) {
      data = data.filter((r) => otaFilter.includes(r.OTA as OTAFilter));
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

  const severityData = useMemo(() => {
    const selectedOTAs = otaFilter.includes("All")
      ? otaPlatforms.filter((ota) => ota !== "All")
      : otaFilter;

    const otaCounts: Record<string, number> = {};
    selectedOTAs.forEach((ota) => {
      otaCounts[ota] = filteredData.filter((r) => r.OTA === ota).length;
    });

    return {
      labels: Object.keys(otaCounts),
      data: Object.values(otaCounts),
    };
  }, [filteredData, otaFilter]);

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

  const scatterData = useMemo(
    () => ({
      datasets: [
        {
          label: "Severity Score",
          data: severityByDate(filteredData),
          backgroundColor: "rgba(75, 192, 192, 0.6)",
          borderColor: "rgba(75, 192, 192, 1)",
          pointRadius: 5,
          pointHoverRadius: 7,
        },
      ],
    }),
    [filteredData]
  );

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
            <div className="multi-select-dropdown">
              <div
                className="multi-select-display"
                onClick={() => setIsOtaDropdownOpen(!isOtaDropdownOpen)}
              >
                {otaFilter.includes("All")
                  ? "All OTAs"
                  : otaFilter.length === 0
                  ? "Select OTAs"
                  : `${otaFilter.length} OTA${
                      otaFilter.length > 1 ? "s" : ""
                    } selected`}
                <span className="dropdown-arrow">
                  {isOtaDropdownOpen ? "▲" : "▼"}
                </span>
              </div>
              {isOtaDropdownOpen && (
                <div className="multi-select-options">
                  {otaPlatforms.map((ota) => (
                    <label key={ota} className="multi-select-option">
                      <input
                        type="checkbox"
                        checked={otaFilter.includes(ota)}
                        onChange={() => handleOtaToggle(ota)}
                      />
                      <span>{ota}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
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

          {/* <ChartCard title="Average Severity by Category" className="bar-chart">
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
          </ChartCard> */}

          <ChartCard title="Reviews per OTA Platform" className="bar-chart">
            <Bar
              data={{
                labels: severityData.labels,
                datasets: [
                  {
                    label: "Review Count",
                    data: severityData.data,
                    backgroundColor: [
                      "#FF6384",
                      "#36A2EB",
                      "#FFCE56",
                      "#4BC0C0",
                      "#9966FF",
                      "#FF9F40",
                      "#E7E9ED",
                      "#C9CBCF",
                    ],
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
                    grid: {
                      display: false,
                    },
                    ticks: {
                      stepSize: 1,
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
                  tooltip: {
                    callbacks: {
                      label: (context) => {
                        return `Reviews: ${context.parsed.y}`;
                      },
                    },
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

        <div className="chart-row">
          <ChartCard title="Severity Score Over Time" className="full-width">
            <Scatter
              data={scatterData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: "top" as const,
                  },
                  tooltip: {
                    callbacks: {
                      title: (context) => {
                        const date = new Date(context[0].parsed.x);
                        return date.toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        });
                      },
                      label: (context) => {
                        return `Severity Score: ${context.parsed.y}`;
                      },
                    },
                  },
                },
                scales: {
                  x: {
                    type: "time" as const,
                    time: {
                      unit: "day",
                      displayFormats: {
                        day: "MMM dd, yyyy",
                      },
                    },
                    grid: {
                      display: false,
                    },
                  },
                  y: {
                    beginAtZero: true,
                    max: 11,
                    grid: {
                      display: false,
                    },
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
