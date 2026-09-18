import React, { useEffect, useState } from 'react';
import { adminApi } from '../api/admin.api';
import type { Plan } from '../types';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { useToast } from '../context/ToastContext';
import { Plus, Edit2 } from 'lucide-react';

export const Plans: React.FC = () => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [formData, setFormData] = useState<Partial<Plan>>({
    name: '',
    description: '',
    price: { monthly: 29, yearly: 290, currency: 'USD' },
    trial: { enabled: true, days: 14 },
    limits: { users: 5, menuItems: 100, categories: 10, tables: 20, printers: 2, branches: 1 },
    isActive: true,
  });
  const [actionLoading, setActionLoading] = useState(false);

  const { showToast } = useToast();

  const fetchPlans = async () => {
    setLoading(true);
    try {
      const data = await adminApi.getPlans(true);
      setPlans(data);
    } catch (error: any) {
      showToast(error.message || 'Failed to load plans', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const openCreate = () => {
    setEditingPlan(null);
    setFormData({
      name: '',
      description: '',
      price: { monthly: 29, yearly: 290, currency: 'USD' },
      trial: { enabled: true, days: 14 },
      limits: { users: 5, menuItems: 100, categories: 10, tables: 20, printers: 2, branches: 1 },
      isActive: true,
    });
    setIsModalOpen(true);
  };

  const openEdit = (plan: Plan) => {
    setEditingPlan(plan);
    setFormData({
      name: plan.name,
      description: plan.description,
      price: plan.price || { monthly: 0, yearly: 0, currency: 'USD' },
      trial: plan.trial || { enabled: false, days: 0 },
      limits: plan.limits || {},
      isActive: plan.isActive,
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) {
      showToast('Plan name is required', 'error');
      return;
    }
    setActionLoading(true);
    try {
      if (editingPlan) {
        await adminApi.updatePlan(editingPlan.id, formData);
        showToast('Plan updated successfully!', 'success');
      } else {
        await adminApi.createPlan(formData);
        showToast('Plan created successfully!', 'success');
      }
      setIsModalOpen(false);
      fetchPlans();
    } catch (error: any) {
      showToast(error.message || 'Failed to save plan', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-100">Subscription Plans</h2>
          <p className="text-sm text-slate-400">
            Define pricing tiers, resource limits, and trial durations for businesses.
          </p>
        </div>
        <Button variant="primary" onClick={openCreate} icon={<Plus className="w-4 h-4" />}>
          Create New Plan
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-20 text-slate-400">Loading plans...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`p-6 rounded-2xl bg-slate-900/80 border flex flex-col justify-between transition-all ${
                plan.isActive ? 'border-slate-800' : 'border-slate-800/40 opacity-70'
              }`}
            >
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-slate-100">{plan.name}</h3>
                    <p className="text-xs text-slate-400 mt-1">{plan.description || 'No description provided'}</p>
                  </div>
                  <Badge status={plan.isActive ? 'active' : 'inactive'} />
                </div>

                {/* Price */}
                <div className="mt-5 pb-5 border-b border-slate-800/80">
                  <span className="text-3xl font-extrabold text-slate-100">
                    ${plan.price?.monthly ?? 0}
                  </span>
                  <span className="text-slate-400 text-xs ml-1">/ month</span>
                  <p className="text-xs text-indigo-400 mt-1">
                    or ${plan.price?.yearly ?? 0} billed yearly
                  </p>
                </div>

                {/* Trial */}
                <div className="mt-4 flex items-center gap-2 text-xs">
                  <span className="text-slate-400">Free Trial:</span>
                  {plan.trial?.enabled ? (
                    <span className="text-emerald-400 font-semibold">{plan.trial.days} Days</span>
                  ) : (
                    <span className="text-slate-500">Disabled</span>
                  )}
                </div>

                {/* Limits */}
                <div className="mt-5 space-y-2">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Resource Limits
                  </p>
                  <ul className="space-y-1.5 text-xs text-slate-300">
                    <li className="flex justify-between">
                      <span className="text-slate-400">Users / Staff:</span>
                      <span className="font-semibold text-slate-200">{plan.limits?.users ?? 'Unlimited'}</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-slate-400">Menu Items:</span>
                      <span className="font-semibold text-slate-200">{plan.limits?.menuItems ?? 'Unlimited'}</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-slate-400">Categories:</span>
                      <span className="font-semibold text-slate-200">{plan.limits?.categories ?? 'Unlimited'}</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-slate-400">Tables:</span>
                      <span className="font-semibold text-slate-200">{plan.limits?.tables ?? 'Unlimited'}</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-slate-400">Branches:</span>
                      <span className="font-semibold text-slate-200">{plan.limits?.branches ?? '1'}</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-6 pt-4 border-t border-slate-800">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openEdit(plan)}
                  icon={<Edit2 className="w-3.5 h-3.5" />}
                  className="w-full"
                >
                  Edit Plan Details
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Plan Form Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingPlan ? 'Edit Subscription Plan' : 'Create New Subscription Plan'}
        maxWidth="lg"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" loading={actionLoading} onClick={handleSave}>
              {editingPlan ? 'Save Changes' : 'Create Plan'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSave} className="space-y-4 text-sm">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
              Plan Name
            </label>
            <input
              type="text"
              required
              value={formData.name || ''}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Pro, Starter, Enterprise"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
              Description
            </label>
            <textarea
              rows={2}
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Brief description of who this plan is tailored for..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100"
            />
          </div>

          {/* Pricing */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                Monthly Price ($)
              </label>
              <input
                type="number"
                value={formData.price?.monthly ?? 0}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    price: { ...formData.price!, monthly: Number(e.target.value) },
                  })
                }
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                Yearly Price ($)
              </label>
              <input
                type="number"
                value={formData.price?.yearly ?? 0}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    price: { ...formData.price!, yearly: Number(e.target.value) },
                  })
                }
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100"
              />
            </div>
          </div>

          {/* Trial */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
            <div>
              <p className="font-semibold text-slate-200 text-xs">Enable Free Trial</p>
              <p className="text-[10px] text-slate-400">Offer trial days upon business onboarding</p>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.trial?.enabled ?? true}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    trial: { ...formData.trial!, enabled: e.target.checked },
                  })
                }
                className="rounded border-slate-700 w-4 h-4 text-indigo-600"
              />
              <input
                type="number"
                value={formData.trial?.days ?? 14}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    trial: { ...formData.trial!, days: Number(e.target.value) },
                  })
                }
                className="w-16 bg-slate-900 border border-slate-700 rounded-lg p-1 text-xs text-center text-slate-100"
              />
              <span className="text-xs text-slate-400">Days</span>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
};
