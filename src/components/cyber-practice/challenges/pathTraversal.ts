import { SecurityChallenge } from "../types";

const vulnerableCode = `
import express from 'express';
import path from 'path';
import fs from 'fs';

const app = express();
const IMAGES_DIR = path.join(__dirname, 'public/images');

// VULNERABLE ENDPOINT: Serve image by filename
app.get('/image', (req, res) => {
    // VULNERABILITY: User input is directly passed to file system operations
    const filename = req.query.file as string; 
    
    // Attacker can send: db_backup.sql or ../../config.json
    const filePath = path.join(IMAGES_DIR, filename);

    console.log("Reading file from:", filePath);

    fs.readFile(filePath, (err, data) => {
        if (err) return res.status(404).send("File not found");
        res.send(data);
    });
});
`;

export const pathTraversalChallenge: SecurityChallenge = {
    id: "path-traversal", // Matches the lab ID
    title: "Prevent Path Traversal",
    type: "fix",
    difficulty: "Intermediate",
    description: "The application allows attackers to read arbitrary system files by manipulating the file path.",
    instructions: `
1. The endpoint constructs a file path using \`req.query.file\`.
2. An attacker can use \`../../\` (dot-dot-slash) sequences to escape the \`images\` directory and read sensitive files like \`/etc/passwd\` or \`config.json\`.
3. **Your Mission:** Sanitize the input to ensure only filenames (not paths) are allowed.
4. **Recommended Fix:** Use \`path.basename()\` to strip directory information from the input, OR check if the input contains \`/\` or \`..\`.
    `,
    vulnerableCode: vulnerableCode.trim(),
    hints: [
        "Path Traversal happens when you trust the full string provided by the user.",
        "The \`path.basename(filename)\` function returns the last portion of a path.",
        "If \`filename\` is \`../../config.json\`, \`path.basename\` will return just \`config.json\`, effectively stripping the directories.",
        "Alternatively, you can just \`return res.status(403)\` if \`filename.includes('..')\`."
    ],
    verify: (code: string) => {
        const results = [];

        // Check 1: Using path.basename()
        const usesBasename = /path\.basename\s*\(\s*(\w+|req\.query\.file)\s*\)/.test(code);

        // Check 2: Explicitly checking for '..' or '/'
        const checksDots = /if\s*\(\s*(\w+|req\.query\.file)\.includes\s*\(\s*['"]\.\.['"]\s*\)/.test(code);
        const checksSlashes = /if\s*\(\s*(\w+|req\.query\.file)\.includes\s*\(\s*['"]\/['"]\s*\)/.test(code);

        // Check 3: Checking if the resolved path starts with the allowed directory (Canonicalization)
        // This is harder to regex reliably, so we focus on the simpler fixes first.

        if (usesBasename) {
            results.push({ name: "Input Sanitization", passed: true, message: "Used path.basename() to strip directory components." });
        } else if (checksDots || checksSlashes) {
            results.push({ name: "Input Validation", passed: true, message: "Explicitly blocked traversal characters ('..' or '/')." });
        } else {
            results.push({ name: "Input Sanitization", passed: false, message: "No sanitization found. Try using 'path.basename(filename)' or checking for '..'." });
        }

        // Check 4: Ensuring logic isn't deleted
        if (code.includes('fs.readFile')) {
            results.push({ name: "Functionality Preserved", passed: true, message: "File reading logic is still intact." });
        } else {
            results.push({ name: "Functionality Preserved", passed: false, message: "Don't delete the fs.readFile logic!" });
        }

        return results;
    }
};
