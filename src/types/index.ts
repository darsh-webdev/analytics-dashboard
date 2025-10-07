export interface Review {
  date: string;
  category: "Positive" | "Neutral" | "Negative";
  severityScore: number;
  areaOfInconvenience: string[];
  OTA: string;
  hotelName: string;
  response?: boolean;
}

export type OTAFilter = "All" | "Booking.com" | "TripAdvisor";
export type DateRangeFilter = "all" | "7days" | "30days" | "3months" | "6months";

export const AREA_CATEGORIES = [
  "Rooms",
  "Location",
  "Staff service",
  "Ambience",
  "Cleanliness",
  "Comfort",
  "Sleep Quality",
  "Food",
  "Hotel Service",
] as const;

export type AreaCategory = typeof AREA_CATEGORIES[number];
