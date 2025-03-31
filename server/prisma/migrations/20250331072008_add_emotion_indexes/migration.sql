-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Emotion" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "diaryId" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "intensity" INTEGER NOT NULL,
    "tags" TEXT DEFAULT '',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Emotion_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Emotion_diaryId_fkey" FOREIGN KEY ("diaryId") REFERENCES "Diary" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Emotion" ("createdAt", "diaryId", "id", "intensity", "tags", "type", "userId") SELECT "createdAt", "diaryId", "id", "intensity", "tags", "type", "userId" FROM "Emotion";
DROP TABLE "Emotion";
ALTER TABLE "new_Emotion" RENAME TO "Emotion";
CREATE INDEX "Emotion_userId_idx" ON "Emotion"("userId");
CREATE INDEX "Emotion_diaryId_idx" ON "Emotion"("diaryId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
