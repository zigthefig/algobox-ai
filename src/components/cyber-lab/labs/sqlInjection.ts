import { LabScenario, CyberState, CyberNode } from "../types";

const baseTopology = {
    nodes: [
        { id: "client", type: "client" as const, label: "User", x: 15, y: 50 },
        { id: "firewall", type: "firewall" as const, label: "WAF", x: 35, y: 50 },
        { id: "server", type: "server" as const, label: "Web App", x: 60, y: 50 },
        { id: "db", type: "database" as const, label: "Users DB", x: 85, y: 50 },
    ],
    links: [
        { source: "client", target: "firewall" },
        { source: "firewall", target: "server" },
        { source: "server", target: "db" },
    ]
};

// Helper to merge updates into the base topology
const getLabState = (nodeUpdates: Partial<CyberNode>[], packetUpdates: any[] = []): CyberState => {
    // 1. Start with clean base nodes
    const finalNodes = baseTopology.nodes.map(n => ({ ...n, status: "idle" as const, data: undefined }));

    // 2. Apply updates by ID
    nodeUpdates.forEach(update => {
        const index = finalNodes.findIndex(n => n.id === update.id);
        if (index !== -1) {
            finalNodes[index] = { ...finalNodes[index], ...update };
        } else {
            // If it's a new node (e.g. attacker replacing client), add or swap?
            // For this simple lab, we usually just update properties of existing IDs.
            // If we actually change 'client' node to 'attacker' type, we just update the type.
        }
    });

    return {
        nodes: finalNodes as CyberNode[],
        links: baseTopology.links,
        packets: packetUpdates
    };
};

export const sqlInjectionLab: LabScenario = {
    id: "sql-injection",
    title: "SQL Injection: Auth Bypass",
    description: "Deep dive into how string concatenation vulnerabilities allow attackers to bypass login logic.",
    difficulty: "Beginner",
    topology: baseTopology,
    steps: [
        // PHASE 1: RECON
        {
            id: 1,
            phase: "Reconnaissance",
            description: "The attacker probes the input field with a single quote (') to test for errors.",
            state: getLabState([
                { id: "client", status: "active", data: "Input: '", type: "client" }
            ]),
            explanation: {
                title: "Vulnerability Probing",
                content: "Attackers often start by injecting special characters like single quotes to break specific SQL syntax.",
                type: "info"
            }
        },
        {
            id: 2,
            phase: "Processing",
            description: "The server naively concatenates the quote into the query.",
            state: getLabState(
                [
                    { id: "firewall", status: "active", label: "WAF (Bypassed)" },
                    { id: "server", status: "compromised", data: "SELECT * FROM users WHERE user = '''" }
                ],
                [{ id: "p1", source: "client", target: "server", type: "data", content: "User='", progress: 0.5 }]
            ),
            explanation: {
                title: "Syntax Error Creation",
                content: "The resulting query has three quotes: `WHERE user = '''`. This is invalid SQL syntax.",
                type: "error"
            }
        },
        {
            id: 3,
            phase: "Error Leak",
            description: "The database throws a syntax error, which the server returns to the user.",
            state: getLabState(
                [
                    { id: "server", status: "active" },
                    { id: "db", status: "active", data: "Syntax Error!" }
                ],
                [{ id: "p2", source: "server", target: "client", type: "response", content: "Error: Unclosed quote...", progress: 0.5 }]
            ),
            explanation: {
                title: "Information Leakage",
                content: "The error message confirms the database is vulnerable and likely using SQL.",
                type: "warning"
            }
        },
        // PHASE 2: EXPLOIT
        {
            id: 4,
            phase: "Payload Construction",
            description: "The attacker crafts a logical payload: ' OR '1'='1",
            state: getLabState([
                { id: "client", status: "compromised", data: "' OR '1'='1", type: "attacker", label: "Attacker" }
            ]),
            explanation: {
                title: "Tautology Attack",
                content: "The goal is to inject a condition that is ALWAYS TRUE (1=1), making the password check irrelevant.",
                type: "info"
            }
        },
        {
            id: 5,
            phase: "Injection",
            description: "The payload travels to the server.",
            state: getLabState(
                [
                    { id: "client", status: "active", type: "attacker", label: "Attacker" }
                ],
                [{ id: "p3", source: "client", target: "server", type: "exploit", content: "' OR '1'='1", progress: 0.5 }]
            ),
            explanation: {
                title: "Payload Delivery",
                content: "The malicious string is sent exactly as typed.",
                type: "info"
            }
        },
        {
            id: 6,
            phase: "Execution",
            description: "The server builds the compromised query.",
            state: getLabState([
                { id: "client", type: "attacker", label: "Attacker" },
                { id: "server", status: "compromised", data: "SELECT ... WHERE user = '' OR '1'='1'" }
            ]),
            explanation: {
                title: "Code Injection",
                content: "The code effectively becomes: 'Find any user where (name is empty) OR (1 equals 1)'.",
                type: "error"
            }
        },
        {
            id: 7,
            phase: "Database Dump",
            description: "The query evaluates to TRUE for every single row.",
            state: getLabState(
                [
                    { id: "client", type: "attacker", label: "Attacker" },
                    { id: "server", status: "compromised" },
                    { id: "db", status: "compromised", data: "Returning ALL ROWS" }
                ],
                [{ id: "p4", source: "server", target: "db", type: "exploit", content: "Query: ... OR '1'='1'", progress: 0.5 }]
            ),
            explanation: {
                title: "Authentication Bypass",
                content: "The database returns the first user it finds (usually Admin) because the condition is true for everyone.",
                type: "error"
            }
        },
        {
            id: 8,
            phase: "Access Granted",
            description: "The attacker is logged in as Administrator.",
            state: getLabState(
                [
                    { id: "client", status: "compromised", label: "Admin (Hacked)", type: "attacker" }
                ],
                [{ id: "p5", source: "server", target: "client", type: "data", content: "Welcome, Admin!", progress: 0.5 }]
            ),
            explanation: {
                title: "System Compromise",
                content: "Access control is completely broken. The attacker has full administrative privileges.",
                type: "error"
            }
        }
    ],
    fixSteps: [
        {
            id: 1,
            phase: "Mitigation",
            description: "Implementing Parameterized Queries (Prepared Statements).",
            state: getLabState([
                { id: "server", status: "secure", label: "Secure Server", hasShield: true }
            ]),
            explanation: { title: "Defense Strategy", content: "Use frameworks that separate Code (SQL) from Data (Input).", type: "success" }
        },
        {
            id: 2,
            phase: "Safe Execution",
            description: "The input is treated as a literal string, not code.",
            state: getLabState(
                [
                    { id: "client", status: "active", data: "' OR '1'='1" },
                    { id: "server", status: "secure", data: "SELECT ... WHERE user = ?", hasShield: true }
                ],
                [{ id: "p1", source: "client", target: "server", type: "data", content: "Safe Input", progress: 0.5 }]
            ),
            explanation: { title: "Parameterization", content: "The database looks for a user whose literal name is \"' OR '1'='1\".", type: "success" }
        },
        {
            id: 3,
            phase: "Rejection",
            description: "No matching user found. Access Denied.",
            state: getLabState(
                [
                    { id: "db", status: "secure", data: "0 Results" },
                    { id: "server", status: "secure", hasShield: true }
                ],
                [{ id: "p2", source: "server", target: "client", type: "response", content: "Invalid Login", progress: 0.5 }]
            ),
            explanation: { title: "Attack Neutralized", content: "The logic remains intact. The attack fails.", type: "success" }
        }
    ]
};
