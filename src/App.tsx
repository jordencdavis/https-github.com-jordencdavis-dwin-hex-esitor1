/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { DwinProvider, useDwin } from './context/DwinContext';
import { Header } from './components/Header';
import { ScreenRegistry } from './components/ScreenRegistry/ScreenRegistry';
import { ParameterRegistry } from './components/ParameterRegistry/ParameterRegistry';
import { RelationshipExplorer } from './components/RelationshipExplorer/RelationshipExplorer';
import { HexLab } from './components/HexLab/HexLab';
import { ImportExport } from './components/ImportExport/ImportExport';
import { Settings } from 'lucide-react';

const WorkspaceContent: React.FC = () => {
  const { activeTab, project, updateProjectMetadata } = useDwin();
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [modelName, setModelName] = useState(project.dwinModel);
  const [projectName, setProjectName] = useState(project.name);
  const [resolution, setResolution] = useState(project.resolution);
  const [headerHex, setHeaderHex] = useState(project.headerHex);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      <Header />

      {/* Sub-header Context / Breadcrumb Bar */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-full mx-auto px-3 sm:px-4 lg:px-6 py-2 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <span className="font-semibold text-slate-900 truncate max-w-xs sm:max-w-md">
              {project.name}
            </span>
            <span className="text-slate-300" aria-hidden="true">|</span>
            <span className="font-mono text-slate-600">
              {project.dwinModel}
            </span>
            <span className="text-slate-300 hidden sm:inline" aria-hidden="true">|</span>
            <span className="font-mono text-slate-500 hidden sm:inline">
              Res: {project.resolution}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="font-mono text-[11px] text-slate-500">
              Header: <span className="font-bold text-slate-800">{project.headerHex}</span>
            </span>
            <button
              onClick={() => {
                setProjectName(project.name);
                setModelName(project.dwinModel);
                setResolution(project.resolution);
                setHeaderHex(project.headerHex);
                setIsConfigModalOpen(true);
              }}
              className="p-1 rounded text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              title="Project Hardware Configuration"
            >
              <Settings className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Workspace Body */}
      <main className="flex-1 max-w-full w-full mx-auto px-3 sm:px-4 lg:px-6 py-4">
        {activeTab === 'screens' && <ScreenRegistry />}
        {activeTab === 'parameters' && <ParameterRegistry />}
        {activeTab === 'explorer' && <RelationshipExplorer />}
        {activeTab === 'hexlab' && <HexLab />}
        {activeTab === 'import_export' && <ImportExport />}
      </main>

      {/* Engineering Footer */}
      <footer className="border-t border-slate-200 bg-white py-3 mt-auto">
        <div className="max-w-full mx-auto px-3 sm:px-4 lg:px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div>
            DWIN DGUS II Protocol Standard · Commands: <code className="font-mono text-slate-800 bg-blue-50 border border-blue-200 px-1.5 py-0.5 rounded font-semibold">0x82</code> Write to VP (RAM / Variable memory), <code className="font-mono text-slate-800 bg-blue-50 border border-blue-200 px-1.5 py-0.5 rounded font-semibold">0x83</code> Read from VP (RAM / Variable memory), <code className="font-mono text-slate-800 bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded font-semibold">0x0084</code> Page Jump
          </div>
          <div className="font-mono text-[11px] text-slate-500">
            DWIN HEX Design Software
          </div>
        </div>
      </footer>

      {/* Hardware Settings Modal */}
      {isConfigModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-lg max-w-lg w-full p-6 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              Target Hardware &amp; Project Config
            </h3>
            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-medium mb-1">
                  Project Title
                </label>
                <input
                  type="text"
                  value={projectName}
                  onChange={e => setProjectName(e.target.value)}
                  className="w-full px-3 py-1.5 rounded border border-slate-300 bg-slate-50 text-slate-900"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">
                  DWIN Display Model / ASIC
                </label>
                <input
                  type="text"
                  value={modelName}
                  onChange={e => setModelName(e.target.value)}
                  className="w-full px-3 py-1.5 rounded border border-slate-300 bg-slate-50 text-slate-900 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">
                    Screen Resolution
                  </label>
                  <select
                    value={resolution}
                    onChange={e => setResolution(e.target.value)}
                    className="w-full px-3 py-1.5 rounded border border-slate-300 bg-slate-50 text-slate-900 font-mono"
                  >
                    <option value="800x480">800x480 (7-inch / 5-inch)</option>
                    <option value="1024x600">1024x600 (7-inch / 10-inch)</option>
                    <option value="480x272">480x272 (4.3-inch)</option>
                    <option value="1280x800">1280x800 (10.1-inch)</option>
                    <option value="320x240">320x240 (3.5-inch)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-medium mb-1 font-mono">
                    Frame Header (Hex)
                  </label>
                  <input
                    type="text"
                    value={headerHex}
                    onChange={e => setHeaderHex(e.target.value)}
                    className="w-full px-3 py-1.5 rounded border border-slate-300 bg-slate-50 text-slate-900 font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsConfigModalOpen(false)}
                  className="px-3 py-1.5 rounded border border-slate-300 text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    updateProjectMetadata({
                      name: projectName,
                      dwinModel: modelName,
                      resolution,
                      headerHex
                    });
                    setIsConfigModalOpen(false);
                  }}
                  className="px-3.5 py-1.5 rounded bg-blue-600 text-white font-medium hover:bg-blue-700"
                >
                  Save Configuration
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default function App() {
  return (
    <DwinProvider>
      <WorkspaceContent />
    </DwinProvider>
  );
}
