# Hotel Review Analytics Dashboard - Usage Guide

## 🚀 Getting Started

### Installation
```bash
npm install
```

### Running the Application
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## 📊 Dashboard Features

### Navigation Structure

```
Home (/)
├── Maritim Hotel (/hotel/maritim)
├── Infinity Hotel (/hotel/infinity)
└── All Hotels Combined (/hotel/all)
```

## 🎯 How to Use

### 1. **Home Page**
- **Purpose**: Select which hotel's analytics you want to view
- **Options**:
  - Click on individual hotel cards to view specific hotel data
  - Click "View All Hotels Combined" to see aggregated data across all properties

### 2. **Dashboard Page**

#### **Header Section**
- **Hotel Name**: Displays which hotel's data you're viewing
- **Back Button**: Returns you to the home page
- **Filters**: Two dropdown menus for filtering data

#### **Filter Options**

##### **OTA Filter** (Online Travel Agency)
- **All OTAs**: Shows reviews from all platforms (default)
- **Booking.com**: Filters to show only Booking.com reviews
- **TripAdvisor**: Filters to show only TripAdvisor reviews

**Use Case**: Compare performance across different booking platforms

##### **Date Range Filter**
- **All Time**: Shows complete historical data (default)
- **Last 7 Days**: Most recent week of reviews
- **Last 30 Days**: Past month of reviews
- **Last 3 Months**: Quarterly view
- **Last 6 Months**: Half-year view

**Use Case**: Track trends over time, identify seasonal patterns

### 3. **Key Metrics Cards**

Four summary cards at the top show:
1. **Total Reviews**: Count of all reviews in the filtered dataset
2. **Positive**: Number of positive reviews
3. **Neutral**: Number of neutral reviews
4. **Negative**: Number of negative reviews

**Color Coding**:
- 🟢 Green = Positive
- 🟡 Yellow = Neutral
- 🔴 Red = Negative

### 4. **Charts & Visualizations**

#### **Review Distribution (Doughnut Chart)**
- **What it shows**: Percentage breakdown of review sentiments
- **How to read**: 
  - Larger segments = more reviews in that category
  - Hover over segments for exact counts
- **Best for**: Quick sentiment overview

#### **Average Severity by Category (Bar Chart)**
- **What it shows**: Average severity score (1-10) for each sentiment category
- **How to read**:
  - Higher bars = higher severity scores
  - Positive reviews: Lower scores are better (less severe issues)
  - Negative reviews: Higher scores indicate more serious problems
- **Best for**: Understanding the intensity of feedback

#### **Areas of Inconvenience (Horizontal Bar Chart)**
- **What it shows**: Count of mentions for each problem area
- **Categories tracked**:
  - Rooms
  - Location
  - Staff service
  - Ambience
  - Cleanliness
  - Comfort
  - Sleep Quality
  - Food
  - Hotel Service
- **How to read**: Longer bars = more complaints in that area
- **Best for**: Identifying which areas need improvement

#### **Review Trends Over Time (Line Chart)**
- **What it shows**: How review sentiments change over time
- **How to read**:
  - Three lines (Positive, Neutral, Negative)
  - X-axis: Dates
  - Y-axis: Number of reviews
  - Upward trends = increasing reviews
- **Best for**: Spotting patterns, seasonal variations, impact of changes

## 💡 Common Use Cases

### **Scenario 1: Monthly Performance Review**
1. Navigate to specific hotel
2. Set date range to "Last 30 Days"
3. Review all metrics and charts
4. Note areas of inconvenience with highest counts
5. Compare with previous month

### **Scenario 2: Platform Comparison**
1. Go to hotel dashboard
2. First, select "Booking.com" filter
3. Note the metrics
4. Then select "TripAdvisor" filter
5. Compare the differences in sentiment and issues

### **Scenario 3: Identifying Improvement Areas**
1. View "Areas of Inconvenience" chart
2. Identify top 3 problem areas
3. Click on those areas for detailed breakdown
4. Create action plan based on data

### **Scenario 4: Trend Analysis**
1. Set date range to "Last 6 Months"
2. Examine "Review Trends Over Time" chart
3. Look for:
   - Sudden spikes in negative reviews
   - Gradual improvements in positive reviews
   - Seasonal patterns

## 🎨 Visual Guide

### **Color Scheme**
- **Primary**: Purple gradient (#667eea to #764ba2)
- **Positive**: Green (#4caf50)
- **Neutral**: Yellow (#ffc107)
- **Negative**: Red (#f44336)
- **Info**: Blue (#2196f3)

### **Interactive Elements**
- **Hover Effects**: All cards and buttons have hover animations
- **Clickable**: Hotel cards, back button, filter dropdowns
- **Responsive**: Works on desktop, tablet, and mobile

## 📱 Mobile Usage

On mobile devices:
- Stats cards stack in 2 columns
- Charts stack vertically
- Filters move below the header
- Touch-optimized dropdowns

## 🔄 Data Updates

Currently using static dummy data. To add new reviews:
1. Open `/src/data/dummyData.ts`
2. Add new review objects following the structure:
```typescript
{
  date: "YYYY-MM-DD",
  category: "Positive" | "Neutral" | "Negative",
  severityScore: 1-10,
  areaOfInconvenience: ["Area1", "Area2"],
  OTA: "Booking.com" | "TripAdvisor",
  hotelName: "Maritim" | "Infinity"
}
```

## 🐛 Troubleshooting

### **Charts not displaying**
- Refresh the page
- Check browser console for errors
- Ensure data is properly formatted

### **Filters not working**
- Clear browser cache
- Check that date format is correct (YYYY-MM-DD)

### **Back button not working**
- Ensure you're using the in-app back button, not browser back

## 🚀 Future Enhancements

Potential features to add:
- Export data to CSV/PDF
- Real-time data integration
- Email alerts for negative reviews
- Comparison between multiple hotels
- AI-powered insights
- Response rate tracking
- Guest satisfaction scores

## 📞 Support

For issues or questions:
1. Check this guide first
2. Review the DASHBOARD_FEATURES.md file
3. Check the code comments in the source files
