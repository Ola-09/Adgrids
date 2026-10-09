import React, { useEffect, useState } from 'react';
import { AgencyOverview } from './AgencyOverview';
import { AgencyCampaigns } from './AgencyCampaigns';
import { AgencyCampaignDetail } from './AgencyCampaignDetail';
import { AgencyCampaignMap } from './AgencyCampaignMap';
import { AgencyClients } from './AgencyClients';
import { AgencyOperations } from './AgencyOperations';
import { AgencyVendors } from './AgencyVendors';
import { AgencyFinance } from './AgencyFinance';
import { AgencyRenewals } from './AgencyRenewals';
import { AgencySettings } from './AgencySettings';
import { AgencyWorkspaceSetupModal } from './AgencyWorkspaceSetupModal';
import { AgencyInventory } from './inventory/AgencyInventory';
import { SubscriptionAdminPanel } from '../../admin/SubscriptionAdminPanel';
import { MarketplaceHome } from '../../public/MarketplaceHome';
import { MarketplaceBillboard, VerificationItem } from '../../../types';

interface AgencyWorkspaceProps {
  activeTab: string;
  onNavigateTab: (tabId: string) => void;
  onSelectBillboard?: (b: MarketplaceBillboard) => void;
  onPurchaseBillboard?: (b: MarketplaceBillboard) => void;
  onOpenProof?: (item: VerificationItem) => void;
}

export const AgencyWorkspace: React.FC<AgencyWorkspaceProps> = ({
  activeTab,
  onNavigateTab,
  onSelectBillboard = () => {},
  onPurchaseBillboard = () => {},
  onOpenProof = () => {},
}) => {
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null);
  const [isViewingMap, setIsViewingMap] = useState<boolean>(false);
  const [workspaceData, setWorkspaceData] = useState<any>(null);
  const [showSetupModal, setShowSetupModal] = useState<boolean>(false);

  useEffect(() => {
    const checkWorkspaceSetup = async () => {
      try {
        const res = await fetch('/api/agency/workspace', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('adgrid_access_token') || ''}`,
          },
        });
        const json = await res.json();
        if (json.success && json.workspace) {
          setWorkspaceData(json.workspace);
          if (json.workspace.setupCompleted === false) {
            setShowSetupModal(true);
          }
        }
      } catch (err) {
        // ignore network error
      }
    };
    checkWorkspaceSetup();
  }, []);

  const renderMainContent = () => {
    // If a campaign detail is active, allow sub-navigation
    if (selectedCampaignId) {
      if (isViewingMap) {
        return (
          <AgencyCampaignMap
            onBack={() => setIsViewingMap(false)}
            onOpenCampaignDetail={(id) => {
              setSelectedCampaignId(id);
              setIsViewingMap(false);
            }}
          />
        );
      }

      return (
        <AgencyCampaignDetail
          campaignId={selectedCampaignId}
          onBack={() => setSelectedCampaignId(null)}
          onOpenMap={() => setIsViewingMap(true)}
        />
      );
    }

    // If user navigated to campaign map tab directly
    if (activeTab === 'live-map' || activeTab === 'map') {
      return (
        <AgencyCampaignMap
          onBack={() => onNavigateTab('campaigns')}
          onOpenCampaignDetail={(id) => setSelectedCampaignId(id)}
        />
      );
    }

    switch (activeTab) {
      case 'command-center':
      case 'overview':
      case 'dashboard':
        return (
          <AgencyOverview
            onNavigateTab={onNavigateTab}
            onOpenCampaignDetail={(id) => setSelectedCampaignId(id)}
          />
        );

      case 'campaigns':
        return (
          <AgencyCampaigns
            onOpenCampaignDetail={(id) => setSelectedCampaignId(id)}
            onNavigateTab={onNavigateTab}
          />
        );

      case 'inventory':
      case 'fleet-inventory':
      case 'import-inventory':
        return <AgencyInventory />;

      case 'clients':
        return (
          <AgencyClients
            onOpenClientPortal={() => onNavigateTab('client-portal')}
            onOpenCampaignDetail={(id) => setSelectedCampaignId(id)}
          />
        );

      case 'marketplace':
        return (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-[#eae7e1] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
              <div>
                <h2 className="text-sm font-extrabold text-[#181716]">Agency Inventory Marketplace</h2>
                <p className="text-xs text-zinc-500">
                  Procure prime digital and classic out-of-home inventory directly for client flights.
                </p>
              </div>
              <button
                onClick={() => onNavigateTab('command-center')}
                className="text-xs font-bold text-[#ef5a24] hover:underline"
              >
                ← Back to Command Center
              </button>
            </div>
            <MarketplaceHome
              onSelectBillboard={onSelectBillboard}
              onPurchaseBillboard={onPurchaseBillboard}
            />
          </div>
        );

      case 'operations':
      case 'jobs':
      case 'verification':
      case 'issues':
        return (
          <AgencyOperations
            onOpenCampaignDetail={(id) => setSelectedCampaignId(id)}
            onOpenProofModal={onOpenProof}
          />
        );

      case 'vendors':
        return <AgencyVendors />;

      case 'field-teams':
      case 'field-agents':
        return (
          <AgencyOperations
            onOpenCampaignDetail={(id) => setSelectedCampaignId(id)}
            onOpenProofModal={onOpenProof}
          />
        );

      case 'finance':
      case 'invoices':
      case 'payments':
      case 'settlements':
        return <AgencyFinance />;

      case 'renewals':
      case 'expiries':
        return (
          <AgencyRenewals
            onOpenCampaignDetail={(id) => setSelectedCampaignId(id)}
          />
        );

      case 'settings':
      case 'workspace-settings':
      case 'team':
        return <AgencySettings />;

      case 'subscriptions':
      case 'subscription':
      case 'plans':
        return <SubscriptionAdminPanel />;

      case 'reports':
      default:
        return (
          <AgencyOverview
            onNavigateTab={onNavigateTab}
            onOpenCampaignDetail={(id) => setSelectedCampaignId(id)}
          />
        );
    }
  };

  return (
    <>
      {renderMainContent()}
      <AgencyWorkspaceSetupModal
        isOpen={showSetupModal}
        onClose={() => setShowSetupModal(false)}
        initialData={workspaceData}
        onSuccess={(updated) => {
          setWorkspaceData(updated);
          setShowSetupModal(false);
        }}
      />
    </>
  );
};
