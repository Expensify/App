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
  - Called in [`src/pages/home/report/ReportActionsView.tsx`](https://github.com/Expensify/App/blob/8f123f449f1a4533830b18a1040c9a5f1949821d/src/pages/home/report/ReportActionsView.tsx#L272) and [`src/components/MoneyRequestReportActionsList.tsx`](https://github.com/Expensify/App/blob/8f123f449f1a4533830b18a1040c9a5f1949821d/src/components/MoneyRequestReportActionsList.tsx#L649)
**Span ID**: `${CONST.TELEMETRY.SPAN_OPEN_REPORT}_${reportID}`
**Attributes**: `is_transaction_thread`, `is_one_transaction_report`, `report_type`, `chat_type`

### Navigate to Reports Tab

**Constant**: `CONST.TELEMETRY.SPAN_NAVIGATE_TO_REPORTS_TAB`
**Sentry Name**: `ManualNavigateToReportsTab`
**Threshold**: 400ms (P90)
**What's Measured**: Time from clicking search tab to results rendered
**Start**: User clicks search/reports tab ([`src/components/Navigation/NavigationTabBar/index.tsx`](https://github.com/Expensify/App/blob/8f123f449f1a4533830b18a1040c9a5f1949821d/src/components/Navigation/NavigationTabBar/index.tsx#L175))
**End**:
- User sees: Search results list displayed
- Technical: Search results layout complete (onLayout event)
  - Search results data loaded from Onyx
  - Results sorted and sectioned
  - List layout rendered ([`src/components/Search/index.tsx`](https://github.com/Expensify/App/blob/8f123f449f1a4533830b18a1040c9a5f1949821d/src/components/Search/index.tsx#L961))

### Navigate to Inbox Tab

**Constant**: `CONST.TELEMETRY.SPAN_NAVIGATE_TO_INBOX_TAB`
**Sentry Name**: `ManualNavigateToInboxTab`
**Threshold**: 400ms (P90)
**What's Measured**: Time from clicking inbox tab to sidebar rendered
**Start**: User clicks inbox/home tab ([`src/components/Navigation/NavigationTabBar/index.tsx`](https://github.com/Expensify/App/blob/8f123f449f1a4533830b18a1040c9a5f1949821d/src/components/Navigation/NavigationTabBar/index.tsx#L160))
**End**:
- User sees: Chat list displayed
- Technical: Sidebar layout complete (onLayout event)
  - Ordered reports list loaded from Onyx
  - Reports sorted by priority mode
  - Sidebar layout rendered ([`src/pages/home/sidebar/SidebarLinksData.tsx`](https://github.com/Expensify/App/blob/8f123f449f1a4533830b18a1040c9a5f1949821d/src/pages/home/sidebar/SidebarLinksData.tsx#L34))

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

### Send Message

**Constant**: `CONST.TELEMETRY.SPAN_SEND_MESSAGE`
**Sentry Name**: `ManualSendMessage`
**Threshold**: 100ms (P90)
**What's Measured**: Time from submitting message to message rendered
**Start**: Message submitted in composer ([`src/pages/home/report/ReportActionCompose/ReportActionCompose.tsx`](https://github.com/Expensify/App/blob/8f123f449f1a4533830b18a1040c9a5f1949821d/src/pages/home/report/ReportActionCompose/ReportActionCompose.tsx#L344))
**End**:
- User sees: Their message appears in chat
- Technical: Message text rendered in report ([`src/pages/home/report/comment/TextCommentFragment.tsx`](https://github.com/Expensify/App/blob/8f123f449f1a4533830b18a1040c9a5f1949821d/src/pages/home/report/comment/TextCommentFragment.tsx#L70))
**Span ID**: Based on reportID
**Attributes**: `report_id`, `message_length`

## Failure Rates

### 404 Pages

**Constant**: `CONST.TELEMETRY.SPAN_NOT_FOUND_PAGE`
**Sentry Name**: `ManualNotFoundPage`
**What's Measured**: Tracks when users land on 404 pages
**Start**: 404 page detected ([`src/libs/telemetry/useAbsentPageSpan.ts`](https://github.com/Expensify/App/blob/8f123f449f1a4533830b18a1040c9a5f1949821d/src/libs/telemetry/useAbsentPageSpan.ts#L30))
**End**: Immediately after start (tracking occurrence, not duration) ([`src/libs/telemetry/useAbsentPageSpan.ts`](https://github.com/Expensify/App/blob/8f123f449f1a4533830b18a1040c9a5f1949821d/src/libs/telemetry/useAbsentPageSpan.ts#L39))
**Attributes**: `url`, `navigationSource: 'deeplink' | 'button'`

### Infinite Skeletons

**Constant**: `CONST.TELEMETRY.SPAN_SKELETON`
**Sentry Name**: `ManualSkeleton`
**Threshold**: 10s minimum duration (only sent if visible 10+ seconds)
**What's Measured**: Number of skeleton components visible longer than expected
**Start**: Skeleton component mounted ([`src/libs/telemetry/useSkeletonSpan.ts`](https://github.com/Expensify/App/blob/8f123f449f1a4533830b18a1040c9a5f1949821d/src/libs/telemetry/useSkeletonSpan.ts#L13))
**End**: Component unmounts ([`src/libs/telemetry/useSkeletonSpan.ts`](https://github.com/Expensify/App/blob/8f123f449f1a4533830b18a1040c9a5f1949821d/src/libs/telemetry/useSkeletonSpan.ts#L24))
**Span ID**: `${CONST.TELEMETRY.SPAN_SKELETON}_${component}_${reactId}`
**Minimum Duration**: `CONST.TELEMETRY.CONFIG.SKELETON_MIN_DURATION` (10s)

### Authentication Failures

**Constants**: `CONST.TELEMETRY.TAG_AUTHENTICATION_FUNCTION`, `CONST.TELEMETRY.TAG_AUTHENTICATION_ERROR_TYPE`, `CONST.TELEMETRY.TAG_AUTHENTICATION_JSON_CODE` ([`src/CONST/index.ts`](https://github.com/Expensify/App/blob/8f123f449f1a4533830b18a1040c9a5f1949821d/src/CONST/index.ts#L1700-L1702))
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
