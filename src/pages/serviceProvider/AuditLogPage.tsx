import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { BentoCard, BentoCardHeader } from '@/components/ui/bento-grid';
import { AuditTimeline, AuditTableRow } from '@/components/AuditLog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { mockAuditLog } from '@/data/mockData';
import { 
  Search, History, Filter, Download, FileText, CreditCard, 
  Scale, CheckCircle2, AlertTriangle, Settings
} from 'lucide-react';
import { format, subDays, isAfter } from 'date-fns';
import { toast } from 'sonner';

export default function AuditLogPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [roleFilter, setRoleFilter] = useState<string>('all');

  // Filter audit entries
  const filteredEntries = mockAuditLog.filter(entry => {
    const matchesSearch = 
      entry.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.entityId.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesAction = actionFilter === 'all' || entry.action.includes(actionFilter);
    const matchesRole = roleFilter === 'all' || entry.performedByRole === roleFilter;
    
    let matchesDate = true;
    if (dateFilter !== 'all') {
      const entryDate = new Date(entry.timestamp);
      const daysAgo = parseInt(dateFilter);
      matchesDate = isAfter(entryDate, subDays(new Date(), daysAgo));
    }
    
    return matchesSearch && matchesAction && matchesDate && matchesRole;
  });

  // Group entries by category
  const paymentEntries = filteredEntries.filter(e => 
    e.action.includes('PAYMENT') || e.action.includes('MILESTONE')
  );
  const documentEntries = filteredEntries.filter(e => 
    e.action.includes('DOCUMENT') || e.action.includes('VERIFIED')
  );
  const caseEntries = filteredEntries.filter(e => 
    e.action.includes('CASE') || e.action.includes('FAILED')
  );
  const plotEntries = filteredEntries.filter(e => 
    e.action.includes('PLOT') && !e.action.includes('FAILED')
  );

  const handleExport = () => {
    toast.success('Audit log exported to CSV');
  };

  const actionGroups = [
    { value: 'PAYMENT', label: 'Payment Actions' },
    { value: 'DOCUMENT', label: 'Document Actions' },
    { value: 'CASE', label: 'Case Actions' },
    { value: 'PLOT', label: 'Plot Actions' },
    { value: 'VERIFIED', label: 'Verification Actions' },
  ];

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Audit Log</h1>
            <p className="text-muted-foreground mt-1">
              Immutable timeline of all system activities (UC-10)
            </p>
          </div>
          <Button variant="outline" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-5 gap-4">
          <BentoCard className="text-center">
            <p className="text-2xl font-bold">{mockAuditLog.length}</p>
            <p className="text-xs text-muted-foreground">Total Entries</p>
          </BentoCard>
          <BentoCard className="text-center">
            <p className="text-2xl font-bold text-success">{paymentEntries.length}</p>
            <p className="text-xs text-muted-foreground">Payment Actions</p>
          </BentoCard>
          <BentoCard className="text-center">
            <p className="text-2xl font-bold text-info">{documentEntries.length}</p>
            <p className="text-xs text-muted-foreground">Document Actions</p>
          </BentoCard>
          <BentoCard className="text-center">
            <p className="text-2xl font-bold text-destructive">{caseEntries.length}</p>
            <p className="text-xs text-muted-foreground">Case Actions</p>
          </BentoCard>
          <BentoCard className="text-center">
            <p className="text-2xl font-bold text-primary">{plotEntries.length}</p>
            <p className="text-xs text-muted-foreground">Plot Actions</p>
          </BentoCard>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search actions, details, or entity IDs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={actionFilter} onValueChange={setActionFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Action type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Actions</SelectItem>
              {actionGroups.map(group => (
                <SelectItem key={group.value} value={group.value}>{group.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={dateFilter} onValueChange={setDateFilter}>
            <SelectTrigger className="w-full sm:w-[150px]">
              <SelectValue placeholder="Date range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="1">Last 24 Hours</SelectItem>
              <SelectItem value="7">Last 7 Days</SelectItem>
              <SelectItem value="30">Last 30 Days</SelectItem>
              <SelectItem value="90">Last 90 Days</SelectItem>
            </SelectContent>
          </Select>
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="purchaser">Purchaser</SelectItem>
              <SelectItem value="service_provider">Service Provider</SelectItem>
              <SelectItem value="admin_legal">Admin Legal</SelectItem>
              <SelectItem value="admin">System</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Audit Log Views */}
        <Tabs defaultValue="timeline" className="w-full">
          <TabsList>
            <TabsTrigger value="timeline">
              <History className="w-4 h-4 mr-2" />
              Timeline View
            </TabsTrigger>
            <TabsTrigger value="table">
              <Settings className="w-4 h-4 mr-2" />
              Table View
            </TabsTrigger>
          </TabsList>

          <TabsContent value="timeline" className="mt-4">
            <BentoCard>
              <BentoCardHeader 
                title="Activity Timeline"
                subtitle={`Showing ${filteredEntries.length} entries`}
              />
              <AuditTimeline entries={filteredEntries} />
            </BentoCard>
          </TabsContent>

          <TabsContent value="table" className="mt-4">
            <BentoCard className="p-0 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Action</TableHead>
                    <TableHead>Entity</TableHead>
                    <TableHead>Details</TableHead>
                    <TableHead>Performed By</TableHead>
                    <TableHead>Timestamp</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEntries.map(entry => (
                    <AuditTableRow key={entry.auditId} entry={entry} />
                  ))}
                </TableBody>
              </Table>
            </BentoCard>
          </TabsContent>
        </Tabs>

        {/* No Results */}
        {filteredEntries.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <History className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No audit entries match your filters</p>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
