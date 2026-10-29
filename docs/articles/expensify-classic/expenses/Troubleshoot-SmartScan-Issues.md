---
title: Troubleshoot SmartScan Issues
description: Fix common SmartScan problems, including failed, stuck and incorrect scans. 
keywords: [Expensify Classic, SmartScan, scan failed, receipt not scanning, illegible receipt, blurry receipt, stuck scanning, SmartScan error, scan not working, SmartScan troubleshooting, SCANREADY, wrong amount, wrong merchant, wrong date, SmartScan incorrect]
internalScope: Audience is all Expensify members. Covers troubleshooting SmartScan failures, image quality tips, and what to do when SmartScan returns incorrect data. Does not cover how to attach, replace, or crop receipts.
---

# Troubleshoot SmartScan Issues

SmartScan reads receipt images and automatically fills in expense details like the amount, date, and merchant. If SmartScan fails, gets stuck, or scans incorrectly, use this guide to identify the cause and fix the issue.

[Learn how to SmartScan a receipt](/articles/expensify-classic/expenses/Add-an-expense#add-an-expense-with-smartscan). 

---

## Why SmartScan fails to complete a scan

SmartScan requires a readable date and total amount on the receipt. If either of these cannot be detected, the scan will fail.

Common reasons include: 

 - The receipt does not include a date or total
 - The date or total is cut off or cropped out
 - The image is blurry or out of focus
 - The receipt is faded or low contrast
 - The text is obscured by shadows, glare, or folds

If SmartScan cannot confidently read these required fields, the scan will fail and will show the message: "Receipt scanning failed. Enter details manually".  

---

## How to fix when SmartScan fails to complete a scan

SmartScan may fail if the receipt image is unreadable, or if the image is missing a clear expense date or amount. 

To retry:

**On web:** 

1. In the navigation tabs on the left, go to **Expenses**.
2. Click the expense with the failed scan to open it.
3. Drag and drop a receipt image onto the window to replace the existing receipt.

**On mobile:** 

1. Tap the hamburger menu in the top-left corner.
2. Tap **Expenses**.
3. Tap the expense with the failed scan to open it.
4. Tap the receipt image.
5. Tap **Retake**.

Once a new receipt image is added, SmartScan will run again. 

---

## How to troubleshoot stuck or delayed scans

SmartScan usually completes within a few seconds, but delays can happen.

- **Wait a few minutes**. Scans may take longer during high-traffic periods.
- **Check your internet connection**. SmartScan requires an active connection to process. If you were offline when you took the photo, the scan will begin once you reconnect.
- **Check the photo library on your device**. If SmartScan fails to process the images, it will be saved to the photo library on your device.

If the scan is still stuck after several minutes, you can retry SmartScan with a new photo to trigger a fresh scan.

---

## How to fix incorrect scans

SmartScan extracts data automatically, but it may misread certain receipts — especially handwritten receipts, faded ink, or unusual formats.

To fix an incorrectly scanned merchant name, date or amount you can edit the expense manually. [Learn how to edit expenses](/articles/expensify-classic/expenses/Edit-expenses). 

---

## How to take better receipt photos for SmartScan

Improving image quality helps prevent most SmartScan issues.

- Lay the receipt flat on a contrasting surface (e.g., a dark receipt on a light table).
- Capture the full receipt and make sure all edges, the total, date, and merchant name are visible.
- Avoid shadows and glare. Hold your phone directly above the receipt and use even lighting.
- Keep the camera steady - blurry images are the most common cause of scan failures.
- Avoid folded or crumpled receipts. Flatten the receipt before photographing it.
- Use the in-app camera. The Expensify camera is optimized for receipt scanning. 

---

# FAQ

## Why does SmartScan keep failing on the same receipt?

The receipt image may be too low quality for SmartScan to process. Try taking a new photo with better lighting and ensure the full receipt is in frame. If it continues to fail, the receipt may be too faded, damaged, or in a non-standard format — in that case, enter the expense details manually instead.

## What file types does SmartScan support?

SmartScan works with common image formats (JPG, PNG) and PDF files. For best results on mobile, use the in-app camera to take a photo directly.

## SmartScan got the currency wrong. How do I fix it?

Open the expense, tap the **Amount** field, and change the currency manually. This can happen with receipts from international merchants or receipts that don't clearly display a currency symbol.
