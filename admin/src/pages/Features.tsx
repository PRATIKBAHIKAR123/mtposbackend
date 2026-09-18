import React, { useEffect, useState } from 'react';
import { adminApi } from '../api/admin.api';
import type { Feature } from '../types';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Table } from '../components/common/Table';
import { useToast } from '../context/ToastContext';
import { Sparkles } from 'lucide-react';

export const Features: React.FC = () => {
  const [features, setFeatures] = useState<Feature[]>([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    const load = async () => {
      try {
        const data = await adminApi.getFeatures();
        setFeatures(data);
      } catch (error: any) {
        showToast(error.message || 'Failed to load feature catalog', 'error');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-100">Platform Feature Flags & Catalog</h2>
        <p className="text-sm text-slate-400">
          SaaS feature flags defined system-wide that can be enabled or restricted across subscription plans.
        </p>
      </div>

      <Card>
        <Table
          loading={loading}
          data={features}
          emptyMessage="No feature flags defined in database."
          columns={[
            {
              header: 'Feature Key',
              accessor: (f) => (
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  <span className="font-mono text-xs font-semibold text-slate-100">{f.id}</span>
                </div>
              ),
            },
            {
              header: 'Name',
              accessor: (f) => <span className="font-medium text-slate-200">{f.name || f.id}</span>,
            },
            {
              header: 'Description',
              accessor: (f) => (
                <span className="text-xs text-slate-400 max-w-md block truncate">
                  {f.description || 'Core SaaS feature module'}
                </span>
              ),
            },
            {
              header: 'Status',
              accessor: () => <Badge status="active" />,
            },
          ]}
        />
      </Card>
    </div>
  );
};
