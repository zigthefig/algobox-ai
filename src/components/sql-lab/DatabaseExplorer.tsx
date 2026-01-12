import { useState } from "react";
import { ChevronDown, ChevronRight, Table, Key, Link } from "lucide-react";
import { databases, Database } from "@/lib/sql-lab/databases/sampleData";
import { cn } from "@/lib/utils";

interface DatabaseExplorerProps {
    selectedDb: string;
    onSelectDb: (db: string) => void;
    onTableClick?: (tableName: string) => void;
}

export function DatabaseExplorer({ selectedDb, onSelectDb, onTableClick }: DatabaseExplorerProps) {
    const [expandedTables, setExpandedTables] = useState<string[]>([]);

    const currentDb = databases[selectedDb as keyof typeof databases];

    const toggleTable = (tableName: string) => {
        setExpandedTables((prev) =>
            prev.includes(tableName) ? prev.filter((t) => t !== tableName) : [...prev, tableName]
        );
    };

    return (
        <div className="h-full flex flex-col bg-slate-900/50 rounded-lg border border-slate-700">
            {/* Database Selector */}
            <div className="p-3 border-b border-slate-700">
                <label className="text-xs text-slate-400 mb-1 block">Database</label>
                <select
                    value={selectedDb}
                    onChange={(e) => onSelectDb(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-600 rounded-md px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    {Object.entries(databases).map(([key, db]) => (
                        <option key={key} value={key}>
                            {db.name}
                        </option>
                    ))}
                </select>
            </div>

            {/* Tables List */}
            <div className="flex-1 overflow-auto p-2">
                <div className="text-xs text-slate-400 px-2 py-1 mb-1">Tables</div>
                {Object.entries(currentDb.tables).map(([tableName, table]) => (
                    <div key={tableName} className="mb-1">
                        {/* Table Header */}
                        <button
                            onClick={() => toggleTable(tableName)}
                            className={cn(
                                "w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm text-left",
                                "hover:bg-slate-800 transition-colors",
                                expandedTables.includes(tableName) && "bg-slate-800"
                            )}
                        >
                            {expandedTables.includes(tableName) ? (
                                <ChevronDown className="h-4 w-4 text-slate-400" />
                            ) : (
                                <ChevronRight className="h-4 w-4 text-slate-400" />
                            )}
                            <Table className="h-4 w-4 text-blue-400" />
                            <span className="text-slate-200 font-medium">{tableName}</span>
                            <span className="text-slate-500 text-xs ml-auto">
                                {table.data.length} rows
                            </span>
                        </button>

                        {/* Columns */}
                        {expandedTables.includes(tableName) && (
                            <div className="ml-4 pl-4 border-l border-slate-700 mt-1">
                                {table.columns.map((col) => (
                                    <div
                                        key={col.name}
                                        className="flex items-center gap-2 px-2 py-1 text-xs"
                                    >
                                        {col.primaryKey ? (
                                            <Key className="h-3 w-3 text-yellow-500" />
                                        ) : col.foreignKey ? (
                                            <Link className="h-3 w-3 text-green-500" />
                                        ) : (
                                            <div className="w-3" />
                                        )}
                                        <span className="text-slate-300">{col.name}</span>
                                        <span className="text-slate-500">{col.type}</span>
                                        {col.foreignKey && (
                                            <span className="text-green-400 text-[10px]">
                                                → {col.foreignKey.table}.{col.foreignKey.column}
                                            </span>
                                        )}
                                    </div>
                                ))}
                                {/* Preview button */}
                                <button
                                    onClick={() => onTableClick?.(tableName)}
                                    className="mt-1 px-2 py-1 text-xs text-blue-400 hover:text-blue-300 hover:bg-slate-800 rounded"
                                >
                                    Preview Data
                                </button>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
