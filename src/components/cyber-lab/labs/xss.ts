import { LabScenario, CyberState, CyberNode, NodeStatus } from "../types";

const baseTopology = {
    nodes: [
        { id: "attacker", type: "attacker" as const, label: "Attacker", x: 10, y: 30 },
        { id: "server", type: "server" as const, label: "Social Media App", x: 50, y: 50 },
        { id: "db", type: "database" as const, label: "Comments DB", x: 80, y: 50 },
        { id: "victim", type: "client" as const, label: "Victim (Browsing)", x: 10, y: 70 },
    ],
    links: [
        { source: "attacker", target: "server", label: "Post Comment" },
        { source: "server", target: "db" },
        { source: "victim", target: "server", label: "View Comments" },
    ]
};

interface NodeUpdate {
    id: string;
    status?: NodeStatus;
    data?: string;
    label?: string;
    isCompromised?: boolean;
    hasShield?: boolean;
}

const getLabState = (nodeUpdates: NodeUpdate[], packetUpdates: any[] = []): CyberState => {
    const finalNodes: CyberNode[] = baseTopology.nodes.map(n => ({ 
        ...n, 
        status: "idle" as NodeStatus, 
        data: undefined 
    }));
    
    nodeUpdates.forEach(update => {
        const index = finalNodes.findIndex(n => n.id === update.id);
        if (index !== -1) {
            finalNodes[index] = { ...finalNodes[index], ...update } as CyberNode;
        }
    });
    
    return { nodes: finalNodes, links: baseTopology.links, packets: packetUpdates };
};

export const xssLab: LabScenario = {
    id: "xss",
    title: "Stored XSS (Cross-Site Scripting)",
    description: "Learn how attackers inject malicious scripts that execute in other users' browsers.",
    difficulty: "Intermediate",
    topology: baseTopology,
    steps: [
        {
            id: 1,
            phase: "Injection",
            description: "Attacker posts a comment containing a malicious script tag.",
            state: getLabState([
                { id: "attacker", status: "active", data: "<script>stealCookies()</script>" }
            ]),
            explanation: { title: "Malicious Input", content: "The attacker inputs JavaScript code instead of plain text.", type: "info" }
        },
        {
            id: 2,
            phase: "Storage",
            description: "The server saves the script to the database without sanitization.",
            state: getLabState(
                [
                    { id: "server", status: "compromised" },
                    { id: "db", status: "compromised", data: "Store: <script>..." }
                ],
                [{ id: "p1", source: "attacker", target: "server", type: "exploit", content: "POST: <script>...", progress: 0.5 }]
            ),
            explanation: { title: "Unsafe Storage", content: "The application trusts the input and stores it exactly as received.", type: "error" }
        },
        {
            id: 3,
            phase: "Retrieval",
            description: "A victim views the comments timeline.",
            state: getLabState(
                [
                    { id: "victim", status: "active" },
                    { id: "server", status: "active" }
                ],
                [{ id: "p2", source: "victim", target: "server", type: "data", content: "GET /comments", progress: 0.5 }]
            ),
            explanation: { title: "User Request", content: "The victim requests the page where the comment is displayed.", type: "info" }
        },
        {
            id: 4,
            phase: "Execution",
            description: "The server serves the script to the victim, and their browser executes it.",
            state: getLabState(
                [
                    { id: "victim", status: "compromised", data: "Running: stealCookies()" },
                    { id: "server", status: "active" } // Ensure server stays visible
                ],
                [{ id: "p3", source: "server", target: "victim", type: "exploit", content: "<html>...<script>...", progress: 0.5 }]
            ),
            explanation: { title: "Code Execution", content: "The browser sees the <script> tag and runs it, sending the victim's cookies to the attacker.", type: "error" }
        }
    ],
    fixSteps: [
        {
            id: 1,
            phase: "Sanitization",
            description: "Server escapes special characters before storage (or output).",
            state: getLabState([
                { id: "attacker", status: "active", data: "<script>..." },
                { id: "server", status: "secure", data: "Escape: &lt;script&gt;", hasShield: true }
            ]),
            explanation: { title: "Output Encoding", content: "Special characters like < and > are converted to HTML entities.", type: "success" }
        },
        {
            id: 2,
            phase: "Safe Delivery",
            description: "The browser renders the text, but does not execute it.",
            state: getLabState(
                [
                    { id: "victim", status: "secure", data: "Display: <script>..." }
                ],
                [{ id: "p1", source: "server", target: "victim", type: "data", content: "&lt;script&gt;...", progress: 0.5 }]
            ),
            explanation: { title: "Safe Rendering", content: "The victim sees the text of the script, but the browser knows it's data, not code.", type: "success" }
        }
    ]
};
