export interface Review {
  reviewId: string;
  rating: number;
  date: string;
  category: "POSITIVE" | "NEGATIVE";
  severityScore: number;
  areaOfInconvenience: AreaCategory[];
  areaOfBenefits: AreaCategory[];
  OTA: string;
  hotelName: string;
  response?: boolean;
}

export type OTAFilter = "ALL" | "BOOKING_COM" | "GOOGLE_REVIEWS" | "EXPEDIA";

export type DateRangeFilter =
  | "all"
  | "7days"
  | "30days"
  | "3months"
  | "6months";

export const AREA_CATEGORIES = [
  "rooms",
  "comfort",
  "food",
  "staff service",
  "location",
  "hotel service",
  "check-in/out",
  "parking",
  "amenities",
  "ambience",
  "cleanliness",
  "pool",
  "spa",
  "pricing",
  "others",
] as const;

export type AreaCategory = (typeof AREA_CATEGORIES)[number];
