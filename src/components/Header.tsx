/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useDwin } from '../context/DwinContext';
import { LayoutGrid, Cpu, Network, Binary, ArrowDownUp } from 'lucide-react';

export const Header: React.FC = () => {
  const { activeTab, setActiveTab, stats } = useDwin();

  return (
    <header className="border-b border-slate-200 bg-white sticky top-0 z-40 shadow-xs">
      <div className="max-w-full mx-auto px-3 sm:px-4 lg:px-6 h-14 flex items-center justify-between gap-4">
        {/* Zone 1: Brand wordmark */}
        <div className="flex items-center gap-3 whitespace-nowrap shrink-0">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-mono font-bold text-sm tracking-wider shadow-xs">
            DW
          </div>
          <div>
            <span className="text-base font-bold tracking-tight text-slate-900">
              DWIN HEX Design Software
            </span>
          </div>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="flex items-center gap-1 sm:gap-2">
          <button
            onClick={() => setActiveTab('screens')}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'screens'
                ? 'bg-blue-50 text-blue-700 font-semibold border border-blue-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Screen Registry</span>
            <span className="text-[11px] text-slate-400 font-mono">({stats.totalScreens})</span>
          </button>

          <button
            onClick={() => setActiveTab('parameters')}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'parameters'
                ? 'bg-blue-50 text-blue-700 font-semibold border border-blue-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>Parameter Registry</span>
            <span className="text-[11px] text-slate-400 font-mono">({stats.totalParameters})</span>
          </button>

          <button
            onClick={() => setActiveTab('explorer')}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'explorer'
                ? 'bg-blue-50 text-blue-700 font-semibold border border-blue-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Network className="w-3.5 h-3.5" />
            <span>Audit</span>
            {stats.duplicateVpCount > 0 ? (
              <span className="text-[11px] text-amber-600 font-mono font-medium">({stats.duplicateVpCount} conflict)</span>
            ) : null}
          </button>

          <button
            onClick={() => setActiveTab('hexlab')}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'hexlab'
                ? 'bg-blue-50 text-blue-700 font-semibold border border-blue-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Binary className="w-3.5 h-3.5" />
            <span>HEX Lab</span>
          </button>

          <button
            onClick={() => setActiveTab('import_export')}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'import_export'
                ? 'bg-blue-50 text-blue-700 font-semibold border border-blue-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <ArrowDownUp className="w-3.5 h-3.5" />
            <span>Import &amp; Export</span>
          </button>
        </nav>

        {/* Zone 3: 1 Primary Action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setActiveTab('hexlab')}
            className="px-3.5 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 shadow-xs"
          >
            <Binary className="w-3.5 h-3.5" />
            <span>Test HEX Frame</span>
          </button>
        </div>
      </div>
    </header>
  );
};
