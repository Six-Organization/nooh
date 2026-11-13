-- CreateEnum
CREATE TYPE "ProductType" AS ENUM ('COMPONENT', 'ALAS', 'BUNDLE');

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "type" "ProductType" NOT NULL DEFAULT 'COMPONENT';

-- Backfill: produk lama yang isBase=true ditandai sebagai ALAS
UPDATE "Product" SET "type" = 'ALAS' WHERE "isBase" = true;

-- CreateTable
CREATE TABLE "QuantityTier" (
    "id" SERIAL NOT NULL,
    "productId" INTEGER NOT NULL,
    "minQty" INTEGER NOT NULL,
    "maxQty" INTEGER,
    "unitPrice" INTEGER NOT NULL,
    "leadDays" INTEGER NOT NULL,

    CONSTRAINT "QuantityTier_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "QuantityTier_productId_idx" ON "QuantityTier"("productId");

-- AddForeignKey
ALTER TABLE "QuantityTier" ADD CONSTRAINT "QuantityTier_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
