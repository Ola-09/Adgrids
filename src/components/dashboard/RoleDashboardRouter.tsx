import React, { Suspense, lazy } from 'react';
import { useAuth } from '../../context/AuthContext';
import { MarketplaceBillboard, ScreenId, VerificationItem } from '../../types';

// Role-Specific Workspaces
const AgencyWorkspace = lazy(() =>
  import('../workspaces/agency/AgencyWorkspace').then((m) => ({ default: m.AgencyWorkspace }))
);
const ClientWorkspace = lazy(() =>
  import('../workspaces/client/ClientWorkspace').then((m) => ({ default: m.ClientWorkspace }))
);
const MediaOwnerWorkspace = lazy(() =>
  import('../workspaces/media-owner/MediaOwnerWorkspace').then((m) => ({ default: m.MediaOwnerWorkspace }))
);
const VendorWorkspace = lazy(() =>
  import('../workspaces/vendor/VendorWorkspace').then((m) => ({ default: m.VendorWorkspace }))
);
const FieldAgentWorkspace = lazy(() =>
  import('../workspaces/field-agent/FieldAgentWorkspace').then((m) => ({ default: m.FieldAgentWorkspace }))
);
const PlatformAdminWorkspace = lazy(() =>
  import('../workspaces/platform-admin/PlatformAdminWorkspace').then((m) => ({ default: m.PlatformAdminWorkspace }))
);

const DashboardLoadingFallback = () => (
  <div className="min-h-[400px] flex items-center justify-center p-12">
    <div className="flex flex-col items-center gap-3">
      <div className="w-8 h-8 border-2 border-[#ef5a24]/20 border-t-[#ef5a24] rounded-full animate-spin" />
      <span className="text-xs font-semibold text-[#8a857e]">Loading workspace...</span>
    </div>
  </div>
);

interface RoleDashboardRouterProps {
  activeTab: string;
  onNavigateTab?: (tabId: string) => void;
  onNavigatePublicMarketplace: () => void;
  onSelectBillboard?: (b: MarketplaceBillboard) => void;
  onPurchaseBillboard?: (b: MarketplaceBillboard) => void;
  onOpenProof?: (item: VerificationItem) => void;
  onNavigateLegacy?: (screen: ScreenId) => void;
}

export const RoleDashboardRouter: React.FC<RoleDashboardRouterProps> = ({
  activeTab,
  onNavigateTab = () => {},
  onNavigatePublicMarketplace,
  onSelectBillboard,
  onPurchaseBillboard,
  onOpenProof = () => {},
  onNavigateLegacy = () => {},
}) => {
  const { currentUser } = useAuth();

  if (!currentUser) return null;

  const renderContent = () => {
    // 1. Customer / Client Company Role
    if (currentUser.role === 'Customer / Client Company') {
      return (
        <ClientWorkspace
          activeTab={activeTab}
          onNavigateTab={onNavigateTab}
          onOpenProof={onOpenProof}
        />
      );
    }

    // 2. Field Agent
    if (currentUser.role === 'Field Agent') {
      return <FieldAgentWorkspace />;
    }

    // 3. Vendor / Contractor
    if (currentUser.role === 'Vendor') {
      return (
        <VendorWorkspace
          activeTab={activeTab}
          onNavigateTab={onNavigateTab}
        />
      );
    }

    // 4. Media Owner / Concessionaire
    if (currentUser.role === 'Media Owner') {
      return (
        <MediaOwnerWorkspace
          activeTab={activeTab}
          onNavigateTab={onNavigateTab}
        />
      );
    }

    // 5. Platform Admin (Governance console)
    if (currentUser.role === 'Platform Admin') {
      return (
        <PlatformAdminWorkspace
          activeTab={activeTab}
          onNavigateTab={onNavigateTab}
        />
      );
    }

    // 6. Agency Roles (Agency Admin, Campaign Manager, Operations Manager, Account Manager, Finance Manager, Field Manager, Agency Staff)
    return (
      <AgencyWorkspace
        activeTab={activeTab}
        onNavigateTab={onNavigateTab}
        onSelectBillboard={onSelectBillboard}
        onPurchaseBillboard={onPurchaseBillboard}
        onOpenProof={onOpenProof}
      />
    );
  };

  return <Suspense fallback={<DashboardLoadingFallback />}>{renderContent()}</Suspense>;
};

