import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

const navItems = [
  { href: '/', label: 'Home', icon: 'LayoutDashboard' },
  { href: '/orders', label: 'Orders', icon: 'ClipboardList' },
  { href: '/products', label: 'Products', icon: 'Package' },
  { href: '/customers', label: 'Customers', icon: 'Users' },
  { href: '/events', label: 'Events', icon: 'Calendar' },
  { href: '/integrations', label: 'Integrations', icon: 'Link' },
  { href: '/analytics', label: 'Analytics', icon: 'BarChart3' },
  { href: '/settings', label: 'Settings', icon: 'Settings' },
];

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-900">ScanOrder</h1>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100 hover:text-gray-900 transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-200">
          <p className="text-sm text-gray-600 truncate">{user.email}</p>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}
