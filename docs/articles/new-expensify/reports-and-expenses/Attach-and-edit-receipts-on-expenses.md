---
title: Attach and edit receipts on expenses
description: Learn how to properly attach, verify, and troubleshoot receipts on expenses in New Expensify for audits and accounting.
keywords: [New Expensify, attach receipt, verify receipt, missing receipt, expense attachments, audit trail, receipt not showing, crop receipt, rotate receipt, trim receipt, receipt upload failed, receipt upload error, save receipt, delete expense, ereceipt, ereceipts, e-receipt, electronic receipt, digital receipt, auto-generated receipt, multi-page PDF receipt, page count badge, Page 1 of, view all pages of a receipt]
internalScope: Audience is Expensify members and Workspace Admins. Covers attaching, replacing, and cropping receipts on expenses, and viewing every page of a multi-page PDF receipt. Does not cover SmartScan configuration or receipt forwarding via email.
---

Make sure your receipts are attached correctly to individual expenses for audit and accounting compliance. This guide explains how to attach, verify, and troubleshoot receipts in New Expensify — and when to use report comments for additional documentation.

# How to Attach and Verify Receipts on Expenses

## Who can attach receipts to an expense
- **Attach or replace a receipt**: The member who created the expense, a Workspace Admin, or the current approver. 
- **Edit a receipt in an Approved or Paid report**: Requires the report to be unapproved first (see below).

---

## Where to Attach Receipts for Audits and Exports

Receipts must be attached **directly to the expense** to be visible in:
- Audit trails
- Accounting exports
- PDF reports

Attaching receipts in the report comment thread does **not** link them to any expense and will not meet audit or export requirements.

---

## How to Attach a Receipt to an Expense

**On web:**
1. Open the expense. 
2. Click the green **+** on the receipt icon.
3. Click **Choose file** to add the receipt image file. 

**On mobile:**
1. Open the expense. 
2. Click the green **+** on the receipt icon.
3. Take a photo or upload a file from your device image gallery.

## How to replace an existing receipt

1. Open the expense and click on the receipt image.
2. Click **Replace**.
3. Take a photo or upload a receipt image file from your device.

## How to crop a receipt image

You can crop a receipt image to remove unnecessary areas or focus on specific details.

1. Open the expense and click on the receipt image.
2. Click **Crop**.
3. Drag the corners or edges of the crop rectangle to select the area you want to keep.
4. Click **Save**.

The cropped image will replace the original receipt on the expense.

## How to rotate a receipt

You can rotate a receipt to correct its orientation. Rotation is available for uploaded or scanned image receipts and for PDF receipts on web or mobile web. PDF rotation is not available in the native mobile app.

1. Open the expense and click on the receipt image or PDF.
2. Click **Rotate**.
3. Each click rotates the receipt 90° counter-clockwise.

## How to view all pages of a multi-page PDF receipt

The receipt preview on an expense only ever shows the first page of a PDF. If a PDF receipt has more than one page, a page count badge appears in the bottom-left corner of the preview — for example, **Page 1 of 3** on a three-page PDF. Use the badge as a signal that details such as the total, itemization, or tax breakdown may be on a later page.

Zooming the preview magnifies the first page only. To read the other pages, open the receipt:

1. Open the expense.
2. Click on the receipt preview to open the full receipt.
3. Scroll down to move through the remaining pages.

<!-- SCREENSHOT:
Suggestion: The expense detail view with a multi-page PDF receipt, showing the **Page 1 of 3** badge in the bottom-left corner of the receipt preview.
Location: Immediately after the numbered steps in this section.
Purpose: Members report that an expense amount looks wrong when the total sits on a later page. Showing where the small badge sits relative to the receipt tells them the badge exists and where to look for it.
-->

---

## How to Add Additional Receipts to an Expense

Each expense has one primary receipt, but you can attach additional receipt images directly on the expense for situations where multiple receipts are needed — for example, the front and back of a paper receipt, or both the credit card slip and the itemized breakdown.

**On web:**

1. In the navigation tabs on the left, click **Spend**.
2. Click on the expense you want to add an additional receipt to. 
3. Hover over the receipt image.
4. Click the icon in the upper right corner of the image to **Add additional receipts**.
5. Choose a receipt image to upload. 

**On mobile:**

1. In the navigation tabs on the bottom, tap **Spend**.
2. Tap the expense you want to add an additional receipt to. 
3. Tap the icon in the upper right corner of the image to **Add additional receipts**.
4. Take a photo or choose a file from your device.

**Note:** Only the first (primary) receipt image is included in exports or downloadable reports. Additional receipt images are visible within Expensify on the expense itself.

---

## How to Fix a Missing or Misplaced Receipt

If a receipt was added to the report comments instead of the expense:

1. Download the file from the comment.
2. Open the relevant expense. 
3. Click the green **+** on the receipt icon.
4. Click **Choose file** to add the receipt image file. 

---

## How to Edit Receipts in Approved or Paid Reports

Approved and Paid reports are locked for editing. To make changes:

1. (Admins only) Open the report.
2. Click **More > Cancel Payment** (if Paid).
3. Then click **More > Unapprove**.
4. The member can then click **More > Undo Submit**.
5. Now the expense and receipt can be updated.

**Note:** If the report was exported to accounting, delete the export before resubmitting.

---

# FAQ

## Why isn’t my receipt showing on the expense?
It was likely uploaded in the report comments. Receipts must be attached directly to the expense to appear properly.

## Why does my expense amount not match the receipt I can see?
If the receipt is a PDF with more than one page, the preview shows only page 1, and the total may be on a later page. Check for a page count badge such as **Page 1 of 3** in the bottom-left corner of the preview, then open the receipt and scroll to review every page before you edit the amount.

## Why don’t I see a page count badge on my PDF receipt?
The badge only appears when a PDF receipt has two or more pages. It does not appear on single-page PDFs, on image receipts, or on eReceipts. It also does not appear on PDF receipts that were uploaded before this feature was released, because page counts are not added to older receipts.

## Can I attach one receipt to multiple expenses?
No. Each expense must have its own receipt. You can upload the same file more than once if needed.

## Can someone else upload a receipt to my expense?
Only the expense creator or a Workspace Admin can attach a receipt an expense.

## Will additional receipt images appear in exports or downloadable reports?

When expenses are exported or downloaded (for example, through an accounting integration, CSV export, or downloadable report), only the primary receipt image is included. Additional receipt images can still be viewed directly in Expensify.

## Can I crop or rotate an eReceipt?

No. eReceipts cannot be cropped or rotated. The **Crop** button is available for uploaded or scanned image receipts only. The **Rotate** button is available for image receipts and PDF receipts on web or mobile web. PDF rotation is not available in the native mobile app.

## What should I do if my receipt upload fails?

If the upload fails (for example, due to a lost network connection), you'll see the message "Receipt upload failed. Save the receipt, or delete the expense and lose it." with two options:

- **Save receipt** — downloads the receipt image to your device so you don't lose it. You can then re-create the expense and attach the saved receipt.
- **Delete expense** — removes the failed expense entirely. The receipt will be lost if you haven't saved it first.

## Can I attach both the card and itemized restaurant receipts?
Yes. Attach the **card receipt** as the primary receipt on the expense, then use **Add additional receipts** to attach the **itemized receipt** directly on the same expense.
