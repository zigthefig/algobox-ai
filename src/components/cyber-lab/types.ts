export type NodeType = "client" | "server" | "database" | "attacker" | "firewall" | "router";
export type NodeStatus = "idle" | "active" | "compromised" | "secure" | "offline";
export type PacketType = "data" | "query" | "response" | "exploit" | "encrypted";

export interface CyberNode {
    id: string;
    type: NodeType;
    label: string;
    x: number; // Relative position (0-100)
    y: number; // Relative position (0-100)
    status: NodeStatus;
    data?: string; // Content displayed on node (e.g., query, code)
    isCompromised?: boolean;
    hasShield?: boolean;
}

export interface CyberLink {
    source: string;
    target: string;
    label?: string;
    dashed?: boolean; // For "wireless" or logical connections
}

export interface CyberPacket {
    id: string;
    source: string;
    target: string;
    type: PacketType;
    content: string; // Text to show in the packet
    progress: number; // 0 to 1 animatable value (useful if we control animation frame, but for step-based, we might just define 'in-transit')
}

export interface CyberState {
    nodes: CyberNode[];
    links: CyberLink[];
    packets: CyberPacket[];
    message?: string; // General status message
}

export interface CyberStep {
    id: number;
    phase: string;
    description: string;
    state: CyberState;
    explanation?: {
        title: string;
        content: string;
        type: "info" | "warning" | "error" | "success";
    };
}

export interface LabScenario {
    id: string;
    title: string;
    description: string;
    difficulty: "Beginner" | "Intermediate" | "Advanced";
    steps: CyberStep[];
    fixSteps: CyberStep[];
    topology: { // Base topology
        nodes: Omit<CyberNode, "status" | "data">[];
        links: CyberLink[];
    };
}
