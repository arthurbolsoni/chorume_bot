/*
  Warnings:

  - Added the required column `amount` to the `UsersOnBets` table without a default value. This is not possible if the table is not empty.
  - Added the required column `option` to the `UsersOnBets` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_UsersOnBets" (
    "betId" INTEGER NOT NULL,
    "userId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "option" TEXT NOT NULL,

    PRIMARY KEY ("userId", "betId"),
    CONSTRAINT "UsersOnBets_betId_fkey" FOREIGN KEY ("betId") REFERENCES "Bets" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "UsersOnBets_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_UsersOnBets" ("betId", "userId") SELECT "betId", "userId" FROM "UsersOnBets";
DROP TABLE "UsersOnBets";
ALTER TABLE "new_UsersOnBets" RENAME TO "UsersOnBets";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
