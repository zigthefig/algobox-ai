import { SecurityChallenge } from "../types";

const vulnerableCode = `
import express from 'express';
import fileUpload from 'express-fileupload';
import path from 'path';

const app = express();
app.use(fileUpload());

// VULNERABLE ENDPOINT: Profile Picture Upload
app.post('/upload', (req, res) => {
    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).send('No files were uploaded.');
    }

    // VULNERABILITY: No validation of file extension or content type!
    // Attacker can upload 'shell.php'
    const uploadedFile = req.files.avatar;
    const uploadPath = path.join(__dirname, 'public/uploads/', uploadedFile.name);

    uploadedFile.mv(uploadPath, (err) => {
        if (err) return res.status(500).send(err);

        res.send('File uploaded to ' + uploadPath);
    });
});
`;

export const fileUploadChallenge: SecurityChallenge = {
    id: "file-upload",
    title: "Secure File Upload",
    type: "fix",
    difficulty: "Advanced",
    description: "The application accepts any file type, allowing attackers to upload shell scripts (e.g., .php, .jsp) and gain Remote Code Execution.",
    instructions: `
1. The server saves files using \`uploadedFile.name\`, trusting the user's extension.
2. An attacker can upload \`shell.php\` and then visit \`/uploads/shell.php\` to run commands.
3. **Your Mission:** Implement a **Strict Allowlist** of extensions.
4. Only allow \`.png\`, \`.jpg\`, or \`.jpeg\`.
5. Reject everything else with a 400 status.
    `,
    vulnerableCode: vulnerableCode.trim(),
    hints: [
        "Create an array of allowed extensions: \`const allowed = ['.png', '.jpg', '.jpeg'];\`",
        "Use \`path.extname(filename)\` to get the extension.",
        "Check if \`allowed.includes(extension)\`.",
        "Do NOT rely on \`req.files.avatar.mimetype\` alone as it can be spoofed!"
    ],
    verify: (code: string) => {
        const results = [];

        // Check 1: Allowed List definition
        const hasAllowedList = /\[\s*['"].png['"]/.test(code) && /['"].jpg['"]/.test(code);

        if (hasAllowedList) {
            results.push({ name: "Extension Allowlist", passed: true, message: "Defined a list of allowed extensions." });
        } else {
            results.push({ name: "Extension Allowlist", passed: false, message: "Define an array of allowed extensions (e.g., ['.png', '.jpg'])." });
        }

        // Check 2: Getting extension
        const getsExt = /path\.extname\s*\(/.test(code);

        if (getsExt) {
            results.push({ name: "Extension Check", passed: true, message: "Correctly extracting file extension." });
        } else {
            results.push({ name: "Extension Check", passed: false, message: "Use 'path.extname()' to check the file extension." });
        }

        // Check 3: Logic validation
        const checksAllowed = /includes\s*\(\s*(\w+|ext)\s*\)/.test(code);

        if (checksAllowed) {
            results.push({ name: "Validation Logic", passed: true, message: "Validating extension against the allowlist." });
        } else {
            results.push({ name: "Validation Logic", passed: false, message: "Check if the extracted extension is in your allowed list." });
        }

        return results;
    }
};
