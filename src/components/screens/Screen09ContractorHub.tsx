import React, { useState } from 'react';
import {
  Wrench,
  Printer,
  ShieldCheck,
  DollarSign,
  Upload,
  Plus,
  Clock,
  CheckCircle,
  FileText,
  AlertTriangle,
  HardHat,
  Cpu,
} from 'lucide-react';
import { JOB_WORK_ORDERS } from '../../data/mockData';
import { ScreenId } from '../../types';

interface Screen09Props {
  onNavigate: (screen: ScreenId) => void;
}

export const Screen09ContractorHub: React.FC<Screen09Props> = ({ onNavigate }) => {
  const [jobs, setJobs] = useState(JOB_WORK_ORDERS);

  const handleUploadProof = (jobId: string) => {
    alert(`Installation proof uploaded for Work Order ${jobId}! Optical CV verification initiated.`);
    setJobs((prev) =>
      prev.map((j) => (j.id === jobId ? { ...j, status: 'Quality QA' as const } : j))
    );
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl lg:text-3xl font-extrabold text-[#140338] tracking-tight">
              Vendor & Tier-1 Contractor Operations
            </h1>
            <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
              <HardHat className="w-3.5 h-3.5 text-emerald-600" />
              Verified Tier-1 Contractor • ARC-NG-9410
            </span>
          </div>
          <p className="text-xs lg:text-sm text-zinc-500 mt-1 font-medium">
            Work orders, grand-format print queues, structural gantry rigging, and ISO 20560 installation proof uploads.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => alert('New Work Order accepted! Assigned to Rigging Team Alpha.')}
            className="flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-zinc-100 rounded-xl text-xs font-black text-[#140338] shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Accept Work Order</span>
          </button>

          <button
            onClick={() => alert('Opening ISO 20560 Installation QA submission dialog...')}
            className="flex items-center gap-2 px-3.5 py-2.5 bg-white border border-[#eae7e1] hover:bg-zinc-50 rounded-xl text-xs font-bold text-[#140338] shadow-2xs"
          >
            <Upload className="w-4 h-4 text-zinc-600" />
            <span>Submit Installation QA</span>
          </button>
        </div>
      </div>

      {/* 4 PRIMARY CONTRACTOR METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="bg-white rounded-2xl p-5 border border-[#eae7e1] shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500">Active Work Orders</span>
            <div className="w-8 h-8 rounded-xl bg-[#f4f3f0] flex items-center justify-center text-[#140338]">
              <Wrench className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-extrabold text-[#140338] tracking-tight tnum block">
              14 Assigned
            </span>
            <div className="mt-3 text-xs text-zinc-600">
              8 In Print • 4 Rigging • 2 Final Sign-off
            </div>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white rounded-2xl p-5 border border-[#eae7e1] shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500">Vinyl & Canvas Printed</span>
            <div className="w-8 h-8 rounded-xl bg-[#f4f3f0] flex items-center justify-center text-[#140338]">
              <Printer className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-extrabold text-[#140338] tracking-tight tnum block">
              18,400 m²
            </span>
            <div className="mt-3 text-xs text-emerald-700 font-bold">
              UV Heavy Duty 550gsm Frontlit
            </div>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white rounded-2xl p-5 border border-[#eae7e1] shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500">Installation SLA Compliance</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-extrabold text-emerald-700 tracking-tight tnum block">
              98.6%
            </span>
            <div className="mt-3 text-xs text-zinc-600">
              Avg Turnaround: 14h Print to Gantry
            </div>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-white rounded-2xl p-5 border border-[#eae7e1] shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500">Contractor Earnings Pending</span>
            <div className="w-8 h-8 rounded-xl bg-[#f4f3f0] flex items-center justify-center text-[#140338]">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-extrabold text-[#140338] tracking-tight tnum block">
              ₦48,200,000
            </span>
            <div className="mt-3 text-xs text-zinc-600">
              ~$32,100 eq. • Direct Escrow Settlement
            </div>
          </div>
        </div>
      </div>

      {/* MAIN TWO-COLUMN SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Active Jobs (7 Cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-5 border border-[#eae7e1] shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] font-extrabold uppercase text-zinc-500 tracking-wider block">
                Field Execution Queue
              </span>
              <h3 className="font-extrabold text-base text-[#140338]">
                Active Work Orders & Mounting Deployments
              </h3>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-white text-[#140338] text-xs font-black">
              3 High Priority
            </span>
          </div>

          <div className="space-y-3">
            {jobs.map((job) => (
              <div
                key={job.id}
                className="p-4 rounded-xl border border-[#eae7e1] bg-[#faf9f6] space-y-3 hover:bg-white transition-all"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-black text-xs text-[#140338]">{job.id}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-200 font-bold text-zinc-800">
                        {job.brand}
                      </span>
                    </div>
                    <h4 className="font-extrabold text-sm text-[#140338] mt-1">{job.campaignFlight}</h4>
                    <p className="text-xs text-zinc-500">{job.siteLocation}</p>
                  </div>

                  <div className="text-right">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-extrabold ${
                        job.status === 'Mounting'
                          ? 'bg-amber-100 text-amber-900'
                          : job.status === 'Printing'
                          ? 'bg-blue-100 text-blue-900'
                          : 'bg-emerald-100 text-emerald-900'
                      }`}
                    >
                      {job.status}
                    </span>
                    <span className="text-[10px] text-zinc-500 font-mono block mt-1">Due: {job.deadline}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-[#eae7e1] flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="text-zinc-600">
                    Specs: <strong>{job.dimensions}</strong> ({job.material}) • Crew: {job.crew}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => alert(`Opening engineering specs for ${job.id}...`)}
                      className="px-2.5 py-1 rounded-lg border border-zinc-300 hover:bg-zinc-100 text-zinc-700 font-semibold"
                    >
                      View Specs
                    </button>
                    <button
                      onClick={() => handleUploadProof(job.id)}
                      className="flex items-center gap-1.5 px-3 py-1 bg-white hover:bg-zinc-100 text-[#140338] border border-zinc-200 font-bold rounded-lg shadow-2xs"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload Gantry Photo</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Equipment Telemetry & Structural QA (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Grand-Format Print Machinery Telemetry */}
          <div className="bg-white rounded-2xl p-5 border border-[#eae7e1] shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-base text-[#140338]">
                Grand-Format Print Fleet Telemetry
              </h3>
              <Cpu className="w-4 h-4 text-zinc-400" />
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="p-3 rounded-xl bg-[#faf9f6] border border-[#eae7e1]">
                <div className="flex justify-between font-bold text-[#140338]">
                  <span>EFI VUTEk 5r+ (Lagos Factory)</span>
                  <span className="text-emerald-700">Active (120 m²/h)</span>
                </div>
                <div className="mt-2 flex justify-between text-[11px] text-zinc-500">
                  <span>Ink Levels: 84% Cyan / 88% Magenta</span>
                  <span>Queue: 4 Jobs</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#faf9f6] border border-[#eae7e1]">
                <div className="flex justify-between font-bold text-[#140338]">
                  <span>Durst Rho 512R (Nairobi Factory)</span>
                  <span className="text-emerald-700">Active (95 m²/h)</span>
                </div>
                <div className="mt-2 flex justify-between text-[11px] text-zinc-500">
                  <span>Ink Levels: 72% Cyan / 76% Black</span>
                  <span>Queue: 2 Jobs</span>
                </div>
              </div>
            </div>
          </div>

          {/* Safety & Structural Engineering Sign-off */}
          <div className="bg-white rounded-2xl p-5 border border-[#eae7e1] shadow-2xs space-y-3">
            <h3 className="font-extrabold text-base text-[#140338]">
              Structural Rigging Safety Compliance
            </h3>

            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
                <span className="font-bold text-emerald-950">Wind Load Certification: 140 km/h rated</span>
                <span className="text-emerald-700 font-bold">Passed ✓</span>
              </div>
              <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
                <span className="font-bold text-emerald-950">Lagos Safety Commission (LSC) Permit</span>
                <span className="text-emerald-700 font-bold">Active ✓</span>
              </div>
              <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
                <span className="font-bold text-emerald-950">Electrical Grounding & Surge Arrestors</span>
                <span className="text-emerald-700 font-bold">Passed ✓</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
