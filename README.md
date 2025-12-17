# 🏨 Hotel Review Analytics Dashboard

A comprehensive, interactive dashboard for analyzing hotel reviews across multiple OTAs (Online Travel Agencies). Built with React, TypeScript, and Chart.js, featuring dynamic routing, advanced filtering, and beautiful data visualizations inspired by PowerBI.

![Dashboard Preview](https://img.shields.io/badge/Status-Production%20Ready-success)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue)
![React](https://img.shields.io/badge/React-18-61dafb)
![License](https://img.shields.io/badge/License-MIT-green)

## ✨ Features

### 🎯 Core Functionality

- **Dynamic Routing**: Hotel-specific dashboards with URL parameters
- **Advanced Filtering**: Filter by OTA platform and date ranges
- **Real-time Updates**: Charts update instantly based on filter selections
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices

### 📊 Visualizations

- **Review Distribution**: Doughnut / pie charts for sentiment distribution.
- **Severity Analysis**: Bar charts for severity scores or counts.
- **Areas of Concerns / Appreciation**: Horizontal bars showing frequently cited areas.
- **Trend Analysis**: Time-series line charts for ratings or sentiment over time.

### 🏨 Supported OTAs & Sample Hotels

- OTAs: `BOOKING_COM`, `GOOGLE_REVIEWS`, `EXPEDIA`, and `ALL` (combined).
- Example hotel in the demo data: `The Grand Cypress Hotel`.
- Combined / aggregated view is supported.

### 🔍 Filter Options

- **OTA Platforms**: All, Booking.com, TripAdvisor, Google Reviews
- **Date Ranges**: Last 7 days, 30 days, 3 months, 6 months, or all time

## 🚀 Quick Start

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## 📁 Project Structure

```
src/
├── components/
│   ├── Dashboard.tsx       # Main dashboard with charts
│   └── Home.tsx           # Landing page
├── data/
│   └── dummyData.ts       # Review data
├── types/
│   └── index.ts           # TypeScript definitions
├── App.tsx                # Router setup
└── App.css                # Global styles
```

## 🛠️ Tech Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **React Router v6** - Client-side routing
- **Chart.js** - Data visualization
- **react-chartjs-2** - React wrapper for Chart.js
- **React Icons** - Icon library
- **Vite** - Build tool

## 📖 Documentation

- **[DASHBOARD_FEATURES.md](./DASHBOARD_FEATURES.md)** - Detailed feature overview
- **[USAGE_GUIDE.md](./USAGE_GUIDE.md)** - User instructions and best practices
- **[IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)** - Technical implementation details

## 🎨 Design Highlights

- Modern, clean UI inspired by PowerBI
- Smooth animations and transitions
- Color-coded sentiment indicators
- Intuitive navigation flow
- Accessible and user-friendly

## 📊 Data Model

```typescript
interface Review {
  date: string;
  category: "Positive" | "Neutral" | "Negative";
  severityScore: number;
  areaOfInconvenience: string[];
  OTA: string;
  hotelName: string;
  response?: boolean;
}
```

## 🔮 Future Enhancements

- Real-time API integration
- Export to CSV/PDF
- Email notifications
- AI-powered insights
- Multi-language support
- Dark mode theme

## 📝 License

MIT License - feel free to use this project for your own purposes.

---

## 🔧 Development Notes

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(["dist"]),
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ["./tsconfig.node.json", "./tsconfig.app.json"],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
]);
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from "eslint-plugin-react-x";
import reactDom from "eslint-plugin-react-dom";

export default defineConfig([
  globalIgnores(["dist"]),
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs["recommended-typescript"],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ["./tsconfig.node.json", "./tsconfig.app.json"],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
]);
```
