-- AlterTable
ALTER TABLE "attendance" ADD COLUMN     "branchId" INTEGER,
ADD COLUMN     "branchName" TEXT;

-- AlterTable
ALTER TABLE "staff" ADD COLUMN     "branchId" INTEGER;

-- AddForeignKey
ALTER TABLE "staff" ADD CONSTRAINT "staff_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "branches"("id") ON DELETE SET NULL ON UPDATE CASCADE;
