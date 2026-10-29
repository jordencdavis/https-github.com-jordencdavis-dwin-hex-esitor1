/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useDwin } from '../../context/DwinContext';
import { generateCHeader, generatePythonDriver, generateCsvExport } from '../../utils/codeExport';
import { DwinProject } from '../../types/dwin';
import { 
  Download, Upload, Copy, Check, FileCode, FileText, 
  RotateCcw, CheckCircle2, AlertTriangle
} from 'lucide-react';

export const ImportExport: React.FC = () => {
  const { project, importProject, resetProjectToDefault } = useDwin();
  const [activeExportTab, setActiveExportTab] = useState<'project_json' | 'c_header' | 'python' | 'csv'>('project_json');
  const [copied, setCopied] = useState<string | null>(null);
  const [importStatus, setImportStatus] = useState<{ status: 'idle' | 'success' | 'error'; message: string }>({
    status: 'idle',
    message: ''
  });

  const cHeaderCode = generateCHeader(project);
  const pythonCode = generatePythonDriver(project);
  const csvData = generateCsvExport(project);
  const projectJson = JSON.stringify(project, null, 2);

  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleDownload = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = event => {
      try {
        const text = event.target?.result as string;
        const parsed: DwinProject = JSON.parse(text);
        if (!parsed.screens || !parsed.parameters) {
          throw new Error('Missing screens or parameters array.');
        }
        importProject(parsed);
        setImportStatus({
          status: 'success',
          message: `Successfully imported "${parsed.name}" (${parsed.screens.length} screens, ${parsed.parameters.length} parameters).`
        });
      } catch (err: any) {
        setImportStatus({
          status: 'error',
          message: `Import failed: ${err.message || 'Invalid JSON project format.'}`
        });
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 rounded-lg p-5 shadow-xs">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Import &amp; Export
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Backup and restore your DWIN DGUS design project, or generate production C/C++ firmware headers, Python test drivers, and CSV variable tables.
          </p>
        </div>

        <button
          onClick={() => {
            resetProjectToDefault();
            setImportStatus({ status: 'success', message: 'Project reset to default sample project.' });
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded border border-slate-300 hover:bg-slate-50 text-slate-700 font-medium"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset to Default</span>
        </button>
      </div>

      {/* Import File Section */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-4 shadow-xs">
        <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
          <Upload className="w-4 h-4 text-blue-600" />
          <span>Import Project File (.json / .dwinhex)</span>
        </h2>

        <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-blue-500 bg-slate-50/50 transition-colors">
          <input
            type="file"
            accept=".json,.dwinhex"
            onChange={handleFileUpload}
            id="file-upload"
            className="hidden"
          />
          <label htmlFor="file-upload" className="cursor-pointer space-y-2 block">
            <Upload className="w-8 h-8 text-slate-400 mx-auto" />
            <div className="text-xs font-semibold text-slate-900">
              Click to select a JSON project file or drag and drop here
            </div>
            <div className="text-[11px] text-slate-500">
              Restores all screens, parameter definitions, VP memory addresses, and navigation linkages.
            </div>
          </label>
        </div>

        {importStatus.status === 'success' && (
          <div className="p-3 rounded bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{importStatus.message}</span>
          </div>
        )}

        {importStatus.status === 'error' && (
          <div className="p-3 rounded bg-red-50 border border-red-200 text-xs text-red-800 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{importStatus.message}</span>
          </div>
        )}
      </div>

      {/* Export Tabs Section */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2">
            <Download className="w-4 h-4 text-blue-600" />
            <h2 className="text-sm font-semibold text-slate-900">
              Export Project &amp; Code
            </h2>
          </div>

          <div className="flex items-center gap-1 overflow-x-auto text-xs border border-slate-200 p-1 rounded-lg bg-slate-50">
            <button
              onClick={() => setActiveExportTab('project_json')}
              className={`px-3 py-1.5 rounded-md font-medium whitespace-nowrap transition-colors ${
                activeExportTab === 'project_json'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Project JSON
            </button>
            <button
              onClick={() => setActiveExportTab('c_header')}
              className={`px-3 py-1.5 rounded-md font-medium whitespace-nowrap transition-colors ${
                activeExportTab === 'c_header'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              C/C++ Header (.h)
            </button>
            <button
              onClick={() => setActiveExportTab('python')}
              className={`px-3 py-1.5 rounded-md font-medium whitespace-nowrap transition-colors ${
                activeExportTab === 'python'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Python Driver (.py)
            </button>
            <button
              onClick={() => setActiveExportTab('csv')}
              className={`px-3 py-1.5 rounded-md font-medium whitespace-nowrap transition-colors ${
                activeExportTab === 'csv'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              CSV Table (.csv)
            </button>
          </div>
        </div>

        {/* Export Preview Area - Clean Light Code Preview (No Black Background) */}
        {activeExportTab === 'project_json' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>Complete design file with {project.screens.length} screens and {project.parameters.length} parameters</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopy(projectJson, 'json')}
                  className="px-2.5 py-1 rounded border border-slate-300 hover:bg-slate-50 flex items-center gap-1 font-medium text-slate-700"
                >
                  {copied === 'json' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>Copy JSON</span>
                </button>
                <button
                  onClick={() => handleDownload(projectJson, `${project.name.toLowerCase().replace(/\s+/g, '_')}_dwin.json`, 'application/json')}
                  className="px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1 font-medium shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download .json</span>
                </button>
              </div>
            </div>
            <pre className="p-4 bg-slate-50 text-slate-800 rounded-lg font-mono text-xs max-h-96 overflow-y-auto border border-slate-300 shadow-inner">
              {projectJson}
            </pre>
          </div>
        )}

        {activeExportTab === 'c_header' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>Embedded C/C++ macro header file for STM32, ESP32, Arduino, or NXP MCU firmware</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopy(cHeaderCode, 'c')}
                  className="px-2.5 py-1 rounded border border-slate-300 hover:bg-slate-50 flex items-center gap-1 font-medium text-slate-700"
                >
                  {copied === 'c' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>Copy Header</span>
                </button>
                <button
                  onClick={() => handleDownload(cHeaderCode, 'dwin_vp_defs.h', 'text/x-c')}
                  className="px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1 font-medium shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download dwin_vp_defs.h</span>
                </button>
              </div>
            </div>
            <pre className="p-4 bg-slate-50 text-slate-800 rounded-lg font-mono text-xs max-h-96 overflow-y-auto border border-slate-300 shadow-inner">
              {cHeaderCode}
            </pre>
          </div>
        )}

        {activeExportTab === 'python' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>Python driver script with packet builders and dictionaries for serial UART bench testing</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopy(pythonCode, 'py')}
                  className="px-2.5 py-1 rounded border border-slate-300 hover:bg-slate-50 flex items-center gap-1 font-medium text-slate-700"
                >
                  {copied === 'py' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>Copy Python</span>
                </button>
                <button
                  onClick={() => handleDownload(pythonCode, 'dwin_protocol.py', 'text/x-python')}
                  className="px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1 font-medium shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download dwin_protocol.py</span>
                </button>
              </div>
            </div>
            <pre className="p-4 bg-slate-50 text-slate-800 rounded-lg font-mono text-xs max-h-96 overflow-y-auto border border-slate-300 shadow-inner">
              {pythonCode}
            </pre>
          </div>
        )}

        {activeExportTab === 'csv' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>Comma-separated table ready for Excel, Google Sheets, or DGUS design documentation</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopy(csvData, 'csv')}
                  className="px-2.5 py-1 rounded border border-slate-300 hover:bg-slate-50 flex items-center gap-1 font-medium text-slate-700"
                >
                  {copied === 'csv' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>Copy CSV</span>
                </button>
                <button
                  onClick={() => handleDownload(csvData, `${project.name.toLowerCase().replace(/\s+/g, '_')}_parameters.csv`, 'text/csv')}
                  className="px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1 font-medium shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download .csv</span>
                </button>
              </div>
            </div>
            <pre className="p-4 bg-slate-50 text-slate-800 rounded-lg font-mono text-xs max-h-96 overflow-y-auto border border-slate-300 whitespace-pre-wrap shadow-inner">
              {csvData}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};
