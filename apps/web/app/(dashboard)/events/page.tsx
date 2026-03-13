import { createClient } from '@/lib/supabase/server';
import { formatPrice } from '@scanorder/shared';

type EventStatus = 'upcoming' | 'active' | 'completed' | 'cancelled';

const STATUS_COLORS: Record<EventStatus, { bg: string; text: string; dot: string }> = {
  upcoming: { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500' },
  active: { bg: 'bg-green-50', text: 'text-green-700', dot: 'bg-green-500' },
  completed: { bg: 'bg-gray-100', text: 'text-gray-600', dot: 'bg-gray-400' },
  cancelled: { bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-500' },
};

export default async function EventsPage() {
  const supabase = await createClient();

  const { data: events, error } = await supabase
    .from('events')
    .select(`
      id,
      name,
      location,
      start_date,
      end_date,
      status,
      notes,
      created_at
    `)
    .eq('is_deleted', false)
    .order('start_date', { ascending: false })
    .limit(50);

  // Get order counts and revenue per event
  let eventStats: Record<string, { orders: number; revenue: number }> = {};
  if (events && events.length > 0) {
    const eventIds = events.map((e) => e.id);
    const { data: orders } = await supabase
      .from('orders')
      .select('event_id, total')
      .in('event_id', eventIds)
      .eq('is_deleted', false);

    if (orders) {
      eventStats = orders.reduce(
        (acc: Record<string, { orders: number; revenue: number }>, o) => {
          const eid = o.event_id as string;
          if (!acc[eid]) acc[eid] = { orders: 0, revenue: 0 };
          acc[eid].orders += 1;
          acc[eid].revenue += (o.total as number) ?? 0;
          return acc;
        },
        {},
      );
    }
  }

  return (
    <div>
      {/* Page header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Events</h1>
          <p className="text-sm text-gray-500 mt-1">
            Trade shows and sales events
          </p>
        </div>
        {/* TODO: Create event button */}
      </div>

      {/* Events grid */}
      {error ? (
        <div className="rounded-lg bg-red-50 p-6 text-center text-red-600">
          Error loading events: {error.message}
        </div>
      ) : !events?.length ? (
        <div className="rounded-lg bg-white border border-gray-200 p-12 text-center">
          <p className="text-gray-500 font-medium">No events yet</p>
          <p className="text-gray-400 text-sm mt-1">
            Create your first trade show event to start tracking orders.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => {
            const status = event.status as EventStatus;
            const colors = STATUS_COLORS[status];
            const stats = eventStats[event.id] ?? { orders: 0, revenue: 0 };
            const startDate = new Date(event.start_date);
            const endDate = new Date(event.end_date);
            const isMultiDay =
              startDate.toDateString() !== endDate.toDateString();

            return (
              <div
                key={event.id}
                className="rounded-lg bg-white border border-gray-200 p-5 hover:shadow-sm transition-shadow"
              >
                {/* Status + Name */}
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-base font-semibold text-gray-900 leading-tight">
                    {event.name}
                  </h3>
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${colors.bg} ${colors.text}`}
                  >
                    <span className={`h-1.5 w-1.5 rounded-full ${colors.dot}`} />
                    {status}
                  </span>
                </div>

                {/* Location */}
                {event.location && (
                  <p className="text-sm text-gray-500 mb-2">{event.location}</p>
                )}

                {/* Dates */}
                <p className="text-sm text-gray-600 mb-4">
                  {startDate.toLocaleDateString('nl-NL', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                  {isMultiDay && (
                    <>
                      {' - '}
                      {endDate.toLocaleDateString('nl-NL', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </>
                  )}
                </p>

                {/* Stats */}
                <div className="flex gap-6 border-t border-gray-100 pt-3">
                  <div>
                    <p className="text-lg font-bold text-gray-900">{stats.orders}</p>
                    <p className="text-xs text-gray-500">Orders</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-gray-900">
                      {formatPrice(stats.revenue, 'EUR')}
                    </p>
                    <p className="text-xs text-gray-500">Revenue</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
