-- CreateEnum
CREATE TYPE "FieldKind" AS ENUM ('SELECT', 'TEXT');

-- CreateTable
CREATE TABLE "RakitType" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RakitType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PersonalizationField" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "kind" "FieldKind" NOT NULL DEFAULT 'SELECT',
    "required" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "PersonalizationField_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PersonalizationOption" (
    "id" SERIAL NOT NULL,
    "fieldId" INTEGER NOT NULL,
    "value" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "PersonalizationOption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ProductRakitTypes" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_ProductRakitTypes_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_RakitTypeFields" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_RakitTypeFields_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "RakitType_slug_key" ON "RakitType"("slug");

-- CreateIndex
CREATE INDEX "PersonalizationOption_fieldId_idx" ON "PersonalizationOption"("fieldId");

-- CreateIndex
CREATE INDEX "_ProductRakitTypes_B_index" ON "_ProductRakitTypes"("B");

-- CreateIndex
CREATE INDEX "_RakitTypeFields_B_index" ON "_RakitTypeFields"("B");

-- AddForeignKey
ALTER TABLE "PersonalizationOption" ADD CONSTRAINT "PersonalizationOption_fieldId_fkey" FOREIGN KEY ("fieldId") REFERENCES "PersonalizationField"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProductRakitTypes" ADD CONSTRAINT "_ProductRakitTypes_A_fkey" FOREIGN KEY ("A") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProductRakitTypes" ADD CONSTRAINT "_ProductRakitTypes_B_fkey" FOREIGN KEY ("B") REFERENCES "RakitType"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RakitTypeFields" ADD CONSTRAINT "_RakitTypeFields_A_fkey" FOREIGN KEY ("A") REFERENCES "PersonalizationField"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RakitTypeFields" ADD CONSTRAINT "_RakitTypeFields_B_fkey" FOREIGN KEY ("B") REFERENCES "RakitType"("id") ON DELETE CASCADE ON UPDATE CASCADE;
