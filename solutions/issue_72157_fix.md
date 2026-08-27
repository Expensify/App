## 📌 Issue Summary  
**Title:** QBD‑Sync status message is not displayed and the last sync time is not updated  
**Environment:** v9.2.28‑0 (staging & production)  
**Component:** Workspace Settings → Accounting → Export → Export Date  

After selecting an export date the UI should:

1. Show a “Syncing with QuickBooks” status message while the sync is in progress.  
2. Update the “Last sync” timestamp once the sync finishes.  

In the current release neither the status message appears nor the timestamp is refreshed.

---

## 🛠️ Root Cause  
The QBD sync flow was refactored to use a new async thunk, but the **Redux state** that drives the UI was not updated correctly:

| Problem | What was happening | Why it broke the UI |
|---------|--------------------|---------------------|
| **Missing sync start / end actions** | The thunk only dispatched `SYNC_SUCCESS` on success. | The component reads `syncStatus` from the store; without a `SYNC_START` it never knows a sync is in progress. |
| **Last sync time not stored** | The thunk returned the timestamp but never stored it in the reducer. | The component uses `lastSyncTime` from the store; it stays `null`. |
| **Component not subscribed** | The status component was using a local state that was never updated. | It never re‑renders when the store changes. |

---

## ✅ Fix Overview  
1. **Add proper sync actions** (`SYNC_START`, `SYNC_SUCCESS`, `SYNC_FAILURE`).  
2. **Update the reducer** to store `syncStatus` and `lastSyncTime`.  
3. **Connect the UI component** to the Redux store via `useSelector`.  
4. **Trigger the sync** when an export date is selected.  
5. **Add unit & integration tests** to guarantee the behaviour.

---

## 📁 File‑by‑File Changes  

### 1. `src/store/actions/qbdSync.js`  
```js
// src/store/actions/qbdSync.js