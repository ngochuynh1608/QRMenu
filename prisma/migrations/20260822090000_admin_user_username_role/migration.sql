-- AlterTable
ALTER TABLE "AdminUser" ADD COLUMN "role" TEXT NOT NULL DEFAULT 'admin';
ALTER TABLE "AdminUser" ADD COLUMN "username" TEXT;

UPDATE "AdminUser"
SET "username" = lower(split_part("email", '@', 1))
WHERE "username" IS NULL;

UPDATE "AdminUser" AS u
SET "username" = u."username" || '-' || substr(u."id", 1, 6)
WHERE EXISTS (
  SELECT 1 FROM "AdminUser" AS o
  WHERE o."username" = u."username" AND o."id" <> u."id"
);

ALTER TABLE "AdminUser" ALTER COLUMN "username" SET NOT NULL;

CREATE UNIQUE INDEX "AdminUser_username_key" ON "AdminUser"("username");
