'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { adminApi } from '@/lib/api';
import { Order, OrderStatus } from '@/lib/types';
import { useLang } from '@/context/LanguageContext';
import { useCurrency } from '@/context/CurrencyContext';
import { ArrowLeft, Package, MapPin, Phone, User, Send, MessageSquare, Trash2 } from 'lucide-react';

const STATUSES: OrderStatus[] = ['pending', 'sold', 'cancelled'];

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { t } = useLang();
  const { format } = useCurrency();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    adminApi.getOrder(id)
      .then(setOrder)
      .catch((err) => alert(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  const handleStatus = async (status: OrderStatus) => {
    if (!order || order.status === status) return;
    setUpdating(true);
    try {
      const updated = await adminApi.updateOrderStatus(order.id, status);
      setOrder({ ...order, ...updated });
    } catch (err) { alert((err as Error).message); }
    finally { setUpdating(false); }
  };

  const handleDelete = async () => {
    if (!order) return;
    if (!confirm(`${t.admin.confirmDelete}\n#${order.id} — ${order.customer_name}`)) return;
    setDeleting(true);
    try {
      await adminApi.deleteOrder(order.id);
      router.push('/admin/orders');
    } catch (err) {
      alert((err as Error).message);
      setDeleting(false);
    }
  };

  const statusLabel: Record<OrderStatus, string> = {
    pending: t.admin.statusPending,
    sold: t.admin.statusSold,
    cancelled: t.admin.statusCancelled,
  };

  if (loading) return (
    <div className="flex items-center justify-center py-24">
      <span className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'var(--gold)' }} />
    </div>
  );

  if (!order) return <p style={{ color: 'var(--text-muted)' }}>Buyurtma topilmadi</p>;

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      <div className="flex items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="ghost-btn p-2"><ArrowLeft size={16} /></button>
          <div>
            <h1 className="font-heading text-2xl font-bold" style={{ color: 'var(--text)' }}>
              Buyurtma <span className="gold-text">#{order.id}</span>
            </h1>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              {new Date(order.created_at).toLocaleDateString('ru-RU', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        </div>
        <button onClick={handleDelete} disabled={deleting} className="ghost-btn p-2 text-xs" style={{ color: '#FCA5A5' }} title={t.admin.delete}>
          {deleting
            ? <span className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin inline-block" />
            : <Trash2 size={14} />}
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
        <div className="glass-card p-5">
          <h2 className="font-heading font-semibold text-sm uppercase tracking-wider mb-4 flex items-center gap-2" style={{ color: 'var(--text-muted)' }}>
            <User size={14} style={{ color: 'var(--gold)' }} /> {t.admin.customerInfo}
          </h2>
          <p className="font-semibold" style={{ color: 'var(--text)' }}>{order.customer_name}</p>
          <p className="text-sm flex items-center gap-1.5 mt-2" style={{ color: 'var(--text-muted)' }}>
            <Phone size={12} />
            <a href={`tel:${order.customer_phone}`} className="hover:underline">{order.customer_phone}</a>
          </p>
          {order.customer_telegram && (
            <p className="text-sm flex items-center gap-1.5 mt-1" style={{ color: 'var(--text-muted)' }}>
              <Send size={12} />
              <a href={`https://t.me/${order.customer_telegram.replace(/^@/, '')}`} target="_blank" rel="noreferrer" className="hover:underline">
                @{order.customer_telegram.replace(/^@/, '')}
              </a>
            </p>
          )}
        </div>

        <div className="glass-card p-5">
          <h2 className="font-heading font-semibold text-sm uppercase tracking-wider mb-4 flex items-center gap-2" style={{ color: 'var(--text-muted)' }}>
            <MapPin size={14} style={{ color: 'var(--gold)' }} /> {t.admin.address}
          </h2>
          {order.customer_address
            ? <p className="text-sm" style={{ color: 'var(--text)' }}>{order.customer_address}</p>
            : <p className="text-sm" style={{ color: 'var(--text-subtle)' }}>—</p>}
          {order.notes && (
            <div className="mt-4 pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
              <p className="text-xs uppercase tracking-wider mb-1.5 flex items-center gap-1.5" style={{ color: 'var(--text-muted)' }}>
                <MessageSquare size={11} /> {t.admin.notes}
              </p>
              <p className="text-sm" style={{ color: 'var(--text)' }}>{order.notes}</p>
            </div>
          )}
        </div>
      </div>

      <div className="glass-card p-5 mb-5">
        <h2 className="font-heading font-semibold text-sm uppercase tracking-wider mb-4" style={{ color: 'var(--text-muted)' }}>
          {t.admin.updateStatus}
        </h2>
        <div className="flex items-center gap-3 flex-wrap">
          {STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => handleStatus(s)}
              disabled={updating || order.status === s}
              className={`badge cursor-pointer transition-all ${order.status === s ? `status-${s}` : 'badge-silver opacity-60 hover:opacity-100'}`}
              style={{ minHeight: 32, paddingInline: '0.75rem' }}
            >
              {updating && order.status !== s ? (
                <span className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin inline-block" />
              ) : statusLabel[s]}
            </button>
          ))}
        </div>
      </div>

      <div className="glass-card p-5 mb-5">
        <h2 className="font-heading font-semibold text-sm uppercase tracking-wider mb-4 flex items-center gap-2" style={{ color: 'var(--text-muted)' }}>
          <Package size={14} style={{ color: 'var(--gold)' }} /> {t.admin.orderItems}
        </h2>
        <div className="space-y-3">
          {(order.items || []).map((item, i) => (
            <div key={i} className="flex items-start justify-between py-2 border-b last:border-0 gap-3" style={{ borderColor: 'var(--border)' }}>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>{item.product_name}</p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                  {item.quantity} × {format(item.unit_price)}
                </p>
              </div>
              <p className="text-sm font-semibold whitespace-nowrap" style={{ color: 'var(--gold-light)' }}>
                {format(item.subtotal)}
              </p>
            </div>
          ))}
          {(!order.items || order.items.length === 0) && (
            <p className="text-xs text-center py-2" style={{ color: 'var(--text-subtle)' }}>Mahsulotlar yo&apos;q</p>
          )}
        </div>
      </div>

      <div className="glass-card p-5">
        <div className="flex justify-between items-center">
          <span className="font-semibold" style={{ color: 'var(--text)' }}>{t.admin.orderTotal}</span>
          <span className="font-heading text-2xl font-bold gold-text">{format(order.total_amount)}</span>
        </div>
      </div>
    </div>
  );
}
