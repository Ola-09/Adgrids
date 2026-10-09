import React, { useState } from 'react';
import {
  CreditCard,
  ShieldCheck,
  TrendingUp,
  Lock,
  DollarSign,
  ArrowUpRight,
  Building,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  Download,
  Percent,
  RefreshCw,
} from 'lucide-react';
import { ESCROW_SETTLEMENTS } from '../../data/mockData';
import { ScreenId } from '../../types';

interface Screen06Props {
  onNavigate: (screen: ScreenId) => void;
}

export const Screen06FinanceTreasury: React.FC<Screen06Props> = ({ onNavigate }) => {
  const [selectedCurrency, setSelectedCurrency] = useState<'USD' | 'KES' | 'NGN' | 'ZAR'>('USD');
  const [releasedIds, setReleasedIds] = useState<string[]>([]);

  const handleRelease = (id: string, brand: string, amount: string) => {
    setReleasedIds((prev) => [...prev, id]);
    alert(`Escrow Funds Released! Transfer of ${amount} to media owner account initiated via Standard Bank Swift Rail.`);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl lg:text-3xl font-extrabold text-[#140338] tracking-tight">
              Finance & Escrow Treasury
            </h1>
            <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
              <Lock className="w-3.5 h-3.5 text-emerald-600" />
              Cross-Border Settlement Engine • ISO 20560
            </span>
          </div>
          <p className="text-xs lg:text-sm text-zinc-500 mt-1 font-medium">
            Automated disbursement triggers tied to ISO 20560 verified Proof-of-Play across 6 African central bank corridors.
          </p>
        </div>

        {/* Currency toggles & Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex bg-white p-0.5 rounded-xl border border-[#eae7e1] text-xs font-bold shadow-2xs">
            {(['USD', 'KES', 'NGN', 'ZAR'] as const).map((curr) => (
              <button
                key={curr}
                onClick={() => setSelectedCurrency(curr)}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  selectedCurrency === curr ? 'bg-[#140338] text-white shadow-2xs' : 'text-zinc-600 hover:text-[#140338]'
                }`}
              >
                {curr} base
              </button>
            ))}
          </div>

          <button
            onClick={() => alert('Initiating batch payout across 4 verified media owner contracts...')}
            className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-zinc-100 rounded-xl text-xs font-black text-[#140338] shadow-sm transition-colors"
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>Initiate Batch Payout</span>
          </button>

          <button
            onClick={() => alert('Downloading Central Bank compliant treasury ledger...')}
            className="flex items-center gap-2 px-3.5 py-2 bg-white border border-[#eae7e1] hover:bg-zinc-50 rounded-xl text-xs font-bold text-[#140338] shadow-2xs"
          >
            <Download className="w-3.5 h-3.5 text-zinc-600" />
            <span>Treasury Audit Log</span>
          </button>
        </div>
      </div>

      {/* 4 PRIMARY FINANCE METRICS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="bg-white rounded-2xl p-5 border border-[#eae7e1] shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500">Total Capital in Escrow</span>
            <div className="w-8 h-8 rounded-xl bg-[#f4f3f0] flex items-center justify-center text-[#140338]">
              <Lock className="w-4 h-4 text-emerald-600" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-extrabold text-[#140338] tracking-tight tnum block">
              $3,840,000
            </span>
            <div className="mt-3 flex items-center justify-between text-xs text-zinc-600">
              <span>Standard Bank SA & KCB</span>
              <span className="font-bold text-[#140338]">14 Flights Active</span>
            </div>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white rounded-2xl p-5 border border-[#eae7e1] shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500">Verified Disbursements Pending</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-extrabold text-emerald-700 tracking-tight tnum block">
              $612,400
            </span>
            <div className="mt-3 flex items-center justify-between text-xs text-zinc-600">
              <span>19 Approved Audits</span>
              <span className="font-bold text-emerald-700">Instant Trigger</span>
            </div>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white rounded-2xl p-5 border border-[#eae7e1] shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500">Withholding Tax Remitted</span>
            <div className="w-8 h-8 rounded-xl bg-[#f4f3f0] flex items-center justify-center text-[#140338]">
              <Percent className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-extrabold text-[#140338] tracking-tight tnum block">
              $184,200
            </span>
            <div className="mt-3 text-xs text-zinc-500 truncate">
              FIRS (NG) • KRA (KE) • SARS (ZA)
            </div>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-white rounded-2xl p-5 border border-[#eae7e1] shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500">Realized FX Optimization</span>
            <div className="w-8 h-8 rounded-xl bg-[#f4f3f0] flex items-center justify-center text-[#140338]">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-extrabold text-[#140338] tracking-tight tnum block">
              +2.84%
            </span>
            <div className="mt-3 text-xs text-emerald-700 font-bold">
              KES/USD, NGN/USD Hedging
            </div>
          </div>
        </div>
      </div>

      {/* MAIN TWO-COLUMN SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Escrow Release Queue (7 Cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-5 border border-[#eae7e1] shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] font-extrabold uppercase text-zinc-500 tracking-wider block">
                Audited Milestone Payouts
              </span>
              <h3 className="font-extrabold text-base text-[#140338]">
                Live Escrow Release & Settlement Queue
              </h3>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-white text-[#140338] text-xs font-black">
              4 Contracts Pending
            </span>
          </div>

          <div className="space-y-3">
            {ESCROW_SETTLEMENTS.map((item) => {
              const isReleased = releasedIds.includes(item.id) || item.payoutState === 'Cleared (Flight Completed)';

              return (
                <div
                  key={item.id}
                  className="p-4 rounded-xl border border-[#eae7e1] bg-[#faf9f6] hover:bg-white transition-all space-y-3"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-[#140338]">{item.flightName}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-200 font-bold text-zinc-800">
                          {item.id}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-500 mt-0.5">
                        Media Concessionaire: <strong className="text-[#140338]">{item.counterparty}</strong> ({item.role})
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="text-base font-extrabold text-[#140338] block tnum">
                        ${item.grossAmountUSD.toLocaleString()}
                      </span>
                      <span className="text-[10px] font-mono text-zinc-500 font-semibold">
                        {item.localCurrencyAmount}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-2 border-t border-[#eae7e1]">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1 font-bold text-emerald-700">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                        {item.popCompliance}
                      </span>
                      <span className="text-zinc-300">•</span>
                      <span className="text-zinc-500">{item.corridor}</span>
                    </div>

                    <div>
                      {isReleased ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-emerald-100 text-emerald-800 font-bold text-xs">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Settled
                        </span>
                      ) : (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => alert(`Placing temporary hold on escrow payout for ${item.id}...`)}
                            className="px-2.5 py-1 rounded-lg border border-zinc-300 hover:bg-zinc-100 text-zinc-700 text-xs font-semibold"
                          >
                            Hold
                          </button>
                          <button
                            onClick={() => handleRelease(item.id, item.flightName, `$${item.grossAmountUSD.toLocaleString()}`)}
                            className="px-3 py-1 rounded-lg bg-white hover:bg-zinc-100 text-[#140338] border border-zinc-200 font-bold text-xs transition-colors shadow-2xs"
                          >
                            Release Funds
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Treasury Vaults & WHT (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Multi-Currency Treasury Vaults */}
          <div className="bg-white rounded-2xl p-5 border border-[#eae7e1] shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-extrabold uppercase text-zinc-500 tracking-wider block">
                  Liquidity Reserves
                </span>
                <h3 className="font-extrabold text-base text-[#140338]">
                  Multi-Currency Treasury Vaults
                </h3>
              </div>
              <Building className="w-4 h-4 text-zinc-400" />
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="p-3 rounded-xl bg-[#faf9f6] border border-[#eae7e1] flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-[#140338]">USD Primary Reserve</h4>
                  <p className="text-[10px] text-zinc-500">Standard Bank Johannesburg • IBAN Encrypted</p>
                </div>
                <span className="text-sm font-extrabold text-[#140338]">$2,180,000</span>
              </div>

              <div className="p-3 rounded-xl bg-[#faf9f6] border border-[#eae7e1] flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-[#140338]">KES Escrow Vault</h4>
                  <p className="text-[10px] text-zinc-500">KCB Bank Nairobi • Central Bank Locked</p>
                </div>
                <div className="text-right">
                  <span className="text-sm font-extrabold text-[#140338] block">KES 142.5M</span>
                  <span className="text-[10px] text-zinc-400">~$1.10M eq.</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#faf9f6] border border-[#eae7e1] flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-[#140338]">NGN Liquidity Pool</h4>
                  <p className="text-[10px] text-zinc-500">Zenith Bank Lagos • Instant NIBSS</p>
                </div>
                <div className="text-right">
                  <span className="text-sm font-extrabold text-[#140338] block">₦620,000,000</span>
                  <span className="text-[10px] text-zinc-400">~$413K eq.</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#faf9f6] border border-[#eae7e1] flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-[#140338]">ZAR Working Capital</h4>
                  <p className="text-[10px] text-zinc-500">FirstRand Bank South Africa</p>
                </div>
                <div className="text-right">
                  <span className="text-sm font-extrabold text-[#140338] block">R 2,750,000</span>
                  <span className="text-[10px] text-zinc-400">~$147K eq.</span>
                </div>
              </div>
            </div>
          </div>

          {/* Regulatory Tax & WHT Automated Withholding */}
          <div className="bg-white rounded-2xl p-5 border border-[#eae7e1] shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-base text-[#140338]">
                Regulatory Tax & WHT Remittance
              </h3>
              <span className="text-xs text-emerald-700 font-bold">Compliant</span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1.5 border-b border-[#eae7e1]">
                <span className="text-zinc-600">Nigeria FIRS (10% WHT auto-remitted):</span>
                <span className="font-bold text-[#140338]">$88,000</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-[#eae7e1]">
                <span className="text-zinc-600">Kenya KRA (5% WHT auto-remitted):</span>
                <span className="font-bold text-[#140338]">$52,000</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-zinc-600">South Africa SARS (Standard VAT clearance):</span>
                <span className="font-bold text-[#140338]">$44,200</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
