import React, { useState } from 'react';
import { ClientOverview } from './ClientOverview';
import { ClientLiveMap } from './ClientLiveMap';
import { ClientCampaigns } from './ClientCampaigns';
import { ClientInvoices } from './ClientInvoices';
import { ClientEvidence } from './ClientEvidence';
import { VerificationItem } from '../../../types';

interface ClientWorkspaceProps {
  activeTab: string;
  onNavigateTab: (tabId: string) => void;
  onOpenProof?: (item: VerificationItem) => void;
}

export const ClientWorkspace: React.FC<ClientWorkspaceProps> = ({
  activeTab,
  onNavigateTab,
  onOpenProof,
}) => {
  const [isViewingMap, setIsViewingMap] = useState(false);

  // If user requested full radar map
  if (isViewingMap || activeTab === 'live-map' || activeTab === 'live-tracker') {
    return <ClientLiveMap onBack={() => setIsViewingMap(false)} />;
  }

  switch (activeTab) {
    case 'dashboard':
    case 'overview':
      return (
        <ClientOverview
          onOpenLiveMap={() => setIsViewingMap(true)}
          onOpenProofModal={onOpenProof}
        />
      );

    case 'campaigns':
      return (
        <ClientCampaigns
          onOpenLiveMap={() => setIsViewingMap(true)}
        />
      );

    case 'evidence':
    case 'locations':
      return <ClientEvidence onOpenProofModal={onOpenProof} />;

    case 'invoices':
      return <ClientInvoices />;

    case 'reports':
    default:
      return (
        <ClientOverview
          onOpenLiveMap={() => setIsViewingMap(true)}
          onOpenProofModal={onOpenProof}
        />
      );
  }
};
