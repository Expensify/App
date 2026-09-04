# Observability Metrics

This document lists all implemented telemetry metrics in the Expensify App.

## Performance Metrics

### App Startup

**Constant**: `CONST.TELEMETRY.SPAN_APP_STARTUP`
**Sentry Name**: `ManualAppStartup`
**Threshold**: 3s (P90)
**What's Measured**: Time from app initialization to splash screen hidden. This only measures JS thread time, not native thread time.
**Start**: App initialization ([`src/setup/telemetry/index.ts`](https://github.com/Expensify/App/blob/8f123f449f1a4533830b18a1040c9a5f1949821d/src/setup/telemetry/index.ts#L29))
**End**: Splash screen hidden ([`src/Expensify.tsx`](https://github.com/Expensify/App/blob/8f123f449f1a4533830b18a1040c9a5f1949821d/src/Expensify.tsx#L218))

### OD → ND Transition

**Constant**: `CONST.TELEMETRY.SPAN_OD_ND_TRANSITION`
**Sentry Name**: `ManualOdNdTransition`
**Threshold**: 3s (P90)
**What's Measured**: Time to transition from OldDot to NewDot in HybridApp
**Start**: Transition initiated with timestamp from HybridApp settings ([`src/HybridAppHandler.tsx`](https://github.com/Expensify/App/blob/8f123f449f1a4533830b18a1040c9a5f1949821d/src/HybridAppHandler.tsx#L49))
**End**:
- User sees: NewDot interface fully loaded
- Technical: Transition finalized after setup ([`src/HybridAppHandler.tsx`](https://github.com/Expensify/App/blob/8f123f449f1a4533830b18a1040c9a5f1949821d/src/HybridAppHandler.tsx#L28))

### Open Report

**Constant**: `CONST.TELEMETRY.SPAN_OPEN_REPORT`
**Sentry Name**: `ManualOpenReport`
**Threshold**: 1s (P90)
**What's Measured**: Time from navigating to report page to report fully rendered
**Start**:
- Automatically via React Navigation integration for all navigations to report screens
- Manually started with custom context in:
  - LHN report click ([`src/components/LHNOptionsList/OptionRowLHN.tsx`](https://github.com/Expensify/App/blob/8f123f449f1a4533830b18a1040c9a5f1949821d/src/components/LHNOptionsList/OptionRowLHN.tsx#L180)) - name: `OptionRowLHN`
  - Money request preview ([`src/components/ReportActionItem/MoneyRequestReportPreview/index.tsx`](https://github.com/Expensify/App/blob/8f123f449f1a4533830b18a1040c9a5f1949821d/src/components/ReportActionItem/MoneyRequestReportPreview/index.tsx#L109)) - name: `MoneyRequestReportPreview`
  - Money request preview content ([`src/components/ReportActionItem/MoneyRequestReportPreview/MoneyRequestReportPreviewContent.tsx`](https://github.com/Expensify/App/blob/8f123f449f1a4533830b18a1040c9a5f1949821d/src/components/ReportActionItem/MoneyRequestReportPreview/MoneyRequestReportPreviewContent.tsx#L516)) - name: `MoneyRequestReportPreviewContent`
  - Search results ([`src/components/Search/index.tsx`](https://github.com/Expensify/App/blob/8f123f449f1a4533830b18a1040c9a5f1949821d/src/components/Search/index.tsx#L786))
**End**:
- User sees: Report messages/content displayed
- Technical: Report actions list rendered (onLayout event)
  - Report data loaded from Onyx (reportID, type, chatType)
  - Report actions list layout complete (we are waiting for the first page data render, so if there is any data in the Onyx, we'll not wait for the API)
  - Called in the list body `src/pages/inbox/report/ReportActionsList.tsx`
**Span ID**: `${CONST.TELEMETRY.SPAN_OPEN_REPORT}_${reportID}`
**Attributes**: `is_transaction_thread`, `is_one_transaction_report`, `report_type`, `chat_type`

### Navigate to Reports Tab

**Constant**: `CONST.TELEMETRY.SPAN_NAVIGATE_TO_REPORTS`
**Sentry Name**: `ManualNavigateToReports`
**Threshold**: 400ms (P90)
**What's Measured**: Time from clicking search tab to results rendered (either list or skeleton)
**Start**: User clicks search/reports tab ([`src/components/Navigation/NavigationTabBar/SearchTabButton.tsx`](https://github.com/Expensify/App/blob/42c42d7fb1984adde1d96ef2285d3c8e1177a4aa/src/components/Navigation/NavigationTabBar/SearchTabButton.tsx#L47))
**End**:
- User sees: Search results list displayed (warm)
- Technical: Search results layout complete (onLayout event)
  - Search results data loaded from Onyx
  - Results sorted and sectioned
  - List layout rendered ([`src/components/Search/index.tsx`](https://github.com/Expensify/App/blob/8f123f449f1a4533830b18a1040c9a5f1949821d/src/components/Search/index.tsx#L961))

- User sees: Search skeleton displayed (cold)
- Technical: Search skeleton layout complete (onLayoutSkeleton event)
  - Skeleton layout rendered ([`src/components/Search/index.tsx`](https://github.com/Expensify/App/blob/e8d4f62021987e5821d69ce483349562918a948a/src/components/Search/index.tsx#L1162))

### Navigate to Reports Tab (First Paint)

**Constant**: `CONST.TELEMETRY.SPAN_NAVIGATE_TO_REPORTS_FIRST_PAINT`
**Sentry Name**: `ManualNavigateToReportsFirstPaint`
**Threshold**: 400ms (P90)
**What's Measured**: Time from clicking the reports tab to the first visible paint - skeleton on a cold start, content on a warm start. Runs alongside the legacy `ManualNavigateToReports` span and ends at the same moment ([`src/libs/telemetry/navigateToReportsSpans.ts`](https://github.com/Expensify/App/blob/c6476c33675cc5620c090234869cd04125878e48/src/libs/telemetry/navigateToReportsSpans.ts))
**Start**: User clicks search/reports tab, started via `startNavigateToReportsSpans()` ([`src/libs/telemetry/navigateToReportsSpans.ts`](https://github.com/Expensify/App/blob/c6476c33675cc5620c090234869cd04125878e48/src/libs/telemetry/navigateToReportsSpans.ts#L42))
**End**:
- User sees: First visible paint (cold skeleton or warm content)
- Technical: First paint layout complete via [`endNavigateToReportsFirstPaint()`](https://github.com/Expensify/App/blob/c6476c33675cc5620c090234869cd04125878e48/src/libs/telemetry/navigateToReportsSpans.ts#L48) (first call wins)
  - Cold start: skeleton layout complete, tagged `start_type: cold` ([`SearchLoadingSkeleton.tsx`](https://github.com/Expensify/App/blob/c6476c33675cc5620c090234869cd04125878e48/src/components/Search/SearchLoadingSkeleton.tsx#L27))
  - Warm start: content or chart layout complete, tagged `start_type: warm_first` ([list](https://github.com/Expensify/App/blob/c6476c33675cc5620c090234869cd04125878e48/src/components/Search/index.tsx#L1550), [chart](https://github.com/Expensify/App/blob/c6476c33675cc5620c090234869cd04125878e48/src/components/Search/index.tsx#L1596), [deferred-mount skeleton](https://github.com/Expensify/App/blob/c6476c33675cc5620c090234869cd04125878e48/src/components/Search/SearchWithNavigationDeferredMount.tsx#L17))
  - Cached re-visit: screen re-focus, tagged `start_type: warm_subsequent` ([`src/components/Search/index.tsx`](https://github.com/Expensify/App/blob/c6476c33675cc5620c090234869cd04125878e48/src/components/Search/index.tsx#L1626))
**Attributes**: `start_type` (`cold` | `warm_first` | `warm_subsequent`), `search_type`, `search_view`, `search_group_by`

### Navigate to Reports Tab (Content Load)

**Constant**: `CONST.TELEMETRY.SPAN_NAVIGATE_TO_REPORTS_CONTENT_LOAD`
**Sentry Name**: `ManualNavigateToReportsContentLoad`
**Threshold**: 1000ms (P90)
**What's Measured**: Time from clicking the reports tab to the real content paint (list or chart), ignoring any skeleton shown in between. Runs alongside the legacy `ManualNavigateToReports` span ([`src/libs/telemetry/navigateToReportsSpans.ts`](https://github.com/Expensify/App/blob/c6476c33675cc5620c090234869cd04125878e48/src/libs/telemetry/navigateToReportsSpans.ts))
**Start**: User clicks search/reports tab, started via `startNavigateToReportsSpans()` ([`src/libs/telemetry/navigateToReportsSpans.ts`](https://github.com/Expensify/App/blob/c6476c33675cc5620c090234869cd04125878e48/src/libs/telemetry/navigateToReportsSpans.ts#L42))
**End**:
- User sees: Real search content displayed (list or chart, never the skeleton)
- Technical: Content layout complete via [`endNavigateToReportsContentLoad()`](https://github.com/Expensify/App/blob/c6476c33675cc5620c090234869cd04125878e48/src/libs/telemetry/navigateToReportsSpans.ts#L61) (first call wins)
  - Content layout complete ([`src/components/Search/index.tsx`](https://github.com/Expensify/App/blob/c6476c33675cc5620c090234869cd04125878e48/src/components/Search/index.tsx#L1551))
  - Chart layout complete ([`src/components/Search/index.tsx`](https://github.com/Expensify/App/blob/c6476c33675cc5620c090234869cd04125878e48/src/components/Search/index.tsx#L1597))
  - Cached re-visit: screen re-focus ([`src/components/Search/index.tsx`](https://github.com/Expensify/App/blob/c6476c33675cc5620c090234869cd04125878e48/src/components/Search/index.tsx#L1627))
**Attributes**: `start_type` (copied from First Paint; `unknown` is a fallback that signals First Paint did not run), `search_type`, `search_view`, `search_group_by`

### Navigate to Inbox Tab

**Constant**: `CONST.TELEMETRY.SPAN_NAVIGATE_TO_INBOX_TAB`
**Sentry Name**: `ManualNavigateToInboxTab`
**Threshold**: 400ms (P90)
**What's Measured**: Time from clicking inbox tab to sidebar rendered
**Start**: User clicks inbox/home tab ([`src/components/Navigation/NavigationTabBar/index.tsx`](https://github.com/Expensify/App/blob/8f123f449f1a4533830b18a1040c9a5f1949821d/src/components/Navigation/NavigationTabBar/index.tsx#L160))
**End**:
- User sees: Chat list displayed
- Technical: Sidebar layout complete via `onLayout` or screen focus via `useFocusEffect` ([`src/pages/inbox/sidebar/SidebarLinksData.tsx`](https://github.com/Expensify/App/blob/main/src/pages/inbox/sidebar/SidebarLinksData.tsx))

### Open Search Modal

**Constant**: `CONST.TELEMETRY.SPAN_OPEN_SEARCH_ROUTER`
**Sentry Name**: `ManualOpenSearchRouter`
**Threshold**: 400ms (P90)
**What's Measured**: Time from opening search to autocomplete ready
**Start**: Search button pressed or CMD+K triggered ([`src/components/Search/SearchRouter/SearchButton.tsx`](https://github.com/Expensify/App/blob/8f123f449f1a4533830b18a1040c9a5f1949821d/src/components/Search/SearchRouter/SearchButton.tsx#L44), [`src/components/Search/SearchRouter/SearchRouterContext.tsx`](https://github.com/Expensify/App/blob/8f123f449f1a4533830b18a1040c9a5f1949821d/src/components/Search/SearchRouter/SearchRouterContext.tsx#L98))
**End**:
- User sees: Search input and autocomplete suggestions
- Technical: Autocomplete list finalized ([`src/components/Search/SearchAutocompleteList.tsx`](https://github.com/Expensify/App/blob/8f123f449f1a4533830b18a1040c9a5f1949821d/src/components/Search/SearchAutocompleteList.tsx#L126))
**Attributes**: `trigger: 'keyboard'` when opened via keyboard shortcut

### Open Create Expense

**Constant**: `CONST.TELEMETRY.SPAN_OPEN_CREATE_EXPENSE`
**Sentry Name**: `ManualOpenCreateExpense`
**Threshold**: 400ms (P90)
**What's Measured**: Time from initiating money request to first step rendered
**Start**: Money request initiated ([`src/libs/actions/IOU/index.ts`](https://github.com/Expensify/App/blob/8f123f449f1a4533830b18a1040c9a5f1949821d/src/libs/actions/IOU/index.ts#L1204))
**End**:
- User sees: Expense creation form displayed
- Technical: Request step page mounted ([`src/pages/iou/request/IOURequestStartPage.tsx`](https://github.com/Expensify/App/blob/8f123f449f1a4533830b18a1040c9a5f1949821d/src/pages/iou/request/IOURequestStartPage.tsx#L143), [`src/pages/iou/request/DistanceRequestStartPage.tsx`](https://github.com/Expensify/App/blob/8f123f449f1a4533830b18a1040c9a5f1949821d/src/pages/iou/request/DistanceRequestStartPage.tsx#L96), [`src/pages/iou/request/step/IOURequestStepParticipants.tsx`](https://github.com/Expensify/App/blob/8f123f449f1a4533830b18a1040c9a5f1949821d/src/pages/iou/request/step/IOURequestStepParticipants.tsx#L141), [`src/pages/iou/request/step/IOURequestStepConfirmation.tsx`](https://github.com/Expensify/App/blob/8f123f449f1a4533830b18a1040c9a5f1949821d/src/pages/iou/request/step/IOURequestStepConfirmation.tsx#L320))
**Span ID**: Based on reportID
**Attributes**: `iou_type`, `iou_request_type`, `report_id`, `route_from`

### Open Share Submit Flow

**Constant**: `CONST.TELEMETRY.SPAN_SHARE_EXTENSION_OPEN_SUBMIT_FLOW`
**Sentry Name**: `ShareExtensionOpenSubmitFlow`
**Threshold**: 1s (P90)
**What's Measured**: Time from selecting a recipient in the Share Submit flow to the submit-details (confirm) screen rendering
**Start**: Recipient selected in the in-app Share participants selector, using an existing report or an account that requires an optimistic DM (`src/components/Share/ShareTabParticipantsSelector.tsx`, `onParticipantsAdded`).
**End**:
- User sees: Confirm-details screen
- Technical: Confirm-details container layout complete (onLayout event)
**Attributes**: `report_id`, `route_from`
**Notes**: The flow enters through a native OS share surface (the iOS Share Extension or Android share intent) and continues in the loaded app’s participant selector. It is scoped to the submit flow only (route `SHARE_SUBMIT_DETAILS`); the shared selector's track/share flow (`SHARE_DETAILS`) is not instrumented. Abandoned attempts (user backs out before the screen renders) are canceled on unmount and tagged `canceled`. The existing `ShareExtensionOpenSubmitFlow` name is retained for Sentry historical continuity.

### Send Message

**Constant**: `CONST.TELEMETRY.SPAN_SEND_MESSAGE_VISIBLE`
**Sentry Name**: `ManualSendMessageVisible`
**Threshold**: 300ms (P90)
**What's Measured**: Time from submitting a message to the message actually laid out on screen (`onLayout`), i.e. user-perceived send latency
**Start**: Message submitted in composer, only when scrolled to bottom ([`src/pages/inbox/report/ReportActionCompose/useComposerSubmit.ts`](https://github.com/Expensify/App/blob/main/src/pages/inbox/report/ReportActionCompose/useComposerSubmit.ts))
**End**:
- User sees: Their message appears in chat
- Technical: Message layout complete (`onLayout` event) in [`src/pages/inbox/report/comment/TextCommentFragment.tsx`](https://github.com/Expensify/App/blob/main/src/pages/inbox/report/comment/TextCommentFragment.tsx), or in [`AttachmentCommentFragment.tsx`](https://github.com/Expensify/App/blob/main/src/pages/inbox/report/comment/AttachmentCommentFragment.tsx) when the sent text parses to an attachment-only message (markdown video). Both use `useSendMessageSpanMarks`.
**Span ID**: `${CONST.TELEMETRY.SPAN_SEND_MESSAGE_VISIBLE}_${reportActionID}` (optimistic report action ID)
**Attributes**: `report_id`, `message_length`, `canceled_by_skeleton`, `send_message_source`, `report_action_count`, `money_request_preview_count`
**Cancellation (report-actions skeleton)**: While a report-actions skeleton is on screen, we listen for `ManualSendMessageVisible` spans started for that report and cancel them immediately, tagging `canceled: true` plus `canceled_by_skeleton` with the skeleton that caused it. Its child phase spans (below) are cancelled first.
- `canceled_by_skeleton` values (`CONST.TELEMETRY.CANCELED_BY_SKELETON`) based on skeleton condition
**Cancellation (report unmount / navigate away)**: If the user leaves the report before their message renders, any pending `ManualSendMessageVisible` span is cancelled via `cancelSpansByPrefix()` to avoid orphaned spans. Cancelled this way the span gets `canceled: true` but **no** `canceled_by_skeleton` (a blanket cancel by span-id prefix, not scoped to one `report_id`).
**Notes**: `send_message_source` = `<tab>_<scenario>` (+ `_rhp` in the RHP, + `_from_report` when drilled in from a report) — slice the metric by send path.
`report_action_count` / `money_request_preview_count` — how many renderable actions the chat's list holds and how many of them are `REPORT_PREVIEW` items — slice the metric by list weight (e.g. chats with many `MoneyRequestReportPreview` items).

### Send Message Phases

**Constants**: `CONST.TELEMETRY.SPAN_SEND_MESSAGE_PHASE.{PROPAGATE, POST_COMMIT}`
**Sentry Names**: `ManualSendMessagePropagate`, `ManualSendMessagePostCommit`
**Threshold**: none, read as slices of the parent
**What's Measured**: Two child spans of `ManualSendMessageVisible` that split a send where React commits the sent row. Everything measured is client-side; no phase covers the `AddComment` request.
**Span ID**: `${CONST.TELEMETRY.SPAN_SEND_MESSAGE_PHASE.<PHASE>}_${reportActionID}`, parented to the `ManualSendMessageVisible` span with the same `reportActionID`
**Lifecycle**: [`src/libs/telemetry/sendMessageSpans.ts`](https://github.com/Expensify/App/blob/main/src/libs/telemetry/sendMessageSpans.ts)

**Sequence**, with the four marks in order:

- `t0` composer submit ([`useComposerSubmit.ts`](https://github.com/Expensify/App/blob/main/src/pages/inbox/report/ReportActionCompose/useComposerSubmit.ts))
- `t1` `API.write` returns and the merge is queued ([`Report/index.ts`](https://github.com/Expensify/App/blob/main/src/libs/actions/Report/index.ts))
- Onyx applies the merge and notifies subscribers, React renders the new tree
- React commits, in order:
  - mutation: DOM / native views created
  - layout effects, innermost component first. `t2` is the sent row's own ([`useSendMessageSpanMarks.ts`](https://github.com/Expensify/App/blob/main/src/libs/telemetry/useSendMessageSpanMarks.ts)), then its ancestors, the list and the screen
  - passive effects
- derived recomputes, and the re-renders their writes cause
- platform layout
- `t3` `onLayout` in `TextCommentFragment` or `AttachmentCommentFragment`

`t2` is the first instant the row provably exists, since a layout effect cannot run before React created its view. Layout effects run child-before-parent, so the row's fires before the list's and the screen's, which puts those ancestor effects on the `PostCommit` side.

**Phases**:

- **Submit**, `t0` to `t1`, no span, read as the `Propagate` offset: builds the optimistic action and queues the write. `Onyx.update` batches and defers, so no merge is applied and nothing has rendered. Measured flat at 2 to 13ms on light and heavy accounts, which is why it has no span.
- **`Propagate`**, `t1` to `t2`: Onyx applying the merge, fan-out to every `reportActions_` and `report_` subscriber, React's render, and the commit up to the row's layout effect. Excludes ancestor layout effects, passive effects, platform layout.
- **`PostCommit`**, `t2` to `t3`: commit tail, passive effects, derived recomputes landing here, the re-renders their writes cause, platform layout. Excludes the row's own render. Larger of the two phases on the heavy accounts we measured.

**Triage**: a `Propagate` spike points at Onyx write application, subscriber fan-out, or the list render. A `PostCommit` spike points at the commit tail, passive effects, or derived recomputes and the re-renders they cause. Optimize one half and the other should stay flat, otherwise the work moved instead of going away.
**Cancellation shape**: no `Propagate` child means the parent died before the write was queued. `Propagate` without `PostCommit` means the row never committed. `PostCommit` present means the row committed and never got a layout. An AppState transition produces the first shape too, since `cancelAllSpans` sweeps parents first and drops the phases with them.
**Ordering**: phases no-op unless the parent is active, and every path that ends or cancels the parent closes them first. `@sentry/core` filters descendants through `isFullFinishedSpan` when a root span becomes a transaction, so a child still running at that point is discarded. `cancelSpansByPrefix` sweeps in reverse insertion order. `cancelAllSpans` keeps insertion order on purpose: it covers every span family, and reversing it would report other features' cancelled children with abort-time durations.
**Coverage**: only sends made while scrolled to the bottom get a parent, so only those get phases. `addAttachmentWithComment` gets neither. Nothing past the row's layout is covered, and keypress to `addComment` sits outside the parent.

**`OnyxDerivedCompute` children**: recomputes that fire while exactly one `ManualSendMessageVisible` is open nest under it, carrying `derivedKey` and `triggeredKeys`. With two sends in flight the engine coalesces the burst into one compute per key, so the recompute could belong to either and gets no parent.

- Position carries no meaning. The engine defers its flush, so the phase a compute lands in varies between sends.
- The span ends at `setDerivedValue`. Subscribers of the derived key re-render after that, outside the span, so a 2ms `sortedReportActions` compute can cost far more than 2ms. The rest surfaces as unattributed time in `PostCommit`.
- `triggeredKeys` separates work the send caused from work that overlapped it. `reportAttributes` fired by `reportActions_` belongs to the send. Fired by `reportNameValuePairs_` it comes from `clearAgentZeroProcessingIndicator` on Concierge sends.

## Failure Rates

### 404 Pages

**Constant**: `CONST.TELEMETRY.SPAN_NOT_FOUND_PAGE`
**Sentry Name**: `ManualNotFoundPage`
**What's Measured**: Tracks when users land on 404 pages
**Start**: 404 page detected ([`src/libs/telemetry/useAbsentPageSpan.ts`](https://github.com/Expensify/App/blob/8f123f449f1a4533830b18a1040c9a5f1949821d/src/libs/telemetry/useAbsentPageSpan.ts#L30))
**End**: Immediately after start (tracking occurrence, not duration) ([`src/libs/telemetry/useAbsentPageSpan.ts`](https://github.com/Expensify/App/blob/8f123f449f1a4533830b18a1040c9a5f1949821d/src/libs/telemetry/useAbsentPageSpan.ts#L39))
**Attributes**: `url`, `navigationSource: 'deeplink' | 'button'`

### Authentication Failures

**Constants**: `CONST.TELEMETRY.TAGS.AUTHENTICATION_FUNCTION`, `CONST.TELEMETRY.TAGS.AUTHENTICATION_ERROR_TYPE`, `CONST.TELEMETRY.TAGS.AUTHENTICATION_JSON_CODE` ([`src/CONST/index.ts`](https://github.com/Expensify/App/blob/8f123f449f1a4533830b18a1040c9a5f1949821d/src/CONST/index.ts#L1700-L1702))
**What's Measured**: Number of authentication failures tracked via `Sentry.captureException()` using [`trackAuthenticationError()`](https://github.com/Expensify/App/blob/8f123f449f1a4533830b18a1040c9a5f1949821d/src/libs/telemetry/trackAuthenticationError.ts#L23)
**Error Types**:
- `missing_params`: Missing required auth parameters ([`Authentication.ts:66`](https://github.com/Expensify/App/blob/8f123f449f1a4533830b18a1040c9a5f1949821d/src/libs/Authentication.ts#L66))
- `network_retry`: Network failure during reauthentication ([`Authentication.ts:158`](https://github.com/Expensify/App/blob/8f123f449f1a4533830b18a1040c9a5f1949821d/src/libs/Authentication.ts#L158))
- `auth_failure`: Non-200 response from auth request ([`Authentication.ts:171`](https://github.com/Expensify/App/blob/8f123f449f1a4533830b18a1040c9a5f1949821d/src/libs/Authentication.ts#L171))

**Tags**: `authentication_function`, `authentication_error_type`, `authentication_json_code`
**Context**: Command name, error message, provided parameters

### ANRs (Application Not Responding) - Android only

**Goal**: Track error conditions for trend analysis to identify when the app becomes unresponsive.
**Status**: ANRs are tracked automatically with a default Sentry configuration. 
**What's Measured**: Number of "Application Not Responding" errors

### Watchdog Terminations - iOS only

**Goal**: Track error conditions for trend analysis to identify when the app becomes unresponsive and is terminated by the OS.
**Status**: Watchdog Terminations are tracked automatically with a default Sentry configuration.
**What's Measured**: Number of "WatchdogTermination" errors

## Feature Health

### Create Expense Flow

**Goal**: Monitor end-to-end flow for critical expense creation features (manual entry, scan, distance).
**Status**: The dashboard to observe this feature can be found [here](https://expensify.sentry.io/dashboard/259520/?environment=production&statsPeriod=7d).
**What's Measured**:

We measure time from initiating an action to render of next screen for these actions:
- Open create an expense flow
- Switch tabs (manual / scan)
- "Next step" actions
    - Change amount
    - Change category
    - Change date
    - Change merchant
    - Confirmation screen
- Submit expense (redirect to report)
