import React from 'react';
import { MediaOwnerOverview } from './MediaOwnerOverview';
import { MediaOwnerInventory } from './MediaOwnerInventory';
import { MediaOwnerBookings } from './MediaOwnerBookings';
import { MediaOwnerRevenue } from './MediaOwnerRevenue';
import { MediaOwnerAgencies } from './MediaOwnerAgencies';

interface MediaOwnerWorkspaceProps {
  activeTab: string;
  onNavigateTab: (tabId: string) => void;
}

export const MediaOwnerWorkspace: React.FC<MediaOwnerWorkspaceProps> = ({
  activeTab,
  onNavigateTab,
}) => {
  switch (activeTab) {
    case 'dashboard':
    case 'overview':
      return <MediaOwnerOverview onNavigateTab={onNavigateTab} />;

    case 'inventory':
    case 'availability':
      return <MediaOwnerInventory />;

    case 'bookings':
    case 'campaigns':
      return <MediaOwnerBookings />;

    case 'revenue':
    case 'settlements':
    case 'reports':
      return <MediaOwnerRevenue />;

    case 'agencies':
    case 'pending-applications':
      return <MediaOwnerAgencies />;

    case 'settings':
    default:
      return <MediaOwnerOverview onNavigateTab={onNavigateTab} />;
  }
};
