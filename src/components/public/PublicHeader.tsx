import React, { useState } from 'react';
import { ArrowUpRight, Menu, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface PublicHeaderProps {
  onNavigateMarketplace: () => void;
  onNavigateAdmin?: () => void;
  onNavigateAgency?: () => void;
  onNavigateMedia?: () => void;
  activeNav?: string;
}

export const PublicHeader: React.FC<PublicHeaderProps> = ({
  onNavigateMarketplace,
  onNavigateAdmin,
  onNavigateAgency,
  onNavigateMedia,
}) => {
  const { currentUser } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const goHome = () => {
    setMobileOpen(false);
    onNavigateMarketplace();
  };

  const goMedia = () => {
    setMobileOpen(false);
    if (onNavigateMedia) {
      onNavigateMedia();
    } else {
      scrollTo('media-owner');
    }
  };

  const goAgency = () => {
    setMobileOpen(false);
    if (onNavigateAgency) {
      onNavigateAgency();
    } else if (onNavigateAdmin) {
      onNavigateAdmin();
    }
  };

  const scrollTo = (id: string) => {
    setMobileOpen(false);
    if (window.location.pathname !== '/marketplace') {
      onNavigateMarketplace();
      window.setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }), 120);
      return;
    }
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <header className="adgrid-public-header">
      <div className="adgrid-container adgrid-header-inner">
        <button type="button" onClick={goHome} className="adgrid-brand" aria-label="Go to ADGRID marketplace">
          <span className="adgrid-brand-logo"><img src="/branding/adgrid-mark.png" alt="" /></span>
          <span className="adgrid-brand-copy">
            <strong>ADGRID</strong>
            <small>OOH marketplace</small>
          </span>
        </button>

        <nav className="adgrid-header-nav" aria-label="Public navigation">
          <button type="button" onClick={goHome} className="is-active">Locations</button>
          <button type="button" onClick={() => scrollTo('coverage')}>Coverage</button>
          <button type="button" onClick={goMedia}>For owners</button>
          <button type="button" onClick={goAgency}>For agencies</button>
        </nav>

        <div className="adgrid-header-actions">
          <button type="button" onClick={goMedia} className="adgrid-header-link-secondary">
            Media Owner
          </button>
          <button type="button" onClick={goAgency} className="adgrid-header-link-secondary">
            Agency Portal
          </button>
          {onNavigateAdmin && (
            <button type="button" onClick={onNavigateAdmin} className="adgrid-orange-button adgrid-header-cta cursor-pointer">
              {currentUser ? 'Workspace' : 'Sign in'}
              <ArrowUpRight size={14} strokeWidth={2.4} />
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={() => setMobileOpen((value) => !value)}
          className="adgrid-mobile-menu"
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X size={19} /> : <Menu size={19} />}
        </button>
      </div>

      {mobileOpen && (
        <div className="adgrid-mobile-panel">
          <div className="adgrid-container">
            <button type="button" onClick={goHome}>Locations</button>
            <button type="button" onClick={() => scrollTo('coverage')}>Coverage</button>
            <button type="button" onClick={goMedia}>Media Owner Portal</button>
            <button type="button" onClick={goAgency}>Marketing Agency Portal</button>
            {onNavigateAdmin && (
              <button type="button" onClick={() => { setMobileOpen(false); onNavigateAdmin(); }} className="adgrid-mobile-cta">
                {currentUser ? 'Open workspace' : 'Sign in / Workspace'}
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default PublicHeader;