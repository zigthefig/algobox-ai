import { LabScenario, CyberState } from "../types";

const baseTopology = {
    nodes: [
        { id: "client", type: "client" as const, label: "Alice", x: 10, y: 30 },
        { id: "attacker", type: "attacker" as const, label: "Eve", x: 30, y: 70 }, // Positioned to "intercept" visual path
        { id: "router", type: "router" as const, label: "WiFi Router", x: 50, y: 30 },
        { id: "server", type: "server" as const, label: "Bank", x: 90, y: 30 },
    ],
    links: [
        { source: "client", target: "router", label: "Normal Path" },
        { source: "router", target: "server" },
        // Attacker links (initially hidden or phantom)
        { source: "attacker", target: "client", dashed: true, label: "Spoofed" },
        { source: "attacker", target: "router", dashed: true, label: "Spoofed" },
    ]
};

const getBaseState = (updates: Partial<CyberState> = {}): CyberState => ({
    nodes: baseTopology.nodes.map(n => ({ ...n, status: "idle" })),
    links: baseTopology.links.slice(0, 2), // Start with only normal links
    packets: [],
    ...updates
});

export const mitmLab: LabScenario = {
    id: "mitm",
    title: "Man-in-the-Middle: ARP Poisoning",
    description: "Step-by-step ARP Spoofing attack to intercept traffic on a local network.",
    difficulty: "Intermediate",
    topology: baseTopology,
    steps: [
        {
            id: 1,
            phase: "Baseline",
            description: "Normal traffic flow between Alice and the Router.",
            state: getBaseState({
                nodes: [
                    { ...baseTopology.nodes[0], status: "active", type: "client" },
                    { ...baseTopology.nodes[2], status: "active", type: "router" }
                ],
                packets: [{ id: "p0", source: "client", target: "router", type: "data", content: "Hello", progress: 0.5 }]
            }),
            explanation: { title: "Normal Operation", content: "Alice asks the Router to send data to the Bank. The Router forwards it.", type: "info" }
        },
        {
            id: 2,
            phase: "ARP Poisoning",
            description: "Eve broadcasts fake ARP replies to Alice and Router.",
            state: getBaseState({
                links: baseTopology.links, // Show attacker links now
                nodes: [
                    { ...baseTopology.nodes[1], status: "active", data: "I am Router! / I am Alice!", type: "attacker" }
                ],
                packets: [
                    { id: "arp1", source: "attacker", target: "client", type: "exploit", content: "ARP: Router is Me", progress: 0.5 },
                    { id: "arp2", source: "attacker", target: "router", type: "exploit", content: "ARP: Alice is Me", progress: 0.5 }
                ]
            }),
            explanation: {
                title: "Identity Theft (Layer 2)",
                content: "Eve tells Alice 'I am the Router' and tells the Router 'I am Alice'. Both update their ARP caches incorrectly.",
                type: "error"
            }
        },
        {
            id: 3,
            phase: "Traffic Redirection",
            description: "Alice's traffic now flows to Eve instead of the Router.",
            state: getBaseState({
                links: baseTopology.links,
                nodes: [
                    { ...baseTopology.nodes[0], status: "active", type: "client" },
                    { ...baseTopology.nodes[1], status: "compromised", data: "Handling Traffic", type: "attacker" }
                ],
                packets: [
                    { id: "p1", source: "client", target: "attacker", type: "data", content: "PASS: secret123", progress: 0.5 }
                ]
            }),
            explanation: {
                title: "Interception",
                content: "Because Alice thinks Eve's MAC address belongs to the Router, she sends her sensitive data directly to Eve.",
                type: "error"
            }
        },
        {
            id: 4,
            phase: "Forwarding",
            description: "Eve logs the data and forwards it to the Router to avoid suspicion.",
            state: getBaseState({
                links: baseTopology.links,
                nodes: [
                    { ...baseTopology.nodes[1], status: "compromised", data: "LOGGED: secret123", type: "attacker" },
                    { ...baseTopology.nodes[2], status: "active", type: "router" }
                ],
                packets: [
                    { id: "p2", source: "attacker", target: "router", type: "data", content: "PASS: secret123", progress: 0.5 }
                ]
            }),
            explanation: {
                title: "Invisible Proxy",
                content: "Eve acts as a bridge. The connection works, so Alice has no idea she's being watched.",
                type: "warning"
            }
        },
        {
            id: 5,
            phase: "Effect",
            description: "Eve has the credentials. The Bank logs Alice in normally.",
            state: getBaseState({
                links: baseTopology.links,
                nodes: [
                    { ...baseTopology.nodes[1], status: "compromised", label: "Eve (Credentials Stolen)", type: "attacker" },
                    { ...baseTopology.nodes[3], status: "active", type: "server" }
                ]
            }),
            explanation: {
                title: "Attack Complete",
                content: "Confidentiality is lost. Eve owns the session.",
                type: "error"
            }
        }
    ],
    fixSteps: [
        {
            id: 1,
            phase: "Encryption",
            description: "Alice uses HTTPS (TLS/SSL).",
            state: getBaseState({
                links: baseTopology.links,
                nodes: [
                    { ...baseTopology.nodes[0], status: "secure", type: "client", hasShield: true },
                    { ...baseTopology.nodes[1], status: "active", type: "attacker" },
                    { ...baseTopology.nodes[3], status: "secure", type: "server", hasShield: true }
                ]
            }),
            explanation: { title: "Defense: Encryption", content: "TLS creates an encrypted tunnel. Even if traffic is redirected, the payload is unreadable.", type: "success" }
        },
        {
            id: 2,
            phase: "Encrypted Interception",
            description: "Eve captures the traffic, but it's garbage.",
            state: getBaseState({
                links: baseTopology.links,
                packets: [
                    { id: "p1", source: "client", target: "attacker", type: "encrypted", content: "x8$#kL9@...", progress: 0.5 }
                ]
            }),
            explanation: { title: "Data Unreadable", content: "Eve sees the packet, but without the private key, she cannot decrypt 'secret123'.", type: "success" }
        }
    ]
};
