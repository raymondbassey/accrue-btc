import * as React from 'react';
import { useState, useEffect } from 'react';

const POLL_INTERVAL = 15_000;
const STALE_THRESHOLD = 30_000;

export const DataFreshness = React.forwardRef<HTMLSpanElement>(
  (props, ref) => {
    const [lastUpdated, setLastUpdated] = useState(Date.now());
    const [now, setNow] = useState(Date.now());

    useEffect(() => {
      const poll = setInterval(() => setLastUpdated(Date.now()), POLL_INTERVAL);
      const tick = setInterval(() => setNow(Date.now()), 1000);
      return () => {
        clearInterval(poll);
        clearInterval(tick);
      };
    }, []);

    const elapsed = now - lastUpdated;
    const isStale = elapsed > STALE_THRESHOLD;
    const seconds = Math.floor(elapsed / 1000);

    return (
      <span ref={ref} className="inline-flex items-center gap-1.5 text-xs text-muted-foreground" {...props}>
        <span
          className={`h-1.5 w-1.5 rounded-full ${
            isStale ? 'bg-warning animate-pulse' : 'bg-success'
          }`}
        />
        {seconds < 2 ? 'Just updated' : `Updated ${seconds}s ago`}
      </span>
    );
  }
);
DataFreshness.displayName = 'DataFreshness';
