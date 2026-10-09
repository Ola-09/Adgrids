import React from 'react';
import { PlatformAdminOverview } from './PlatformAdminOverview';
import { PlatformOrganizations } from './PlatformOrganizations';
import { PlatformUsers } from './PlatformUsers';
import { PlatformAuditLogs } from './PlatformAuditLogs';
import { SubscriptionAdminPanel } from '../../admin/SubscriptionAdminPanel';

interface PlatformAdminWorkspaceProps {
  activeTab: string;
  onNavigateTab: (tabId: string) => void;
}

export const PlatformAdminWorkspace: React.FC<PlatformAdminWorkspaceProps> = ({
  activeTab,
  onNavigateTab,
}) => {
  switch (activeTab) {
    case 'platform-overview':
    case 'overview':
    case 'dashboard':
      return <PlatformAdminOverview onNavigateTab={onNavigateTab} />;

    case 'subscriptions':
    case 'plans':
    case 'entitlements':
      return <SubscriptionAdminPanel />;

    case 'tenants':
    case 'organizations':
    case 'agencies':
    case 'media-owners':
      return <PlatformOrganizations />;

    case 'users':
      return <PlatformUsers />;

    case 'audit-logs':
    case 'compliance':
      return <PlatformAuditLogs />;

    case 'governance':
    case 'system-settings':
    default:
      return <PlatformAdminOverview onNavigateTab={onNavigateTab} />;
  }
};
