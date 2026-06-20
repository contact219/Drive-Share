import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import AdminLayout from "./components/AdminLayout";
import RequireAdmin from "./components/RequireAdmin";
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
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import RequireAuth from "./components/RequireAuth";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminUsers from "./pages/admin/Users";
import AdminVehicles from "./pages/admin/Vehicles";
import AdminTrips from "./pages/admin/Trips";
import AdminVerifications from "./pages/admin/Verifications";
import AdminPayments from "./pages/admin/Payments";
import AdminDocuments from "./pages/admin/Documents";
import AdminConfig from "./pages/admin/Config";
import AdminAuditLog from "./pages/admin/AuditLog";
import AdminServiceAreas from "./pages/admin/ServiceAreas";

function ScrollTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollTop />
      <Routes>
        {/* Admin panel — full-screen, own layout, no public nav */}
        <Route path="/admin" element={<RequireAdmin><AdminLayout /></RequireAdmin>}>
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="vehicles" element={<AdminVehicles />} />
          <Route path="trips" element={<AdminTrips />} />
          <Route path="verifications" element={<AdminVerifications />} />
          <Route path="payments" element={<AdminPayments />} />
          <Route path="documents" element={<AdminDocuments />} />
          <Route path="config" element={<AdminConfig />} />
          <Route path="audit-log" element={<AdminAuditLog />} />
          <Route path="service-areas" element={<AdminServiceAreas />} />
        </Route>

        {/* Public + auth routes */}
        <Route path="*" element={
          <PublicLayout>
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
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="*" element={<Home />} />
            </Routes>
          </PublicLayout>
        } />
      </Routes>
    </BrowserRouter>
  );
}
