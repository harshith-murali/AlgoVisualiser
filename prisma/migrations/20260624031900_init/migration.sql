-- CreateEnum
CREATE TYPE "ModuleType" AS ENUM ('cpu', 'page', 'disk', 'deadlock');

-- CreateTable
CREATE TABLE "UserProfile" (
    "clerkUserId" TEXT NOT NULL,
    "email" TEXT,
    "name" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserProfile_pkey" PRIMARY KEY ("clerkUserId")
);

-- CreateTable
CREATE TABLE "SimulationProject" (
    "id" TEXT NOT NULL,
    "clerkUserId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "moduleType" "ModuleType" NOT NULL,
    "algorithm" TEXT NOT NULL,
    "inputData" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SimulationProject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SimulationRun" (
    "id" TEXT NOT NULL,
    "clerkUserId" TEXT NOT NULL,
    "moduleType" "ModuleType" NOT NULL,
    "algorithm" TEXT NOT NULL,
    "inputData" JSONB NOT NULL,
    "resultData" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SimulationRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SavedPreset" (
    "id" TEXT NOT NULL,
    "clerkUserId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "moduleType" "ModuleType" NOT NULL,
    "algorithm" TEXT NOT NULL,
    "presetData" JSONB NOT NULL,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SavedPreset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RecentActivity" (
    "id" TEXT NOT NULL,
    "clerkUserId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "metadata" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RecentActivity_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SimulationProject_clerkUserId_moduleType_idx" ON "SimulationProject"("clerkUserId", "moduleType");

-- CreateIndex
CREATE INDEX "SimulationRun_clerkUserId_createdAt_idx" ON "SimulationRun"("clerkUserId", "createdAt");

-- CreateIndex
CREATE INDEX "SavedPreset_clerkUserId_moduleType_idx" ON "SavedPreset"("clerkUserId", "moduleType");

-- CreateIndex
CREATE INDEX "RecentActivity_clerkUserId_createdAt_idx" ON "RecentActivity"("clerkUserId", "createdAt");
