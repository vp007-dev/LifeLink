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
    <div className="min-h-screen bg-background flex flex-col">
      {header && (
        <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/50 px-4 py-3 safe-area-top">
          {header}
        </header>
      )}
      <main className={cn("flex-1 flex flex-col", className)}>
        {children}
      </main>
      {footer && (
        <footer className="sticky bottom-0 z-50 bg-background/80 backdrop-blur-lg border-t border-border/50 px-4 py-3 safe-area-bottom">
          {footer}
        </footer>
      )}
    </div>
  );
};

export default MobileLayout;
