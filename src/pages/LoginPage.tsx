import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { UserRole } from '@/types/entities';
import { User, Briefcase, Scale, Shield, ArrowRight, Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const roles: { role: UserRole; label: string; description: string; icon: typeof User; path: string }[] = [
  { 
    role: 'purchaser', 
    label: 'Purchaser', 
    description: 'View plots, make payments, and access documents',
    icon: User,
    path: '/purchaser'
  },
  { 
    role: 'service_provider', 
    label: 'Service Provider', 
    description: 'Verify documents, manage schedules, issue documents',
    icon: Briefcase,
    path: '/admin'
  },
  { 
    role: 'admin_legal', 
    label: 'Admin Legal', 
    description: 'Handle cases, legal filings, and escalations',
    icon: Scale,
    path: '/admin'
  },
  { 
    role: 'admin', 
    label: 'System Admin', 
    description: 'Full system access and oversight',
    icon: Shield,
    path: '/admin'
  },
];

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleRoleSelect = (role: UserRole, path: string) => {
    login(role);
    navigate(path);
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-accent/30" />
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 rounded-full bg-accent blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 rounded-full bg-primary-foreground blur-3xl" />
        </div>
        
        <div className="relative z-10 flex flex-col justify-center px-16 text-primary-foreground">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur flex items-center justify-center">
              <Building2 className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Hasan Enterprises</h1>
              <p className="text-primary-foreground/70">Plot Purchase Management</p>
            </div>
          </div>
          
          <div className="space-y-6 max-w-md">
            <h2 className="text-4xl font-bold leading-tight">
              Streamlined Plot Management for Modern Real Estate
            </h2>
            <p className="text-lg text-primary-foreground/80">
              Complete workflow management from plot selection to document issuance, 
              with milestone-based payments and transparent tracking.
            </p>
            
            <div className="flex flex-wrap gap-3 pt-4">
              {['Milestone Payments', 'Document Tracking', 'Legal Workflow', 'Audit Trail'].map((feature) => (
                <span 
                  key={feature}
                  className="px-3 py-1.5 rounded-full bg-white/10 text-sm font-medium backdrop-blur"
                >
                  {feature}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Role Selection */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-lg">
          {/* Mobile Header */}
          <div className="lg:hidden text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center">
                <Building2 className="w-6 h-6 text-primary-foreground" />
              </div>
              <h1 className="text-2xl font-bold">Hasan Enterprises</h1>
            </div>
          </div>

          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-foreground">Welcome Back</h2>
            <p className="text-muted-foreground mt-2">
              Select your role to access the portal
            </p>
          </div>

          <div className="space-y-3">
            {roles.map(({ role, label, description, icon: Icon, path }) => (
              <button
                key={role}
                onClick={() => handleRoleSelect(role, path)}
                className={cn(
                  'w-full p-4 rounded-xl border-2 border-border bg-card',
                  'flex items-center gap-4 text-left',
                  'transition-all duration-200',
                  'hover:border-primary hover:bg-primary/5',
                  'group'
                )}
              >
                <div className={cn(
                  'w-12 h-12 rounded-xl flex items-center justify-center',
                  'bg-primary/10 text-primary',
                  'group-hover:bg-primary group-hover:text-primary-foreground',
                  'transition-colors duration-200'
                )}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground">{label}</h3>
                  <p className="text-sm text-muted-foreground truncate">{description}</p>
                </div>
                <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
              </button>
            ))}
          </div>

          <p className="text-center text-xs text-muted-foreground mt-8">
            This is a demo application. Select any role to explore the system.
          </p>
        </div>
      </div>
    </div>
  );
}
