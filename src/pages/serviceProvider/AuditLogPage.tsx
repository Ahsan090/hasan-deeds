import { AppLayout } from '@/components/layout/AppLayout';
import { BentoCard } from '@/components/ui/bento-grid';

export default function AuditLogPage() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Audit Log</h1>
          <p className="text-muted-foreground mt-1">
            System activity and audit trail
          </p>
        </div>

        <BentoCard>
          <p className="text-center py-12 text-muted-foreground">
            Audit log endpoint not available in backend API
          </p>
        </BentoCard>
      </div>
    </AppLayout>
  );
}
