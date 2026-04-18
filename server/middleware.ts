import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  console.warn("WARNING: JWT_SECRET env var not set — using insecure fallback. Set JWT_SECRET in production.");
}
const SECRET = JWT_SECRET || "insecure-dev-secret-change-me";

export interface AuthenticatedRequest extends Request {
  user?: { id: string; isAdmin: boolean; email: string };
}

export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Authentication required" });
  }
  const token = authHeader.slice(7);
  try {
    const payload = jwt.verify(token, SECRET) as { id: string; isAdmin: boolean; email: string };
    req.user = payload;
    next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

export function requireAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  requireAuth(req, res, () => {
    if (!(req as AuthenticatedRequest).user?.isAdmin) {
      return res.status(403).json({ error: "Admin access required" });
    }
    next();
  });
}

export function signToken(payload: { id: string; isAdmin: boolean; email: string }): string {
  return jwt.sign(payload, SECRET, { expiresIn: "30d" });
}
