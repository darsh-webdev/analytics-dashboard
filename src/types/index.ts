export interface Review {
  date: string;
  category: "Positive" | "Negative";
  severityScore: number;
  areaOfInconvenience: string[];
  OTA: string;
  hotelName: string;
  response?: boolean;
}

export type OTAFilter =
  | "All"
  | "Booking.com"
  | "TripAdvisor"
  | "Expedia"
  | "Hotels.com"
  | "Agoda"
  | "Airbnb"
  | "MakeMyTrip"
  | "Goibibo";

export type DateRangeFilter =
  | "all"
  | "7days"
  | "30days"
  | "3months"
  | "6months";

export const AREA_CATEGORIES = [
  "Rooms",
  "Comfort",
  "Food",
  "Staff service",
  "Location",
  "Hotel Service",
  "Sleep Quality",
  "Parking",
  "Space Utilization",
  "Ambience",
  "Cleanliness",
] as const;

export type AreaCategory = (typeof AREA_CATEGORIES)[number];
