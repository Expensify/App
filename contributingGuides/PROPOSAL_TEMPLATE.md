## Proposal

### Please re-state the problem that we are trying to solve in this issue.

After an admin approves an expense, the status message incorrectly changes from "Waiting for admin to pay expense" to "Waiting for you to finish setting up business bank account" even when the expense has been properly approved and should be showing a payment-related status message. This creates user confusion as the displayed status doesn't match the actual workflow state.

### What is the root cause of that problem?

The root cause is in the expense status message logic priority system. Currently, the system checks for bank account setup requirements before properly evaluating the approved expense state. When an expense transitions to the approved state, the status logic incorrectly prioritizes the bank account setup check over the "waiting for payment" state, causing the wrong message to display even though the expense is approved and ready for payment processing.

### What changes do you think we should make in order to solve the problem?

We should restructure the expense status message logic with proper priority ordering:

1. **Fix Priority Logic in ReportUtils**: Update `getExpenseStatusMessage()` to check approved-but-unpaid state first, before checking bank account setup requirements.

2. **Add State Guards**: Ensure bank account setup messages only show for expenses that haven't been approved yet.

3. **Improve State Transitions**: Add proper state management in the approval flow to prevent intermediate state confusion.

4. **Add Debouncing**: Implement debounced status updates to prevent rapid message changes during state transitions.

The key change is reordering the conditional checks so that approved expenses always show payment-related messages, and bank account setup messages only appear for non-approved expenses.

### What specific scenarios should we cover in automated tests to prevent reintroducing this issue in the future?

**Unit Tests:**
- Test `getExpenseStatusMessage()` returns "waiting for payment" when expense state is APPROVED and isPaid is false
- Test that approved expenses never return bank account setup messages, regardless of bank account status
- Test status message returns correct admin vs non-admin payment messages for approved expenses

**Integration Tests:**
- Test complete approval workflow: submit expense → approve → verify "waiting for payment" message displays
- Test that status message remains stable after approval and doesn't revert to bank account setup
- Test approval flow with various policy configurations (with/without bank accounts)

**E2E Tests:**
- Test user sees correct status progression: submitted → approved → waiting for payment
- Test admin approval flow shows appropriate messages for both admin and employee views
- Test that status messages remain consistent during network delays or slow API responses

### What alternative solutions did you explore? (Optional)

**Alternative 1**: Add a new expense state specifically for "approved-awaiting-payment" - This would require more extensive backend changes and state machine updates.

**Alternative 2**: Use feature flags to gradually roll out the fix - This adds complexity without addressing the core logic issue.

**Alternative 3**: Cache status messages and only update on specific state changes - This could mask underlying state management issues rather than fixing them.

The chosen solution directly addresses the root cause in the status logic priority system, making it the most straightforward and maintainable approach.[expensify-fix-64153.pdf](https://github.com/user-attachments/files/20864704/expensify-fix-64153.pdf)
[expensify-solution-code.txt](https://github.com/user-attachments/files/20864703/expensify-solution-code.txt)
