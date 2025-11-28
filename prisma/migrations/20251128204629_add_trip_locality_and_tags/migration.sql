/*
  Warnings:

  - You are about to drop the column `tripId` on the `Locality` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Locality" DROP CONSTRAINT "Locality_tripId_fkey";

-- AlterTable
ALTER TABLE "Locality" DROP COLUMN "tripId";

-- CreateTable
CREATE TABLE "TripLocality" (
    "id" TEXT NOT NULL,
    "tripId" TEXT NOT NULL,
    "localityId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TripLocality_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tag" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SpecimenTag" (
    "specimenId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,

    CONSTRAINT "SpecimenTag_pkey" PRIMARY KEY ("specimenId","tagId")
);

-- CreateIndex
CREATE UNIQUE INDEX "TripLocality_tripId_localityId_key" ON "TripLocality"("tripId", "localityId");

-- CreateIndex
CREATE UNIQUE INDEX "Tag_userId_name_key" ON "Tag"("userId", "name");

-- AddForeignKey
ALTER TABLE "TripLocality" ADD CONSTRAINT "TripLocality_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trip"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TripLocality" ADD CONSTRAINT "TripLocality_localityId_fkey" FOREIGN KEY ("localityId") REFERENCES "Locality"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tag" ADD CONSTRAINT "Tag_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SpecimenTag" ADD CONSTRAINT "SpecimenTag_specimenId_fkey" FOREIGN KEY ("specimenId") REFERENCES "Specimen"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SpecimenTag" ADD CONSTRAINT "SpecimenTag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
