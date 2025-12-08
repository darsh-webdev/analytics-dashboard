import { useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { reviewData } from "../data/dummyData";
import type { Review, OTAFilter, DateRangeFilter } from "../types";
import { AREA_CATEGORIES } from "../types";
import {
  ArrowLeft,
  Star,
  Smile,
  Frown,
  BarChart3,
  Filter,
  Moon,
  Sun,
} from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";
import { Switch } from "@/components/ui/switch";

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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MultiSelect } from "@/components/ui/multi-select";

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
  icon: React.ElementType;
  color: string;
  trend?: string | null;
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
    x: review.date,
    y: review.severityScore,
  }));
}

function groupByDateAndCategory(data: Review[]) {
  const res: Record<string, { POSITIVE: number; NEGATIVE: number }> = {};
  data.forEach(({ date, category }) => {
    if (!res[date]) res[date] = { POSITIVE: 0, NEGATIVE: 0 };
    res[date][category]++;
  });
  return res;
}

function countByRating(data: Review[]) {
  const map: Record<number, number> = {};
  for (let i = 1; i <= 10; i++) {
    map[i] = 0;
  }

  data.forEach(({ severityScore }) => {
    if (severityScore >= 1 && severityScore <= 10) {
      map[severityScore] = (map[severityScore] || 0) + 1;
    }
  });
  return map;
}

function countByAreaOfInconvenience(data: Review[]) {
  const map: Record<string, number> = {};
  AREA_CATEGORIES.forEach((area) => (map[area] = 0));

  data.forEach(({ areaOfInconvenience }) => {
    areaOfInconvenience.forEach((area) => {
      const areaCategories = AREA_CATEGORIES as readonly string[];
      if (areaCategories.includes(area)) {
        map[area] = (map[area] || 0) + 1;
      }
    });
  });
  return map;
}

function countByAreaOfBenefit(data: Review[]) {
  const map: Record<string, number> = {};
  AREA_CATEGORIES.forEach((area) => (map[area] = 0));

  data.forEach(({ areaOfBenefits }) => {
    areaOfBenefits.forEach((area) => {
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
  const [otaFilter, setOtaFilter] = useState<OTAFilter[]>(["ALL"]);
  const [dateRange, setDateRange] = useState<DateRangeFilter>("all");
  const { theme, toggleTheme } = useTheme();

  const otaPlatforms: OTAFilter[] = useMemo(
    () => ["ALL", "BOOKING_COM", "GOOGLE_REVIEWS", "EXPEDIA"],
    []
  );

  // Filter data based on hotel name, OTA, and date range
  const filteredData = useMemo(() => {
    let data = reviewData;

    if (hotelName && hotelName.toLowerCase() !== "all") {
      data = data.filter(
        (r) => r.hotelName.toLowerCase() === hotelName.toLowerCase()
      );
    }

    if (!otaFilter.includes("ALL")) {
      data = data.filter((r) => otaFilter.includes(r.OTA as OTAFilter));
    }

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
          data: sortedDates.map((date) => grouped[date].POSITIVE),
          borderColor: "#4caf50",
          backgroundColor: "rgba(76, 175, 80, 0.1)",
          fill: false,
        },
        {
          label: "Negative",
          data: sortedDates.map((date) => grouped[date].NEGATIVE),
          borderColor: "#f44336",
          backgroundColor: "rgba(244, 67, 54, 0.1)",
          fill: false,
        },
      ],
    };
  }, [filteredData]);

  const severityData = useMemo(() => {
    const selectedOTAs = otaFilter.includes("ALL")
      ? otaPlatforms.filter((ota) => ota !== "ALL")
      : otaFilter;

    const otaCounts: Record<string, number> = {};
    selectedOTAs.forEach((ota) => {
      otaCounts[ota] = filteredData.filter((r) => r.OTA === ota).length;
    });

    return {
      labels: Object.keys(otaCounts),
      data: Object.values(otaCounts),
    };
  }, [filteredData, otaFilter, otaPlatforms]);

  const areaOfInconvenienceCounts = useMemo(
    () => countByAreaOfInconvenience(filteredData),
    [filteredData]
  );

  const areaOfBenefitsCounts = useMemo(
    () => countByAreaOfBenefit(filteredData),
    [filteredData]
  );

  const ratingCounts = useMemo(
    () => countByRating(filteredData),
    [filteredData]
  );

  const areaOfInconvenienceChartData = useMemo(() => {
    const sortedEntries = Object.entries(areaOfInconvenienceCounts).sort(
      (a, b) => b[1] - a[1]
    );
    const labels = sortedEntries.map(([label]) => label);
    const data = sortedEntries.map(([, value]) => value);
    return {
      labels,
      datasets: [
        {
          label: "Count",
          data,
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
  }, [areaOfInconvenienceCounts]);

  const areaOfBenefitChartData = useMemo(() => {
    const sortedEntries = Object.entries(areaOfBenefitsCounts).sort(
      (a, b) => b[1] - a[1]
    );
    const labels = sortedEntries.map(([label]) => label);
    const data = sortedEntries.map(([, value]) => value);
    return {
      labels,
      datasets: [
        {
          label: "Count",
          data,
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
  }, [areaOfBenefitsCounts]);

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
    (r) => r.category === "POSITIVE"
  ).length;

  const badCount = filteredData.filter((r) => r.category === "NEGATIVE").length;

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
    <Card className="transition-all hover:shadow-lg">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-muted-foreground mb-1">
              {title}
            </p>
            <p className="text-3xl font-bold">{value}</p>
            {trend && (
              <span className="text-xs text-green-600 font-medium">
                {trend}
              </span>
            )}
          </div>
          <div
            className="ml-4 p-3 rounded-full"
            style={{ backgroundColor: `${color}20` }}
          >
            <Icon className="w-6 h-6" style={{ color }} />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <Button asChild variant="ghost" className="hover:bg-accent">
            <Link to="/" className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Link>
          </Button>

          <div className="flex items-center gap-2">
            <Sun className="h-4 w-4" />
            <Switch checked={theme === "dark"} onCheckedChange={toggleTheme} />
            <Moon className="h-4 w-4" />
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6 pb-4 border-b border-border">
          <h1 className="text-3xl font-bold text-foreground">
            {hotelName && hotelName.toLowerCase() !== "all"
              ? `${
                  hotelName.charAt(0).toUpperCase() + hotelName.slice(1)
                } Hotel`
              : "All Hotels"}{" "}
            - Review Analytics
          </h1>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-purple-600" />
              <MultiSelect
                options={otaPlatforms}
                selected={otaFilter}
                onChange={(selected) => setOtaFilter(selected as OTAFilter[])}
                placeholder="Select OTAs"
              />
            </div>
            <Select
              value={dateRange}
              onValueChange={(value) => setDateRange(value as DateRangeFilter)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select date range" />
              </SelectTrigger>
              <SelectContent className="SelectContent bg-popover text-popover-foreground border-border">
                <SelectItem value="all" className="SelectItem">
                  All Time
                </SelectItem>
                <SelectItem value="7days" className="SelectItem">
                  Last 7 Days
                </SelectItem>
                <SelectItem value="30days" className="SelectItem">
                  Last 30 Days
                </SelectItem>
                <SelectItem value="3months" className="SelectItem">
                  Last 3 Months
                </SelectItem>
                <SelectItem value="6months" className="SelectItem">
                  Last 6 Months
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard
            title="Rating"
            value={`${averageSeverity.toFixed(2)}/10`}
            icon={Star}
            color="#FFCE56"
          />
          <StatCard
            title="Total Reviews"
            value={filteredData.length}
            icon={BarChart3}
            color="#9966FF"
          />
          <StatCard
            title="Positive"
            value={goodCount}
            icon={Smile}
            color="#4caf50"
          />
          <StatCard
            title="Negative"
            value={badCount}
            icon={Frown}
            color="#f44336"
          />
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Review Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
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
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Reviews per OTA Platform</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
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
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Rating Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <Bar
                    data={{
                      labels: Object.keys(ratingCounts),
                      datasets: [
                        {
                          label: "Number of Reviews",
                          data: Object.values(ratingCounts),
                          backgroundColor: [
                            "#f44336",
                            "#e53935",
                            "#ff5722",
                            "#ff9800",
                            "#ffc107",
                            "#ffeb3b",
                            "#cddc39",
                            "#8bc34a",
                            "#4caf50",
                            "#2e7d32",
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
                          title: {
                            display: true,
                            text: "Number of Reviews",
                          },
                        },
                        x: {
                          grid: {
                            display: false,
                          },
                          title: {
                            display: true,
                            text: "Rating (1-10)",
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
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Areas of Inconvenience</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <Bar
                  data={areaOfInconvenienceChartData}
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
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Areas of Benefit</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <Bar
                  data={areaOfBenefitChartData}
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
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Review Trends Over Time</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
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
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Severity Score Over Time</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
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
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
