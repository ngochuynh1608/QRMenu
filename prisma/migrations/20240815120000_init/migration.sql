-- CreateTable
CREATE TABLE "Restaurant" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "logoUrl" TEXT,
    "coverUrl" TEXT,
    "phone" TEXT,
    "address" TEXT,
    "hours" TEXT,
    "currency" TEXT NOT NULL DEFAULT 'VND',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "venueType" TEXT NOT NULL DEFAULT 'qsr',
    "defaultLang" TEXT NOT NULL DEFAULT 'vi',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Restaurant_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "RestaurantTranslation" (
    "id" TEXT NOT NULL,
    "restaurantId" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "RestaurantTranslation_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Category" (
    "id" TEXT NOT NULL,
    "restaurantId" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CategoryTranslation" (
    "id" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "CategoryTranslation_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "MenuItem" (
    "id" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "imageUrl" TEXT,
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "MenuItem_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "MenuItemTranslation" (
    "id" TEXT NOT NULL,
    "menuItemId" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "MenuItemTranslation_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Language" (
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nativeName" TEXT NOT NULL,
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Language_pkey" PRIMARY KEY ("code")
);

CREATE TABLE "AdminUser" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,

    CONSTRAINT "AdminUser_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "SiteSettings" (
    "id" TEXT NOT NULL,
    "siteName" TEXT NOT NULL DEFAULT 'QRMenu',
    "logoUrl" TEXT,
    "publicBaseUrl" TEXT,
    "qrRevision" INTEGER NOT NULL DEFAULT 0,
    "primaryColor" TEXT NOT NULL DEFAULT '#DC2626',
    "secondaryColor" TEXT NOT NULL DEFAULT '#F87171',
    "ctaColor" TEXT NOT NULL DEFAULT '#CA8A04',
    "backgroundColor" TEXT NOT NULL DEFAULT '#FEF2F2',
    "textColor" TEXT NOT NULL DEFAULT '#450A0A',
    "adsEnabled" BOOLEAN NOT NULL DEFAULT false,
    "adsIdleSeconds" INTEGER NOT NULL DEFAULT 10,
    "adsSlideSeconds" INTEGER NOT NULL DEFAULT 8,

    CONSTRAINT "SiteSettings_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AdSlide" (
    "id" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdSlide_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Restaurant_slug_key" ON "Restaurant"("slug");
CREATE UNIQUE INDEX "RestaurantTranslation_restaurantId_locale_key" ON "RestaurantTranslation"("restaurantId", "locale");
CREATE UNIQUE INDEX "CategoryTranslation_categoryId_locale_key" ON "CategoryTranslation"("categoryId", "locale");
CREATE UNIQUE INDEX "MenuItemTranslation_menuItemId_locale_key" ON "MenuItemTranslation"("menuItemId", "locale");
CREATE UNIQUE INDEX "AdminUser_email_key" ON "AdminUser"("email");

ALTER TABLE "RestaurantTranslation" ADD CONSTRAINT "RestaurantTranslation_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "Restaurant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Category" ADD CONSTRAINT "Category_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "Restaurant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CategoryTranslation" ADD CONSTRAINT "CategoryTranslation_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "MenuItem" ADD CONSTRAINT "MenuItem_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "MenuItemTranslation" ADD CONSTRAINT "MenuItemTranslation_menuItemId_fkey" FOREIGN KEY ("menuItemId") REFERENCES "MenuItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

INSERT INTO "SiteSettings" ("id") VALUES ('default') ON CONFLICT ("id") DO NOTHING;
