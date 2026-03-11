import { Link } from 'react-router-dom';
import { useInView } from '@/hooks/useInView';
import { useCountUp } from '@/hooks/useCountUp';
import { useParallax } from '@/hooks/useParallax';
import { MOCK_VAULT } from '@/lib/mock-data';
import { Button } from '@/components/ui/button';
import { Logo, Logomark } from '@/components/Logo';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  ArrowDownToLine,
  TrendingUp,
  ArrowUpFromLine,
  ShieldCheck,
  Eye,
  Unlock,
  FileCode2,
  ArrowRight,
  ChevronDown,
  Zap,
  Globe,
  Lock,
} from 'lucide-react';

/* ─── Scroll-animated wrapper ─── */
function Section({
  children,
  className = '',
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const [ref, inView] = useInView(0.12);
  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${
        inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      } ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

/* ─── Animated stat ─── */
function AnimatedStat({
  label,
  value,
  prefix = '',
  suffix = '',
  decimals = 2,
}: {
  label: string;
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
}) {
  const [ref, inView] = useInView(0.3);
  const animated = useCountUp(inView ? value : 0, 1200);
  return (
    <div ref={ref} className="flex flex-col items-center gap-2 px-8 py-6">
      <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
        {label}
      </span>
      <span className="font-mono-financial text-3xl font-bold text-foreground sm:text-4xl">
        {prefix}
        {animated.toFixed(decimals)}
        {suffix}
      </span>
    </div>
  );
}

/* ─── Step card with connector ─── */
function StepCard({
  step,
  icon: Icon,
  title,
  description,
  delay,
  isLast = false,
}: {
  step: number;
  icon: React.ElementType;
  title: string;
  description: string;
  delay: number;
  isLast?: boolean;
}) {
  return (
    <Section delay={delay} className="relative flex flex-col items-center text-center">
      {/* Connector line (hidden on mobile, hidden on last card) */}
      {!isLast && (
        <div className="pointer-events-none absolute left-[calc(50%+40px)] top-8 hidden h-px w-[calc(100%-80px)] border-t border-dashed border-border sm:block" />
      )}
      <div className="relative mb-5">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-border bg-card transition-all duration-300 hover-lift">
          <Icon className="h-7 w-7 text-primary" />
        </div>
        <span className="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground shadow-[0_0_12px_hsl(var(--primary)/0.3)]">
          {step}
        </span>
      </div>
      <h3 className="mb-2 text-lg font-semibold text-foreground">{title}</h3>
      <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">{description}</p>
    </Section>
  );
}

/* ─── Feature card ─── */
function FeatureCard({
  icon: Icon,
  title,
  description,
  delay,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  delay: number;
}) {
  return (
    <Section delay={delay}>
      <div className="group relative overflow-hidden rounded-lg border border-border bg-card p-8 transition-all duration-300 hover-lift hover:border-primary/30">
        {/* Top accent line on hover */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/0 to-transparent transition-all duration-500 group-hover:via-primary/60" />
        <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <Icon className="h-5 w-5 text-primary" />
        </div>
        <h3 className="mb-2 text-base font-semibold text-foreground">{title}</h3>
        <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
      </div>
    </Section>
  );
}

/* ─── Trust badge ─── */
function TrustBadge({ icon: Icon, label }: { icon: React.ElementType; label: string }) {
  return (
    <div className="flex items-center gap-2 text-xs text-muted-foreground">
      <Icon className="h-3.5 w-3.5" />
      <span>{label}</span>
    </div>
  );
}

/* ═══════════════ LANDING PAGE ═══════════════ */
const Landing = () => {
  const scrollY = useParallax();
  const scrollToHowItWorks = () => {
    document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <main className="relative overflow-hidden">
      {/* ── Dot grid background ── */}
      <div
        className="pointer-events-none absolute inset-0 z-0 opacity-[0.03]"
        style={{
          backgroundImage:
            'radial-gradient(circle, hsl(var(--muted-foreground)) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />

      {/* ═══ HERO ═══ */}
      <section className="relative z-10 flex min-h-[90vh] flex-col items-center justify-center px-4 py-28 text-center">
        {/* Radial glow — stronger */}
        <div
          className="pointer-events-none absolute left-1/2 top-1/3 h-[600px] w-[900px] -translate-x-1/2 -translate-y-1/2 opacity-[0.10]"
          style={{
            background: 'radial-gradient(ellipse at center, hsl(var(--primary)), transparent 70%)',
            transform: `translate(-50%, calc(-50% + ${scrollY * 0.3}px))`,
            willChange: 'transform',
          }}
        />

        <Section>
          <div className="relative mb-4 hover-scale cursor-pointer">
            <div className="absolute inset-0 rounded-full bg-primary/20 blur-2xl animate-pulse" />
            <Logomark size={80} />
          </div>
        </Section>

        <Section>
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card/80 px-4 py-1.5 text-xs text-muted-foreground backdrop-blur-sm">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
            </span>
            Live on Stacks Testnet
          </div>
        </Section>

        <Section delay={100}>
          <h1 className="mx-auto max-w-3xl text-4xl font-bold leading-[1.1] tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-7xl">
            Earn Yield on Your{' '}
            <span className="text-gradient-primary">Bitcoin</span>
          </h1>
        </Section>

        <Section delay={200}>
          <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            Deposit sBTC into the AccrueBTC vault. Earn sustainable yield.
            Withdraw anytime. No lock-ups, no minimums.
          </p>
        </Section>

        {/* TVL — single clean block */}
        <Section delay={300}>
          <div className="mt-8 flex flex-col items-center">
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Total Value Locked
            </span>
            <span className="font-mono-financial text-3xl font-bold text-foreground sm:text-4xl">
              ₿{MOCK_VAULT.totalAssets.toFixed(8)}
            </span>
          </div>
        </Section>

        {/* CTA Buttons */}
        <Section delay={400}>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg" className="group gap-2 px-8 text-base glow-primary">
              <Link to="/vault">
                Launch App
                <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
              </Link>
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="group gap-2 px-8 text-base"
              onClick={scrollToHowItWorks}
            >
              How It Works
              <ChevronDown className="h-4 w-4 transition-transform duration-200 group-hover:translate-y-0.5" />
            </Button>
          </div>
        </Section>

        {/* Social proof / Trust strip */}
        <Section delay={500}>
          <div className="mt-12 flex flex-wrap items-center justify-center gap-6">
            <TrustBadge icon={ShieldCheck} label="Secured by Clarity" />
            <span className="h-3 w-px bg-border" />
            <TrustBadge icon={Globe} label="Built on Stacks" />
            <span className="h-3 w-px bg-border" />
            <TrustBadge icon={FileCode2} label="Open Source" />
          </div>
        </Section>
      </section>

      {/* ═══ LIVE STATS BAR ═══ */}
      <section className="relative z-10 border-y border-border bg-card/60 backdrop-blur-sm">
        {/* Top accent line */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-center divide-y divide-border sm:flex-row sm:divide-x sm:divide-y-0">
          <AnimatedStat label="Total Value Locked" value={MOCK_VAULT.totalAssets} prefix="₿" decimals={8} />
          <AnimatedStat label="Current APY" value={1.74} suffix="%" decimals={2} />
          <AnimatedStat label="Share Price" value={MOCK_VAULT.sharePrice} prefix="₿" decimals={8} />
        </div>
      </section>

      {/* ═══ HOW IT WORKS ═══ */}
      <section id="how-it-works" className="relative z-10 mx-auto max-w-5xl px-4 py-28">
        <Section className="mb-16 text-center">
          <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">
            Getting Started
          </span>
          <h2 className="mt-3 text-2xl font-bold text-foreground sm:text-3xl">How It Works</h2>
          <p className="mt-3 text-sm text-muted-foreground">Three simple steps to start earning</p>
        </Section>
        <div className="grid gap-12 sm:grid-cols-3">
          <StepCard
            step={1}
            icon={ArrowDownToLine}
            title="Deposit sBTC"
            description="Connect your Stacks wallet and deposit sBTC into the vault. You receive aBTC shares representing your position."
            delay={0}
          />
          <StepCard
            step={2}
            icon={TrendingUp}
            title="Earn Yield"
            description="The vault strategist deploys capital and reports yield on-chain. Your share price grows automatically."
            delay={150}
          />
          <StepCard
            step={3}
            icon={ArrowUpFromLine}
            title="Withdraw Anytime"
            description="Redeem your aBTC shares for the underlying sBTC plus accrued yield. No lock-ups, no penalties."
            delay={300}
            isLast
          />
        </div>
      </section>

      {/* ═══ WHY ACCRUEBTC ═══ */}
      <section className="relative z-10 border-y border-border bg-card/30">
        <div className="mx-auto max-w-5xl px-4 py-28">
          <Section className="mb-14 text-center">
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">
              Built Different
            </span>
            <h2 className="mt-3 text-2xl font-bold text-foreground sm:text-3xl">
              Why Accrue<span className="text-primary">BTC</span>?
            </h2>
          </Section>
          <div className="grid gap-5 sm:grid-cols-2">
            <FeatureCard
              icon={ShieldCheck}
              title="Non-Custodial"
              description="Your keys, your Bitcoin. Funds are secured by auditable Clarity smart contracts on the Stacks blockchain."
              delay={0}
            />
            <FeatureCard
              icon={Eye}
              title="Transparent"
              description="All yield is reported on-chain. Verify every transaction, every share price update, in real time."
              delay={100}
            />
            <FeatureCard
              icon={Unlock}
              title="Flexible"
              description="No lock-ups, no minimum deposits, no penalties. Withdraw your sBTC plus accrued yield whenever you want."
              delay={200}
            />
            <FeatureCard
              icon={FileCode2}
              title="Auditable"
              description="Open-source smart contracts deployed on Stacks testnet. Inspect every function, every line of code."
              delay={300}
            />
          </div>
        </div>
      </section>

      {/* ═══ SECURITY ═══ */}
      <section className="relative z-10 mx-auto max-w-5xl px-4 py-28">
        <Section>
          <div className="border-gradient relative overflow-hidden rounded-lg border border-border bg-card p-8 sm:p-12">
            <div className="flex flex-col items-center gap-8 text-center sm:flex-row sm:text-left">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-border bg-primary/10">
                <ShieldCheck className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h3 className="mb-3 text-xl font-semibold text-foreground">Smart Contract Security</h3>
                <p className="mb-5 text-sm leading-relaxed text-muted-foreground">
                  AccrueBTC's vault contracts are written in Clarity — a decidable, non-Turing-complete language
                  designed for predictable execution. All state transitions are transparent and verifiable on-chain.
                </p>
                <div className="mb-5 flex flex-wrap items-center justify-center gap-3 sm:justify-start">
                  <span className="inline-flex items-center gap-1.5 rounded-md border border-border bg-secondary px-3 py-1 text-xs font-medium text-foreground">
                    <Lock className="h-3 w-3 text-primary" /> Clarity
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-md border border-border bg-secondary px-3 py-1 text-xs font-medium text-foreground">
                    <Zap className="h-3 w-3 text-primary" /> Stacks L2
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-md border border-border bg-secondary px-3 py-1 text-xs font-medium text-foreground">
                    <Globe className="h-3 w-3 text-primary" /> Bitcoin Finality
                  </span>
                </div>
                <a
                  href="https://explorer.hiro.so/txid/ST16CJZJAT68A6Y2XG0AEFA7C311KDPBW2ZEFTYAP.accrue-vault?chain=testnet"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center gap-2 font-mono-financial text-xs text-primary hover:underline"
                >
                  View contract on Hiro Explorer
                  <ArrowRight className="h-3 w-3 transition-transform duration-200 group-hover:translate-x-1" />
                </a>
              </div>
            </div>
          </div>
        </Section>
      </section>

      {/* ═══ FAQ ═══ */}
      <section className="relative z-10 border-y border-border bg-card/30">
        <div className="mx-auto max-w-3xl px-4 py-28">
          <Section className="mb-14 text-center">
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">
              Support
            </span>
            <h2 className="mt-3 text-2xl font-bold text-foreground sm:text-3xl">
              Frequently Asked Questions
            </h2>
          </Section>
          <Section delay={100}>
            <Accordion type="single" collapsible className="w-full">
              {[
                {
                  value: 'sbtc',
                  q: 'What is sBTC?',
                  a: 'sBTC is a 1:1 Bitcoin-backed asset on the Stacks blockchain. It enables Bitcoin holders to participate in DeFi while maintaining a peg to BTC. sBTC can be bridged from the Bitcoin mainchain to Stacks and back.',
                },
                {
                  value: 'yield',
                  q: 'How is yield generated?',
                  a: 'A designated vault strategist deploys the pooled sBTC across DeFi strategies and reports the yield on-chain. The share price increases proportionally, meaning your aBTC shares are worth more sBTC over time.',
                },
                {
                  value: 'fees',
                  q: 'What are the fees?',
                  a: 'There are no deposit or withdrawal fees at the smart contract level. Standard Stacks network transaction fees apply for on-chain operations.',
                },
                {
                  value: 'lockup',
                  q: 'Is there a lock-up period?',
                  a: 'No. You can withdraw your sBTC at any time by redeeming your aBTC shares. There are no lock-ups, cooldown periods, or early withdrawal penalties.',
                },
                {
                  value: 'network',
                  q: 'What network is this on?',
                  a: 'AccrueBTC is currently deployed on Stacks Testnet. You can interact with the vault using testnet sBTC. A mainnet launch is planned after security audits and community review.',
                },
              ].map((item) => (
                <AccordionItem key={item.value} value={item.value} className="border-border group/faq">
                  <AccordionTrigger className="py-5 text-sm font-medium text-foreground hover:no-underline data-[state=open]:text-primary">
                    {item.q}
                  </AccordionTrigger>
                  <AccordionContent className="pb-5 text-sm leading-relaxed text-muted-foreground">
                    {item.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </Section>
        </div>
      </section>

      {/* ═══ FINAL CTA ═══ */}
      <section className="relative z-10 px-4 pt-24 pb-8">
        {/* Glow — stronger */}
        <div
          className="pointer-events-none absolute left-1/2 top-1/2 h-[400px] w-[700px] opacity-[0.08]"
          style={{
            background: 'radial-gradient(ellipse at center, hsl(var(--primary)), transparent 70%)',
            transform: `translate(-50%, calc(-50% + ${scrollY * 0.1}px))`,
            willChange: 'transform',
          }}
        />
        <Section className="flex flex-col items-center text-center">
          <h2 className="text-2xl font-bold text-foreground sm:text-3xl lg:text-4xl">
            Ready to earn yield on your{' '}
            <span className="text-gradient-primary">Bitcoin</span>?
          </h2>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-muted-foreground">
            Connect your wallet and start earning in under a minute.
          </p>
          <p className="mt-2 font-mono-financial text-xs text-muted-foreground/60">
            No minimum deposit · No lock-ups · Testnet
          </p>
          <Button asChild size="lg" className="group mt-8 gap-2 px-10 text-base glow-primary">
            <Link to="/vault">
              Launch App
              <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
            </Link>
          </Button>
          {/* Trust strip */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-6">
            <TrustBadge icon={ShieldCheck} label="Secured by Clarity" />
            <span className="h-3 w-px bg-border" />
            <TrustBadge icon={Globe} label="Built on Stacks" />
            <span className="h-3 w-px bg-border" />
            <TrustBadge icon={FileCode2} label="Open Source" />
          </div>
        </Section>
      </section>

    </main>
  );
};

export default Landing;
