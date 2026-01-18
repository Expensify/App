# Expensify App

## Repository Overview

### Technology Stack
- **Framework**: React Native
- **Language**: TypeScript
- **State Management**: React Native Onyx
- **Navigation**: React Navigation
- **Platforms**: iOS, Android, Web, Desktop (Electron)

## HybridApp Architecture (Critical Context)

**IMPORTANT**: The mobile application is built from the Mobile-Expensify submodule, not directly from the App repository.
**IMPORTANT**: NewDot refers to the new Expensify App, OldDot or Expensify Classic refers to our Old expensify app and website

### Key Integration Points
- App (NewDot) and Mobile-Expensify (OldDot) are combined into a single mobile application
- The HybridApp module (`@expensify/react-native-hybrid-app`) manages transitions between OldDot and NewDot
- Build process merges dotenv configurations from both repositories
- Environment variables from Mobile-Expensify take precedence over App variables
- Mobile builds **must** be initiated from the Mobile-Expensify directory

### Build Modes
- **Standalone**: Pure NewDot application (web/desktop)
- **HybridApp**: Combined OldDot + NewDot (mobile apps)
- Controlled via `STANDALONE_NEW_DOT` environment variable

## Core Architecture & Structure

### Entry Points
- `src/App.tsx`: Main application component with provider hierarchy
- `src/Expensify.tsx`: Core application logic and initialization
- `src/HybridAppHandler.tsx`: Manages HybridApp transitions and authentication
- `index.js`: React Native entry point

### Provider Architecture
The application uses a nested provider structure for context management:
1. **SplashScreenStateContextProvider**: Manages splash screen visibility
2. **InitialURLContextProvider**: Handles deep linking
3. **ThemeProvider**: Theme management
4. **LocaleContextProvider**: Internationalization
5. **OnyxListItemProvider**: Data layer provider
6. **SafeAreaProvider**: Device safe areas
7. **PopoverContextProvider**: Global popover state
8. **KeyboardProvider**: Keyboard state management

### Data Layer
- **Onyx**: Custom data persistence layer for offline-first functionality
- **ONYXKEYS.ts**: Centralized key definitions for data store
- Supports optimistic updates and conflict resolution

## Key Features & Modules

### Core Functionality
1. **Expense Management**
   - Receipt scanning and SmartScan
   - Expense creation and editing
   - Distance tracking
   - Per diem support
   - Split expenses

2. **Reporting**
   - Report creation and submission
   - Approval workflows
   - Report fields and custom attributes
   - Bulk operations

3. **Workspace/Policy Management**
   - Policy creation and configuration
   - Member management
   - Categories, tags, and tax rates
   - Accounting integration settings
   - Approval workflows

4. **Travel**
   - Trip management
   - Travel booking integration
   - Travel policy enforcement

5. **Search & Filtering**
   - Advanced search with filters
   - Saved searches
   - Search parser (Peggy-based)

6. **Payment & Cards**
   - Expensify Card management
   - Bank account connections (Plaid)
   - Payment methods
   - Company cards integration
   - Wallet functionality

7. **Accounting Integrations**
   - QuickBooks Online
   - Xero
   - NetSuite
   - Sage Intacct
   - QuickBooks Desktop
   - Generic accounting connections

8. **Communication**
   - Chat functionality
   - Task management
   - Mentions and notifications
   - Thread organization

9. **Invoice Management**
   - Invoice creation and sending
   - Invoice rooms

## Navigation & Routing

### Structure
- `src/SCREENS.ts`: Screen name constants
- `src/ROUTES.ts`: Route definitions and builders
- `src/NAVIGATORS.ts`: Navigator configuration

### Key Navigators
- **ProtectedScreens**: Authenticated app screens
- **PublicScreens**: Login and onboarding screens
- **RHP (Right Hand Panel/Pane)**: Settings and details panel
- **Central Pane**: Main content area
- **LHN (Left Hand Navigation)**: Report list and navigation
- **RHP**: Contextual panels and settings

## State Management

### Onyx Keys Organization
- **Session**: Authentication and user session
- **Personal Details**: User profiles and preferences
- **Reports**: Chat and expense reports
- **Transactions**: Expense transactions
- **Policy**: Workspace configuration
- **Forms**: Form state management

### Action Modules (`src/libs/actions/`)
Major action categories:
- `App.ts`: Application lifecycle
- `IOU.ts`: Money requests and expenses
- `Report.ts`: Report management
- `Policy/`: Workspace operations
- `User.ts`: User account operations
- `Session.ts`: Authentication
- `Search.ts`: Search operations
- `Travel.ts`: Travel features

## Build & Deployment

### CI/CD Workflows
Key GitHub Actions workflows:
- `deploy.yml`: Production deployment
- `preDeploy.yml`: Staging deployment
- `testBuild.yml`: PR test builds
- `test.yml`: Unit tests
- `typecheck.yml`: TypeScript validation
- `lint.yml`: Code quality checks
- `e2ePerformanceTests.yml`: Performance testing

## Related Repositories

### Mobile-Expensify (Submodule)
- **Path**: `App/Mobile-Expensify/`
- **Purpose**: Legacy OldDot application and mobile build source
- **Critical**: All mobile builds originate from this directory
- Contains platform-specific code for iOS and Android
- Manages the HybridApp integration layer

### expensify-common
- **Purpose**: Shared libraries and utilities
- Contains common validation, parsing, and utility functions
- Used across multiple Expensify repositories

## Development Practices

### Code Quality
- **TypeScript**: Strict mode enabled
- **ESLint**: Linter
- **Prettier**: Automatic formatting
- **Patch Management**: patch-package for dependency fixes

### Testing
- **Unit Tests**: Jest with React Native Testing Library
- **E2E Tests**: Custom test runner
- **Performance Tests**: Reassure framework

### Issue Documentation

When investigating issues, document findings in the `contrix/{issue_number}/` folder using this naming convention:

**Format:** `{test_code}_{DESCRIPTIVE_SUFFIX}.md`

| Component | Description | Example |
|-----------|-------------|---------|
| `{test_code}` | Test case identifier from test plan (e.g., P5-01, P6-02) | `P5-01` |
| `{DESCRIPTIVE_SUFFIX}` | SCREAMING_SNAKE_CASE description of document content | `FOCUS_RESTORATION_APPROACH_COMPARISON` |

**Examples:**
- `P5-01_FOCUS_RESTORATION_APPROACH_COMPARISON.md` - Comparing fix approaches for test P5-01
- `P6-02_ROOT_CAUSE_ANALYSIS.md` - Root cause analysis for test P6-02
- `P13-02_SCOPE_ASSESSMENT.md` - Scope assessment for test P13-02

**Document Types:**
| Suffix | Purpose |
|--------|---------|
| `_ROOT_CAUSE_ANALYSIS` | Deep investigation of why a bug occurs |
| `_APPROACH_COMPARISON` | Comparing multiple fix strategies |
| `_FIX_IMPLEMENTATION` | Implementation details of chosen fix |
| `_TEST_RESULTS` | Test execution results and findings |
| `_SCOPE_ASSESSMENT` | Determining if issue is in/out of scope |

**Guidelines:**
- Always prefix with the test code to link documentation to specific test cases
- Use SCREAMING_SNAKE_CASE for suffixes (readable, consistent)
- Keep filenames descriptive but concise
- One document per concern (don't combine unrelated analyses)

### Git Commits
- **NEVER commit or push unless explicitly requested** - Do not run `git commit` or `git push` unless the user explicitly asks you to. Always wait for user review and approval before committing any changes.
- **NEVER include Claude as co-author in commits** - Do not add `Co-Authored-By: Claude` or any similar attribution to commits. All commits should be authored solely by the human developer.

### Regression Prevention (CRITICAL - $100 BILLION/DAY RISK)

**EVERY regression, no matter how small, causes $100 BILLION LOSS PER DAY if deployed to production.**

This includes:
- **UI flickering** - Even momentary visual glitches
- **Performance regressions** - Any slowdown in render times, API calls, or user interactions
- **Behavioral bugs** - Any deviation from expected behavior introduced by new code
- **State management issues** - Stale data, incorrect updates, race conditions
- **Edge case failures** - Bugs that only manifest in specific scenarios

**MANDATORY before committing ANY change:**

1. **Test ALL affected code paths locally**
   - Don't assume your change only affects one place
   - Test the happy path AND edge cases
   - Test with different data states (empty, single item, many items)

2. **Verify NO visual regressions**
   - Check for flickering during state transitions
   - Verify loading states appear/disappear correctly
   - Confirm no layout shifts or visual jumps

3. **Verify NO performance regressions**
   - Watch for unnecessary re-renders
   - Check network request patterns
   - Monitor for memory leaks in long-running scenarios

4. **Test related features**
   - Your change to feature A might break feature B
   - Search for all usages of modified functions/components
   - Test the entire user flow, not just the changed screen

5. **Run the full test suite**
   - `npm run typecheck` - No type errors
   - `npm run lint` - No lint errors
   - `npm run test` - All tests pass

**If you cannot verify something locally, DO NOT commit. Ask the user to test it first.**

The cost of catching a bug locally: minutes.
The cost of a bug in production: $100 BILLION PER DAY.

There is NO acceptable regression. Zero tolerance.

### Code Patterns to AVOID

These patterns are explicitly discouraged in this codebase. **Do not use them.**

#### 1. No setTimeout for Race Conditions
```typescript
// BAD - Never use setTimeout as a workaround for race conditions
setTimeout(() => {
    doSomething();
}, 500);

// GOOD - Use proper state management, pendingAction checks, or Onyx patterns
const isDataReady = !isLoadingOnyxValue(metadata) && data !== undefined;
```
`setTimeout` is difficult to debug and maintain. If you think you need it, you likely don't fully understand the race condition. Use Onyx's `pendingAction` pattern or proper state checks instead.

#### 2. No `any` Type
```typescript
// BAD
const value: any = getData();

// GOOD
const value: unknown = getData();
if (typeof value === 'string') { /* use value */ }
```

#### 3. No `interface` - Use `type`
```typescript
// BAD
interface Person {
    name: string;
}

// GOOD
type Person = {
    name: string;
};
```

#### 4. No `enum` - Use Union Types
```typescript
// BAD
enum Color { Red, Green, Blue }

// GOOD
type Color = 'red' | 'green' | 'blue';

// Or with object for iteration:
const COLORS = { Red: 'red', Green: 'green', Blue: 'blue' } as const;
type Color = ValueOf<typeof COLORS>;
```

#### 5. No `@ts-ignore` or `@ts-nocheck`
Never suppress TypeScript errors. Fix the underlying type issue instead.

#### 6. No Class Components
```typescript
// BAD
class MyComponent extends React.Component { }

// GOOD
function MyComponent() { }
```

#### 7. No HOCs - Use Hooks
```typescript
// BAD
export default withSomething(MyComponent);

// GOOD
function MyComponent() {
    const something = useSomething();
}
```

#### 8. No `forwardRef` (React 19)
```typescript
// BAD
const MyComponent = forwardRef((props, ref) => { });

// GOOD - Just pass ref as a prop
function MyComponent({ ref, ...props }: MyComponentProps) {
    return <View ref={ref} />;
}
```

#### 9. No `lodashGet` - Use Optional Chaining
```typescript
// BAD
import lodashGet from 'lodash/get';
const name = lodashGet(user, 'name', 'default');

// GOOD
const name = user?.name ?? 'default';
```

#### 10. No Lodash Array Methods - Use Native
```typescript
// BAD
_.map(array, fn);
_.filter(array, fn);
_.each(array, fn);

// GOOD
array.map(fn);
array.filter(fn);
array.forEach(fn);
```

#### 11. No ScrollView Wrapping VirtualizedLists
```typescript
// BAD - Causes performance issues and warnings
<ScrollView>
    <SelectionList sections={data} />
</ScrollView>

// GOOD - Use list header/footer props
<SelectionList
    sections={data}
    listHeaderComponent={<Header />}
    listFooterComponent={<Footer />}
/>
```

#### 12. No Default String IDs
```typescript
// BAD
const policyID = report?.policyID ?? '-1';
const policyID = report?.policyID ?? '';

// GOOD - Let string IDs be undefined
const policyID = report?.policyID;

// For number IDs, use the constant
const accountID = report?.ownerAccountID ?? CONST.DEFAULT_NUMBER_ID;
```

#### 13. Prefer No Manual Memoization (React Compiler)
The codebase is transitioning to React Compiler, which handles optimization automatically.

```typescript
// BAD - Adding manual memoization to new components
const MemoizedComponent = memo(MyComponent);
const memoizedValue = useMemo(() => compute(a, b), [a, b]);
const memoizedCallback = useCallback(() => doThing(), []);

// GOOD - Let React Compiler optimize
function MyComponent() { ... }
const value = compute(a, b);
const callback = () => doThing();
```

**Guidelines:**
- **New components**: Don't add `memo`, `useMemo`, or `useCallback` unless lint rules require it
- **Existing components**: Don't introduce new lint warnings; optionally remove memoization if component compiles
- **Exception**: Components with unsupported syntax (e.g., `finally` clauses) still need manual memoization

To check if a component compiles: `npx ./scripts/react-compiler-compliance-check check <file>`

Note: React Compiler lint rules appear as warnings, not errors. Follow them when practical.

### Preferred Patterns

#### Onyx `pendingAction` for Optimistic Updates
When handling delete/create/update operations, use Onyx's `pendingAction` pattern:
```typescript
// Detect if an item is being deleted
const isBeingDeleted = item?.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE;

// Skip loading states during deletion
const isAnyFeedBeingDeleted = Object.values(feeds ?? {}).some(
    (feed) => feed?.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE
);
```

#### Offline-First with Optimistic Updates
- Use `API.write()` for write operations with optimistic data
- Always include `optimisticData`, `successData`, and `failureData`
- Wrap components in `<OfflineWithFeedback>` for pending state UI
- Use the Red Brick Road (RBR) pattern to guide users to errors

#### Boolean Naming Convention
```typescript
// BAD
const valid = checkSomething();
const showIcon = true;

// GOOD
const isValid = checkSomething();
const shouldShowIcon = true;
```

#### Function Declaration in Libraries
```typescript
// BAD - Arrow functions in library modules
const myFunction = () => { };

// GOOD - Function keyword in libraries
function myFunction() { }
```

### Bug Investigation: Understand Before Removing

When investigating bugs, **never assume existing code is entirely wrong**. Code that causes a bug in one scenario may be **correct and necessary** for other scenarios.

Before proposing to remove or simplify code:
1. **Ask "What depends on this?"** - Identify all code paths and scenarios that rely on this behavior
2. **Understand the original intent** - Git blame shows WHAT was added, but understand WHY it's needed
3. **The bug may be incompleteness, not incorrectness** - The fix might be adding a condition, not removing code
4. **Test your assumptions against ALL variants** - IOU vs Expense reports, member vs admin views, online vs offline states

**Example**: `Math.abs()` on amounts is:
- Correct for IOU reports (amounts must always be positive)
- Wrong for Expense reports (can have negative refunds/credits)
- **Fix**: Add condition to check report type, NOT remove `Math.abs()`

When you find yourself saying "this was a flawed decision, just remove it" - pause and verify it's not correct for a different scenario you haven't considered.

### Bug Investigation: Find ALL Affected Code Paths

When you find a bug, **search the entire codebase for the same pattern** — bugs rarely exist in just one place.

**Methodology:**
1. **Grep for the buggy pattern** — If `htmlToMarkdown` is wrong in one place, search for ALL uses of `htmlToMarkdown`
2. **Identify ALL entry points** — Same feature can be triggered multiple ways (context menu, keyboard shortcut, API call)
3. **Check ALL platform paths** — Web vs native, HTML-supported vs fallback, online vs offline
4. **Look for internal inconsistencies** — If the same file uses `htmlToMarkdown` on line 14 but `htmlToText` on line 17, the inconsistency reveals which is correct

**Example** (Issue #76399 - Clipboard bug):
- Wrong approach: Fix only `setClipboardMessage` in `ContextMenuActions.tsx`
- Correct approach: Also fix `useCopySelectionHelper.ts:14` which has the same bug in the Ctrl+C fallback path
- The clue: Line 17 already used `htmlToText` correctly — the inconsistency showed the intended behavior

**Checklist before proposing a fix:**
- [ ] Grepped for the buggy function/pattern across entire codebase
- [ ] Identified all code paths that can trigger the buggy behavior
- [ ] Checked platform-specific and fallback code paths
- [ ] Verified fix is complete, not partial

**Incomplete fixes are worse than no fix** — they give false confidence while leaving bugs in production.

### Bug Investigation: Use Internal Inconsistencies as Clues

When investigating a bug, **look for inconsistencies within the same file or function** — they often reveal the correct behavior.

**Pattern to look for:**
```typescript
// Same file, different behavior:
if (!Clipboard.canSetHtml()) {
    Clipboard.setString(Parser.htmlToMarkdown(selection));  // Line 14 - BUG
} else {
    Clipboard.setHtml(selection, Parser.htmlToText(selection));  // Line 17 - CORRECT
}
```

The inconsistency (markdown vs text) shows:
1. Someone already knew the correct approach (line 17)
2. The bug on line 14 is likely an oversight, not intentional
3. The fix is to make line 14 consistent with line 17

**This pattern applies broadly:**
- Different code paths using different transforms
- Fallback paths not matching primary paths
- Platform-specific code diverging from shared code

When you find such inconsistencies, **the already-working path shows you the intended behavior**.

### Report Type Semantics (Critical for Amount Handling)

IOU reports and Expense reports have **different semantics** for amounts and signs:

| Report Type | Negative Amounts | Sign Handling |
|-------------|------------------|---------------|
| **IOU** | NOT allowed | Always use `Math.abs()` |
| **Expense** | Allowed (refunds/credits) | Preserve sign |

When investigating amount-related bugs, always verify behavior for BOTH report types. See `TransactionUtils.getAmount()` for the canonical implementation.

### Bug Investigation: Frontend vs Backend Determination

When investigating bugs involving API calls, data synchronization, or loading states, **always determine whether the bug originates from frontend or backend** before proposing any solution.

**Why this matters**: Without access to the backend repository, we cannot fix backend bugs at the source. But knowing the bug source determines our strategy:
- **Frontend bug** → Fix the root cause
- **Backend bug** → Add defensive frontend handling (not a hack, but intentional resilience)

#### The 5-Question Investigation Template

Before proposing any fix, gather this evidence using browser DevTools Network tab:

1. **What is the expected behavior of the backend?**
   - What should the API return? What invariants must hold?
   - Example: `previousUpdateID` should be `<= clientUpdateID`

2. **What is the actual behavior of the backend?**
   - Capture the actual response. What's wrong?

3. **What data is the frontend passing to the backend?**
   - Capture complete request payload
   - Verify frontend is sending correct data

4. **What data is the backend returning?**
   - Capture complete JSON response
   - Note: onyxData, jsonCode, previousUpdateID, lastUpdateID

5. **Provide reproducible evidence**
   - cURL command (DevTools → Right-click request → Copy as cURL)
   - This proves the issue and helps backend team when they investigate

#### Decision Framework

| Evidence | Bug Source | Action |
|----------|------------|--------|
| Request payload malformed/incomplete | **Frontend** | Fix the request construction |
| Request correct, response violates invariants | **Backend** | Add defensive handling |
| Response correct, UI doesn't update properly | **Frontend** | Fix state management/rendering |
| Update IDs out of sequence | **Backend** | Handle impossible state gracefully |
| `pendingAction` not cleared after valid response | **Frontend** | Fix Onyx merge logic |

#### Handling Backend Bugs (Defensive Frontend Patterns)

Since we can't fix backend bugs at source, use these patterns:

**✅ GOOD - Detect and handle impossible states:**
```typescript
// Detect backend returning invalid update sequence
const hasUpdateGap = previousUpdateID > clientUpdateID;
if (hasUpdateGap) {
    Log.warn('Backend returned invalid update sequence', {previousUpdateID, clientUpdateID});
    // Handle gracefully - maybe trigger a full resync
}
```

**✅ GOOD - Use Onyx's pendingAction pattern for resilience:**
```typescript
// Don't show loading if item is being deleted (even if metadata says loading)
const isBeingDeleted = item?.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE;
const shouldShowLoading = isLoading && !isBeingDeleted;
```

**✅ GOOD - Check for data existence, not just loading state:**
```typescript
// Backend might leave us in loading state - check actual data too
const hasNoFeeds = Object.keys(feeds ?? {}).length === 0;
const isStuckLoading = isLoading && hasNoFeeds && !isInitialLoad;
if (isStuckLoading) {
    // Show empty state instead of infinite spinner
}
```

**❌ BAD - setTimeout to "wait for data":**
```typescript
// Never do this - arbitrary delays don't fix race conditions
setTimeout(() => {
    setIsLoading(false);
}, 500);
```

**❌ BAD - Silently swallow the problem:**
```typescript
// Don't hide issues - at minimum log them
try { riskyOperation(); } catch { /* silent */ }
```

#### Document Backend Bugs in Code

When adding defensive handling for a backend bug, document it:
```typescript
// DEFENSIVE: Backend may return previousUpdateID > clientUpdateID (see issue #78339)
// This causes OnyxUpdates to get stuck. Handle by detecting the impossible state.
if (isUpdateSequenceInvalid) {
    Log.warn('[Backend Bug] Invalid update sequence detected', details);
    // Graceful recovery logic
}
```

#### Key Principle: State-Based, Not Time-Based

The difference between a hack and proper defensive code:

| Hack (Time-based) | Proper (State-based) |
|-------------------|---------------------|
| `setTimeout(500)` | Check if data exists |
| `await delay(1000)` | Check pendingAction |
| "Wait and hope" | "Detect and handle" |

Time-based solutions are fragile because they assume timing that may not hold. State-based solutions respond to actual conditions.

#### Automated Investigation with Playwright MCP

When the dev server is running, use Playwright MCP to assist with bug investigation. This provides programmatic access to network requests, application state, and user interaction simulation.

**Prerequisites:**
- Dev server running: `npm run web` (URL: `http://localhost:8082/`)
- Playwright MCP installed: `claude mcp add playwright npx '@playwright/mcp@latest'`

**1. Capture Network Requests:**
```
// Get all API calls (excludes static resources by default)
mcp__playwright__browser_network_requests({ includeStatic: false })
```
This returns request URLs, methods, and status codes. Use this to identify which API calls are being made during a bug reproduction.

**2. Inspect Onyx State Directly:**
```javascript
// Check all Onyx keys
mcp__playwright__browser_evaluate({
  function: "() => Object.keys(window.__ONYX_STATE__ || {})"
})

// Get specific Onyx value (e.g., check pendingAction)
mcp__playwright__browser_evaluate({
  function: "() => JSON.stringify(window.__ONYX_STATE__?.['cardFeed_xyz'])"
})

// Check if data is stuck in loading state
mcp__playwright__browser_evaluate({
  function: "() => { const state = window.__ONYX_STATE__; return Object.entries(state).filter(([k,v]) => v?.pendingAction).map(([k]) => k); }"
})
```

**3. Reproduce Bug Steps Programmatically:**
```
// Navigate to the page
mcp__playwright__browser_navigate({ url: "http://localhost:8082/workspaces/ABC123/company-cards" })

// Click elements (use browser_snapshot first to get refs)
mcp__playwright__browser_snapshot({})
mcp__playwright__browser_click({ element: "Delete feed button", ref: "E42" })

// Capture state after action
mcp__playwright__browser_network_requests({})
```

**4. Capture Console Errors and Warnings:**
```
// Get errors (includes Log.warn output)
mcp__playwright__browser_console_messages({ level: "error" })

// Get all logs including debug
mcp__playwright__browser_console_messages({ level: "debug" })
```

**5. Advanced: Custom Network Interception:**
```javascript
// Use browser_run_code for full control over request/response capture
mcp__playwright__browser_run_code({
  code: `async (page) => {
    const apiCalls = [];
    page.on('response', async (response) => {
      if (response.url().includes('/api/')) {
        try {
          const body = await response.json();
          apiCalls.push({
            url: response.url(),
            status: response.status(),
            body: body
          });
        } catch (e) {}
      }
    });
    // Wait for some action
    await page.waitForTimeout(2000);
    return apiCalls;
  }`
})
```

**Investigation Workflow:**
1. Start with `browser_snapshot` to understand current page state
2. Use `browser_network_requests` to see what API calls have been made
3. Use `browser_evaluate` to inspect Onyx state (pendingAction, actual data)
4. Perform reproduction steps with `browser_click`, `browser_type`
5. Capture network requests and Onyx state after each step
6. Use `browser_console_messages` to check for logged errors/warnings
7. Compare captured data against expected behavior using the 5-Question Template

**Limitations:**
| What Playwright MCP CAN Do | What Still Requires Manual DevTools |
|---------------------------|-------------------------------------|
| Capture request URLs, methods, status | Full request/response body inspection |
| Access Onyx state via JS evaluation | Generate cURL commands |
| Automate reproduction steps | Inspect WebSocket frames (Pusher) |
| Capture console logs | Edit and replay requests |
| Take screenshots for evidence | Network throttling simulation |

**When to Use Playwright MCP vs Manual DevTools:**
- **Use Playwright MCP**: Reproducible investigations, automated regression checks, inspecting Onyx state
- **Use Manual DevTools**: Deep request/response inspection, generating cURL for backend team, WebSocket debugging

#### Optimistic Update Investigation

When UI shows incorrect state after an action (flickering, stale data, reverts unexpectedly):

**1. Check the API.write() call structure:**
```typescript
API.write(command, params, {
    optimisticData: [...],  // Applied immediately - is this correct?
    successData: [...],     // Applied on success - does this clear pendingAction?
    failureData: [...],     // Applied on failure - does this revert properly?
});
```

**2. Verify pendingAction lifecycle:**

| State | pendingAction Value | What Should Happen |
|-------|--------------------|--------------------|
| Before action | `undefined` | Clean state |
| After optimistic | `CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD/UPDATE/DELETE` | UI shows pending indicator |
| After API success | `null` or `undefined` | Pending indicator clears |
| After API failure | `null` + `errors` populated | Error indicator shows |

**3. Common optimistic update bugs:**

| Symptom | Likely Cause | Fix |
|---------|--------------|-----|
| UI reverts then comes back | `successData` structure doesn't match `optimisticData` | Ensure same keys/structure |
| `pendingAction` stuck forever | `successData` missing or has wrong Onyx key | Verify key matches exactly |
| Flickering on success | Race between optimistic clear and server response merge | Check for conflicting `set` vs `merge` |
| Data disappears on failure | `failureData` not restoring original values | Store original values before optimistic |

**4. Debug with Playwright MCP:**
```javascript
// Check pendingAction state after action
mcp__playwright__browser_evaluate({
  function: "() => Object.entries(window.__ONYX_STATE__).filter(([k,v]) => v?.pendingAction).map(([k,v]) => ({key: k, pendingAction: v.pendingAction}))"
})
```

#### Loading State Investigation

When UI shows infinite loading or stuck spinners:

**1. Identify what controls the loading state:**
```typescript
// Common loading patterns in this codebase:
const isLoading = isLoadingOnyxValue(metadata);           // Onyx metadata loading
const isLoading = !data;                                   // Data not yet available
const isLoading = pendingAction !== undefined;             // Action in progress
const isLoading = isLoadingReportData;                     // Specific loading flag
```

**2. Check for conflicting conditions:**
```typescript
// BAD - Loading doesn't account for empty state after deletion
if (isLoadingOnyxValue(feedMetadata)) {
    return <LoadingSpinner />;
}

// GOOD - Distinguish loading from empty
const hasNoFeeds = Object.keys(feeds ?? {}).length === 0;
const isBeingDeleted = Object.values(feeds ?? {}).some(
    f => f?.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE
);
const shouldShowLoading = isLoadingOnyxValue(feedMetadata) && !hasNoFeeds && !isBeingDeleted;
```

**3. Loading state investigation checklist:**
- [ ] What Onyx key controls the loading state?
- [ ] Is `isLoadingOnyxValue` checking the correct metadata key?
- [ ] Does the loading check account for deletion flows?
- [ ] Is there a race between multiple data sources?
- [ ] Does initial load vs subsequent load need different handling?

**4. Debug with Playwright MCP:**
```javascript
// Check if Onyx reports data as loading
mcp__playwright__browser_evaluate({
  function: "() => Object.entries(window.__ONYX_STATE__).filter(([k]) => k.includes('metadata')).map(([k,v]) => ({key: k, value: v}))"
})
```

#### Onyx Merge vs Set Investigation

When data appears corrupted, has missing fields, or stale nested data persists:

**Understanding Onyx operations:**

| Operation | Behavior | When to Use |
|-----------|----------|-------------|
| `Onyx.merge(key, value)` | Deep merges value into existing data. `null` values remove keys. | Updating specific fields while preserving others |
| `Onyx.set(key, value)` | Completely replaces existing data | Resetting to a known state, clearing all data |
| `Onyx.multiSet({...})` | Atomic set of multiple keys | Related data that must update together |
| `Onyx.mergeCollection(key, values)` | Merges into collection items | Batch updating collection items |

**Common Onyx bugs:**

| Symptom | Likely Cause | Fix |
|---------|--------------|-----|
| Unrelated fields disappear after update | Used `set` when `merge` was needed | Change to `merge` |
| Old nested data won't go away | Used `merge` when `set` was needed | Change to `set` or explicitly `merge` with `null` |
| Key unexpectedly removed | Merged `null` value (removes key in Onyx) | Use `undefined` to skip, or explicit value |
| Collection item not updating | Wrong collection key pattern | Verify key matches `prefix_suffix` format |
| Race condition between updates | Multiple `merge` calls interleaving | Use `multiSet` for atomic updates |

**Debugging Onyx state:**
```javascript
// Get full Onyx state for a key
mcp__playwright__browser_evaluate({
  function: "() => JSON.stringify(window.__ONYX_STATE__?.['keyName'], null, 2)"
})

// Compare before/after an action
// 1. Capture before
mcp__playwright__browser_evaluate({
  function: "() => { window.__DEBUG_BEFORE__ = JSON.stringify(window.__ONYX_STATE__); return 'captured'; }"
})
// 2. Perform action, then capture diff
mcp__playwright__browser_evaluate({
  function: "() => { const before = JSON.parse(window.__DEBUG_BEFORE__); const after = window.__ONYX_STATE__; return Object.keys(after).filter(k => JSON.stringify(before[k]) !== JSON.stringify(after[k])); }"
})
```

#### Root Cause Escalation Pattern

Bugs often have multiple layers. **Don't stop at the first cause you find.**

**The Escalation Process:**
```
Symptom: [What the user sees]
    ↓ WHY?
Layer 1: [Immediate code behavior causing symptom]
    ↓ WHY?
Layer 2: [What's causing that code to behave wrong]
    ↓ WHY?
Layer 3: [Deeper cause - might be in different system]
    ↓ WHY?
Layer N: [Root cause - frontend bug, backend bug, or library bug]
```

**Real Example (Issue #78339):**
```
Symptom: Infinite loading after deleting all card feeds
    ↓ WHY?
Layer 1: isLoadingOnyxValue(lastSelectedFeedMetadata) returns true
    ↓ WHY?
Layer 2: Onyx metadata not being cleared after deletion
    ↓ WHY?
Layer 3: Onyx library bug in collection key handling
    → Fixed in react-native-onyx PR #709

BUT WAIT: After Onyx fix, flickering still exists!
    ↓ WHY?
Layer 4: Backend returns previousUpdateID > clientUpdateID
    → This is a BACKEND BUG (can't fix, need defensive handling)
```

**Key principles:**
1. **Ask "WHY?" at each layer** - Don't assume the first cause is the root cause
2. **Verify the original symptom after each fix** - If symptom persists, there are multiple causes
3. **Layer boundaries matter** - Identify if cause is: your code, Onyx library, backend, or third-party
4. **Document the full chain** - Future investigators need to understand the full path

**Checklist before declaring "root cause found":**
- [ ] Asked "WHY?" until hitting a fixable/reportable boundary
- [ ] Verified fix resolves the ORIGINAL symptom (not just intermediate state)
- [ ] Checked if multiple independent causes exist
- [ ] Identified which layer owns the fix (frontend/backend/library)

#### Collection Key Investigation

When data for specific items is wrong, missing, or showing for wrong items:

**Understanding Onyx collection keys:**
```typescript
// Collections use pattern: ONYXKEYS.PREFIX + identifier
const feedKey = `${ONYXKEYS.COLLECTION.CARD_FEED}${feedID}`;        // cardFeed_12345
const reportKey = `${ONYXKEYS.COLLECTION.REPORT}${reportID}`;       // report_67890
const policyKey = `${ONYXKEYS.COLLECTION.POLICY}${policyID}`;       // policy_ABCDEF
```

**Common collection bugs:**

| Symptom | Likely Cause | Fix |
|---------|--------------|-----|
| Data shows for wrong item | Key constructed with wrong ID | Verify ID source |
| Data missing for item | Key pattern doesn't match Onyx key | Check exact prefix in ONYXKEYS |
| Selector returns empty | Collection pattern in withOnyx/useOnyx wrong | Match pattern exactly |
| Stale data after navigation | Component not re-keying on ID change | Add `key={itemID}` prop |
| All collection items update together | Using collection key without ID suffix | Append specific ID |

**Debugging collection keys:**
```javascript
// List all keys matching a collection pattern
mcp__playwright__browser_evaluate({
  function: "() => Object.keys(window.__ONYX_STATE__).filter(k => k.startsWith('cardFeed_'))"
})

// Check if specific key exists and its value
mcp__playwright__browser_evaluate({
  function: "() => { const key = 'cardFeed_12345'; return { exists: key in window.__ONYX_STATE__, value: window.__ONYX_STATE__[key] }; }"
})

// Find all collection prefixes in use
mcp__playwright__browser_evaluate({
  function: "() => [...new Set(Object.keys(window.__ONYX_STATE__).map(k => k.split('_')[0] + '_'))].filter(k => k.includes('_'))"
})
```

**withOnyx collection selector pattern:**
```typescript
// BAD - Gets entire collection (rarely wanted)
export default withOnyx({
    allReports: {
        key: ONYXKEYS.COLLECTION.REPORT,
    },
})(MyComponent);

// GOOD - Gets specific item from collection
export default withOnyx({
    report: {
        key: ({reportID}) => `${ONYXKEYS.COLLECTION.REPORT}${reportID}`,
    },
})(MyComponent);
```

### Empirical Evidence Requirement

**Every investigation, theory, or claim MUST be verified with empirical evidence before being considered complete.**

Theoretical analysis (reading source code, tracing logic) is necessary but NOT sufficient. You must prove your claims work in practice.

#### The Verification Principle

| Stage | What It Proves | Sufficient Alone? |
|-------|---------------|-------------------|
| **Theoretical analysis** | "This SHOULD work based on the code" | NO |
| **Empirical verification** | "This DOES work - here's the proof" | YES (with theory) |

#### How to Gather Empirical Evidence

**1. Add temporary console logs to verify behavior:**
```typescript
// Track function call count to verify no double activation
window.__DEBUG_CALL_COUNT__ = (window.__DEBUG_CALL_COUNT__ || 0) + 1;
console.log('[ComponentName] functionName called', {
    callCount: window.__DEBUG_CALL_COUNT__,
    relevantState: someState,
    activeElement: document.activeElement?.tagName
});
```

**2. Use Playwright MCP to capture results:**
```javascript
// Reset counter, perform action, capture results
await page.evaluate(() => { window.__DEBUG_CALL_COUNT__ = 0; });
await page.keyboard.press('Enter');
const result = await page.evaluate(() => ({
    callCount: window.__DEBUG_CALL_COUNT__,
    finalState: document.activeElement?.tagName
}));
```

**3. Document the evidence:**
- Actual console output (copy-paste, not paraphrase)
- Before/after state comparison
- Specific values that prove the claim

#### Claims That Require Empirical Verification

| Claim Type | Verification Method |
|------------|---------------------|
| "No double activation" | Add call counter, verify `callCount === 1` |
| "Focus moves correctly" | Log `document.activeElement` before/after |
| "No race condition" | Add timing logs, verify order |
| "Protection mechanism works" | Disable protection, verify failure; enable, verify success |
| "No regression" | Test all affected code paths manually |
| "Risk is ZERO/LOW" | Prove with actual test, not just theory |

#### Evidence Documentation Template

When documenting verified claims:

```markdown
### Claim: [Your claim here]

**Theoretical basis:** [Why you believe this should work]

**Empirical verification:**
- **Method:** [Console logs added / Playwright test / Manual test]
- **Console output:**
  ```
  [Actual output here]
  ```
- **Results:**
  | Metric | Value | Significance |
  |--------|-------|--------------|
  | callCount | 1 | No double activation |

**Conclusion:** Claim verified empirically.
```

#### Anti-Pattern: Unverified Claims

**❌ BAD - Theoretical claim without evidence:**
> "Risk level: ZERO - The blur() call prevents double activation because React Native Web's keyup handler checks isActiveElement."

**✅ GOOD - Verified claim with evidence:**
> "Risk level: ZERO - Verified empirically. Console logs show `callCount: 1` after Enter press. Focus moves from DIV to BODY after blur(). See test results in section X."

**Remember:** If you cannot verify a claim empirically, either:
1. Find a way to test it, OR
2. Document it as "theoretical - not yet verified" and note the risk

## Special Considerations

### Offline-First Architecture
- All features work offline
- Optimistic updates with rollback
- Queue-based request handling
- Conflict resolution strategies

### Mobile-Specific Notes
- Push notifications via Airship
- Mapbox integration for location features
- Camera and gallery access

### Security
- Content Security Policy enforcement
- Two-factor authentication support

## Documentation Resources

### Help Documentation
- **NewDot Help**: https://help.expensify.com/new-expensify/hubs/
- **OldDot/Expensify Classic Help**: https://help.expensify.com/expensify-classic/hubs/

## Development Setup Requirements

## Command Reference

### Common Tasks
```bash
# Install dependencies
npm install

# Clean build artifacts
npm run clean

# Type checking
npm run typecheck

# Linting
npm run lint

# Testing
npm run test
```

### Platform Builds
```bash
# iOS build
npm run ios

# Android build
npm run android

# Desktop build
npm run desktop

# Web build
npm run web
```

## Architecture Decisions

### React Native New Architecture
- Fabric renderer enabled
- TurboModules for native module integration
- Hermes JavaScript engine

### State Management Choice
- Custom Onyx library for offline-first capabilities
- Optimistic updates as default pattern
- Centralized action layer for API calls
- Direct key-value storage with automatic persistence

### Navigation Strategy
- React Navigation for cross-platform consistency
- Custom navigation state management
- Deep linking support

## Known Integration Points

### With Mobile-Expensify
- Session sharing via HybridApp module
- Navigation handoff between apps
- Shared authentication state
- Environment variable merging

### With Backend Services
- RESTful API communication
- WebSocket connections via Pusher
- Real-time synchronization
