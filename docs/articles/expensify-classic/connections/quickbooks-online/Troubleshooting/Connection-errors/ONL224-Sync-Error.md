---
title: ONL224 Sync Error in QuickBooks Online Integration
description: Learn what the ONL224 sync error means in QuickBooks Online and how to ensure admin access before reconnecting the integration.
keywords: ONL224, QuickBooks Online admin required, not listed as admin QuickBooks, connect QuickBooks Online Expensify, QuickBooks Online permissions error, Workspace Admin
internalScope: Audience is Workspace Admins connecting QuickBooks Online to Expensify. Covers resolving the ONL224 sync error caused by missing QuickBooks Online admin access. Does not cover other QuickBooks Online error codes.
---

# ONL224 Sync Error in QuickBooks Online Integration

If you see the error:

ONL224: You’re not listed as an admin for this company.

This means the QuickBooks Online user attempting to connect the integration does not have Admin access, preventing the connection from completing.

---

## Why the ONL224 Sync Error Happens in QuickBooks Online

The ONL224 error typically indicates:

- The user attempting to connect is not a QuickBooks Online Company Admin.
- QuickBooks Online restricts third-party integrations to Admin users.
- The connection attempt failed due to insufficient permissions.

Only QuickBooks Online Admin users can connect a QuickBooks account to a Workspace.

This is a QuickBooks Online permission issue, not a Workspace configuration issue.

---

## How to Fix the ONL224 Sync Error

This issue must be resolved in QuickBooks Online.

1. Log in to QuickBooks Online.
2. Go to the user management section.
3. Confirm whether your account is listed as a **Company Admin**.
4. If not, request Admin access from an existing Company Admin, or
5. Ask a Company Admin to connect QuickBooks Online to the Workspace.

After confirming Admin access:

1. Go to **Settings > Workspaces**.
2. Select your Workspace.
3. Click **Accounting**.
4. Reconnect QuickBooks Online.
5. Click **Sync Now** to confirm the integration works properly.

---

# FAQ

## Can a Standard QuickBooks User Connect the Integration?

No. Only QuickBooks Online Company Admin users can connect QuickBooks Online to a Workspace.

## Does ONL224 Mean the Connection Is Broken?

Not necessarily. It means the current user does not have sufficient QuickBooks permissions to establish or reconnect the integration.

## Do I Need to Disconnect First?

No. You can reconnect directly using a QuickBooks Online Admin account.
