/*
  Warnings:

  - You are about to drop the column `Analysis` on the `Diary` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Diary" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "weather" TEXT,
    "location" TEXT,
    "imageUrls" TEXT DEFAULT '',
    "tags" TEXT DEFAULT '',
    "aiAnalysis" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Diary_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Diary" ("content", "createdAt", "id", "imageUrls", "location", "tags", "updatedAt", "userId", "weather") SELECT "content", "createdAt", "id", "imageUrls", "location", "tags", "updatedAt", "userId", "weather" FROM "Diary";
DROP TABLE "Diary";
ALTER TABLE "new_Diary" RENAME TO "Diary";
CREATE TABLE "new_Emotion" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "diaryId" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "intensity" INTEGER NOT NULL,
    "tags" TEXT DEFAULT '',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Emotion_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Emotion_diaryId_fkey" FOREIGN KEY ("diaryId") REFERENCES "Diary" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Emotion" ("createdAt", "diaryId", "id", "intensity", "tags", "type", "userId") SELECT "createdAt", "diaryId", "id", "intensity", "tags", "type", "userId" FROM "Emotion";
DROP TABLE "Emotion";
ALTER TABLE "new_Emotion" RENAME TO "Emotion";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
