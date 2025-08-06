import { CheckoutSystem } from '@/components/checkout-system';
import { Logo } from '@/components/logo';

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-10 w-full border-b bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
          <Logo />
        </div>
      </header>
      <main className="container mx-auto p-4 md:p-6">
        <CheckoutSystem />
      </main>
    </div>
  );
}
