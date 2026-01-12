// SQL Parser - Parses SQL queries into executable steps
// This is a simplified parser for educational purposes

export interface ParsedQuery {
    type: "SELECT" | "INSERT" | "UPDATE" | "DELETE";
    columns: string[];
    from: string;
    joins: JoinClause[];
    where: WhereClause | null;
    groupBy: string[];
    orderBy: OrderByClause[];
    limit: number | null;
}

export interface JoinClause {
    type: "INNER" | "LEFT" | "RIGHT" | "FULL";
    table: string;
    on: {
        leftTable: string;
        leftColumn: string;
        rightTable: string;
        rightColumn: string;
    };
}

export interface WhereClause {
    conditions: Condition[];
    operator: "AND" | "OR";
}

export interface Condition {
    column: string;
    operator: "=" | "!=" | ">" | "<" | ">=" | "<=" | "LIKE" | "IN";
    value: string | number | string[];
    table?: string;
}

export interface OrderByClause {
    column: string;
    direction: "ASC" | "DESC";
}

export interface ExecutionStep {
    index: number;
    operation: string;
    description: string;
    tables: string[];
    affectedRows: number[];
    highlights: {
        table: string;
        rows: number[];
        type: "scan" | "match" | "filter" | "result";
    }[];
    intermediateResult?: Record<string, any>[];
}

// Simple SQL tokenizer
function tokenize(sql: string): string[] {
    const tokens: string[] = [];
    let current = "";
    let inString = false;
    let stringChar = "";

    for (let i = 0; i < sql.length; i++) {
        const char = sql[i];

        if (inString) {
            current += char;
            if (char === stringChar) {
                tokens.push(current);
                current = "";
                inString = false;
            }
        } else if (char === "'" || char === '"') {
            if (current) tokens.push(current);
            current = char;
            inString = true;
            stringChar = char;
        } else if (/\s/.test(char)) {
            if (current) tokens.push(current);
            current = "";
        } else if (",;()".includes(char)) {
            if (current) tokens.push(current);
            tokens.push(char);
            current = "";
        } else if ("=<>!".includes(char)) {
            if (current) tokens.push(current);
            current = char;
            // Handle multi-char operators
            if (i + 1 < sql.length && "=<>".includes(sql[i + 1])) {
                current += sql[++i];
            }
            tokens.push(current);
            current = "";
        } else {
            current += char;
        }
    }
    if (current) tokens.push(current);

    return tokens.filter((t) => t.trim());
}

// Parse SELECT query
export function parseSQL(sql: string): ParsedQuery {
    const tokens = tokenize(sql.toUpperCase());
    const originalTokens = tokenize(sql);

    const query: ParsedQuery = {
        type: "SELECT",
        columns: [],
        from: "",
        joins: [],
        where: null,
        groupBy: [],
        orderBy: [],
        limit: null,
    };

    let i = 0;

    // Parse SELECT
    if (tokens[i] !== "SELECT") {
        throw new Error("Query must start with SELECT");
    }
    i++;

    // Parse columns
    while (i < tokens.length && tokens[i] !== "FROM") {
        if (tokens[i] !== ",") {
            query.columns.push(originalTokens[i]);
        }
        i++;
    }

    // Parse FROM
    if (tokens[i] === "FROM") {
        i++;
        query.from = originalTokens[i];
        i++;
    }

    // Parse JOINs
    while (i < tokens.length) {
        const token = tokens[i];

        if (token === "JOIN" || token === "INNER" || token === "LEFT" || token === "RIGHT") {
            const joinType = token === "JOIN" ? "INNER" : token;
            if (token !== "JOIN") i++; // Skip to JOIN keyword
            i++; // Skip JOIN

            const joinTable = originalTokens[i];
            i++;

            if (tokens[i] === "ON") {
                i++;
                const leftPart = originalTokens[i].split(".");
                i++;
                i++; // Skip =
                const rightPart = originalTokens[i].split(".");
                i++;

                query.joins.push({
                    type: joinType as "INNER" | "LEFT" | "RIGHT",
                    table: joinTable,
                    on: {
                        leftTable: leftPart[0],
                        leftColumn: leftPart[1],
                        rightTable: rightPart[0],
                        rightColumn: rightPart[1],
                    },
                });
            }
        } else if (token === "WHERE") {
            i++;
            const conditions: Condition[] = [];

            while (i < tokens.length && !["GROUP", "ORDER", "LIMIT"].includes(tokens[i])) {
                if (tokens[i] === "AND" || tokens[i] === "OR") {
                    i++;
                    continue;
                }

                const columnParts = originalTokens[i].split(".");
                const column = columnParts.length > 1 ? columnParts[1] : columnParts[0];
                const table = columnParts.length > 1 ? columnParts[0] : undefined;
                i++;

                const operator = tokens[i] as Condition["operator"];
                i++;

                let value: string | number = originalTokens[i];
                if (value.startsWith("'") || value.startsWith('"')) {
                    value = value.slice(1, -1);
                } else if (!isNaN(Number(value))) {
                    value = Number(value);
                }
                i++;

                conditions.push({ column, operator, value, table });
            }

            query.where = { conditions, operator: "AND" };
        } else if (token === "GROUP") {
            i += 2; // Skip GROUP BY
            while (i < tokens.length && !["ORDER", "LIMIT", "HAVING"].includes(tokens[i])) {
                if (tokens[i] !== ",") {
                    query.groupBy.push(originalTokens[i]);
                }
                i++;
            }
        } else if (token === "ORDER") {
            i += 2; // Skip ORDER BY
            while (i < tokens.length && tokens[i] !== "LIMIT") {
                if (tokens[i] !== ",") {
                    const col = originalTokens[i];
                    i++;
                    const dir = tokens[i] === "DESC" ? "DESC" : "ASC";
                    if (tokens[i] === "ASC" || tokens[i] === "DESC") i++;
                    query.orderBy.push({ column: col, direction: dir });
                } else {
                    i++;
                }
            }
        } else if (token === "LIMIT") {
            i++;
            query.limit = parseInt(originalTokens[i]);
            i++;
        } else {
            i++;
        }
    }

    return query;
}

// Generate execution steps from parsed query
export function generateExecutionSteps(
    query: ParsedQuery,
    database: any
): ExecutionStep[] {
    const steps: ExecutionStep[] = [];
    let stepIndex = 0;

    // Step 1: Scan FROM table
    const fromTable = database.tables[query.from.toLowerCase()];
    if (fromTable) {
        steps.push({
            index: stepIndex++,
            operation: "TABLE_SCAN",
            description: `Scanning table "${query.from}" - ${fromTable.data.length} rows`,
            tables: [query.from],
            affectedRows: fromTable.data.map((_: any, i: number) => i),
            highlights: [
                {
                    table: query.from,
                    rows: fromTable.data.map((_: any, i: number) => i),
                    type: "scan",
                },
            ],
            intermediateResult: [...fromTable.data],
        });
    }

    // Step 2-N: Process JOINs
    let currentResult = fromTable ? [...fromTable.data] : [];

    for (const join of query.joins) {
        const joinTable = database.tables[join.table.toLowerCase()];
        if (!joinTable) continue;

        // Scan join table
        steps.push({
            index: stepIndex++,
            operation: "TABLE_SCAN",
            description: `Scanning table "${join.table}" for JOIN - ${joinTable.data.length} rows`,
            tables: [join.table],
            affectedRows: joinTable.data.map((_: any, i: number) => i),
            highlights: [
                {
                    table: join.table,
                    rows: joinTable.data.map((_: any, i: number) => i),
                    type: "scan",
                },
            ],
        });

        // Perform JOIN
        const newResult: any[] = [];
        const matchedFromRows: number[] = [];
        const matchedJoinRows: number[] = [];

        currentResult.forEach((row, fromIdx) => {
            joinTable.data.forEach((joinRow: any, joinIdx: number) => {
                const leftVal = row[join.on.leftColumn] ?? row[`${join.on.leftTable}.${join.on.leftColumn}`];
                const rightVal = joinRow[join.on.rightColumn];

                if (leftVal === rightVal) {
                    matchedFromRows.push(fromIdx);
                    matchedJoinRows.push(joinIdx);
                    newResult.push({ ...row, ...joinRow });
                }
            });
        });

        steps.push({
            index: stepIndex++,
            operation: "JOIN",
            description: `Joining on ${join.on.leftTable}.${join.on.leftColumn} = ${join.on.rightTable}.${join.on.rightColumn} - ${newResult.length} matches`,
            tables: [query.from, join.table],
            affectedRows: matchedFromRows,
            highlights: [
                { table: query.from, rows: matchedFromRows, type: "match" },
                { table: join.table, rows: matchedJoinRows, type: "match" },
            ],
            intermediateResult: newResult,
        });

        currentResult = newResult;
    }

    // Step: Apply WHERE filter
    if (query.where && query.where.conditions.length > 0) {
        const beforeCount = currentResult.length;
        const filteredRows: number[] = [];

        currentResult = currentResult.filter((row, idx) => {
            const passes = query.where!.conditions.every((cond) => {
                const val = row[cond.column];
                switch (cond.operator) {
                    case "=": return val == cond.value;
                    case "!=": return val != cond.value;
                    case ">": return val > cond.value;
                    case "<": return val < cond.value;
                    case ">=": return val >= cond.value;
                    case "<=": return val <= cond.value;
                    default: return true;
                }
            });
            if (passes) filteredRows.push(idx);
            return passes;
        });

        const condStr = query.where.conditions
            .map((c) => `${c.column} ${c.operator} ${c.value}`)
            .join(" AND ");

        steps.push({
            index: stepIndex++,
            operation: "FILTER",
            description: `Applying WHERE ${condStr} - ${beforeCount - currentResult.length} rows filtered out`,
            tables: [query.from],
            affectedRows: filteredRows,
            highlights: [
                { table: query.from, rows: filteredRows, type: "filter" },
            ],
            intermediateResult: currentResult,
        });
    }

    // Step: Projection (SELECT columns)
    const projectedResult = currentResult.map((row) => {
        if (query.columns.includes("*")) return row;
        const newRow: any = {};
        query.columns.forEach((col) => {
            const colName = col.includes(".") ? col.split(".")[1] : col;
            if (row[colName] !== undefined) {
                newRow[colName] = row[colName];
            }
        });
        return newRow;
    });

    steps.push({
        index: stepIndex++,
        operation: "PROJECTION",
        description: `Selecting columns: ${query.columns.join(", ")} - Final result: ${projectedResult.length} rows`,
        tables: [query.from],
        affectedRows: projectedResult.map((_, i) => i),
        highlights: [
            { table: "result", rows: projectedResult.map((_, i) => i), type: "result" },
        ],
        intermediateResult: projectedResult,
    });

    return steps;
}
