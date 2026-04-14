# Tutorial: Fixing Currency Update Issue with Non-US Bank Accounts in Expensify Workspace Settings

## Introduction
In this tutorial, we'll walk through resolving an issue where users are unable to update the currency in the overview when their workspace has a partially added non-US bank account. This problem was identified during regression testing and is specific to certain versions of the application. By following these steps, you can help ensure that users have a seamless experience updating currencies after adding new or partially connected non-US bank accounts.

## Prerequisites
Before starting this tutorial, make sure you meet the following requirements:
- Access to staging.new.expensify.com
- A new expensifail account with no existing bank accounts added
- Basic understanding of working with bank accounts in Expensify

## Step-by-Step Guide

### Step 1: Navigating to Staging Environment
1. Open your web browser and navigate to **staging.new.expensify.com**.
2. Log in using the new expensifail account that does not have any pre-existing bank accounts.

### Step 2: Creating a New Workspace
1. Once logged in, create a new workspace by clicking on the "Create Workspace" button.
2. Name your workspace appropriately and proceed with setting up basic details such as organization name, address, etc.

### Step 3: Setting Primary Currency
1. Go to the **Settings** section of your newly created workspace.
2. Within Settings, click on **Workflows** and then select **Add bank account**.
3. Choose to connect a bank account manually and follow the prompts until you reach the Business Information step.

### Step 4: Completing Bank Account Connection
1. Enter random details for fields in steps 1 and 2 of the business information section (these will not trigger any errors).
2. Input **24 302 976 253** as both the business registration number and "ABN".
3. Click **Next** to proceed.

### Step 5: Closing the Bank Account Connection Flow
1. Close or exit the “Connect Bank Account” flow by clicking outside any RHP (Right Hand Panel) elements that may still be open.
2. Ensure you do not complete the bank account connection process fully; we want this step to remain partially incomplete.

### Step 6: Navigating to Workspace Overview
1. Go back to your workspace overview by navigating through the main menu or using the browser’s navigation history.

### Step 7: Attempting to Update Currency
1. Try updating the currency from its current value (AUD) to either **CAD**, **EUR**, or **GBP**.
2. Observe if the update is successful or if you encounter any errors preventing this action.

## Expected Result vs. Actual Result
- **Expected**: Users should be able to update the currency in the overview when their workspace has a partially added non-US bank account.
- **Actual**: The user encounters an error preventing them from updating the currency, even though other steps of connecting the bank account have been completed but not fully.

## Troubleshooting Section

### Common Issues and Solutions
#### Issue 1: Incomplete Bank Account Connection
**Solution:** Ensure that all mandatory fields in the bank account connection process are correctly filled out. However, do not complete the final steps to keep the account partially added.

#### Issue 2: Currency Update Conflict
**Solution:** Verify that no other workspace settings or configurations might be conflicting with currency updates during this stage of development.

### Detailed Debugging Steps

1. **Check Logs and Console Errors**
   - Open your browser’s developer tools (usually F12) to inspect any console errors.
   - Look for any specific error messages related to currency updates or bank account connections.

2. **Verify Server-side Validation**
   - Check the backend validation logic that might be blocking currency changes when a non-US bank account is partially added.
   - Review server logs if available, to identify any issues with server validation during this stage of development.

3. **Test Different Scenarios**
   - Test multiple different scenarios by adding different types and amounts of bank accounts in various states (fully connected vs. partially connected).
   - Document these tests to ensure consistent results across different configurations.

## Code Example
Below is an example of how the server-side validation logic might be structured to handle currency updates during a partial bank account connection:

```javascript
// Simplified Server-Side Validation Logic

function validateCurrencyUpdate(workspaceId, newCurrency) {
    const workspace = getWorkspaceDetails(workspaceId);
    
    // Check if there are any partially added non-US accounts
    const hasNonUsPartialAccounts = workspace.accounts.some(account => 
        account.type === 'non-us' && !account.completedConnectionFlow);

    if (hasNonUsPartialAccounts) {
        console.error('Currency update not allowed due to partially connected non-US bank accounts.');
        return false;
    }

    // Proceed with currency update
    updateWorkspaceCurrency(workspaceId, newCurrency);
    return true;
}
```

## Conclusion
By following the steps outlined in this tutorial, you can identify and resolve the issue where users are unable to update the currency in the overview when their workspace has a partially added non-US bank account. This solution ensures that users have a smooth experience with Expensify, even during partial bank account connections.

If you encounter any issues or need further assistance, feel free to reach out to the project team for additional support. Happy coding!