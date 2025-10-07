# Dashboard Features

## Overview
A comprehensive hotel review analytics dashboard with routing, filtering, and dynamic data visualization.

## Key Features

### 1. **Routing System**
- **Home Page** (`/`): Landing page with hotel selection cards
- **Hotel-Specific Dashboard** (`/hotel/:hotelName`): 
  - `/hotel/maritim` - Maritim Hotel analytics
  - `/hotel/infinity` - Infinity Hotel analytics
  - `/hotel/all` - Combined analytics for all hotels

### 2. **Dynamic Filtering**

#### OTA Filter
- **All OTAs**: Shows reviews from all platforms
- **Booking.com**: Shows only Booking.com reviews
- **TripAdvisor**: Shows only TripAdvisor reviews

#### Date Range Filter
- **All Time**: Shows all historical data
- **Last 7 Days**: Reviews from the past week
- **Last 30 Days**: Reviews from the past month
- **Last 3 Months**: Reviews from the past quarter
- **Last 6 Months**: Reviews from the past half year

### 3. **Charts & Visualizations**

#### Key Metrics (Top Cards)
- Total Reviews count
- Positive reviews count
- Neutral reviews count
- Negative reviews count

#### Chart Types
1. **Review Distribution** (Doughnut Chart)
   - Visual breakdown of Positive/Neutral/Negative reviews
   - Interactive legend

2. **Average Severity by Category** (Bar Chart)
   - Shows average severity scores (1-10 scale)
   - Color-coded by sentiment

3. **Areas of Inconvenience** (Horizontal Bar Chart) - NEW!
   - Tracks common complaint areas:
     - Rooms
     - Location
     - Staff service
     - Ambience
     - Cleanliness
     - Comfort
     - Sleep Quality
     - Food
     - Hotel Service
   - Helps identify improvement areas

4. **Review Trends Over Time** (Line Chart)
   - Time-series visualization of review sentiment
   - Shows trends for Positive, Neutral, and Negative reviews
   - Helps identify patterns and seasonal variations

### 4. **Responsive Design**
- Mobile-friendly layout
- Adaptive grid system
- Touch-optimized filters
- Collapsible charts on smaller screens

### 5. **User Experience**
- Smooth animations and transitions
- Hover effects on interactive elements
- Back navigation button
- Clean, modern UI inspired by PowerBI
- Color-coded sentiment indicators

## Data Structure

Each review contains:
```typescript
{
  date: string;
  category: "Positive" | "Neutral" | "Negative";
  severityScore: number; // 1-10
  areaOfInconvenience: string[];
  OTA: "Booking.com" | "TripAdvisor";
  hotelName: "Maritim" | "Infinity";
  response?: boolean;
}
```

## How to Use

1. **Start at Home**: Select a hotel or view all hotels combined
2. **Apply Filters**: Use the OTA and date range filters to narrow down data
3. **Analyze Charts**: Review the visualizations to identify trends and issues
4. **Navigate**: Use the back button to return to hotel selection

## Technical Stack
- React with TypeScript
- React Router for navigation
- Chart.js with react-chartjs-2 for visualizations
- React Icons for UI elements
- CSS Grid and Flexbox for responsive layout
