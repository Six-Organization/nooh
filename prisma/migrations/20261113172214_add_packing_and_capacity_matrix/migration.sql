-- AlterEnum
ALTER TYPE "ProductType" ADD VALUE 'PACKING';

-- CreateTable
CREATE TABLE "CapacityRule" (
    "id" SERIAL NOT NULL,
    "alasSize" "Size" NOT NULL,
    "packingSize" "Size" NOT NULL,
    "capacity" INTEGER NOT NULL,

    CONSTRAINT "CapacityRule_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CapacityRule_alasSize_packingSize_key" ON "CapacityRule"("alasSize", "packingSize");
