-- CreateTable
CREATE TABLE "workspaces" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "workspaces_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "templates" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "htmlContent" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "email_template_mappings" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "lang" TEXT NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "workspaceId" TEXT,
    "templateId" TEXT NOT NULL,

    CONSTRAINT "email_template_mappings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "email_template_mappings_type_lang_isDefault_idx" ON "email_template_mappings"("type", "lang", "isDefault");

-- CreateIndex
CREATE UNIQUE INDEX "email_template_mappings_type_lang_workspaceId_key" ON "email_template_mappings"("type", "lang", "workspaceId");

-- AddForeignKey
ALTER TABLE "email_template_mappings" ADD CONSTRAINT "email_template_mappings_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "email_template_mappings" ADD CONSTRAINT "email_template_mappings_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "templates"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
