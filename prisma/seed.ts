import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient();

async function main() {
  const defaultWorkspace = await prisma.workspace.upsert({
    where: { id: '550e8400-e29b-41d4-a716-446655440000' },
    update: {},
    create: {
      id: '550e8400-e29b-41d4-a716-446655440000',
      name: 'Default Workspace',
    },
  });

  const secondWorkspace = await prisma.workspace.upsert({
    where: { id: '6ba7b810-9dad-11d1-80b4-00c04fd430c8' },
    update: {},
    create: {
      id: '6ba7b810-9dad-11d1-80b4-00c04fd430c8',
      name: 'Second Workspace',
    },
  });

  console.log(
    `Created workspaces: ${defaultWorkspace.name}, ${secondWorkspace.name}`,
  );

  const welcomeTemplateEn = await prisma.template.upsert({
    where: { id: '7c9e6679-7425-40de-944b-e07fc1f90ae7' },
    update: {},
    create: {
      id: '7c9e6679-7425-40de-944b-e07fc1f90ae7',
      name: 'Welcome Email Template (EN)',
      htmlContent:
        '<h1>Welcome to our service!</h1><p>We are happy to have you on board.</p>',
      version: '1.0.0',
    },
  });

  const otpTemplateEn = await prisma.template.upsert({
    where: { id: '550e8400-e29b-41d4-a716-446655440001' },
    update: {},
    create: {
      id: '550e8400-e29b-41d4-a716-446655440001',
      name: 'OTP Email Template (EN)',
      htmlContent:
        '<h1>Your verification code</h1><p>Use this code to verify your account: 7723</p>',
      version: '1.0.0',
    },
  });

  const resetPasswordTemplateEn = await prisma.template.upsert({
    where: { id: '6ba7b810-9dad-11d1-80b4-00c04fd430c9' },
    update: {},
    create: {
      id: '6ba7b810-9dad-11d1-80b4-00c04fd430c9',
      name: 'Reset Password Template (EN)',
      htmlContent:
        '<h1>Reset your password</h1><p>Click the link below to reset your password: <a href="{{resetLink}}">Reset Password</a></p>',
      version: '1.0.0',
    },
  });

  const welcomeTemplateFr = await prisma.template.upsert({
    where: { id: '7c9e6679-7425-40de-944b-e07fc1f90ae8' },
    update: {},
    create: {
      id: '7c9e6679-7425-40de-944b-e07fc1f90ae8',
      name: 'Welcome Email Template (FR)',
      htmlContent:
        '<h1>Bienvenue dans notre service !</h1><p>Nous sommes ravis de vous compter parmi nous.</p>',
      version: '1.0.0',
    },
  });

  const otpTemplateFr = await prisma.template.upsert({
    where: { id: '550e8400-e29b-41d4-a716-446655440002' },
    update: {},
    create: {
      id: '550e8400-e29b-41d4-a716-446655440002',
      name: 'OTP Email Template (FR)',
      htmlContent:
        '<h1>Votre code de vérification</h1><p>Utilisez ce code pour vérifier votre compte : 4586</p>',
      version: '1.0.0',
    },
  });

  const resetPasswordTemplateFr = await prisma.template.upsert({
    where: { id: '6ba7b810-9dad-11d1-80b4-00c04fd430ca' },
    update: {},
    create: {
      id: '6ba7b810-9dad-11d1-80b4-00c04fd430ca',
      name: 'Reset Password Template (FR)',
      htmlContent:
        '<h1>Réinitialisation de votre mot de passe</h1><p>Cliquez sur le lien ci-dessous pour réinitialiser votre mot de passe : <a href="{{resetLink}}">Réinitialiser le mot de passe</a></p>',
      version: '1.0.0',
    },
  });

  console.log(
    `Created templates: ${welcomeTemplateEn.name}, ${otpTemplateEn.name}, ${resetPasswordTemplateEn.name}, ${welcomeTemplateFr.name}, ${otpTemplateFr.name}, ${resetPasswordTemplateFr.name}`,
  );

  const templateMappings = [
    // Mappings globaux (sans workspace)
    {
      type: 'welcome',
      lang: 'en',
      isDefault: true,
      templateId: welcomeTemplateEn.id,
      workspaceId: null,
    },
    {
      type: 'welcome',
      lang: 'fr',
      isDefault: true,
      templateId: welcomeTemplateFr.id,
      workspaceId: null,
    },
    {
      type: 'otp',
      lang: 'en',
      isDefault: true,
      templateId: otpTemplateEn.id,
      workspaceId: null,
    },
    {
      type: 'otp',
      lang: 'fr',
      isDefault: true,
      templateId: otpTemplateFr.id,
      workspaceId: null,
    },
    {
      type: 'reset_password',
      lang: 'en',
      isDefault: true,
      templateId: resetPasswordTemplateEn.id,
      workspaceId: null,
    },
    {
      type: 'reset_password',
      lang: 'fr',
      isDefault: true,
      templateId: resetPasswordTemplateFr.id,
      workspaceId: null,
    },

    // Mappings pour Default Workspace
    {
      type: 'welcome',
      lang: 'en',
      isDefault: true,
      templateId: welcomeTemplateEn.id,
      workspaceId: defaultWorkspace.id,
    },
    {
      type: 'welcome',
      lang: 'fr',
      isDefault: true,
      templateId: welcomeTemplateFr.id,
      workspaceId: defaultWorkspace.id,
    },
    {
      type: 'otp',
      lang: 'en',
      isDefault: true,
      templateId: otpTemplateEn.id,
      workspaceId: defaultWorkspace.id,
    },
    {
      type: 'otp',
      lang: 'fr',
      isDefault: true,
      templateId: otpTemplateFr.id,
      workspaceId: defaultWorkspace.id,
    },
    {
      type: 'reset_password',
      lang: 'en',
      isDefault: true,
      templateId: resetPasswordTemplateEn.id,
      workspaceId: defaultWorkspace.id,
    },
    {
      type: 'reset_password',
      lang: 'fr',
      isDefault: true,
      templateId: resetPasswordTemplateFr.id,
      workspaceId: defaultWorkspace.id,
    },

    // Mappings pour Second Workspace
    {
      type: 'welcome',
      lang: 'en',
      isDefault: true,
      templateId: welcomeTemplateEn.id,
      workspaceId: secondWorkspace.id,
    },
    {
      type: 'welcome',
      lang: 'fr',
      isDefault: true,
      templateId: welcomeTemplateFr.id,
      workspaceId: secondWorkspace.id,
    },
    {
      type: 'otp',
      lang: 'en',
      isDefault: true,
      templateId: otpTemplateEn.id,
      workspaceId: secondWorkspace.id,
    },
    {
      type: 'otp',
      lang: 'fr',
      isDefault: true,
      templateId: otpTemplateFr.id,
      workspaceId: secondWorkspace.id,
    },
    {
      type: 'reset_password',
      lang: 'en',
      isDefault: true,
      templateId: resetPasswordTemplateEn.id,
      workspaceId: secondWorkspace.id,
    },
    {
      type: 'reset_password',
      lang: 'fr',
      isDefault: true,
      templateId: resetPasswordTemplateFr.id,
      workspaceId: secondWorkspace.id,
    },
  ];

  for (const mapping of templateMappings) {
    await prisma.emailTemplateMapping.upsert({
      where: {
        type_lang_workspaceId: {
          type: mapping.type,
          lang: mapping.lang,
          workspaceId: String(mapping.workspaceId),
        },
      },
      update: {
        isDefault: mapping.isDefault,
        templateId: mapping.templateId,
      },
      create: mapping,
    });
  }

  console.log(`Created ${templateMappings.length} template mappings`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
