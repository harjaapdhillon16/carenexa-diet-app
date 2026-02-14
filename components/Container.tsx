import { ReactNode } from 'react';

export function Container({
  children,
  className = ''
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`mx-auto w-[min(1160px,92vw)] ${className}`.trim()}>
      {children}
    </div>
  );
}
