{
  "file": "src/pages/domain/AddDomainVerifyAccountPage.tsx",
  "content": "import React from 'react';\nimport VerifyAccountPageBase from '@pages/settings/VerifyAccountPageBase';\nimport ROUTES from '@src/ROUTES';\n\nfunction AddDomainVerifyAccountPage() {\n    return <VerifyAccountPageBase navigateBackTo={ROUTES.WORKSPACES_ADD_DOMAIN} shouldForceEnableTwoFactorAuth />;\n}\n\nexport default AddDomainVerifyAccountPage;"
}