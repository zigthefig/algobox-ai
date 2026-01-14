import { useState } from "react";
import { ChevronDown, ChevronRight, Table, Key, Link, History, Table2 } from "lucide-react";
import { databases, Database } from "@/lib/sql-lab/databases/sampleData";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import Mermaid from "@/components/Mermaid";

interface DatabaseExplorerProps {
    selectedDb: string;
    onSelectDb: (db: string) => void;
    onTableClick?: (tableName: string) => void;
    history?: { query: string, timestamp: number }[];
    onHistorySelect?: (query: string) => void;
}

export function DatabaseExplorer({ selectedDb, onSelectDb, onTableClick, history = [], onHistorySelect }: DatabaseExplorerProps) {
    const [expandedTables, setExpandedTables] = useState<string[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [activeTab, setActiveTab] = useState("tables");

    const currentDb = databases[selectedDb as keyof typeof databases];

    const generateSchemaDiagram = () => {
        if (!currentDb) return "";
        let mermaidCode = "erDiagram\n";
        Object.entries(currentDb.tables).forEach(([tableName, table]) => {
            mermaidCode += `  ${tableName} {\n`;
            table.columns.forEach(col => {
                mermaidCode += `    ${col.type} ${col.name} ${col.primaryKey ? "PK" : ""} ${col.foreignKey ? "FK" : ""}\n`;
            });
            mermaidCode += `  }\n`;
        });
        return mermaidCode;
    };

    const toggleTable = (tableName: string) => {
        setExpandedTables((prev) =>
            prev.includes(tableName) ? prev.filter((t) => t !== tableName) : [...prev, tableName]
        );
    };

    return (
        <div className="h-full flex flex-col bg-slate-900/50 rounded-lg border border-slate-700 overflow-hidden">
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

            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
                <div className="px-3 border-b border-slate-700 bg-slate-800/50">
                    <TabsList className="w-full justify-start h-9 bg-transparent p-0">
                        <TabsTrigger value="tables" className="text-xs px-3 h-8 data-[state=active]:bg-slate-700 data-[state=active]:text-blue-400 rounded-none border-b-2 border-transparent data-[state=active]:border-blue-400">Tables</TabsTrigger>
                        <TabsTrigger value="schema" className="text-xs px-3 h-8 data-[state=active]:bg-slate-700 data-[state=active]:text-blue-400 rounded-none border-b-2 border-transparent data-[state=active]:border-blue-400">Schema</TabsTrigger>
                        <TabsTrigger value="history" className="text-xs px-3 h-8 data-[state=active]:bg-slate-700 data-[state=active]:text-blue-400 rounded-none border-b-2 border-transparent data-[state=active]:border-blue-400">History</TabsTrigger>
                    </TabsList>
                </div>

                <TabsContent value="tables" className="flex-1 overflow-auto p-0 m-0">
                    <div className="p-2">
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
                </TabsContent>

                <TabsContent value="schema" className="flex-1 overflow-auto p-0 m-0 bg-slate-950">
                    <div className="h-full min-h-[300px] flex items-center justify-center p-4">
                        <Mermaid chart={generateSchemaDiagram()} />
                    </div>
                </TabsContent>

                <TabsContent value="history" className="flex-1 overflow-auto p-0 m-0">
                    <ScrollArea className="h-full">
                        <div className="p-2 space-y-1">
                            {history.length === 0 && <div className="text-xs text-slate-500 text-center py-8">No history yet</div>}
                            {history.map((h, i) => (
                                <button
                                    key={i}
                                    onClick={() => onHistorySelect?.(h.query)}
                                    className="w-full text-left p-2 rounded hover:bg-slate-800 group border border-transparent hover:border-slate-700 transition-all"
                                >
                                    <div className="text-xs font-mono text-blue-300 truncate mb-1">{h.query}</div>
                                    <div className="text-[10px] text-slate-500 flex justify-between items-center">
                                        <span>{new Date(h.timestamp).toLocaleTimeString()}</span>
                                        <History className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity text-slate-400" />
                                    </div>
                                </button>
                            ))}
                        </div>
                    </ScrollArea>
                </TabsContent>
            </Tabs>
        </div>
    );
}
