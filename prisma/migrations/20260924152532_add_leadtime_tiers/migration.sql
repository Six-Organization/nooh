-- CreateTable
CREATE TABLE "LeadTimeTier" (
    "id" SERIAL NOT NULL,
    "productId" INTEGER NOT NULL,
    "minQty" INTEGER NOT NULL,
    "maxQty" INTEGER,
    "days" INTEGER NOT NULL,

    CONSTRAINT "LeadTimeTier_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "LeadTimeTier_productId_idx" ON "LeadTimeTier"("productId");

-- AddForeignKey
ALTER TABLE "LeadTimeTier" ADD CONSTRAINT "LeadTimeTier_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
