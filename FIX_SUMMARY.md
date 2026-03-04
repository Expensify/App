# Expensify App - Bug Fix Submission

## Issue
**Issue #78241:** [$500] Invoice shows "waiting for user to add a bank account" despite payer already having a verified bank account

**Bounty:** $500 USD

## Problem
When a payer pays an invoice with a credit card, the payee (who already has a Verified Business Bank Account - VBBA) incorrectly sees the message: "[payer] started payment, but is waiting for [payee] to add a bank account."

This message should not appear when the payee's policy already has an active VBBA.

## Root Cause
The `getReportPreviewMessage()` function in `src/libs/ReportUtils.ts` was unconditionally showing the "waiting for bank account" message whenever `report.isWaitingOnBankAccount` was true, without verifying whether the policy actually has a VBBA.

The `isWaitingOnBankAccount` flag comes from the backend, but the frontend should validate this against the actual policy state before displaying the message to the user.

## Solution
Modified `src/libs/ReportUtils.ts` line 5400-5407 to check if the policy has a VBBA before showing the "waiting for bank account" message:

```typescript
// Check if the report is waiting on a bank account AND the policy doesn't have a verified business bank account (VBBA)
// This prevents showing the "waiting for bank account" message when the user already has a VBBA set up
const hasVBBA = !!policy?.achAccount?.bankAccountID && policy.achAccount.state === CONST.BANK_ACCOUNT.STATE.OPEN;
if (report.isWaitingOnBankAccount && !hasVBBA) {
    const submitterDisplayName = getDisplayNameForParticipant({accountID: report.ownerAccountID, shouldUseShortForm: true, formatPhoneNumber: formatPhoneNumberPhoneUtils}) ?? '';
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    return translateLocal('iou.waitingOnBankAccount', {submitterDisplayName});
}
```

## Changes Made
**File:** `src/libs/ReportUtils.ts`
**Line:** 5400-5407
**Function:** `getReportPreviewMessage()`

### Before:
```typescript
if (report.isWaitingOnBankAccount) {
    const submitterDisplayName = getDisplayNameForParticipant({...}) ?? '';
    return translateLocal('iou.waitingOnBankAccount', {submitterDisplayName});
}
```

### After:
```typescript
// Check if the report is waiting on a bank account AND the policy doesn't have a verified business bank account (VBBA)
// This prevents showing the "waiting for bank account" message when the user already has a VBBA set up
const hasVBBA = !!policy?.achAccount?.bankAccountID && policy.achAccount.state === CONST.BANK_ACCOUNT.STATE.OPEN;
if (report.isWaitingOnBankAccount && !hasVBBA) {
    const submitterDisplayName = getDisplayNameForParticipant({...}) ?? '';
    return translateLocal('iou.waitingOnBankAccount', {submitterDisplayName});
}
```

## Testing
The fix ensures:
1. ✅ Users with a VBBA (achAccount.bankAccountID exists AND state === OPEN) will NOT see the "waiting for bank account" message
2. ✅ Users without a VBBA will still see the message as expected
3. ✅ TypeScript compilation passes with no errors

## VBBA Check Logic
A policy has a VBBA when:
- `policy.achAccount?.bankAccountID` exists (truthy)
- `policy.achAccount.state === CONST.BANK_ACCOUNT.STATE.OPEN`

This matches the pattern used elsewhere in the codebase (e.g., `src/libs/SearchUIUtils.ts`, `src/pages/workspace/workflows/WorkspaceWorkflowsPage.tsx`).

## Impact
- **User Experience:** Users with VBBA will no longer see confusing messages asking them to add a bank account they already have
- **Backward Compatibility:** Users without VBBA will continue to see the message as before
- **No Breaking Changes:** This is a pure bug fix that corrects incorrect message display

## Submission
**Author:** Walle (AI Assistant)
**Date:** 2026-03-04
**Issue:** Expensify/App #78241
**Bounty Amount:** $500 USD

## Next Steps
1. Submit PR to Expensify/App repository
2. Follow contributing guidelines for external contributors
3. Request review from @stephanieelliott (issue reporter) and @huult (issue owner)
