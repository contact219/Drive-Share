import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Browse from "./pages/Browse";
import VehicleDetail from "./pages/VehicleDetail";
import Login from "./pages/Login";
import Host from "./pages/Host";
import HostDashboard from "./pages/HostDashboard";
import AddListing from "./pages/AddListing";
import Trips from "./pages/Trips";
import Profile from "./pages/Profile";
import Favorites from "./pages/Favorites";
import Conversations from "./pages/Conversations";
import Messages from "./pages/Messages";
import Checkout from "./pages/Checkout";
import RequireAuth from "./components/RequireAuth";

function ScrollTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollTop />
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/cars" element={<Browse />} />
            <Route path="/cars/:id" element={<VehicleDetail />} />
            <Route path="/checkout/:vehicleId" element={<RequireAuth><Checkout /></RequireAuth>} />
            <Route path="/host" element={<Host />} />
            <Route path="/host/dashboard" element={<RequireAuth><HostDashboard /></RequireAuth>} />
            <Route path="/host/new" element={<RequireAuth><AddListing /></RequireAuth>} />
            <Route path="/trips" element={<RequireAuth><Trips /></RequireAuth>} />
            <Route path="/favorites" element={<RequireAuth><Favorites /></RequireAuth>} />
            <Route path="/messages" element={<RequireAuth><Conversations /></RequireAuth>} />
            <Route path="/messages/:id" element={<RequireAuth><Messages /></RequireAuth>} />
            <Route path="/profile" element={<RequireAuth><Profile /></RequireAuth>} />
            <Route path="/login" element={<Login />} />
            <Route path="*" element={<Home />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}
