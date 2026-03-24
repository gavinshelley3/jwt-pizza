import React from 'react';
import { pizzaService } from '../service/service';
import { User } from '../service/pizzaService';

interface Props {
  user: User | null;
}

const isDev = import.meta.env.DEV;

export default function DevMetricsPoke({ user }: Props) {
  const [status, setStatus] = React.useState<'idle' | 'pending' | 'success' | 'error'>('idle');
  const lastPingUserId = React.useRef<string | null>(null);

  const shouldRender = isDev && !!user;

  React.useEffect(() => {
    if (!shouldRender || !user?.id) {
      return;
    }

    if (lastPingUserId.current === user.id) {
      return;
    }

    lastPingUserId.current = user.id;
    pingProtectedRoute();
  }, [shouldRender, user?.id]);

  async function pingProtectedRoute() {
    if (!user) {
      return;
    }
    setStatus('pending');
    try {
      await pizzaService.getOrders(user);
      setStatus('success');
    } catch (error) {
      console.warn('Dev metrics ping failed', error);
      setStatus('error');
    }
  }

  if (!shouldRender) {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex max-w-xs flex-col gap-2 rounded-md bg-gray-900/90 p-3 text-xs text-orange-50 shadow-lg">
      <div className="font-semibold uppercase tracking-wide text-orange-300">Grafana helper</div>
      <p className="text-[11px] leading-relaxed text-orange-100">
        Pings `/api/order` so the backend emits <code>active_users</code>. Auto-runs once per login; tap to retry.
      </p>
      <button className="rounded bg-orange-500 px-3 py-1 text-[11px] font-semibold text-white transition hover:bg-orange-400 disabled:opacity-60" onClick={pingProtectedRoute} disabled={status === 'pending'}>
        {status === 'pending' ? 'Pinging...' : 'Ping protected API'}
      </button>
      {status === 'success' && <span className="text-green-300">Last ping succeeded</span>}
      {status === 'error' && <span className="text-red-300">Ping failed (see console)</span>}
    </div>
  );
}
