import React, { useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  CalendarDays,
  Car,
  Check,
  CheckCircle2,
  Clock3,
  Compass,
  Copy,
  ExternalLink,
  Eye,
  Globe,
  Lock,
  Mail,
  MapPin,
  Maximize2,
  MessageSquare,
  Moon,
  Navigation,
  Phone,
  Send,
  ShieldCheck,
  Sparkles,
  Sun,
  UserCheck,
  X,
} from 'lucide-react';
import { MarketplaceBillboard } from '../../types';
import { Billboard360Viewer } from '../common/Billboard360Viewer';
import { FeatureGate } from '../entitlements/FeatureGate';
import { useEntitlements } from '../../context/EntitlementContext';

interface BillboardDetailProps {
  billboard: MarketplaceBillboard;
  onBack: () => void;
  onStartPurchase: (billboard: MarketplaceBillboard) => void;
}

type MapLayer = 'm' | 'k' | 'h';

const formatNumber = (value: number | string | undefined) => {
  if (value === undefined || value === null || value === '') return '—';
  if (typeof value === 'number') return value.toLocaleString();
  return value;
};

const formatMoney = (value: number | undefined) => {
  if (typeof value !== 'number') return '—';
  return `$${value.toLocaleString()}`;
};

export const BillboardDetail: React.FC<BillboardDetailProps> = ({
  billboard,
  onBack,
  onStartPurchase,
}) => {
  const [activeImageMode, setActiveImageMode] = useState<'day' | 'night'>('day');
  const [is360ViewerOpen, setIs360ViewerOpen] = useState(false);
  const [mapLayer, setMapLayer] = useState<MapLayer>('m');
  const [zoomLevel, setZoomLevel] = useState(16);
  const [copiedCoords, setCopiedCoords] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [contactFormSubmitted, setContactFormSubmitted] = useState(false);
  const [inquiryText, setInquiryText] = useState('');
  const [inquiryEmail, setInquiryEmail] = useState('');
  const [inquiryName, setInquiryName] = useState('');

  const { hasEntitlement, openUpgradeModal } = useEntitlements();
  const canView360 = hasEntitlement('can_view_360');
  const canViewTraffic = hasEntitlement('can_view_traffic_data');

  const company = billboard.companyContact;
  const hasNightView = Boolean(billboard.nightUrl);
  const isVerified = billboard.status.toLowerCase().includes('verified');

  const displayImage =
    activeImageMode === 'night' && billboard.nightUrl
      ? billboard.nightUrl
      : billboard.previewUrl;

  const googleMapsUrl =
    `https://www.google.com/maps/search/?api=1&query=${billboard.lat},${billboard.lng}`;
  const directionsUrl =
    `https://www.google.com/maps/dir/?api=1&destination=${billboard.lat},${billboard.lng}`;
  const embedMapUrl =
    `https://maps.google.com/maps?q=${billboard.lat},${billboard.lng}` +
    `&t=${mapLayer}&z=${zoomLevel}&ie=UTF8&iwloc=&output=embed`;

  const handleCopyCoordinates = async () => {
    const coordinates = `${billboard.lat}, ${billboard.lng}`;

    try {
      await navigator.clipboard.writeText(coordinates);
      setCopiedCoords(true);
      window.setTimeout(() => setCopiedCoords(false), 1800);
    } catch {
      setCopiedCoords(false);
    }
  };

  const handleSendInquiry = (event: React.FormEvent) => {
    event.preventDefault();
    setContactFormSubmitted(true);

    // This is currently a front-end interaction. A production implementation
    // should replace this timeout with the real inquiry API/service.
    window.setTimeout(() => {
      setContactFormSubmitted(false);
      setIsContactModalOpen(false);
      setInquiryText('');
      setInquiryEmail('');
      setInquiryName('');
    }, 2200);
  };

  return (
    <div className="min-h-screen bg-[#f7f8fb] text-slate-950">
      <div className="adgrid-container py-6 sm:py-8">
        {/* Breadcrumb / back */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex w-fit items-center gap-2 rounded-xl px-2 py-2 text-xs font-black text-slate-500 transition hover:bg-white hover:text-slate-950"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to inventory
          </button>

          <div className="flex flex-wrap items-center gap-2 text-[11px] font-bold text-slate-400">
            <span>Marketplace</span>
            <span>/</span>
            <span>{billboard.metroName}</span>
            <span>/</span>
            <span className="text-slate-700">{billboard.id}</span>
          </div>
        </div>

        {/* Property heading */}
        <section className="mt-4 rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_10px_45px_rgba(15,23,42,0.045)] sm:p-7">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-[#181716] px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.12em] text-white">
                  {billboard.format}
                </span>
                <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-[10px] font-black text-emerald-800">
                  {billboard.availabilityStatus}
                </span>
                {isVerified && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-sky-50 px-3 py-1.5 text-[10px] font-black text-sky-800">
                    <CheckCircle2 className="h-3 w-3" />
                    Verified listing
                  </span>
                )}
              </div>

              <h1 className="mt-4 max-w-4xl text-3xl font-black tracking-[-0.04em] text-slate-950 sm:text-4xl lg:text-5xl">
                {billboard.name}
              </h1>

              <p className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm font-medium text-slate-500">
                <MapPin className="h-4 w-4 shrink-0 text-emerald-600" />
                <span>{billboard.location}</span>
                <span className="text-slate-300">•</span>
                <span>{billboard.corridor}</span>
                <span className="text-slate-300">•</span>
                <span>{billboard.metroName}</span>
              </p>
            </div>

            <div className="flex shrink-0 flex-col items-start gap-2 sm:items-end">
              <p className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">
                Commercial rate
              </p>
              <p className="text-3xl font-black tracking-tight text-slate-950 tnum">
                {billboard.priceTwoWeeksNGN
                  ? `₦${billboard.priceTwoWeeksNGN.toLocaleString()}`
                  : formatMoney(billboard.priceMonthlyUSD)}
                <span className="ml-1 text-sm font-bold text-slate-400">
                  {billboard.priceTwoWeeksNGN ? '/ 2 wks' : '/mo'}
                </span>
              </p>
              <p className="text-xs text-slate-400">
                {formatMoney(billboard.priceMonthlyUSD)} / month · {formatMoney(billboard.priceDailyUSD)} daily equiv.
              </p>
            </div>
          </div>
        </section>

        {/* Main content */}
        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1.55fr)_minmax(330px,0.75fr)]">
          <div className="min-w-0 space-y-6">
            {/* Hero image */}
            <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-slate-950 shadow-[0_12px_50px_rgba(15,23,42,0.08)]">
              <div className="relative aspect-[16/10] min-h-[280px] sm:aspect-[16/9]">
                <img
                  src={displayImage}
                  alt={billboard.name}
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-black/10" />

                {/* 360 Experience Button (Section 5) */}
                <div className="absolute left-4 top-4 z-10 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIs360ViewerOpen(true)}
                    className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-black/60 px-3.5 py-2 text-xs font-black text-white backdrop-blur-xl hover:bg-black/85 transition-all cursor-pointer shadow-lg group"
                  >
                    <Compass className="h-4 w-4 text-[#ef5a24] group-hover:rotate-45 transition-transform" />
                    <span>Explore in 360°</span>
                    {!canView360 && (
                      <span className="rounded-md bg-amber-400/20 px-1.5 py-0.5 text-[10px] font-extrabold text-amber-300 border border-amber-400/40">
                        Pro
                      </span>
                    )}
                  </button>
                </div>

                {hasNightView && (
                  <div className="absolute right-4 top-4 flex rounded-xl border border-white/15 bg-black/55 p-1 text-xs font-black text-white backdrop-blur-xl">
                    <button
                      type="button"
                      onClick={() => setActiveImageMode('day')}
                      className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 transition ${
                        activeImageMode === 'day'
                          ? 'bg-white text-slate-950'
                          : 'text-white/70 hover:text-white'
                      }`}
                    >
                      <Sun className="h-3.5 w-3.5" />
                      Day
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveImageMode('night')}
                      className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 transition ${
                        activeImageMode === 'night'
                          ? 'bg-white text-slate-950'
                          : 'text-white/70 hover:text-white'
                      }`}
                    >
                      <Moon className="h-3.5 w-3.5" />
                      Night
                    </button>
                  </div>
                )}

                <div className="absolute bottom-4 left-4 right-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                  <div className="text-white">
                    <p className="text-[10px] font-black uppercase tracking-[0.16em] text-white/60">
                      Site preview
                    </p>
                    <p className="mt-1 text-sm font-black">{billboard.name}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="rounded-full border border-white/15 bg-black/35 px-3 py-1.5 text-[10px] font-bold text-white/80 backdrop-blur">
                      GPS {billboard.lat.toFixed(4)}, {billboard.lng.toFixed(4)}
                    </span>
                    {billboard.lightingType && (
                      <span className="hidden rounded-full border border-white/15 bg-black/35 px-3 py-1.5 text-[10px] font-bold text-white/80 backdrop-blur sm:inline-flex">
                        {billboard.lightingType}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </section>

            {/* Key facts */}
            <div className="space-y-3">
              <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <FactCard
                  icon={<Eye className="h-4 w-4" />}
                  label="Daily reach"
                  value={
                    canViewTraffic
                      ? formatNumber(billboard.dailyReach)
                      : `${formatNumber(billboard.dailyReach)} [Est]`
                  }
                />
                <FactCard
                  icon={<Car className="h-4 w-4" />}
                  label="Vehicles/day"
                  value={
                    canViewTraffic ? (
                      formatNumber(billboard.dailyTrafficVehicles)
                    ) : (
                      <span className="flex items-center gap-1 text-slate-400 text-xs">
                        <Lock className="h-3 w-3" /> Pro Only
                      </span>
                    )
                  }
                />
                <FactCard
                  icon={<Clock3 className="h-4 w-4" />}
                  label="Dwell time"
                  value={
                    canViewTraffic ? (
                      `${formatNumber(billboard.dwellTimeSeconds)}s`
                    ) : (
                      <span className="flex items-center gap-1 text-slate-400 text-xs">
                        <Lock className="h-3 w-3" /> Pro Only
                      </span>
                    )
                  }
                />
                <FactCard
                  icon={<Maximize2 className="h-4 w-4" />}
                  label="Dimensions"
                  value={billboard.dimensions || '—'}
                />
              </section>

              {!canViewTraffic && (
                <FeatureGate entitlement="can_view_traffic_data" compact />
              )}
            </div>

            {/* About */}
            <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_8px_35px_rgba(15,23,42,0.04)] sm:p-7">
              <SectionHeading
                eyebrow="Site overview"
                title="About this advertising location"
              />
              <p className="mt-4 text-sm leading-7 text-slate-600">
                {billboard.description || 'No site description has been provided for this listing.'}
              </p>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <InfoRow label="Audience" value={billboard.audienceType} />
                <InfoRow label="Campaign objective" value={billboard.campaignObjective} />
                <InfoRow label="Format" value={billboard.format} />
                <InfoRow label="Lighting" value={billboard.lightingType || 'Not specified'} />
              </div>
            </section>

            {/* Technical specifications */}
            <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_8px_35px_rgba(15,23,42,0.04)] sm:p-7">
              <SectionHeading
                eyebrow="Asset information"
                title="Technical specifications"
              />

              {billboard.specsList?.length ? (
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  {billboard.specsList.map((spec, index) => (
                    <div
                      key={`${spec}-${index}`}
                      className="flex items-start gap-3 rounded-2xl bg-slate-50 p-3.5"
                    >
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                      <span className="text-xs font-semibold leading-5 text-slate-700">{spec}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-4 text-sm text-slate-500">
                  No additional technical specifications have been provided.
                </p>
              )}
            </section>

            {/* Map */}
            <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_8px_35px_rgba(15,23,42,0.04)]">
              <div className="p-6 sm:p-7">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <SectionHeading
                      eyebrow="Location"
                      title="Inspect the site on the map"
                    />
                    <p className="mt-2 max-w-xl text-xs leading-5 text-slate-500">
                      Coordinates below are the location values stored with this inventory record.
                    </p>
                  </div>

                  <div className="flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-50 p-1">
                    <MapLayerButton
                      active={mapLayer === 'm'}
                      onClick={() => setMapLayer('m')}
                      label="Roadmap"
                    />
                    <MapLayerButton
                      active={mapLayer === 'k'}
                      onClick={() => setMapLayer('k')}
                      label="Satellite"
                    />
                    <MapLayerButton
                      active={mapLayer === 'h'}
                      onClick={() => setMapLayer('h')}
                      label="Hybrid"
                    />
                  </div>
                </div>

                <div className="relative mt-5 h-[340px] overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
                  <iframe
                    title={`Map location for ${billboard.name}`}
                    width="100%"
                    height="100%"
                    frameBorder="0"
                    scrolling="no"
                    src={embedMapUrl}
                    className="h-full w-full"
                    loading="lazy"
                  />

                  <div className="absolute left-3 top-3 flex items-center gap-2 rounded-xl border border-white/70 bg-white/95 px-3 py-2 text-xs font-black text-slate-800 shadow-lg">
                    <MapPin className="h-3.5 w-3.5 text-emerald-600" />
                    {billboard.location}
                  </div>

                  <div className="absolute bottom-3 right-3 flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white/95 shadow-lg backdrop-blur">
                    <button
                      type="button"
                      onClick={() => setZoomLevel((value) => Math.min(value + 1, 19))}
                      className="flex h-9 w-9 items-center justify-center border-b border-slate-200 text-lg font-black text-slate-800 hover:bg-slate-50"
                      aria-label="Zoom in"
                    >
                      +
                    </button>
                    <button
                      type="button"
                      onClick={() => setZoomLevel((value) => Math.max(value - 1, 11))}
                      className="flex h-9 w-9 items-center justify-center text-lg font-black text-slate-800 hover:bg-slate-50"
                      aria-label="Zoom out"
                    >
                      −
                    </button>
                  </div>
                </div>

                <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 font-mono text-[11px] font-bold text-slate-600">
                      {billboard.lat.toFixed(5)}, {billboard.lng.toFixed(5)}
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyCoordinates}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-[11px] font-black text-slate-700 hover:bg-slate-50"
                    >
                      {copiedCoords ? (
                        <>
                          <Check className="h-3.5 w-3.5 text-emerald-600" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5" />
                          Copy coordinates
                        </>
                      )}
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <a
                      href={directionsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-xl bg-slate-100 px-3 py-2 text-[11px] font-black text-slate-800 hover:bg-slate-200"
                    >
                      <Navigation className="h-3.5 w-3.5" />
                      Directions
                    </a>
                    <a
                      href={googleMapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-xl bg-[#181716] px-3 py-2 text-[11px] font-black text-white hover:bg-[#2d2b29]"
                    >
                      Open in Maps
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Sticky commercial panel */}
          <aside className="min-w-0">
            <div className="space-y-5 lg:sticky lg:top-24">
              <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_12px_45px_rgba(15,23,42,0.07)] sm:p-7">
                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">
                  Booking
                </p>
                <div className="mt-2 flex items-end gap-2">
                  <span className="text-3xl font-black tracking-tight text-slate-950 tnum">
                    {formatMoney(billboard.priceMonthlyUSD)}
                  </span>
                  <span className="pb-1 text-xs font-bold text-slate-400">/ month</span>
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  {formatMoney(billboard.priceDailyUSD)} estimated daily rate
                </p>

                <div className="mt-5 rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
                  <div className="flex items-start gap-3">
                    <CalendarDays className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" />
                    <div>
                      <p className="text-xs font-black text-emerald-950">Current availability</p>
                      <p className="mt-1 text-[11px] leading-5 text-emerald-800">
                        {billboard.availabilityStatus}
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onStartPurchase(billboard)}
                  className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#ef5a24] px-5 py-4 text-sm font-black text-white shadow-lg shadow-[#ef5a24]/15 transition hover:-translate-y-0.5 hover:bg-[#df4d19]"
                >
                  Request booking
                  <ArrowRight className="h-4 w-4" />
                </button>

                <button
                  type="button"
                  onClick={() => setIsContactModalOpen(true)}
                  className="mt-2.5 flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 px-5 py-3.5 text-xs font-black text-slate-800 hover:bg-slate-50"
                >
                  <MessageSquare className="h-4 w-4" />
                  Ask the media owner
                </button>

                <p className="mt-4 text-center text-[10px] leading-5 text-slate-400">
                  Booking continues into the authenticated ADGRID workspace.
                </p>
              </section>

              <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_8px_35px_rgba(15,23,42,0.04)]">
                <SectionHeading eyebrow="Audience" title="Campaign fit" />
                <div className="mt-5 space-y-3">
                  <InfoRow label="Primary audience" value={billboard.audienceType} />
                  <InfoRow label="Campaign objective" value={billboard.campaignObjective} />
                  <InfoRow label="Traffic" value={`${formatNumber(billboard.dailyTrafficVehicles)} vehicles/day`} />
                  <InfoRow label="Dwell time" value={`${formatNumber(billboard.dwellTimeSeconds)} seconds`} />
                </div>
              </section>

              <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_8px_35px_rgba(15,23,42,0.04)]">
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#181716] text-white">
                    <Building2 className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">
                      Media owner
                    </p>
                    <h2 className="mt-1 text-base font-black text-slate-950">
                      {company?.companyName || billboard.mediaOwnerCompany}
                    </h2>
                    {company?.tradingName && (
                      <p className="mt-0.5 text-xs text-slate-500">{company.tradingName}</p>
                    )}
                  </div>
                </div>

                {(company?.verifiedStatus || company?.licenseNumber) && (
                  <div className="mt-5 rounded-2xl bg-slate-50 p-4">
                    {company?.verifiedStatus && (
                      <div className="flex items-center justify-between gap-3 text-xs">
                        <span className="text-slate-500">Verification</span>
                        <span className="font-black text-emerald-700">{company.verifiedStatus}</span>
                      </div>
                    )}
                    {company?.licenseNumber && (
                      <div className="mt-2 flex items-center justify-between gap-3 text-xs">
                        <span className="text-slate-500">License</span>
                        <span className="font-mono font-bold text-slate-800">{company.licenseNumber}</span>
                      </div>
                    )}
                    {company?.activeSitesCount && (
                      <div className="mt-2 flex items-center justify-between gap-3 text-xs">
                        <span className="text-slate-500">Active sites</span>
                        <span className="font-black text-slate-800">{company.activeSitesCount}</span>
                      </div>
                    )}
                  </div>
                )}

                {company?.contactPerson && (
                  <div className="mt-4 flex items-center gap-3 rounded-2xl border border-slate-200 p-3.5">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-slate-700">
                      <UserCheck className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">
                        Contact
                      </p>
                      <p className="truncate text-xs font-black text-slate-900">{company.contactPerson}</p>
                      {company.contactRole && (
                        <p className="truncate text-[11px] text-slate-500">{company.contactRole}</p>
                      )}
                    </div>
                  </div>
                )}

                <div className="mt-4 space-y-2">
                  {company?.phoneDirect && (
                    <ContactLink
                      href={`tel:${company.phoneDirect}`}
                      icon={<Phone className="h-4 w-4" />}
                      label="Commercial enquiries"
                      value={company.phoneDirect}
                      action="Call"
                    />
                  )}
                  {company?.phoneOperations && (
                    <ContactLink
                      href={`tel:${company.phoneOperations}`}
                      icon={<Phone className="h-4 w-4" />}
                      label="Operations line"
                      value={company.phoneOperations}
                      action="Call"
                    />
                  )}
                  {company?.emailBookings && (
                    <ContactLink
                      href={`mailto:${company.emailBookings}?subject=${encodeURIComponent(`Inquiry: ${billboard.name} (#${billboard.id})`)}`}
                      icon={<Mail className="h-4 w-4" />}
                      label="Bookings"
                      value={company.emailBookings}
                      action="Email"
                    />
                  )}
                </div>

                {company?.headquartersAddress && (
                  <div className="mt-3 rounded-2xl bg-slate-50 p-3.5">
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">
                      <MapPin className="h-3.5 w-3.5" />
                      Headquarters
                    </div>
                    <p className="mt-2 text-xs font-semibold leading-5 text-slate-700">
                      {company.headquartersAddress}
                    </p>
                    {company.regionalDepotAddress && (
                      <p className="mt-1 text-[11px] text-slate-500">
                        Depot: {company.regionalDepotAddress}
                      </p>
                    )}
                  </div>
                )}

                {(company?.operatingHours || company?.emergencySLA) && (
                  <div className="mt-3 grid grid-cols-1 gap-2 text-xs">
                    {company.operatingHours && (
                      <InfoRow label="Operating hours" value={company.operatingHours} />
                    )}
                    {company.emergencySLA && (
                      <InfoRow label="Field response SLA" value={company.emergencySLA} />
                    )}
                  </div>
                )}

                {company?.website && (
                  <a
                    href={company.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-xs font-black text-slate-800 hover:bg-slate-50"
                  >
                    <Globe className="h-4 w-4 text-emerald-600" />
                    Visit media owner website
                    <ExternalLink className="h-3.5 w-3.5 text-slate-400" />
                  </a>
                )}
              </section>
            </div>
          </aside>
        </div>
      </div>

      {/* Contact modal */}
      {isContactModalOpen && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="inquiry-title"
        >
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-[28px] bg-white p-6 shadow-2xl sm:p-7">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">
                  Media owner enquiry
                </p>
                <h2 id="inquiry-title" className="mt-1 text-xl font-black tracking-tight text-slate-950">
                  Contact {billboard.mediaOwnerCompany}
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  About <span className="font-bold text-slate-800">{billboard.name}</span> · {billboard.id}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsContactModalOpen(false)}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200"
                aria-label="Close enquiry"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {contactFormSubmitted ? (
              <div className="py-12 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                  <Check className="h-7 w-7" />
                </div>
                <h3 className="mt-4 text-lg font-black text-slate-950">Inquiry form submitted</h3>
                <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">
                  The current frontend has captured the form interaction. Connect this handler to your
                  backend inquiry service when the API is ready.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSendInquiry} className="mt-6 space-y-4">
                <Field label="Full name">
                  <input
                    type="text"
                    required
                    value={inquiryName}
                    onChange={(event) => setInquiryName(event.target.value)}
                    placeholder="Your name"
                    className="form-field"
                  />
                </Field>

                <Field label="Business email">
                  <input
                    type="email"
                    required
                    value={inquiryEmail}
                    onChange={(event) => setInquiryEmail(event.target.value)}
                    placeholder="you@company.com"
                    className="form-field"
                  />
                </Field>

                <Field label="Message">
                  <textarea
                    rows={5}
                    required
                    value={inquiryText}
                    onChange={(event) => setInquiryText(event.target.value)}
                    placeholder={`Tell ${billboard.mediaOwnerCompany} what you need to confirm about ${billboard.name}.`}
                    className="form-field resize-none"
                  />
                </Field>

                <div className="flex items-center gap-2 rounded-2xl bg-slate-50 p-3 text-[11px] leading-5 text-slate-500">
                  <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-600" />
                  This form currently demonstrates the enquiry workflow; no external message is sent until the backend integration is connected.
                </div>

                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsContactModalOpen(false)}
                    className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-black text-slate-700 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 rounded-xl bg-[#ef5a24] px-5 py-2.5 text-xs font-black text-white hover:bg-[#df4d19]"
                  >
                    <Send className="h-3.5 w-3.5" />
                    Submit inquiry
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
      {/* 360 Virtual Sphere Viewer */}
      <Billboard360Viewer
        billboard={billboard}
        isOpen={is360ViewerOpen}
        onClose={() => setIs360ViewerOpen(false)}
      />
    </div>
  );
};

const SectionHeading: React.FC<{ eyebrow: string; title: string }> = ({ eyebrow, title }) => (
  <div>
    <p className="text-[10px] font-black uppercase tracking-[0.16em] text-emerald-700">{eyebrow}</p>
    <h2 className="mt-1.5 text-xl font-black tracking-[-0.025em] text-slate-950">{title}</h2>
  </div>
);

const FactCard: React.FC<{ icon: React.ReactNode; label: string; value: React.ReactNode }> = ({
  icon,
  label,
  value,
}) => (
  <div className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_6px_24px_rgba(15,23,42,0.035)]">
    <div className="flex items-center gap-2 text-slate-400">
      {icon}
      <span className="truncate text-[10px] font-black uppercase tracking-[0.11em]">{label}</span>
    </div>
    <p className="mt-2 truncate text-base font-black text-slate-950 tnum">{value}</p>
  </div>
);

const InfoRow: React.FC<{ label: string; value: string | number | undefined }> = ({ label, value }) => (
  <div className="flex items-start justify-between gap-4 border-b border-slate-100 py-2.5 last:border-0">
    <span className="text-xs font-medium text-slate-500">{label}</span>
    <span className="max-w-[65%] text-right text-xs font-black text-slate-800">
      {value || 'Not specified'}
    </span>
  </div>
);

const ContactLink: React.FC<{
  href: string;
  icon: React.ReactNode;
  label: string;
  value: string;
  action: string;
}> = ({ href, icon, label, value, action }) => (
  <div className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 p-3">
    <div className="flex min-w-0 items-center gap-2.5">
      <span className="shrink-0 text-slate-500">{icon}</span>
      <div className="min-w-0">
        <p className="text-[10px] font-black uppercase tracking-[0.08em] text-slate-400">{label}</p>
        <p className="truncate text-xs font-bold text-slate-800">{value}</p>
      </div>
    </div>
    <a
      href={href}
      className="shrink-0 rounded-lg bg-slate-100 px-2.5 py-1.5 text-[10px] font-black text-slate-700 hover:bg-slate-200"
    >
      {action}
    </a>
  </div>
);

const MapLayerButton: React.FC<{
  active: boolean;
  onClick: () => void;
  label: string;
}> = ({ active, onClick, label }) => (
  <button
    type="button"
    onClick={onClick}
    className={`rounded-lg px-2.5 py-1.5 text-[10px] font-black transition ${
      active ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-500 hover:text-slate-900'
    }`}
  >
    {label}
  </button>
);

const Field: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <label className="block">
    <span className="mb-1.5 block text-xs font-black text-slate-700">{label}</span>
    {children}
  </label>
);

export default BillboardDetail;