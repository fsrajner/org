

import './global.css';
import { Providers } from "./providers";

export const metadata = {
  title: 'StockPriceChecker Frontend',
  description: '',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className='dark'>
      <body>
        <main className="dark text-foreground bg-background">
          <Providers>
            {children}
          </Providers>
        </main>
      </body>
    </html>
  );
}
