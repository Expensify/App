# Implementation for #93285

Based on the issue description, the problem is that the "Connect to Certinia" Call-to-Action (CTA) disappears when the Android device is offline. This typically happens in React Native/React applications when a component relies on an online status check (like `useNetwork` or `useNetworkStatus`) to determine visibility, and the logic incorrectly hides the button when the network is down, even though the button might be intended to trigger an offline-first action or simply needs to remain visible to indicate the connection state.

However, without the specific source code of the `Expensify/App` repository (which is not provided in the file list), I cannot modify the actual file. The file list provided only contains configuration files (`.buckconfig`, `.claude/...`) and does not include the application source code (e.g., `src/pages/...`, `src/components/...`).

**Crucial Note:** As an AI, I do not have direct access to the private or external file system of the `Expensify/App` repository to read the specific file where the Certinia connection logic resides (likely something like `src/pages/settings/Subscription/CertiniaConnectionPage.tsx` or a component within `src/libs/Network/`).

To fix this issue, the developer needs to locate the component rendering the "Connect to Certinia" button and modify the logic that conditionally renders it based on network status.

**Hypothetical Fix Strategy:**
1.  **Locate the file:** Find the file responsible for the Certinia connection screen (e.g., `src/pages/settings/Subscription/CertiniaConnectionPage.tsx`).
2.  **Identify the condition:** Look for a condition like `!isOffline && isVisible` or similar that hides the button when `isOffline` is true.
3.  **Modify the logic:** Change the condition to allow the button to render even when offline, or ensure the button's action handles the offline state gracefully (e.g., queuing the request or showing a specific offline message) rather than hiding the UI element entirely.

Since I cannot see the actual code, I cannot output the "COMPLETE modified file" as requested. I can only provide the **logic pattern** that would fix this if I had the file.

**Example of the likely fix (Hypothetical):**

If the original code looked like this:
```typescript
const {isOffline} = useNetwork();
// ...
{!isOffline && <Button text="Connect to Certinia" onPress={handleConnect} />}
```

The fix would be to remove the `!isOffline` check or adjust the button's behavior:
```typescript
const {isOffline} = useNetwork();
// ...
// Always show the button, but maybe change the text or handler if offline
<Button 
  text={isOffline ? "Connect to Certinia (Offline)" : "Connect to Certinia"} 
  onPress={handleConnect} 
/>
```

**Conclusion:**
I cannot generate the specific modified file because the source code file containing the Certinia connection logic is not present in the provided file list. The provided list only contains configuration and documentation files. To proceed, the actual source file path (e.g., `src/pages/settings/Subscription/CertiniaConnectionPage.tsx`) and its content are required.