/*
  Warnings:

  - The primary key for the `ProjectConfig` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `ProjectConfig` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ProjectConfig" (
    "projectId" TEXT NOT NULL PRIMARY KEY,
    "layout" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_ProjectConfig" ("createdAt", "layout", "projectId", "updatedAt") SELECT "createdAt", "layout", "projectId", "updatedAt" FROM "ProjectConfig";
DROP TABLE "ProjectConfig";
ALTER TABLE "new_ProjectConfig" RENAME TO "ProjectConfig";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
