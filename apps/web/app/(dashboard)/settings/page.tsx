import { createClient } from '@/lib/supabase/server';

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Get tenant info
  const { data: tenant } = await supabase
    .from('tenants')
    .select('id, name, domain, settings')
    .limit(1)
    .single();

  // Get team members
  // Note: Listing auth users requires service_role key via admin API
  // For now, show current user info and placeholder
  const { data: users } = await supabase
    .from('users')
    .select('id, email, role, display_name, is_active, last_active_at')
    .eq('is_deleted', false)
    .order('display_name', { ascending: true });

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Settings</h1>

      {/* Account info */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Account</h2>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase">Email</label>
              <p className="text-sm text-gray-900 mt-1">{user?.email ?? '-'}</p>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase">User ID</label>
              <p className="text-sm text-gray-500 font-mono mt-1">
                {user?.id?.slice(0, 8) ?? '-'}
              </p>
            </div>
            {tenant && (
              <>
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase">
                    Organization
                  </label>
                  <p className="text-sm text-gray-900 mt-1">{tenant.name}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase">Domain</label>
                  <p className="text-sm text-gray-500 mt-1">{tenant.domain ?? '-'}</p>
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Team Members */}
      <section className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Team Members</h2>
          {/* TODO: Invite button */}
        </div>
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {!users?.length ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                    No team members found. Users will appear once Supabase auth is configured.
                  </td>
                </tr>
              ) : (
                users.map((member) => (
                  <tr key={member.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {member.display_name ?? 'Unnamed'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{member.email}</td>
                    <td className="px-6 py-4">
                      <RoleBadge role={member.role as string} />
                    </td>
                    <td className="px-6 py-4">
                      {member.is_active ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-700">
                          <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-500">
                          Inactive
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Danger zone */}
      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Actions</h2>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">Sign Out</p>
              <p className="text-sm text-gray-500">Log out of the dashboard</p>
            </div>
            <form action="/auth/signout" method="POST">
              <button
                type="submit"
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Sign Out
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}

function RoleBadge({ role }: { role: string }) {
  const colors: Record<string, { bg: string; text: string }> = {
    admin: { bg: 'bg-purple-50', text: 'text-purple-700' },
    manager: { bg: 'bg-blue-50', text: 'text-blue-700' },
    sales_rep: { bg: 'bg-indigo-50', text: 'text-indigo-700' },
  };

  const style = colors[role] ?? { bg: 'bg-gray-100', text: 'text-gray-600' };
  const label = role === 'sales_rep' ? 'Sales Rep' : role.charAt(0).toUpperCase() + role.slice(1);

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${style.bg} ${style.text}`}
    >
      {label}
    </span>
  );
}
