# Manual Tests Derived from PR #72034 Comments

Each test below comes directly from feedback left on [PR #72034](https://github.com/Expensify/App/pull/72034) and should be added to the PR description so reviewers can verify the scenarios that were called out during review.

## 1. Search skeleton alignment on wide layouts
- **Source:** https://github.com/Expensify/App/pull/72034#issuecomment-3407040487
1. Sign in on desktop web (Chrome) with a workspace admin account.
2. Go to `Reports` and open the Search page.
3. In DevTools, throttle the network to `Slow 3G` and reload so the new LHN skeleton is visible.
4. Observe the placeholder rows while data is still loading.
- **Expected:** Every skeleton row aligns with the eventual menu layout (left padding, height, spacing). No row appears offset or clipped on wide screens.

## 2. iOS menu update after live workspace invite
- **Source:** https://github.com/Expensify/App/pull/72034#issuecomment-3417680190
1. Log in to the iOS hybrid app with Account A.
2. From Account B (desktop), invite Account A to an existing workspace with submit permission while Account A stays logged in.
3. After the invite processes, open the reports Search menu on Account A.
4. Tap the newly added `Submit` option.
- **Expected:** The `Submit` row appears without requiring an app restart, and tapping it opens the correct modal instead of a blank/blocked sheet.

## 3. Highlight resets when a new default option appears
- **Source:** https://github.com/Expensify/App/pull/72034#issuecomment-3417682412
1. Start as a workspace member (no approve permission) on any platform.
2. Open the Search menu and note that `Submit` is the default highlighted entry.
3. Without reloading, promote this user to an approver from another admin account so the `Approve` entry becomes available.
4. Re-open the Search menu.
- **Expected:** Only one entry is highlighted—the newly inserted default (`Approve`). The previously highlighted option is cleared so the UI does not show two simultaneous highlights.

## 4. Default logic respects manual overrides vs. automatic defaults
- **Sources:** https://github.com/Expensify/App/pull/72034#issuecomment-3417967886 and https://github.com/Expensify/App/pull/72034#issuecomment-3421359484
1. As a non-approver, manually select a non-default tab (e.g., `Explore`).
2. From another account, promote this user to an approver while they stay logged in.
3. Open the Search menu before reloading, then log out and back in to test the fresh-login path.
- **Expected:**
   - In the existing session, the manually selected tab remains active (we do not override explicit user choice).
   - After a fresh login, the default switches to `Approve` automatically if the user now has approval permission and never set a manual preference.

## 5. Mobile popover while data is still loading
- **Sources:** https://github.com/Expensify/App/pull/72034#issuecomment-3417688714 and https://github.com/Expensify/App/pull/72034#issuecomment-3421366059
1. On a narrow viewport (iOS/Android hybrid app), throttle the connection to `Slow 3G`.
2. Navigate to `Reports` and immediately open the bottom-docked SearchTypeMenu popover while the LHN skeleton is showing.
- **Expected:** The popover presents a clear loading state (skeleton rows or disabled placeholders) instead of flashing stale data or an empty modal. Capture a video for design if the experience regresses.

## 6. Slow-connection lag when opening the modal
- **Sources:** https://github.com/Expensify/App/pull/72034#issuecomment-3421454469 and https://github.com/Expensify/App/pull/72034#issuecomment-3421608480
1. On iOS (hybrid app) set the Network Link Conditioner to a very slow profile.
2. Open the Search popover multiple times while data is fetching.
- **Expected:** The modal waits for data before rendering options, but the app remains responsive (no locks or console errors). Any delay is communicated through the loader.

## 7. Real-time update when workspace membership changes (removal as well as addition)
- **Source:** https://github.com/Expensify/App/pull/72034#discussion_r2448015214
1. With the app open on iOS, ensure the user currently has submit/approve access and see the corresponding entries in the menu.
2. From another admin account on desktop, remove the user from the workspace (or revoke the permission).
3. Watch the iOS device without reloading, then open the Search menu.
- **Expected:** The `Submit`/`Approve` entries disappear (or get disabled) in real time and the menu no longer references permissions the user lost.

## 8. Approve tab only appears after policy data is ready (employee list / exporter / reimburser)
- **Source:** https://github.com/Expensify/App/pull/72034#discussion_r2460924733
1. Use a workspace that has not finished syncing `employeeList`, `exporter`, or `reimburser` data (e.g., immediately after enabling payments).
2. Log in and open the Search menu before those Onyx keys load.
3. Wait for the policy data to arrive (confirm via logs or Onyx inspector) without reloading.
- **Expected:** The `Approve` tab stays hidden until all required policy data is available, then automatically appears once the data finishes loading.
