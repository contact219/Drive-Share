import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../lib/auth";

export default function RequireAdmin({ children }: { children: React.ReactNode }) {
  const { signedIn, user } = useAuth();
  const loc = useLocation();
  if (!signedIn) return <Navigate to={`/login?next=${encodeURIComponent(loc.pathname)}`} replace />;
  if (!user?.isAdmin) return <Navigate to="/" replace />;
  return <>{children}</>;
}
