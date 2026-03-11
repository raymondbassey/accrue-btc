import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Link } from "react-router-dom";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.warn("404: attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
      <div className="text-center">
        <h1 className="mb-4 font-mono text-5xl font-bold text-foreground">404</h1>
        <p className="mb-6 text-sm text-muted-foreground">Page not found</p>
        <Link
          to="/"
          className="inline-flex h-10 items-center rounded-lg bg-primary px-6 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
