import React, { useState } from 'react';
import { VendorOverview } from './VendorOverview';
import { VendorJobs } from './VendorJobs';
import { VendorEarnings } from './VendorEarnings';

interface VendorWorkspaceProps {
  activeTab: string;
  onNavigateTab: (tabId: string) => void;
}

export const VendorWorkspace: React.FC<VendorWorkspaceProps> = ({
  activeTab,
  onNavigateTab,
}) => {
  switch (activeTab) {
    case 'dashboard':
    case 'overview':
      return <VendorOverview onNavigateTab={onNavigateTab} />;

    case 'assigned-jobs':
    case 'upcoming-jobs':
    case 'active-jobs':
    case 'completed-jobs':
    case 'jobs':
    case 'schedule':
      return <VendorJobs />;

    case 'earnings':
    case 'ratings':
      return <VendorEarnings />;

    case 'profile':
    default:
      return <VendorOverview onNavigateTab={onNavigateTab} />;
  }
};
