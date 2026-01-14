import { SecurityChallenge } from "../types";

const vulnerableCode = `
import { exec } from 'child_process';
import express from 'express';

const app = express();

// VULNERABLE ENDPOINT: Network Diagnostic Tool
app.get('/api/ping', (req, res) => {
    // VULNERABILITY: User input is directly concatenated into a shell command
    const host = req.query.host;

    // Attacker can send: "google.com; cat /etc/passwd"
    // This executes: "ping -c 4 google.com; cat /etc/passwd"
    const command = "ping -c 4 " + host;

    console.log("Executing:", command);

    exec(command, (error, stdout, stderr) => {
        if (error) {
            return res.status(500).send(stderr);
        }
        res.send(stdout);
    });
});
`;

export const commandInjectionChallenge: SecurityChallenge = {
    id: "command-injection",
    title: "Prevent Command Injection",
    type: "fix",
    difficulty: "Advanced",
    description: "The application passes user input directly to a shell command, allowing arbitrary OS execution.",
    instructions: `
1. The \`ping\` endpoint uses \`exec\` which spawns a shell (allows command chaining with \`;\`, \`|\`, etc.).
2. An attacker can append commands to the host parameter to take over the server.
3. **Your Mission:** Refactor the code to use **\`spawn\`** or **\`execFile\`** instead of \`exec\`.
4. These functions execute a specific binary and treat arguments as strings, not code.
5. Alternatively, rigorously valid the input to allow only IP addresses or domains.
    `,
    vulnerableCode: vulnerableCode.trim(),
    hints: [
        "The \`exec\` function runs a shell (e.g., \`/bin/sh -c\`), which interprets characters like \`;\`, \`&\`, and \`|\`.",
        "The \`spawn\` function (from 'child_process') takes the command and an **array of arguments**.",
        "Example: \`spawn('ping', ['-c', '4', host])\`.",
        "When using \`spawn\`, even if \`host\` contains \`; rm -rf /\`, it is treated as a single weird argument to ping, not a new command."
    ],
    verify: (code: string) => {
        const results = [];

        // Check 1: Removal of exec
        const usesExec = /exec\s*\(/.test(code);
        if (!usesExec) {
            results.push({ name: "Unsafe Function Removed", passed: true, message: "Replaced vulnerable 'exec' function." });
        } else {
            results.push({ name: "Unsafe Function Removed", passed: false, message: "Still detected 'exec' usage. Try 'spawn' or 'execFile'." });
        }

        // Check 2: Usage of spawn or execFile
        const usesSpawn = /spawn\s*\(/.test(code);
        const usesExecFile = /execFile\s*\(/.test(code);

        if (usesSpawn || usesExecFile) {
            results.push({ name: "Safe Execution Method", passed: true, message: "Used 'spawn' or 'execFile' to avoid shell interpretation." });
        } else {
            results.push({ name: "Safe Execution Method", passed: false, message: "Did not find 'spawn' or 'execFile'." });
        }

        // Check 3: Array of arguments
        // spawn('ping', ['-c', '4', host])
        const usesArrayArgs = /\[\s*.*host.*\s*\]/.test(code);

        if (usesArrayArgs) {
            results.push({ name: "Argument Separation", passed: true, message: "Passed arguments as an array, separating data from command." });
        } else if (usesSpawn) {
            results.push({ name: "Argument Separation", passed: false, message: "When using spawn, arguments must be in an array!" });
        }

        return results;
    }
};
