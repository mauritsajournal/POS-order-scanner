import { type ReactNode, type JSX } from 'react';

export default function AuthLayout({ children }: { children: ReactNode }): JSX.Element {
  return <>{children}</>;
}
