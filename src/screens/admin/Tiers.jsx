import React, { useState, useEffect } from 'react';
import { T } from '../../theme/tokens';
import { CSCard, CSBadge, CSButton, Icons, CSField, CSInput } from '../../components/UI';
import { getTiers, updateTierPrice } from '../../api/api';

export function Tiers() {
  const [loading, setLoading] = useState(true);
  const [tiers, setTiers] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [newPrice, setNewPrice] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      const data = await getTiers();
      setTiers(data);
    } catch (error) {
      console.error('Error loading tiers:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdatePrice(id) {
    if (!newPrice || isNaN(newPrice)) return;
    try {
      const price = parseFloat(newPrice);
      await updateTierPrice(id, price);
      setTiers(prev => prev.map(t => t.id === id ? { ...t, precio: price } : t));
      setEditingId(null);
    } catch (error) {
      alert(error.message);
    }
  }

  if (loading) return <div style={{ padding: 40 }}>Cargando categorías...</div>;

  return (
    <div style={{ padding: 32, maxWidth: 800 }}>
      <header style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0 }}>Categorías de Stands</h1>
        <p style={{ color: T.textMuted, marginTop: 4 }}>Gestiona los precios globales por categoría</p>
      </header>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {tiers.map(tier => (
          <CSCard key={tier.id} padding={20} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: tier.color + '15', color: tier.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icons.Layers size={24} />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 18 }}>{tier.nombre}</div>
                <div style={{ fontSize: 13, color: T.textMuted }}>Precio base para todos los stands de este nivel</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
              {editingId === tier.id ? (
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <CSInput
                    inputMode="decimal"
                    value={newPrice}
                    onChange={e => setNewPrice(e.target.value.replace(/[^0-9.]/g, ''))}
                    style={{ width: 120, textAlign: 'right' }}
                    placeholder="0.00"
                  />
                  <CSButton variant="primary" size="sm" onClick={() => handleUpdatePrice(tier.id)}>Guardar</CSButton>
                  <CSButton variant="ghost" size="sm" onClick={() => setEditingId(null)}>Cancelar</CSButton>
                </div>
              ) : (
                <>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 24, fontWeight: 700, color: tier.color }}>${tier.precio}</div>
                    <div style={{ fontSize: 12, color: T.textMuted }}>USD / Evento</div>
                  </div>
                  <CSButton variant="secondary" icon={<Icons.Edit size={14} />} onClick={() => {
                    setEditingId(tier.id);
                    setNewPrice(tier.precio.toString());
                  }}>Editar</CSButton>
                </>
              )}
            </div>
          </CSCard>
        ))}
      </div>
    </div>
  );
}
