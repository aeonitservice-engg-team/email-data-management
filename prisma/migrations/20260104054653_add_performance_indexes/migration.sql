-- CreateEnum
CREATE TYPE "Status" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateTable
CREATE TABLE "brands" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "status" "Status" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "brands_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "journals" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "issn" TEXT,
    "subject" TEXT,
    "frequency" TEXT,
    "status" "Status" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "brand_id" TEXT NOT NULL,

    CONSTRAINT "journals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "email_contacts" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "article_title" TEXT,
    "year" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "journal_id" TEXT NOT NULL,

    CONSTRAINT "email_contacts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "brands_name_key" ON "brands"("name");

-- CreateIndex
CREATE UNIQUE INDEX "brands_code_key" ON "brands"("code");

-- CreateIndex
CREATE INDEX "brands_status_idx" ON "brands"("status");

-- CreateIndex
CREATE INDEX "brands_created_at_idx" ON "brands"("created_at");

-- CreateIndex
CREATE INDEX "journals_brand_id_idx" ON "journals"("brand_id");

-- CreateIndex
CREATE INDEX "journals_status_idx" ON "journals"("status");

-- CreateIndex
CREATE INDEX "journals_created_at_idx" ON "journals"("created_at");

-- CreateIndex
CREATE INDEX "journals_brand_id_status_idx" ON "journals"("brand_id", "status");

-- CreateIndex
CREATE INDEX "journals_status_name_idx" ON "journals"("status", "name");

-- CreateIndex
CREATE INDEX "email_contacts_journal_id_idx" ON "email_contacts"("journal_id");

-- CreateIndex
CREATE INDEX "email_contacts_created_at_idx" ON "email_contacts"("created_at");

-- CreateIndex
CREATE INDEX "email_contacts_email_idx" ON "email_contacts"("email");

-- CreateIndex
CREATE INDEX "email_contacts_year_idx" ON "email_contacts"("year");

-- CreateIndex
CREATE INDEX "email_contacts_journal_id_created_at_idx" ON "email_contacts"("journal_id", "created_at");

-- CreateIndex
CREATE INDEX "email_contacts_created_at_id_idx" ON "email_contacts"("created_at", "id");

-- CreateIndex
CREATE UNIQUE INDEX "email_contacts_email_journal_id_key" ON "email_contacts"("email", "journal_id");

-- AddForeignKey
ALTER TABLE "journals" ADD CONSTRAINT "journals_brand_id_fkey" FOREIGN KEY ("brand_id") REFERENCES "brands"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "email_contacts" ADD CONSTRAINT "email_contacts_journal_id_fkey" FOREIGN KEY ("journal_id") REFERENCES "journals"("id") ON DELETE CASCADE ON UPDATE CASCADE;
