-- CreateEnum
CREATE TYPE "Size" AS ENUM ('KECIL', 'SEDANG', 'BESAR');

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "isBase" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "size" "Size";
