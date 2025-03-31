-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Diary" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "weather" TEXT,
    "location" TEXT,
    "imageUrls" TEXT,
    "tags" TEXT,
    "aiAnalysis" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Diary_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Diary" ("aiAnalysis", "content", "createdAt", "id", "imageUrls", "location", "tags", "updatedAt", "userId", "weather") SELECT "aiAnalysis", "content", "createdAt", "id", "imageUrls", "location", "tags", "updatedAt", "userId", "weather" FROM "Diary";
DROP TABLE "Diary";
ALTER TABLE "new_Diary" RENAME TO "Diary";
CREATE INDEX "Diary_userId_idx" ON "Diary"("userId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
