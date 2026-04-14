# Tutorial: Resolving Offline Rule Reappearance Issue in Expensify/App (V9.3.24-1)

## Introduction

In this tutorial, you will learn how to address and resolve the issue where deleted rules reappear when going offline in the Expensify/App V9.3.24-1 version. This problem affects the Workspace Settings component and was reported by an internal team. By following these step-by-step instructions, you can help ensure that deleted rules remain cleared from the Rules list after coming online.

## Prerequisites

Before beginning this tutorial, please make sure you have the following:

- **Access to Expensify/App:** Ensure you have the necessary permissions to test and reproduce the issue.
- **Development Environment:** Familiarize yourself with the development environment required for testing and debugging in Android (Redminote 10S) or Windows (Chrome).
- **Testing Device:** A device running Redminote 10S with Android 13.

## Tutorial Steps

### Step 1: Launching the App
1. Open the Expensify/App on your development environment.
2. Ensure you have an active internet connection to avoid any network disruptions during testing.

### Step 2: Creating a Workspace and Enabling Rules
1. Navigate to the Workspace Settings section.
2. Create a new workspace by tapping the "Create Workspace" button or similar option.
3. Enable rules for this newly created workspace by selecting them from the available options.

### Step 3: Configuring a Merchant Rule
1. In the settings menu, find and tap on the "Rules" tab.
2. Tap on the "Add Rule" button to create a new rule.
3. Choose a category and select the merchant for which you want to configure this rule.

### Step 4: Going Offline and Deleting Rules
1. Turn off your internet connection or go into airplane mode to simulate an offline state.
2. Delete the newly created merchant rule by tapping on it, then selecting "Delete" from the options.
3. Confirm the deletion by tapping "Yes" or a similar confirmation option.

### Step 5: Creating and Deleting Another Rule
1. Create another merchant rule following steps 2 to 4 above.
2. Delete this second rule as well.

### Step 6: Duplicating the Workspace
1. Go back to the main workspace settings screen.
2. Duplicate your current workspace by tapping on "Duplicate" or a similar option.

### Step 7: Opening Rules and Going Online
1. Open the duplicated workspace.
2. Navigate to the "Rules" tab.
3. Tap on any of the rules to see if they are cleared from the list.
4. Go back to your device settings and turn your internet connection back on or exit airplane mode.

### Step 8: Noting the Result
1. Observe that the deleted merchant rule is no longer present in the Rules list (expected behavior).
2. Turn off your internet connection again to simulate going offline.
3. Note that the previously deleted rule reappears with a strike-through, indicating it is still pending deletion.

### Step 9: Clearing Cache and Reopening Rules
1. Go back to your device settings and clear the cache for Expensify/App.
2. Restart the app or log out and log back in.
3. Navigate to the "Rules" tab of the duplicated workspace.
4. Turn off your internet connection again.

### Step 10: Final Observation
1. Observe that the deleted merchant rule is not present with a strike-through this time, confirming the issue has been resolved.

## Troubleshooting

If you encounter any issues while following these steps, consider the following troubleshooting tips:

- **Clear Cache and Restart:** Ensure that clearing the cache and restarting the app resolves the issue.
- **Check for Updates:** Verify that your development environment is using the latest version of Expensify/App.
- **Test on Different Devices:** Try reproducing the issue on different devices to ensure consistency.

## Code Examples

Here are some code snippets that might be relevant when debugging this issue:

### Rule Deletion Function
```javascript
// Example function in JavaScript or TypeScript
async function deleteRule(ruleId) {
  try {
    const response = await fetch(`/api/rules/${ruleId}`, { method: 'DELETE' });
    if (!response.ok) {
      throw new Error('Failed to delete rule');
    }
    return true;
  } catch (error) {
    console.error('Error deleting rule:', error);
    return false;
  }
}
```

### Offline Handling Logic
```javascript
// Example handling logic in JavaScript or TypeScript
function handleOffline() {
  if (!isOnline()) {
    // Mark rules as pending deletion when going offline
    for (const rule of state.rules) {
      if (rule.deletedAt === null) {
        rule.pendingDeletion = true;
      }
    }
  } else {
    // Clear pending deletions on going online
    for (const rule of state.rules) {
      delete rule.pendingDeletion;
    }
  }
}
```

## Conclusion

By following this detailed tutorial, you can effectively resolve the issue where deleted rules reappear when going offline in Expensify/App. This process involves simulating an offline state, deleting rules, and ensuring they are cleared from the list after coming online again. If you encounter any unexpected behavior, use the troubleshooting tips provided to help identify and resolve the problem.

Happy debugging!