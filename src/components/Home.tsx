import { Link } from "react-router-dom";
import { Hotel } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function Home() {
  const hotels = ["Maritim", "Infinity"];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800 p-5">
      <div className="max-w-6xl w-full text-center">
        <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 drop-shadow-lg">
          Hotel Review Analytics Dashboard
        </h1>
        <p className="text-xl text-white/90 mb-12">
          Select a hotel to view detailed analytics
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {hotels.map((hotel) => (
            <Link
              key={hotel}
              to={`/hotel/${hotel.toLowerCase()}`}
              className="group"
            >
              <Card className="h-full transition-all duration-300 hover:scale-105 hover:shadow-2xl cursor-pointer border-2 hover:border-purple-400  bg-gradient-to-br from-purple-500 via-purple-500 to-indigo-600">
                <CardContent className="flex flex-col items-center justify-center p-12">
                  <Hotel className="w-16 h-16 text-white mb-6 group-hover:scale-110 transition-transform" />
                  <h2 className="text-3xl font-semibold mb-3 text-indigo-900">
                    {hotel} Hotel
                  </h2>
                  <p className="text-white font-medium group-hover:translate-x-2 transition-transform">
                    View Analytics →
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        <div className="mt-8">
          <Button
            asChild
            size="lg"
            className="bg-white text-purple-700 hover:bg-gray-100 shadow-lg text-lg px-12 py-6 rounded-full font-semibold"
          >
            <Link to="/hotel/all">View All Hotels Combined</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
