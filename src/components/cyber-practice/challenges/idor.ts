import { SecurityChallenge } from "../types";

const vulnerableCode = `
import express from 'express';
const app = express();

// Mock Database of user documents
const documents = {
  101: { id: 101, ownerId: 101, content: "User 101's Private Diary" },
  102: { id: 102, ownerId: 102, content: "User 102's Tax Returns" }, // ATTACK TARGET
  103: { id: 103, ownerId: 103, content: "User 103's Medical Records" }
};

// VULNERABLE ENDPOINT: Get Document by ID
// Authenticated user is available in req.user
app.get('/api/documents/:id', (req, res) => {
  const docId = parseInt(req.params.id);
  const user = req.user; // e.g., { id: 101, role: 'user' }

  // VULNERABILITY: No check to see if the document belongs to the requesting user!
  const document = documents[docId];

  if (!document) {
    return res.status(404).send("Document not found");
  }

  // Directly returning the object just because it exists
  res.json(document);
});
`;

export const idorChallenge: SecurityChallenge = {
    id: "idor",
    title: "Prevent IDOR",
    type: "fix",
    difficulty: "Beginner",
    language: "javascript",
    description: "The application allows users to access ANY document just by changing the ID number.",
    instructions: `
1. The endpoint \`/api/documents/:id\` returns a document based solely on the URL parameter \`id\`.
2. A logged-in user (e.g., ID 101) can access ID 102's data just by requesting it.
3. **Your Mission:** Implement an **Authorization Check**.
4. Verify that the \`document.ownerId\` matches the \`user.id\` (available in \`req.user\`) before returning data.
5. If the IDs don't match, return a 403 status.
    `,
    vulnerableCode: vulnerableCode.trim(),
    hints: [
        "Insecure Direct Object Reference (IDOR) happens when you trust the user input ID.",
        "Check if \`document.ownerId === user.id\`.",
        "You can mock the response for failure: \`return res.status(403).send('Forbidden');\`"
    ],
    verify: (code: string) => {
        const results = [];

        // Check 1: Checking for ownership comparison
        const hasOwnershipCheck = /document\.ownerId\s*===?\s*user\.id/i.test(code) ||
            /user\.id\s*===?\s*document\.ownerId/i.test(code);

        if (hasOwnershipCheck) {
            results.push({ name: "Ownership Verification", passed: true, message: "Code compares document owner with session user." });
        } else {
            results.push({ name: "Ownership Verification", passed: false, message: "No check found comparing 'document.ownerId' to 'user.id'." });
        }

        // Check 2: Handling Valid Access
        const sendsJson = /res\.json\(document\)/.test(code);
        if (sendsJson) {
            results.push({ name: "Allowed Access", passed: true, message: "Valid requests still return data." });
        } else {
            results.push({ name: "Allowed Access", passed: false, message: "Make sure to still return the document if the check passes!" });
        }

        // Check 3: Handling Invalid Access (403)
        const sends403 = /res\.status\(403\)/.test(code) || /res\.sendStatus\(403\)/.test(code);

        if (sends403) {
            results.push({ name: "Block Unauthorized", passed: true, message: "Denies access (403) for non-owners." });
        } else {
            results.push({ name: "Block Unauthorized", passed: false, message: "Did not find a 403 Forbidden response for invalid access." });
        }

        return results;
    }
};
