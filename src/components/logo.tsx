import { ShoppingBasket } from 'lucide-react';

export function Logo() {
  return (
    <div className="flex items-center gap-2">
      <ShoppingBasket className="h-8 w-8 text-primary" />
      <h1 className="font-headline text-2xl font-bold text-primary">
        MarketMate Checkout
      </h1>
    </div>
  );
}
