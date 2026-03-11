import * as React from 'react';
import { ExternalLink, Layers } from 'lucide-react';
import { Logo } from '@/components/Logo';

const links = [
  { label: 'Docs', href: 'https://docs.stacks.co' },
  { label: 'GitHub', href: 'https://github.com' },
  { label: 'Hiro Explorer', href: 'https://explorer.hiro.so/?chain=testnet' },
];

export const Footer = React.forwardRef<HTMLElement>(
  (props, ref) => {
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
            <span className="font-mono-financial">Block #184,291</span>
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
