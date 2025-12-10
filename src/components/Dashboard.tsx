import { useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { reviewData } from "../data/dummyData";
import type {
  Review,
  OTAFilter,
  DateRangeFilter,
  AreaCategory,
} from "../types";
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
function getBucketKeyAndDate(date: Date, range: DateRangeFilter) {
  const d = new Date(date);

  if (range === "30days") {
    const key = d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
    const bd = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    return { key, bucketDate: bd };
  }

  if (range === "3months" || range === "6months") {
    const day = d.getDay();
    const daysSinceMonday = (day + 6) % 7;
    const monday = new Date(d);
    monday.setDate(d.getDate() - daysSinceMonday);
    const weekEnd = new Date(
      monday.getFullYear(),
      monday.getMonth(),
      monday.getDate() + 6
    );
    const key =
      monday.toLocaleDateString("en-US", { month: "short", day: "numeric" }) +
      " - " +
      weekEnd.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    const bd = new Date(
      monday.getFullYear(),
      monday.getMonth(),
      monday.getDate()
    );
    return { key, bucketDate: bd };
  }

  const key = d.toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });
  const bd = new Date(d.getFullYear(), d.getMonth(), 1);
  return { key, bucketDate: bd };
}

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

function groupRatingTrendsByRange(reviews: Review[], range: DateRangeFilter) {
  const buckets: Record<
    string,
    {
      bucketDate: Date;
      ratingCounts: Record<number, number>;
      totalRatingSum: number;
      totalCount: number;
    }
  > = {};
  //                                                                                      ^ New fields added

  reviews.forEach((r) => {
    const reviewDate = new Date(r.date);
    const { key, bucketDate } = getBucketKeyAndDate(reviewDate, range);

    if (!buckets[key]) {
      buckets[key] = {
        bucketDate,
        ratingCounts: {},
        totalRatingSum: 0, // Initialize
        totalCount: 0, // Initialize
      };
    }

    const rating = r.severityScore;
    if (rating >= 1 && rating <= 10) {
      // Update rating counts
      buckets[key].ratingCounts[rating] =
        (buckets[key].ratingCounts[rating] || 0) + 1;

      // Update new fields for average calculation
      buckets[key].totalRatingSum += rating;
      buckets[key].totalCount += 1;
    }
  });

  // Calculate the average severity score for each bucket
  const sorted = Object.entries(buckets)
    .map(([label, val]) => ({
      label,
      ...val,
      // Calculate the average only if totalCount is greater than 0
      averageSeverity:
        val.totalCount > 0 ? val.totalRatingSum / val.totalCount : 0,
    }))
    .sort((a, b) => a.bucketDate.getTime() - b.bucketDate.getTime());

  return sorted;
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

function groupCategoryTrendsByRange(
  reviews: Review[],
  range: DateRangeFilter,
  category: AreaCategory
) {
  const buckets: Record<
    string,
    { bucketDate: Date; inconvenience: number; benefit: number }
  > = {};

  reviews.forEach((r) => {
    const reviewDate = new Date(r.date);
    const { key, bucketDate } = getBucketKeyAndDate(reviewDate, range);

    if (!buckets[key]) {
      buckets[key] = {
        bucketDate,
        inconvenience: 0,
        benefit: 0,
      };
    }

    // Check if this category is in areas of inconvenience
    if (r.areaOfInconvenience && r.areaOfInconvenience.includes(category)) {
      buckets[key].inconvenience += 1;
    }

    // Check if this category is in areas of benefits
    if (r.areaOfBenefits && r.areaOfBenefits.includes(category)) {
      buckets[key].benefit += 1;
    }
  });

  const sorted = Object.entries(buckets)
    .map(([label, val]) => ({ label, ...val }))
    .sort((a, b) => a.bucketDate.getTime() - b.bucketDate.getTime());

  return sorted;
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
  const [selectedCategory, setSelectedCategory] = useState<AreaCategory>(
    AREA_CATEGORIES[0]
  );
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
    const groupedByRange = groupRatingTrendsByRange(filteredData, dateRange);
    const labels = groupedByRange.map((g) => g.label);

    // Create a dataset for each rating (1-10)
    const datasets = [];
    // Separate colors for individual ratings
    const ratingColors = [
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
    ];

    for (let rating = 1; rating <= 10; rating++) {
      datasets.push({
        label: `Severity Rating ${rating}`,
        data: groupedByRange.map((g) => g.ratingCounts[rating] || 0),
        borderColor: ratingColors[rating - 1],
        backgroundColor: ratingColors[rating - 1],
        fill: false,
        tension: 0.4,
        pointRadius: 3,
        pointHoverRadius: 5,
        hidden: false, // You might want to hide individual lines by default
      });
    }

    // --- ADDITION FOR AVERAGE TREND LINE ---
    const averageSeverityData = groupedByRange.map((g) => g.averageSeverity);

    datasets.push({
      label: "Average Severity Trend",
      data: averageSeverityData,
      borderColor: "#6F66E7",
      backgroundColor: "#6F66E7",
      borderWidth: 3,
      fill: false,
      tension: 0.4,
      pointRadius: 5,
      pointHoverRadius: 7,
    });
    // ----------------------------------------

    return { labels, datasets };
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

  const categoryTrendData = useMemo(() => {
    const groupedByRange = groupCategoryTrendsByRange(
      filteredData,
      dateRange,
      selectedCategory
    );
    const labels = groupedByRange.map((g) => g.label);

    return {
      labels,
      datasets: [
        {
          label: `${selectedCategory} - Inconvenience`,
          data: groupedByRange.map((g) => g.inconvenience),
          borderColor: "#f44336",
          backgroundColor: "rgba(244, 67, 54, 0.1)",
          fill: false,
          tension: 0.4,
          pointRadius: 5,
          pointHoverRadius: 7,
          borderWidth: 3,
        },
        {
          label: `${selectedCategory} - Benefit`,
          data: groupedByRange.map((g) => g.benefit),
          borderColor: "#4caf50",
          backgroundColor: "rgba(76, 175, 80, 0.1)",
          fill: false,
          tension: 0.4,
          pointRadius: 5,
          pointHoverRadius: 7,
          borderWidth: 3,
        },
      ],
    };
  }, [filteredData, dateRange, selectedCategory]);

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
              <CardTitle>Rating Trends Over Time</CardTitle>
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

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle>Category Trend Over Time</CardTitle>
              <Select
                value={selectedCategory as AreaCategory}
                onValueChange={(value) =>
                  setSelectedCategory(value as AreaCategory)
                }
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {AREA_CATEGORIES.map((category: AreaCategory) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <Line
                  data={categoryTrendData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      y: {
                        beginAtZero: true,
                        grid: {
                          display: true,
                          color:
                            theme === "dark"
                              ? "rgba(255,255,255,0.1)"
                              : "rgba(0,0,0,0.1)",
                        },
                        title: {
                          display: true,
                          text: "Number of Mentions",
                        },
                        ticks: {
                          stepSize: 1,
                        },
                      },
                      x: {
                        grid: {
                          display: false,
                        },
                        title: {
                          display: true,
                          text: "Time Period",
                        },
                      },
                    },
                    plugins: {
                      legend: {
                        position: "top",
                        labels: {
                          boxWidth: 15,
                          padding: 15,
                          font: {
                            size: 12,
                          },
                          usePointStyle: true,
                        },
                      },
                      tooltip: {
                        mode: "index",
                        intersect: false,
                        callbacks: {
                          title: (context) => {
                            return context[0].label;
                          },
                          label: (context) => {
                            const label = context.dataset.label || "";
                            const value = context.parsed.y;
                            return `${label}: ${value} mention${
                              value !== 1 ? "s" : ""
                            }`;
                          },
                          afterLabel: (context) => {
                            const dataIndex = context.dataIndex;
                            const groupedByRange = groupCategoryTrendsByRange(
                              filteredData,
                              dateRange,
                              selectedCategory
                            );
                            const bucket = groupedByRange[dataIndex];
                            const total = bucket.inconvenience + bucket.benefit;

                            if (total === 0) return "";

                            const value = context.parsed.y;
                            const percentage = ((value / total) * 100).toFixed(
                              1
                            );
                            return `(${percentage}% of ${selectedCategory} mentions)`;
                          },
                        },
                      },
                    },
                    interaction: {
                      mode: "nearest",
                      axis: "x",
                      intersect: false,
                    },
                  }}
                />
              </div>
              <div className="mt-4 text-sm text-muted-foreground text-center">
                <p>
                  Track how "{selectedCategory}" is perceived over time - as an
                  concern (red) or appreciation (green)
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
