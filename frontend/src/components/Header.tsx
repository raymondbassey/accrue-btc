import { Link, useLocation } from 'react-router-dom';
import { useWallet } from '@/contexts/WalletContext';
import { truncateAddress } from '@/lib/format';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Logo } from '@/components/Logo';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
} from '@/components/ui/sheet';
import { Menu, Copy, LogOut, Wallet, CircleDot } from 'lucide-react';
import { toast } from 'sonner';

export function Header() {
  const { connected, address, network, connect, disconnect } = useWallet();
  const location = useLocation();

  const navLinks = [
    { label: 'Vault', path: '/vault' },
    { label: 'Stats', path: '/stats' },
    { label: 'Admin', path: '/admin' },
  ];

  const handleCopy = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      toast.success('Address copied', { description: address });
    }
  };

  const NavItems = ({ onClick }: { onClick?: () => void }) => (
    <>
      {navLinks.map(link => {
        const isActive = location.pathname === link.path;
        return (
          <Link
            key={link.path}
            to={link.path}
            onClick={onClick}
            className={`relative rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              isActive
                ? 'bg-secondary text-primary'
                : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground'
            }`}
          >
            {link.label}
            {/* Animated underline indicator */}
            {isActive && (
              <span className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full bg-primary animate-scale-in" />
            )}
          </Link>
        );
      })}
    </>
  );

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 lg:px-8">
        {/* Logo */}
        <Link to="/" className="flex items-center">
          <Logo size="sm" />
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-1 md:flex">
          <NavItems />
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-3">
          <Badge
            variant="outline"
            className={`hidden text-xs sm:inline-flex ${
              network === 'testnet'
                ? 'border-warning/40 text-warning animate-pulse-slow'
                : 'border-success/40 text-success'
            }`}
          >
            <CircleDot className="mr-1 h-2.5 w-2.5" />
            {network === 'testnet' ? 'Testnet' : 'Mainnet'}
          </Badge>

          {connected && address ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2 font-mono-financial text-xs">
                  {/* Green pulse ring */}
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-50" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
                  </span>
                  {truncateAddress(address)}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={handleCopy} className="gap-2 text-xs">
                  <Copy className="h-3.5 w-3.5" /> Copy Address
                </DropdownMenuItem>
                <DropdownMenuItem onClick={disconnect} className="gap-2 text-xs text-destructive">
                  <LogOut className="h-3.5 w-3.5" /> Disconnect
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button size="sm" onClick={connect} className="gap-2">
              <Wallet className="h-4 w-4" /> Connect Wallet
            </Button>
          )}

          {/* Mobile Sheet */}
          <Sheet>
            <SheetTrigger asChild>
              <button aria-label="Open navigation menu" className="inline-flex items-center justify-center rounded-md p-2 text-muted-foreground hover:text-foreground md:hidden">
                <Menu className="h-5 w-5" />
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="w-64 bg-background border-border">
              <div className="flex flex-col gap-2 pt-8">
                <div className="mb-4 px-1">
                  <Badge
                    variant="outline"
                    className={`text-xs ${
                      network === 'testnet'
                        ? 'border-warning/40 text-warning'
                        : 'border-success/40 text-success'
                    }`}
                  >
                    <CircleDot className="mr-1 h-2.5 w-2.5" />
                    {network === 'testnet' ? 'Testnet' : 'Mainnet'}
                  </Badge>
                </div>
                <SheetClose asChild>
                  <div className="flex flex-col gap-1">
                    <NavItems />
                  </div>
                </SheetClose>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
