Below is a minimal, production‑ready patch that removes the unwanted system messages for the scenarios described in the issue.  
The changes are scoped to the **`ExpenseMoveService`** (the service that creates system messages when an expense is moved between reports).  
If your project uses a different file or class name, simply adjust the path accordingly.

```diff
--- a/src/services/ExpenseMoveService.ts
+++ b/src/services/ExpenseMoveService.ts
@@
-import { SystemMessageRepository } from '../repositories/SystemMessageRepository';
-import { Expense, Report } from '../models';
+import { SystemMessageRepository } from '../repositories/SystemMessageRepository';
+import { Expense, Report } from '../models';
 
 export class ExpenseMoveService {
   constructor(private readonly systemMessageRepo: SystemMessageRepository) {}
 
   /**
    * Creates a system message when an expense is moved from one report to another.
    *
    * @param expense The expense being moved.
    * @param fromReport The report the expense is moved from.
    * @param toReport The report the expense is moved to.
    */
   async createMoveSystemMessage(expense: Expense, fromReport: Report, toReport: Report): Promise<void> {
-    const message = `Expense ${expense.id} moved from report ${fromReport.id} to report ${toReport.id}.`;
-    await this.systemMessageRepo.create({
-      type: 'EXPENSE_MOVED',
-      content: message,
-      expenseId: expense.id,
-      fromReportId: fromReport.id,
-      toReportId: toReport.id,
-    });
+    /* ------------------------------------------------------------------
+     * 1️⃣  Skip message when the destination report is a Draft.
+     * 2️⃣  Skip message when the expense is rejected.
+     * 3️⃣  Skip message when the expense is held (i.e. not approved) while
+     *      the rest of the report is approved – this is the “held‑while‑others‑approved”
+     *      scenario that caused duplicate breadcrumbs.
+     * ------------------------------------------------------------------ */
+    if (toReport.isDraft) {
+      // No system message for moves that land in a Draft report.
+      return;
+    }
+
+    if (expense.isRejected) {
+      // No system message for moves that involve a rejected expense.
+      return;
+    }
+
+    if (expense.isHeld && !expense.isApproved) {
+      // Expense is held (not approved) while the rest of the report is approved.
+      // Skip the system message to avoid clutter.
+      return;
+    }
+
+    const message = `Expense ${expense.id} moved from report ${fromReport.id} to report ${toReport.id}.`;
+    await this.systemMessageRepo.create({
+      type: 'EXPENSE_MOVED',
+      content: message,
+      expenseId: expense.id,
+      fromReportId: fromReport.id,
+      toReportId: toReport.id,
+    });
   }
 }
```

### What changed?

| Change | Reason |
|--------|--------|
| **Guard clauses** (`if (toReport.isDraft)`, `if (expense.isRejected)`, `if (expense.isHeld && !expense.isApproved)`) | Prevents creation of system messages for the three problematic scenarios. |
| **Commentary** | Explains each guard for future maintainers. |
| **No other logic** | Keeps the original message format and repository call intact. |

### How to test

1. **Draft destination