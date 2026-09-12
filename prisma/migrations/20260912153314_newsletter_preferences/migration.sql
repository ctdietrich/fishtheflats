-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_NewsletterSignup" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "destination" TEXT,
    "species" TEXT,
    "budgetBand" TEXT,
    "partySize" TEXT,
    "flexible30" BOOLEAN NOT NULL DEFAULT true,
    "source" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_NewsletterSignup" ("createdAt", "email", "id", "name") SELECT "createdAt", "email", "id", "name" FROM "NewsletterSignup";
DROP TABLE "NewsletterSignup";
ALTER TABLE "new_NewsletterSignup" RENAME TO "NewsletterSignup";
CREATE UNIQUE INDEX "NewsletterSignup_email_key" ON "NewsletterSignup"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
