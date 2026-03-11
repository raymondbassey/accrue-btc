import { ReactNode } from "react";

export const AnimatedRoute = ({ children }: { children: ReactNode }) => (
  <div className="animate-page-in">{children}</div>
);
