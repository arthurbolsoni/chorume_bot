-- CreateTable
CREATE TABLE "Users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "coins" INTEGER NOT NULL DEFAULT 10
);

-- CreateTable
CREATE TABLE "Guilds" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ticket_category" TEXT NOT NULL DEFAULT '',
    "moderation_role" TEXT NOT NULL DEFAULT '',
    "image_only_channel" TEXT NOT NULL DEFAULT '',
    "logs_channel" TEXT NOT NULL DEFAULT '',
    "questions_channel" TEXT NOT NULL DEFAULT ''
);

-- CreateTable
CREATE TABLE "Questions" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "content" TEXT NOT NULL,
    "message_id" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    CONSTRAINT "Questions_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "Users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Projects" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Bets" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "optionA" TEXT NOT NULL,
    "optionB" TEXT NOT NULL,
    "deposit" INTEGER NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "UsersOnBets" (
    "betId" INTEGER NOT NULL,
    "userId" TEXT NOT NULL,

    PRIMARY KEY ("userId", "betId"),
    CONSTRAINT "UsersOnBets_betId_fkey" FOREIGN KEY ("betId") REFERENCES "Bets" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "UsersOnBets_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "UsersOnProjects" (
    "projectId" INTEGER NOT NULL,
    "userId" TEXT NOT NULL,

    PRIMARY KEY ("userId", "projectId"),
    CONSTRAINT "UsersOnProjects_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Projects" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "UsersOnProjects_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
