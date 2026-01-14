# Observability Metrics

This document lists all implemented telemetry metrics in the Expensify App.

## Performance Metrics

### App Startup

**Constant**: `CONST.TELEMETRY.SPAN_APP_STARTUP`
**Sentry Name**: `ManualAppStartup`
**Threshold**: 3s (P90)
**What's Measured**: Time from app initialization to splash screen hidden. This only measures JS thread time, not native thread time.
**Start**: App initialization (`src/setup/telemetry/index.ts:29`)
**End**: Splash screen hidden (`src/Expensify.tsx:218`)

### OD → ND Transition

**Constant**: `CONST.TELEMETRY.SPAN_OD_ND_TRANSITION`
**Sentry Name**: `ManualOdNdTransition`
**Threshold**: 3s (P90)
**What's Measured**: Time to transition from OldDot to NewDot in HybridApp
**Start**: Transition initiated with timestamp from HybridApp settings (`src/HybridAppHandler.tsx:49`)
**End**:
- User sees: NewDot interface fully loaded
- Technical: Transition finalized after setup (`src/HybridAppHandler.tsx:28`)

### Open Report

**Constant**: `CONST.TELEMETRY.SPAN_OPEN_REPORT`
**Sentry Name**: `ManualOpenReport`
**Threshold**: 1s (P90)
**What's Measured**: Time from navigating to report page to report fully rendered
**Start**:
- Automatically via React Navigation integration for all navigations to report screens
- Manually started with custom context in:
  - LHN report click (`src/components/LHNOptionsList/OptionRowLHN.tsx:180`) - name: `OptionRowLHN`
  - Money request preview (`src/components/ReportActionItem/MoneyRequestReportPreview/index.tsx:109`) - name: `MoneyRequestReportPreview`
  - Money request preview content (`src/components/ReportActionItem/MoneyRequestReportPreview/MoneyRequestReportPreviewContent.tsx:516`) - name: `MoneyRequestReportPreviewContent`
  - Search results (`src/components/Search/index.tsx:786`)
**End**:
- User sees: Report messages/content displayed
- Technical: Report actions list rendered (onLayout event)
  - Report data loaded from Onyx (reportID, type, chatType)
  - Report actions list layout complete
  - Called in `ReportActionsView.tsx:272` and `MoneyRequestReportActionsList.tsx:649`
**Span ID**: `${CONST.TELEMETRY.SPAN_OPEN_REPORT}_${reportID}`
**Attributes**: `is_transaction_thread`, `is_one_transaction_report`, `report_type`, `chat_type`

### Navigate to Reports Tab

**Constant**: `CONST.TELEMETRY.SPAN_NAVIGATE_TO_REPORTS_TAB`
**Sentry Name**: `ManualNavigateToReportsTab`
**Threshold**: 400ms (P90)
**What's Measured**: Time from clicking search tab to results rendered
**Start**: User clicks search/reports tab (`src/components/Navigation/NavigationTabBar/index.tsx:175`)
**End**:
- User sees: Search results list displayed
- Technical: Search results layout complete (onLayout event)
  - Search results data loaded from Onyx
  - Results sorted and sectioned
  - List layout rendered (`src/components/Search/index.tsx:961`)

### Navigate to Inbox Tab

**Constant**: `CONST.TELEMETRY.SPAN_NAVIGATE_TO_INBOX_TAB`
**Sentry Name**: `ManualNavigateToInboxTab`
**Threshold**: 400ms (P90)
**What's Measured**: Time from clicking inbox tab to sidebar rendered
**Start**: User clicks inbox/home tab (`src/components/Navigation/NavigationTabBar/index.tsx:160`)
**End**:
- User sees: Chat list displayed
- Technical: Sidebar layout complete (onLayout event)
  - Ordered reports list loaded from Onyx
  - Reports sorted by priority mode
  - Sidebar layout rendered (`src/pages/home/sidebar/SidebarLinksData.tsx:34`)

### Open Search Modal

**Constant**: `CONST.TELEMETRY.SPAN_OPEN_SEARCH_ROUTER`
**Sentry Name**: `ManualOpenSearchRouter`
**Threshold**: 400ms (P90)
**What's Measured**: Time from opening search to autocomplete ready
**Start**: Search button pressed or CMD+K triggered (`src/components/Search/SearchRouter/SearchButton.tsx:44`, `src/components/Search/SearchRouter/SearchRouterContext.tsx:98`)
**End**:
- User sees: Search input and autocomplete suggestions
- Technical: Autocomplete list finalized (`src/components/Search/SearchAutocompleteList.tsx:126`)
**Attributes**: `trigger: 'keyboard'` when opened via keyboard shortcut

### Open Create Expense

**Constant**: `CONST.TELEMETRY.SPAN_OPEN_CREATE_EXPENSE`
**Sentry Name**: `ManualOpenCreateExpense`
**Threshold**: 400ms (P90)
**What's Measured**: Time from initiating money request to first step rendered
**Start**: Money request initiated (`src/libs/actions/IOU/index.ts:1204`)
**End**:
- User sees: Expense creation form displayed
- Technical: Request step page mounted (`src/pages/iou/request/IOURequestStartPage.tsx:143`, `DistanceRequestStartPage.tsx:96`, `IOURequestStepParticipants.tsx:141`, `IOURequestStepConfirmation.tsx:320`)
**Span ID**: Based on reportID
**Attributes**: `iou_type`, `iou_request_type`, `report_id`, `route_from`

### Send Message

**Constant**: `CONST.TELEMETRY.SPAN_SEND_MESSAGE`
**Sentry Name**: `ManualSendMessage`
**Threshold**: 300ms (P90)
**What's Measured**: Time from submitting message to message rendered
**Start**: Message submitted in composer (`src/pages/home/report/ReportActionCompose/ReportActionCompose.tsx:344`)
**End**:
- User sees: Their message appears in chat
- Technical: Message text rendered in report (`src/pages/home/report/comment/TextCommentFragment.tsx:70`)
**Span ID**: Based on reportID
**Attributes**: `report_id`, `message_length`

## Failure Rates

### 404 Pages

**Constant**: `CONST.TELEMETRY.SPAN_NOT_FOUND_PAGE`
**Sentry Name**: `ManualNotFoundPage`
**What's Measured**: Tracks when users land on 404 pages
**Start**: 404 page detected (`src/libs/telemetry/useAbsentPageSpan.ts:30`)
**End**: Immediately after start (tracking occurrence, not duration) (`src/libs/telemetry/useAbsentPageSpan.ts:39`)
**Attributes**: `url`, `navigationSource: 'deeplink' | 'button'`

### Infinite Skeletons

**Constant**: `CONST.TELEMETRY.SPAN_SKELETON`
**Sentry Name**: `ManualSkeleton`
**Threshold**: 10s minimum duration (only sent if visible 10+ seconds)
**What's Measured**: Skeleton components visible longer than expected
**Start**: Skeleton component mounted (`src/libs/telemetry/useSkeletonSpan.ts:13`)
**End**: Component unmounts (`src/libs/telemetry/useSkeletonSpan.ts:24`)
**Span ID**: `${CONST.TELEMETRY.SPAN_SKELETON}_${component}_${reactId}`
**Minimum Duration**: `CONST.TELEMETRY.CONFIG.SKELETON_MIN_DURATION` (10s)

### Authentication Failures

**Constants**: `TAG_AUTHENTICATION_FUNCTION`, `TAG_AUTHENTICATION_ERROR_TYPE`, `TAG_AUTHENTICATION_JSON_CODE`
**Status**: Implementation details TBD

### ANRs (Application Not Responding)

**Status**: Metrics TBD

## Feature Health

### Create Expense Flow

**Status**: Metrics TBD
**Coverage**: Manual entry, scan, distance
