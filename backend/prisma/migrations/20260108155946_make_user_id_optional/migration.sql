-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_AlgoRun" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT,
    "algorithmId" TEXT NOT NULL,
    "steps" TEXT NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AlgoRun_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_AlgoRun" ("algorithmId", "completed", "createdAt", "id", "steps", "userId") SELECT "algorithmId", "completed", "createdAt", "id", "steps", "userId" FROM "AlgoRun";
DROP TABLE "AlgoRun";
ALTER TABLE "new_AlgoRun" RENAME TO "AlgoRun";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
