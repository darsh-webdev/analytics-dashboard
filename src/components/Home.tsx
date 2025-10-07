import { Link } from "react-router-dom";
import { FaHotel } from "react-icons/fa";
import "../App.css";

export default function Home() {
  const hotels = ["Maritim", "Infinity"];

  return (
    <div className="home-container">
      <div className="home-content">
        <h1 className="home-title">Hotel Review Analytics Dashboard</h1>
        <p className="home-subtitle">Select a hotel to view detailed analytics</p>
        
        <div className="hotel-grid">
          {hotels.map((hotel) => (
            <Link
              key={hotel}
              to={`/hotel/${hotel.toLowerCase()}`}
              className="hotel-card"
            >
              <FaHotel className="hotel-icon" />
              <h2>{hotel} Hotel</h2>
              <p>View Analytics →</p>
            </Link>
          ))}
        </div>
        
        <div className="view-all-section">
          <Link to="/hotel/all" className="view-all-button">
            View All Hotels Combined
          </Link>
        </div>
      </div>
    </div>
  );
}
