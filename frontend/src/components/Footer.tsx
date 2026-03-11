import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { ExternalLink, Layers } from 'lucide-react';
import { Logo } from '@/components/Logo';
import { API_BASE } from '@/lib/stacks';

const links = [
  { label: 'Docs', href: 'https://docs.stacks.co' },
  { label: 'GitHub', href: 'https://github.com/raymondbassey/accrue-btc' },
  { label: 'Hiro Explorer', href: 'https://explorer.hiro.so/?chain=testnet' },
];

async function fetchBlockHeight(): Promise<number> {
  const res = await fetch(`${API_BASE}/v2/info`);
  if (!res.ok) return 0;
  const data = await res.json();
  return data.stacks_tip_height ?? 0;
}

export const Footer = React.forwardRef<HTMLElement>(
  (props, ref) => {
    const { data: blockHeight } = useQuery({
      queryKey: ['block-height'],
      queryFn: fetchBlockHeight,
      refetchInterval: 30_000,
      staleTime: 15_000,
    });

    const formattedBlock = blockHeight
      ? `Block #${blockHeight.toLocaleString()}`
      : 'Block #…';

    return (
      <footer ref={ref} className="border-t border-border bg-background" {...props}>
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-3 px-4 py-4 text-xs text-muted-foreground sm:flex-row sm:justify-between lg:px-8">
          <div className="flex items-center gap-3">
            <Logo size="xs" />
            <span className="font-mono-financial">v0.1.0</span>
            <span className="text-border">·</span>
            <span className="flex items-center gap-1">
              <Layers className="h-3 w-3" />
              Powered by Stacks
            </span>
            <span className="text-border">·</span>
            <span className="font-mono-financial">{formattedBlock}</span>
          </div>
          <nav className="flex items-center gap-4">
            {links.map(link => (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 transition-colors hover:text-foreground"
              >
                {link.label}
                <ExternalLink className="h-3 w-3" />
              </a>
            ))}
          </nav>
        </div>
      </footer>
    );
  }
);
Footer.displayName = 'Footer';
