ALTER TABLE "Restaurant" ADD COLUMN "sortOrder" INTEGER NOT NULL DEFAULT 0;

WITH ranked AS (
  SELECT id, (ROW_NUMBER() OVER (ORDER BY "createdAt" ASC) - 1)::INTEGER AS rn
  FROM "Restaurant"
)
UPDATE "Restaurant" AS r
SET "sortOrder" = ranked.rn
FROM ranked
WHERE r.id = ranked.id;
