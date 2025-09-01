---
title: Connect personal bank account
description: Receive reimbursements for expense reports submitted to your employer
keyword: [Expensify Classic, deposit account, reimbursement account]
---


Employees can connect a personal deposit-only bank account to receive reimbursements for their expense reports.

---

# Connect a Deposit-only Bank Account

1. Hover over **Settings**, then click **Account**.
2. Click the **Wallet** tab on the left.
3. Under **Bank Accounts**, click **Add Deposit-Only Bank Account**, then click **Connect to your bank**.
4. Click **Continue**.
5. Search for your bank account in the list of banks
6. Follow the prompts to sign in to your bank account using the corresponding username and password.
   - If your bank doesn’t appear, click the **X** in the right corner of the Plaid pop-up window, then click **Connect Manually**. You’ll then manually enter your account information and click **Save & Continue**.
7. Enter the name, address, and phone number associated with the account
8. Click **Save & Continue**.


Once the bank account is connected to your Expensify account, future reimbursements will be deposited directly.

## Using Global Reimbursement

If your organization has global reimbursement enabled and you want to add a bank account outside the US, follow the steps above.

After clicking **Add Deposit-Only Bank Account**, under **Settings > Accounts > Wallet**, click **Switch Country** at the top of the bank selection screen. This will allow you to add a deposit account from a supported country and receive reimbursements in your local currency.

---

# FAQ

## I connected my deposit-only bank account. Why haven’t I received my reimbursement?

Check the following possible issues:
- The estimated deposit date on the report has not arrived yet.
- The bank account information is incorrect. If you believe you may have entered the wrong account, contact **Concierge (Expensify’s support team)** and provide the **Report ID** for the missing reimbursement.
- Your bank account isn’t set up for **Direct Deposit/ACH** — please contact your bank to confirm.

## What happens if my bank requires an additional security check before adding it to a third party?

If your bank account has **two-factor authentication (2FA)** or another security step enabled, you should be prompted to complete this authentication step when connecting the account to Expensify.

However, if you encounter an error during this process, you can close the pop-up window and select **Connect Manually** to add the account manually.

## Why don’t the account number and routing number in Expensify match what’s on my bank statement?

Some banks, such as Chase, may display masked or tokenized account numbers when connected via Plaid. This is a security feature implemented by the bank and does not indicate any setup error. As long as the connection was successful and you see your account listed in your **Wallet**, reimbursements should process correctly.

## I can't find all the details for my bank in Singapore that you require. Where can I find them?

Expensify requires many fields to add a Singaporean Business account (for paying out) or Personal account (for receiving into). The Name and Address fields are self-explanatory. The other fields are:

- Swift Code  
- Account Number  
- Clearing Code  

The Swift code can generally be found by searching for your bank [here](https://wise.com/gb/swift-codes/countries). It always contains a capitalized alphanumerical string of characters that end in either XXX or the bank **Branch Code**. There is no requirement to use anything but the XXX head office option.

The Account Number can usually be found on your statement or in your online banking portal. For example, HSBC typically includes the **Branch Code** (the final three digits of the Swift Code, e.g. HSBCSGS2XXX → 146) in the **Account Number**. If you see figures like `146172002492`, drop the first 3 digits (`146`), which form the Branch Code, and use the remainder as the Account No.

The Clearing Code is made up of both the **Bank Code** and the **Branch Code** to form a full 7-digit Clearing Code. Some bank-specific help is outlined below:

- **UOB (Standard Accounts)** — Bank Code: 7375. Branch Code: first 3 digits of Account No. Account No: unchanged.  
  Example: `9102031012` → Branch Code `030`, Clearing Code `7375030`, Account No `9102031012`.
- **DBS** — Bank Code: 7171. Branch Code: first 3 digits of Account No. Account No: unchanged.  
  Example: `0052312891` → Branch Code `005`, Clearing Code `7171005`.
- **POSBank** — Bank Code: 7171. Branch Code: always `081`. Account No: unchanged.  
  Example: `84102395` → Branch Code `081`, Clearing Code `7171081`.
- **OCBC** — Bank Code: 7339. Branch Code: first 3 digits of Account No. Account No: drop the first 3 digits.  
  Example: `5501089550` → Branch Code `550`, Clearing Code `7339550`, Account No `1089550`.
- **HSBC (Corporate)** — Bank Code: 7232. Branch Code: first 3 digits of Account No. Account No: drop the first 3 digits.  
  Example: `146172002492` → Branch Code `146`, Clearing Code `7232146`, Account No `172002492`.
- **HSBC (Personal)** — Bank Code: 9548. Branch Code: first 3 digits of Account No. Account No: drop the first 3 digits.  
  Example: `146123843293` → Branch Code `146`, Clearing Code `9548146`, Account No `123843293`.
- **SBI** — Bank Code: 7791. Branch Code: first 3 digits of Account No. Account No: drop the first 3 digits.  
  Example: `27767012518738` → Branch Code `277`, Clearing Code `7791277`, Account No `67012518738`.
- **Standard Chartered** — Bank Code: 9496. Branch Code: `0` + first 2 digits of Account No. Account No: full 10 digits.  
  Example: `1803645852` → Branch Code `018`, Clearing Code `9496018`, Account No `1803645852`.

