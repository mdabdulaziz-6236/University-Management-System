-- CreateTable
CREATE TABLE "faculty" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "shortName" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "faculty_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "faculty_name_key" ON "faculty"("name");

-- CreateIndex
CREATE UNIQUE INDEX "faculty_shortName_key" ON "faculty"("shortName");

-- CreateIndex
CREATE UNIQUE INDEX "faculty_code_key" ON "faculty"("code");
