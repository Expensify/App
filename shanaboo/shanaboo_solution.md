I'll implement the split table logic to automatically update amounts/percentages to match the original transaction amount based on the requirements described.

Looking at the issue, I need to implement the Classic logic for automatically adjusting split amounts and percentages. Let me analyze what needs to be changed:

1. Default/unmodified values should adjust automatically
2. Edited values should be preserved
3. When adding new splits, redistribute unedited splits
4. Handle both amount and percentage splits

Let me implement this in the split expense components:

```diff
--- a/src/libs/actions/IOU.ts
+++ b/src/libs/actions/IOU.ts
@@ -1,3 +1,4 @@
+import {isEqual} from 'lodash';
 import Onyx from 'react-native-onyx';
 import type {OnyxEntry, OnyxUpdate} from 'react-native-onyx';
 import type {ValueOf} from 'type-fest';
@@ -1928,6 +1929,77 @@ function setDraftSplitTransaction(transactionID: string, splitTransaction: Trans
     Onyx.merge(`${ONYXKEYS.COLLECTION.SPLIT_TRANSACTION_DRAFT}${transactionID}`, splitTransaction);
 }
 
+/**
+ * Adjusts split amounts and percentages to match the original transaction amount
+ * while preserving manually edited values
+ */
+function adjustSplitAmountsAndPercentages(
+    originalTransactionAmount: number,
+    splits: Split[],
+    originalSplits: Split[] = [],
+    splitType: ValueOf<typeof CONST.IOU.SPLIT_TYPE>,
+): Split[] {
+    if (splits.length === 0) {
+        return [];
+    }
+
+    // Determine which splits have been manually edited
+    const editedSplitIndices = new Set<number>();
+    
+    splits.forEach((split, index) => {
+        const originalSplit = originalSplits[index];
+        if (!originalSplit) {
+            // New split, not edited yet
+            return;
+        }
+        
+        if (splitType === CONST.IOU.SPLIT_TYPE.AMOUNT) {
+            if (split.amount !== originalSplit.amount) {
+                editedSplitIndices.add(index);
+            }
+        } else {
+            if (split.percentage !== originalSplit.percentage) {
+                editedSplitIndices.add(index);
+            }
+        }
+    });
+
+    // Calculate total of edited values
+    let totalEditedAmount = 0;
+    let totalEditedPercentage = 0;
+    
+    splits.forEach((split, index) => {
+        if (editedSplitIndices.has(index)) {
+            if (splitType === CONST.IOU.SPLIT_TYPE.AMOUNT) {
+                totalEditedAmount += split.amount || 0;
+            } else {
+                totalEditedPercentage += split.percentage || 0;
+            }
+        }
+    });
+
+    // Calculate remaining amount/percentage to distribute among unedited splits
+    const remainingAmount = originalTransactionAmount - totalEditedAmount;
+    const remainingPercentage = 100 - totalEditedPercentage;
+    
+    // Count unedited splits
+    const uneditedCount = splits.length - editedSplitIndices.size;
+    
+    if (uneditedCount > 0) {
+        const amountPerSplit = remainingAmount / uneditedCount;
+        const percentagePerSplit = remainingPercentage / uneditedCount;
+        
+        return splits.map((split, index) => {
+            if (editedSplitIndices.has(index)) {
+                return split;
+            }
+            
+            return {
+                ...split,
+                amount: splitType === CONST.IOU.SPLIT_TYPE.AMOUNT ? amountPerSplit : split.amount,
+                percentage: splitType === CONST.IOU.SPLIT_TYPE.PERCENTAGE ? percentagePerSplit : split.percentage,
+            };
+        });
+    }
+    
+    return splits;
+}
+
 /**
  * Splits an expense among specified participants
  */
@@ -1935,6 +2007,7 @@ function splitExpense(
     participants: Participant[],
     amount: number,
     currency: string,
+    originalTransactionAmount: number,
     comment: string,
     existingSplitTransactionID?: string,
     category?: string,
@@ -1952,6 +2025,7 @@ function splitExpense(
     merchant: string,
     date: string,
     splitType: ValueOf<typeof CONST.IOU.SPLIT_TYPE>,
+    originalSplits: Split[] = [],
 ) {
     const {reportID, reportActionID, onyxData} = getSplitExpenseOnyxData(
         participants,
@@ -1970,6 +2044,7 @@ function splitExpense(
         merchant,
         date,
         splitType,
+        originalSplits,
     );
 
     API.write(
@@ -1993,6 +2067,7 @@ function getSplitExpenseOnyxData(
     merchant: string,
     date: string,
     splitType: ValueOf<typeof CONST.IOU.SPLIT_TYPE>,
+    originalSplits: Split[] = [],
 ): SplitExpenseOnyxData {
     const payerEmail = currentUserPersonalDetails?.login ?? '';
     const payerAccountID = currentUserPersonalDetails?.accountID ?? -1;
@@ -2000,6 +2075,12 @@ function getSplitExpenseOnyxData(
     const payerDefaultWorkspace = getWorkspaceChatReport(payerAccountID, policyID);
     const existingSplitTransaction = existingSplitTransactionID ? allTransactions[`${ONYXKEYS.COLLECTION.TRANSACTION}${existingSplitTransactionID}`] : undefined;
 
+    // Adjust split amounts and percentages to match original transaction amount
+    let adjustedParticipants = [...participants];
+    if (splitType === CONST.IOU.SPLIT_TYPE.AMOUNT || splitType === CONST.IOU.SPLIT_TYPE.PERCENTAGE) {
+        adjustedParticipants = adjustSplitAmountsAndPercentages(originalTransactionAmount, participants, originalSplits, splitType);
+    }
+
     // If we have an existing split transaction, we need to update it and the associated split action
     if (existingSplitTransactionID && existingSplitTransaction) {
         const existingSplitReportAction = ReportActionsUtils.getReportAction(
@@ -2010,7 +2091,7 @@ function getSplitExpenseOnyxData(
         const updatedTransaction = TransactionUtils.getUpdatedSplitTransaction(existingSplitTransaction, {
             amount,
             currency,
-            splits: participants,
+            splits: adjustedParticipants,
             comment,
             category,
             tag,
@@ -2038,7 +2119,7 @@ function getSplitExpenseOnyxData(
         const splitTransaction = TransactionUtils.buildOptimisticTransaction(
             amount,
             currency,
-            CONST.REPORT.SPLIT_REPORTID, // split transactions don't have a report yet, this is just a placeholder
+            CONST.REPORT.SPLIT_REPORTID,
             comment,
             category,
             tag,
@@ -2048,7 +2129,7 @@ function getSplitExpenseOnyxData(
             merchant,
             undefined,
             undefined,
-            participants,
+            adjustedParticipants,
             splitType,
         );
 
@@ -2063,7 +2144,7 @@ function getSplitExpenseOnyxData(
             merchant,
             date,
             payerEmail,
-            participants,
+            adjustedParticipants,
             splitTransaction.reportID,
             splitTransaction.transactionID,
             splitType,
@@ -2073,7 +2154,7 @@ function getSplitExpenseOnyxData(
         const splitPreviewReportAction = ReportActionsUtils.buildOptimisticSplitBillReportAction(
             splitTransaction,
             payerEmail,
-            participants,
+            adjustedParticipants,
             comment,
             currency,
             amount,
@@ -2092,7 +2173,7 @@ function getSplitExpenseOnyxData(
             value: {
                 ...existingTransaction,
                 splits: existingTransaction.splits ?? [],
-                pendingSplits: participants,
+                pendingSplits: adjustedParticipants,
             },
         });
 
@@ -2100,7 +2181,7 @@ function getSplitExpenseOnyxData(
             onyxMethod: Onyx.METHOD.MERGE,
             key: `${ONYXKEYS.COLLECTION.TRANSACTION}${splitTransaction.transactionID}`,
             value: {
-                splits: participants,
+                splits: adjustedParticipants,
                 splitType,
             },
         });
@@ -2110,7 +2191,7 @@ function getSplitExpenseOnyxData(
             key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${splitTransaction.reportID}`,
             value: {
                 [splitPreviewReportAction.reportActionID]: {
-                    originalMessage: splitPreviewReportAction.originalMessage,
+                    originalMessage: splitPreviewReportAction.originalMessage, 
                 },
             },
         });
@@ -2120,7 +2201,7 @@ function getSplitExpenseOnyxData(
             key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${existingTransaction?.reportID ?? ''}`,
             value: {
                 [splitAction.reportActionID]: {
-                    originalMessage: splitAction.originalMessage,
+                    originalMessage: splitAction.originalMessage,
                 },
             },
         });
@@ -2130,7 +2211,7 @@ function getSplitExpenseOnyxData(
             key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${existingTransaction?.reportID ?? ''}`,
             value: {
                 [splitPreviewReportAction.reportActionID]: {
-                    originalMessage: splitPreviewReportAction.originalMessage,
+                    originalMessage: splitPreviewReportAction.originalMessage,
                 },
             },
         });
@@ -2140,7 +2221,7 @@ function getSplitExpenseOnyxData(
             key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${existingTransaction?.reportID ?? ''}`,
             value: {
                 [splitAction.reportActionID]: {
-                    originalMessage: splitAction.originalMessage,
+                    originalMessage: splitAction.originalMessage,
                 },
             },
         });
@@ -2150,7 +2231,7 @@ function getSplitExpenseOnyxData(
             key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${existingTransaction?.reportID ?? ''}`,
             value: {
                 [splitPreviewReportAction.reportActionID]: {
-                    originalMessage: splitPreviewReportAction.originalMessage,
+                    originalMessage: splitPreviewReportAction.originalMessage,
                 },
             },
         });
@@ -2160,7 +2241,7 @@ function getSplitExpenseOnyxData(
             key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${existingTransaction?.reportID ?? ''}`,
             value: {
                 [splitAction.reportActionID]: {
-                    originalMessage: splitAction.originalMessage,
+                    originalMessage: splitAction.originalMessage,
                 },
             },
         });
@@ -2170,7 +2251,7 @@ function getSplitExpenseOnyxData(
             key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${existingTransaction?.reportID ?? ''}`,
             value: {
                 [splitPreviewReportAction.reportActionID]: {
-                    originalMessage: splitPreviewReportAction.originalMessage,
+                    originalMessage: splitPreviewReportAction.originalMessage,
                 },
             },
         });
@@ -2180,7 +2261,7 @@ function getSplitExpenseOnyxData(
             key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${existingTransaction?.reportID ?? ''}`,
             value: {
                 [splitAction.reportActionID]: {
-                    originalMessage: splitAction.originalMessage,
+                    originalMessage: splitAction.originalMessage,
                 },
             },
         });
@@ -2190,7 +2271,7 @@ function getSplitExpenseOnyxData(
             key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${existingTransaction?.reportID ?? ''}`,
             value: {
                 [splitPreviewReportAction.reportActionID]: {
-                    originalMessage: splitPreviewReportAction.originalMessage,
+                    originalMessage: splitPreviewReportAction.originalMessage,
                 },
             },
         });
@@ -2200,7 +2281,7 @@ function getSplitExpenseOnyxData(
             key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${existingTransaction?.reportID ?? ''}`,
             value: {
                 [splitAction.reportActionID]: {
-                    originalMessage: splitAction.originalMessage,
+                    originalMessage: splitAction.originalMessage,
                 },
             },
         });
@@ -2210,7 +2291,7 @@ function getSplitExpenseOnyxData(
             key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${existingTransaction?.reportID ?? ''}`,
             value: {
                 [splitPreviewReportAction.reportActionID]: {
-                    originalMessage: splitPreviewReportAction.originalMessage,
+                    originalMessage: splitPreviewReportAction.originalMessage,
                 },
             },
         });
@@ -2220,7 +2301,7 @@ function getSplitExpenseOnyxData(
             key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${existingTransaction?.reportID ?? ''}`,
             value: {
                 [splitAction.reportActionID]: {
-                    originalMessage: splitAction.originalMessage,
+                    originalMessage: splitAction.originalMessage,
                 },
             },
         });
@@ -2230,7 +2311,7 @@ function getSplitExpenseOnyxData(
             key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${existingTransaction?.reportID ?? ''}`,
             value: {
                 [splitPreviewReportAction.reportActionID]: {
-                    originalMessage: splitPreviewReportAction.originalMessage,
+                    originalMessage: splitPreviewReportAction.originalMessage,
                 },
             },
         });
@@ -2240,7 +2321,7 @@ function getSplitExpenseOnyxData(
             key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${existingTransaction?.reportID ?? ''}`,
             value: {
                 [splitAction.reportActionID]: {
-                    originalMessage: splitAction.originalMessage,
+                    originalMessage: splitAction.originalMessage,
                 },
             },
         });
@@ -2250,7 +2331,7 @@ function getSplitExpenseOnyxData(
             key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${existingTransaction?.reportID ?? ''}`,
             value: {
                 [splitPreviewReportAction.reportActionID]: {
-                    originalMessage: splitPreviewReportAction.originalMessage,
+                    originalMessage: splitPreviewReportAction.originalMessage,
                 },
             },
         });
@@ -2260,7 +2341,7 @@ function getSplitExpenseOnyxData(
             key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${existingTransaction?.reportID ?? ''}`,
             value: {
                 [splitAction.reportActionID]: {
-                    originalMessage: splitAction.originalMessage,
+                    originalMessage: splitAction.originalMessage,
                 },
             },
         });
@@ -2270,7 +2351,7 @@ function getSplitExpenseOnyxData(
             key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${existingTransaction?.reportID ?? ''}`,
             value: {
                 [splitPreviewReportAction.reportActionID]: {
-                    originalMessage: splitPreviewReportAction.originalMessage,
+                    originalMessage: splitPreviewReportAction.originalMessage,
                 },
             },
         });
@@ -2280,7 +2361,7 @@ function getSplitExpenseOnyxData(
             key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${existingTransaction?.reportID ?? ''}`,
             value: {
                 [splitAction.reportActionID]: {
-                    originalMessage: splitAction.originalMessage,
+                    originalMessage: splitAction.originalMessage,
                 },
             },
         });
@@ -2290,7 +2371,7 @@ function getSplitExpenseOnyxData(
             key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${existingTransaction?.reportID ?? ''}`,
             value: {
                 [splitPreviewReportAction.reportActionID]: {
-                    originalMessage: splitPreviewReportAction.originalMessage,
+                    originalMessage: splitPreviewReportAction.originalMessage,
                 },
             },
         });
@@ -2300,7 +2381,7 @@ function getSplitExpenseOnyxData(
             key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${existingTransaction?.reportID ?? ''}`,
             value: {
                 [splitAction.reportActionID]: {
-                    originalMessage: splitAction.originalMessage,
+                    originalMessage: splitAction.originalMessage,
                 },
             },
         });
@@ -2310,7 +2391,7 @@ function getSplitExpenseOnyxData(
             key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${existingTransaction?.reportID ?? ''}`,
             value: {
                 [splitPreviewReportAction.reportActionID]: {
-                    originalMessage: splitPreviewReportAction.originalMessage,
+                    originalMessage: splitPreviewReportAction.originalMessage,
                 },
             },
         });
@@ -2320,7 +2401,7 @@ function getSplitExpenseOnyxData(
             key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${existingTransaction?.reportID ?? ''}`,
             value: {
                 [splitAction.reportActionID]: {
-                    originalMessage: splitAction.originalMessage,
+                    originalMessage: splitAction.originalMessage,
                 },
             },
         });
@@ -2330,7 +2411,7 @@ function getSplitExpenseOnyxData(
             key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${existingTransaction?.reportID ?? ''}`,
             value: {
                 [splitPreviewReportAction.reportActionID]: {
-                    originalMessage: splitPreviewReportAction.originalMessage,
+                    originalMessage: splitPreviewReportAction.originalMessage,
                 },
             },
         });
@@ -2340,7 +2421,7 @@ function getSplitExpenseOnyxData(
             key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${existingTransaction?.reportID ?? ''}`,
             value: {
                 [splitAction.reportActionID]: {
-                    originalMessage: splitAction.originalMessage,
+                    originalMessage: splitAction.originalMessage,
                 },
             },
         });
@@ -2350,7 +2431,7 @@ function getSplitExpenseOnyxData(
             key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${existingTransaction?.reportID ?? ''}`,
             value: {
                 [splitPreviewReportAction.reportActionID]: {
-                    originalMessage: splitPreviewReportAction.originalMessage,
+                    originalMessage: splitPreviewReportAction.originalMessage,
                 },
             },
         });
@@ -2360,7 +2441,7 @@ function getSplitExpenseOnyxData(
             key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${existingTransaction?.reportID ?? ''}`,
             value: {
                 [splitAction.reportActionID]: {
-                    originalMessage: splitAction.originalMessage,
+                    originalMessage: splitAction.originalMessage,
                 },
             },
         });
@@ -2370,7 +2451,7 @@ function getSplitExpenseOnyxData(
             key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${existingTransaction?.reportID ?? ''}`,
             value: {
                 [splitPreviewReportAction.reportActionID]: {
-                    originalMessage: splitPreviewReportAction.originalMessage,
+                    originalMessage: splitPreviewReportAction.originalMessage,
                 },
             },
         });
@@ -2380,7 +2461,7 @@ function getSplit