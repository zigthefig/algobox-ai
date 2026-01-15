import { SecurityChallenge } from "../types";

const vulnerableCode = `
import sqlite3 from 'sqlite3';
const db = new sqlite3.Database(':memory:');

// Vulnerable Login Function
export function login(username, password) {
  return new Promise((resolve, reject) => {
    // VULNERABILITY: Direct string concatenation allows SQL Injection
    const query = "SELECT * FROM users WHERE username = '" + username + "' AND password = '" + password + "'";
    
    console.log("Executing Query:", query); // Debug log to see the injection

    db.get(query, (err, row) => {
      if (err) return reject(err);
      resolve(row);
    });
  });
}
`;

export const sqlInjectionChallenge: SecurityChallenge = {
    id: "sql-injection",
    title: "Prevent SQL Injection",
    type: "fix",
    difficulty: "Beginner",
    language: "javascript",
    description: "The login function is vulnerable to SQL Injection due to unsafe string concatenation.",
    instructions: `
1. The \`login\` function constructs a SQL query by directly concatenating the \`username\` and \`password\` arguments.
2. An attacker can input \`' OR '1'='1\` to bypass authentication and log in as any user.
3. **Your Mission:** Refactor the query to use **Parameterized Queries** (Prepared Statements) using \`?\` placeholders.
4. Do not remove the logic, just secure the query construction.
    `,
    vulnerableCode: vulnerableCode.trim(),
    hints: [
        "String concatenation is the root cause. Using `+` to build SQL is dangerous.",
        "Replace the variable values in the query string with `?` placeholders.",
        "Pass the variables (username, password) as the second argument to `db.get` in an array: `db.get(query, [params], callback)`.",
        "Example: `db.get('SELECT * FROM users WHERE id = ?', [id], callback)`"
    ],
    verify: (code: string) => {
        const results = [];

        // Check 1: No direct concatenation of variables into the string
        const hasConcatenation = /['"]\s*\+\s*(username|password)\s*\+\s*['"]/g.test(code) ||
            /\$\{(username|password)\}/g.test(code); // Template literals are also bad here

        if (hasConcatenation) {
            results.push({ name: "Safe Query Construction", passed: false, message: "Detected unsafe string concatenation or template literals." });
        } else {
            results.push({ name: "Safe Query Construction", passed: true, message: "No unsafe concatenation detected." });
        }

        // Check 2: Usage of placehodlers
        const hasPlaceholders = /username\s*=\s*\?\s*AND\s*password\s*=\s*\?/i.test(code) ||
            /WHERE\s+username\s*=\s*\?\s+/i.test(code);

        if (hasPlaceholders) {
            results.push({ name: "Parameterized Query Used", passed: true, message: "Correctly used '?' placeholders." });
        } else {
            results.push({ name: "Parameterized Query Used", passed: false, message: "Did not find '?' placeholders in the query string." });
        }

        // Check 3: Passing params array
        const passingParams = /db\.get\s*\(\s*[^,]+,\s*\[\s*username\s*,\s*password\s*\]/g.test(code) ||
            /db\.get\s*\(\s*query\s*,\s*\[\s*username\s*,\s*password\s*\]/g.test(code);

        if (passingParams) {
            results.push({ name: "Parameters Bound", passed: true, message: "Variables correctly passed as bound parameters." });
        } else {
            results.push({ name: "Parameters Bound", passed: false, message: "Did not find the variables passed as a parameter array." });
        }

        return results;
    }
};
