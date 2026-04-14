# Tutorial: Resolving Invoice Payment Issues with Missing Bank Account Verification

## Introduction

In this tutorial, you will learn how to resolve an issue where an invoice shows that the user needs to add a bank account despite having already verified one. This problem can occur in various scenarios and platforms within the Expensify App. By following these steps, you can ensure that your payment processes are smooth and accurate.

## Prerequisites

Before proceeding with this tutorial, make sure you have the following:

- Access to the Expensify App on a supported platform (Windows: Chrome)
- Two accounts in the same workspace, one of which has a verified business bank account (VBBA).
- Basic understanding of how invoices and payments work within the Expensify App.

## Step-by-Step Instructions

### 1. Precondition Setup
Ensure that you have two accounts configured correctly:
- One account with a VBBA is set up and verified.
- The second account, which will be paying an invoice, does not currently show as having a VBBA but is part of the same workspace.

### 2. Sending an Invoice
1. **Log in to your Expensify App** using the account that has the verified business bank account (VBBA).
2. Navigate to the "Invoices" section.
3. Click on "Send Invoice."
4. Choose the payer's account and add details for the invoice, such as amount and purpose.
5. Send the invoice.

### 3. Paying the Invoice
1. Log in to your Expensify App using the second account (the payer).
2. Navigate to the "Invoices" section.
3. Locate the newly received invoice from the first account.
4. Click on the invoice to view its details.
5. Choose a payment method, such as a credit card.

### 4. Verification Issue
1. After selecting the payment method and initiating the payment process:
   - You might see an error message stating that you need to add a bank account.
2. Verify that your second account already has a VBBA configured by checking its profile settings or financial information section within the Expensify App.

### 5. Troubleshooting
1. **Check Bank Account Configuration:**
   - Go back to the first account (VBBA) and ensure that all required bank details are correctly filled out.
2. **Clear Cache and Cookies:**
   - Sometimes, cached data can cause issues. Clear your browser cache and cookies for a fresh start.
3. **Sign Out and Sign In Again:**
   - Log out of the Expensify App completely and log back in to ensure you are on the latest version.

### 6. Contact Support
If the issue persists after following these steps, contact support by:
1. Visiting the [Expensify Help Center](https://help.expensify.com/) for further guidance.
2. Submitting a support ticket through the app or website.
3. Reaching out to contributors@expensify.com to request assistance.

## Code Examples

### Verifying Bank Account
```javascript
// Example of verifying bank account details
function verifyBankAccountDetails(bankAccountInfo) {
  if (!bankAccountInfo || !bankAccountInfo.accountNumber || !bankAccountInfo.routingNumber) {
    throw new Error("Incomplete or missing bank account information.");
  }
  // Additional validation logic can be added here
}
```

### Sending an Invoice via API (Example in JavaScript)
```javascript
async function sendInvoice(invoiceDetails, paymentMethod) {
  try {
    const response = await fetch('/api/invoices', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        invoiceDetails,
        paymentMethod
      })
    });
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error sending invoice:', error);
  }
}
```

## Additional Notes

- Ensure that all users involved in the process are using the latest version of the Expensify App.
- Regularly check for updates and patches from Expensify to ensure compatibility and fix any known issues.

## Conclusion

By following these detailed steps, you should be able to resolve any issues related to bank account verification when sending or receiving invoices within the Expensify App. If problems persist, consider reaching out to support for further assistance.

Happy troubleshooting!