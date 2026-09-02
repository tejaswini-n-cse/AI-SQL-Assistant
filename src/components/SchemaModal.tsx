import React, { useState } from 'react';
import { Database, X, Table, Key, Copy, Check, FileCode } from 'lucide-react';
import { SAMPLE_SCHEMAS } from '../data/mockSchemas.ts';

interface SchemaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShowToast: (type: 'success' | 'error' | 'info', title: string, message?: string) => void;
}

export function SchemaModal({ isOpen, onClose, onShowToast }: SchemaModalProps) {
  const [selectedSchemaId, setSelectedSchemaId] = useState<string>(SAMPLE_SCHEMAS[0].id);
  const [copiedTable, setCopiedTable] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentSchema =
    SAMPLE_SCHEMAS.find((s) => s.id === selectedSchemaId) || SAMPLE_SCHEMAS[0];

  const handleCopySchemaDdl = (tableName?: string) => {
    let ddl = '';
    if (tableName) {
      const table = currentSchema.tables.find((t) => t.name === tableName);
      if (table) {
        ddl = `CREATE TABLE ${table.name} (\n  ${table.columns
          .map((c) => `${c.name} ${c.type}${c.key === 'PK' ? ' PRIMARY KEY' : ''}`)
          .join(',\n  ')}\n);`;
      }
    } else {
      ddl = currentSchema.tables
        .map(
          (t) =>
            `CREATE TABLE ${t.name} (\n  ${t.columns
              .map((c) => `${c.name} ${c.type}${c.key === 'PK' ? ' PRIMARY KEY' : ''}`)
              .join(',\n  ')}\n);`
        )
        .join('\n\n');
    }

    navigator.clipboard.writeText(ddl);
    setCopiedTable(tableName || 'all');
    onShowToast('success', 'Schema DDL Copied', 'SQL CREATE TABLE definitions copied.');
    setTimeout(() => setCopiedTable(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-5 border-b border-neutral-800 flex items-center justify-between bg-neutral-950/60">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <Database className="h-5 w-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-neutral-100">
                Database Schema Scratchpad & Reference
              </h3>
              <p className="text-xs text-neutral-400">
                Explore relational schemas, column data types, keys, and sample records.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Database Selector Tabs */}
        <div className="px-5 py-3 border-b border-neutral-800 bg-neutral-950/40 flex items-center justify-between gap-3 overflow-x-auto">
          <div className="flex gap-2">
            {SAMPLE_SCHEMAS.map((sch) => (
              <button
                key={sch.id}
                onClick={() => setSelectedSchemaId(sch.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition shrink-0 cursor-pointer ${
                  selectedSchemaId === sch.id
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'bg-neutral-900 text-neutral-400 hover:text-neutral-200 border border-neutral-800'
                }`}
              >
                {sch.name}
              </button>
            ))}
          </div>

          <button
            onClick={() => handleCopySchemaDdl()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-medium border border-neutral-700 transition shrink-0 cursor-pointer"
          >
            {copiedTable === 'all' ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied Full DDL</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5 text-neutral-400" />
                <span>Copy Full DDL</span>
              </>
            )}
          </button>
        </div>

        {/* Schema Content */}
        <div className="p-5 overflow-y-auto space-y-6 flex-1">
          <div className="space-y-4">
            {currentSchema.tables.map((tbl) => (
              <div
                key={tbl.name}
                className="rounded-xl bg-neutral-950 border border-neutral-800 overflow-hidden shadow-md"
              >
                {/* Table Header */}
                <div className="px-4 py-3 bg-neutral-900/80 border-b border-neutral-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Table className="h-4 w-4 text-emerald-400" />
                    <span className="font-mono text-sm font-bold text-neutral-100">
                      {tbl.name}
                    </span>
                    <span className="text-xs text-neutral-400 font-sans hidden sm:inline">
                      &bull; {tbl.description}
                    </span>
                  </div>

                  <button
                    onClick={() => handleCopySchemaDdl(tbl.name)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-[11px] font-mono border border-neutral-700 transition"
                  >
                    {copiedTable === tbl.name ? (
                      <>
                        <Check className="h-3 w-3 text-emerald-400" />
                        <span className="text-emerald-400">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3" />
                        <span>Copy Table DDL</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Columns Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-mono">
                    <thead className="bg-neutral-900/40 text-neutral-400 uppercase tracking-wider text-[10px] border-b border-neutral-800">
                      <tr>
                        <th className="px-4 py-2">Column Name</th>
                        <th className="px-4 py-2">Type</th>
                        <th className="px-4 py-2">Key</th>
                        <th className="px-4 py-2 font-sans">Description</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-800/60">
                      {tbl.columns.map((col) => (
                        <tr key={col.name} className="hover:bg-neutral-900/30">
                          <td className="px-4 py-2 font-semibold text-neutral-200">
                            {col.name}
                          </td>
                          <td className="px-4 py-2 text-indigo-400">{col.type}</td>
                          <td className="px-4 py-2">
                            {col.key === 'PK' && (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                                PK
                              </span>
                            )}
                            {col.key === 'FK' && (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                                FK
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-2 font-sans text-neutral-400">
                            {col.description}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Sample Rows Data Preview */}
                {tbl.sampleData && tbl.sampleData.length > 0 && (
                  <div className="p-3 bg-neutral-900/40 border-t border-neutral-800 space-y-1.5">
                    <span className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider">
                      Sample Records ({tbl.sampleData.length} rows)
                    </span>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-[11px] font-mono text-neutral-300">
                        <thead className="text-[10px] text-neutral-400">
                          <tr>
                            {tbl.columns.map((c) => (
                              <th key={c.name} className="pr-3 py-1">
                                {c.name}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-800/40">
                          {tbl.sampleData.map((row, rIdx) => (
                            <tr key={rIdx}>
                              {tbl.columns.map((c) => (
                                <td key={c.name} className="pr-3 py-1 text-neutral-300">
                                  {row[c.name] === null ? (
                                    <span className="text-neutral-400 italic">NULL</span>
                                  ) : (
                                    String(row[c.name])
                                  )}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-neutral-800 bg-neutral-950/80 flex items-center justify-between">
          <span className="text-xs text-neutral-400">
            Use these schemas in the Generator or Practice modes for query testing.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold border border-neutral-700 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
