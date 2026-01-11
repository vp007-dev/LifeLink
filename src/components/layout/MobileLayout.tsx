import React from 'react';
import { cn } from '@/lib/utils';

interface MobileLayoutProps {
  children: React.ReactNode;
  className?: string;
  header?: React.ReactNode;
  footer?: React.ReactNode;
}

const MobileLayout: React.FC<MobileLayoutProps> = ({
  children,
  className,
  header,
  footer,
}) => {
  return (
    <div className="min-h-screen bg-background flex flex-col max-w-md mx-auto">
      {header && (
        <header className="sticky top-0 z-50 bg-background px-5 pt-3 pb-2 safe-area-top">
          {header}
        </header>
      )}
      <main className={cn("flex-1 flex flex-col", className)}>
        {children}
      </main>
      {footer && (
        <footer className="sticky bottom-0 z-50 bg-background px-5 py-3 safe-area-bottom">
          {footer}
        </footer>
      )}
    </div>
  );
};

export default MobileLayout;
