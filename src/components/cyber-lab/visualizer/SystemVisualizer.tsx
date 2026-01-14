import { motion } from "framer-motion";
import { Server, Database, User, FileCode, Shield, Lock } from "lucide-react";
import { CyberStep } from "../types";

interface SystemVisualizerProps {
    step: CyberStep;
    mode: "attack" | "defense";
}

export function SystemVisualizer({ step, mode }: SystemVisualizerProps) {
    const { client, server, database, packet } = step.state;

    return (
        <div className="w-full h-full flex items-center justify-center p-10 relative">
            {/* Trust Boundary Lines */}
            <div className="absolute left-1/3 top-0 bottom-0 border-r border-dashed border-red-500/20" />
            <div className="absolute left-[200px] top-10 text-[10px] text-red-500/50 font-mono tracking-widest uppercase rotate-90 origin-left">
                Untrusted Zone
            </div>

            <div className="absolute right-1/3 top-0 bottom-0 border-r border-dashed border-green-500/20" />
            <div className="absolute right-[200px] top-10 text-[10px] text-green-500/50 font-mono tracking-widest uppercase rotate-90 origin-left">
                Trusted Zone
            </div>

            <div className="flex items-center justify-between w-full max-w-4xl relative z-10">
                {/* Client Node */}
                <div className="flex flex-col items-center gap-4 w-32">
                    <div className={`w-20 h-20 rounded-full flex items-center justify-center border-2 bg-slate-800 transition-colors
                        ${client.status === "hacked" ? "border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.3)]" : "border-slate-600"}
                    `}>
                        <User className={`h-8 w-8 ${client.status === "hacked" ? "text-red-500" : "text-slate-300"}`} />
                    </div>
                    <div className="text-center">
                        <div className="font-bold text-slate-200">Attacker</div>
                        <div className="text-xs text-slate-500 font-mono mt-1">
                            {client.message ? (
                                <span className={client.status === "hacked" ? "text-red-400" : "text-yellow-400"}>
                                    "{client.message}"
                                </span>
                            ) : "Idle"}
                        </div>
                    </div>
                </div>

                {/* Packet Animation Layer */}
                {packet && (
                    <motion.div
                        className={`absolute top-1/2 -mt-6 z-20 flex flex-col items-center
                             ${packet.type === "malicious" ? "text-red-500" : packet.type === "secure" ? "text-green-500" : "text-blue-400"}
                        `}
                        initial={{ left: packet.from === "client" ? "10%" : packet.from === "server" && packet.to === "client" ? "50%" : "50%", opacity: 0 }}
                        animate={{
                            left: packet.from === "client" && packet.to === "server" ? "42%" :
                                packet.from === "server" && packet.to === "database" ? "82%" :
                                    packet.from === "database" && packet.to === "server" ? "58%" : "10%",
                            opacity: 1
                        }}
                        transition={{ duration: 0.8, ease: "easeInOut" }}
                    >
                        <FileCode className="h-8 w-8" />
                        <div className="text-[10px] font-mono mt-1 bg-black/80 px-1 rounded whitespace-nowrap">
                            {packet.content}
                        </div>
                    </motion.div>
                )}

                {/* Server Node */}
                <div className="flex flex-col items-center gap-4 w-40">
                    <div className={`w-24 h-24 rounded-lg flex items-center justify-center border-2 bg-slate-800 transition-colors relative
                        ${server.status === "compromised" ? "border-red-500 bg-red-950/20" :
                            server.status === "secure" ? "border-green-500 bg-green-950/20" : "border-indigo-500"}
                    `}>
                        <Server className={`h-10 w-10 ${server.status === "compromised" ? "text-red-500" : "text-indigo-400"}`} />
                        {server.status === "secure" && (
                            <div className="absolute -top-2 -right-2 bg-green-500 text-black rounded-full p-1">
                                <Shield className="h-3 w-3" />
                            </div>
                        )}
                        {server.status === "compromised" && (
                            <div className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 animate-pulse">
                                !
                            </div>
                        )}
                    </div>
                    <div className="text-center">
                        <div className="font-bold text-slate-200">App Server</div>
                        <div className="text-xs text-slate-500 mt-1 max-w-[150px]">
                            {server.query ? (
                                <span className={`font-mono block p-1 rounded ${mode === "attack" ? "bg-red-900/20 text-red-200" : "bg-green-900/20 text-green-200"}`}>
                                    {server.query}
                                </span>
                            ) : "Processing..."}
                        </div>
                    </div>
                </div>

                {/* Database Node */}
                <div className="flex flex-col items-center gap-4 w-32">
                    <div className={`w-20 h-20 rounded-lg flex items-center justify-center border-2 bg-slate-800 transition-colors gap-1
                        ${database.status === "leaking" ? "border-red-500 animate-pulse" : "border-slate-600"}
                     `}>
                        <Database className="h-8 w-8 text-slate-300" />
                        {database.status === "secure" && <Lock className="h-4 w-4 text-green-500" />}
                    </div>
                    <div className="text-center">
                        <div className="font-bold text-slate-200">Database</div>
                        <div className="text-xs text-slate-500 mt-1">
                            {database.status === "leaking" ? "DATA LEAK!" : "Secure"}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
