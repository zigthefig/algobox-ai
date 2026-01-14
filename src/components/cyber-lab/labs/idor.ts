import { LabScenario, CyberState, CyberNode } from "../types";

const baseTopology = {
    nodes: [
        { id: "client", type: "client" as const, label: "User A (ID: 101)", x: 20, y: 50 },
        { id: "server", type: "server" as const, label: "API Server", x: 50, y: 50 },
        { id: "db", type: "database" as const, label: "Database", x: 80, y: 50 },
    ],
    links: [
        { source: "client", target: "server" },
        { source: "server", target: "db" },
    ]
};

const getLabState = (nodeUpdates: Partial<CyberNode>[], packetUpdates: any[] = []): CyberState => {
    const finalNodes = baseTopology.nodes.map(n => ({ ...n, status: "idle" as const, data: undefined }));
    nodeUpdates.forEach(update => {
        const index = finalNodes.findIndex(n => n.id === update.id);
        if (index !== -1) finalNodes[index] = { ...finalNodes[index], ...update };
    });
    return { nodes: finalNodes as CyberNode[], links: baseTopology.links, packets: packetUpdates };
};

export const idorLab: LabScenario = {
    id: "idor",
    title: "IDOR (Insecure Direct Object Reference)",
    description: "See how changing a simple ID parameter can expose other users' private data.",
    difficulty: "Beginner",
    topology: baseTopology,
    steps: [
        {
            id: 1,
            phase: "Legitimate Request",
            description: "User A requests their own profile (ID: 101).",
            state: getLabState(
                [
                    { id: "client", status: "active", data: "GET /profile?id=101" },
                    { id: "server", status: "active" }
                ],
                [{ id: "p1", source: "client", target: "server", type: "data", content: "id=101", progress: 0.5 }]
            ),
            explanation: { title: "Normal Access", content: "The user is authorized to see their own data.", type: "info" }
        },
        {
            id: 2,
            phase: "Manipulation",
            description: "User A changes the ID parameter to 102 (User B's ID).",
            state: getLabState([
                { id: "client", status: "compromised", data: "GET /profile?id=102", label: "User A (Attacking)" }
            ]),
            explanation: { title: "Parameter Tampering", content: "The user guesses that IDs are sequential and tries to access the next one.", type: "warning" }
        },
        {
            id: 3,
            phase: "Unchecked Execution",
            description: "Server blindly fetches ID 102 without checking ownership.",
            state: getLabState(
                [
                    { id: "server", status: "compromised", data: "No Ownership Check" },
                    { id: "db", status: "active", data: "Found: User B Data" }
                ],
                [{ id: "p2", source: "server", target: "db", type: "data", content: "SELECT WHERE id=102", progress: 0.5 }]
            ),
            explanation: { title: "Missing Authorization", content: "The server checked *if* the user is logged in, but not *if* they own Record 102.", type: "error" }
        },
        {
            id: 4,
            phase: "Data Leak",
            description: "Server returns User B's private data to User A.",
            state: getLabState(
                [
                    { id: "client", status: "active", label: "User A (Has User B Data)" }
                ],
                [{ id: "p3", source: "server", target: "client", type: "data", content: "User B's Private Profile", progress: 0.5 }]
            ),
            explanation: { title: "Privacy Violation", content: "Confidential data is exposed because the object reference was direct and insecure.", type: "error" }
        }
    ],
    fixSteps: [
        {
            id: 1,
            phase: "Request",
            description: "User A tries to access ID 102 again.",
            state: getLabState([
                { id: "client", status: "active", data: "GET /id=102" }
            ]),
            explanation: { title: "Attack Attempt", content: "The user attempts the same tamper.", type: "info" }
        },
        {
            id: 2,
            phase: "Authorization Check",
            description: "Server checks: Does CurrentUser.id == Requested.id?",
            state: getLabState([
                { id: "server", status: "secure", data: "Check: 101 != 102", hasShield: true }
            ]),
            explanation: { title: "Server-Side Validation", content: "The server compares the session owner (101) with the requested resource (102).", type: "success" }
        },
        {
            id: 3,
            phase: "Access Denied",
            description: "Server rejects the request with 403 Forbidden.",
            state: getLabState(
                [
                    { id: "db", status: "idle" }, // DB never touched
                    { id: "server", status: "secure", hasShield: true }
                ],
                [{ id: "p1", source: "server", target: "client", type: "response", content: "403 Forbidden", progress: 0.5 }]
            ),
            explanation: { title: "Secure Access Control", content: "The database is never even queried. The request is blocked at the logic layer.", type: "success" }
        }
    ]
};
