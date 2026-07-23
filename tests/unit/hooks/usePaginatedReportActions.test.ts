import {renderHook} from '@testing-library/react-native';

import useOnyx from '@hooks/useOnyx';
import usePaginatedReportActions from '@hooks/usePaginatedReportActions';
import useReportIsArchived from '@hooks/useReportIsArchived';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report, ReportAction} from '@src/types/onyx';
import type Pages from '@src/types/onyx/Pages';

import type {OnyxKey, UseOnyxResult} from 'react-native-onyx';

import createRandomReportAction from '../../utils/collections/reportActions';

// The behavior change under test lives in the `id` useMemo of usePaginatedReportActions:
// when a `reportActionID` is provided but does NOT exist in this report's own actions
// (e.g. a one-transaction expense link where the linked message lives in the merged-in
// transaction thread), the hook must fall back to the newest window instead of anchoring
// pagination to a missing action. Previously, getContinuousChain returned an empty array in
// that case (see tests/unit/PaginationUtilsTest.ts "given an input ID of 8 or 13 ... empty
// array"), which is what hid the parent-level "Submitted" system message.
//
// We deliberately use the REAL getContinuousChain (PaginationUtils is not mocked) so these
// tests exercise the true integration of the change with pagination, and only mock the Onyx
// subscriptions so we can control the report, its actions, and its pages.

jest.mock('@hooks/useOnyx', () => ({
    __esModule: true,
    default: jest.fn(),
}));

jest.mock('@hooks/useReportIsArchived', () => ({
    __esModule: true,
    default: jest.fn(() => false),
}));

const mockUseOnyx = jest.mocked(useOnyx);

const REPORT_ID = 'expense-report-1';
const LINKED_ACTION_ID = 'action-in-this-report';
const SIBLING_ACTION_ID = 'action-in-transaction-thread';

// `{status: 'loaded'}` alone satisfies ResultMetadata (its sourceValue is optional). A single
// broad UseOnyxResult type keeps each mocked subscription value assignable without casts.
type MockOnyxResult = UseOnyxResult<Report | ReportAction[] | Pages>;

function makeReport(overrides: Partial<Report> = {}): Report {
    return {
        reportID: REPORT_ID,
        type: CONST.REPORT.TYPE.EXPENSE,
        chatReportID: 'chat-report-1',
        ...overrides,
    } as Report;
}

/**
 * Minimal display-sorted actions (newest first). Ordering only needs to be internally
 * consistent — getContinuousChain indexes by reportActionID, and the "newest window"
 * result for empty pages returns the whole array regardless of order.
 */
function makeActions(reportActionIds: string[]): ReportAction[] {
    return reportActionIds.map((reportActionID, index) => ({
        ...createRandomReportAction(index),
        reportActionID,
        created: `2024-01-01 10:0${reportActionIds.length - index}:00.000`,
    }));
}

/**
 * Wire the three Onyx subscriptions usePaginatedReportActions makes: the report, its
 * (already display-sorted) actions, and its pages. The selector on the actions key is
 * bypassed by the mock, so we pass pre-sorted actions directly.
 */
function wireOnyx({report, actions, pages}: {report: Report | undefined; actions: ReportAction[] | undefined; pages: Pages | undefined}): void {
    mockUseOnyx.mockImplementation((key: OnyxKey): MockOnyxResult => {
        if (key === `${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`) {
            return [report, {status: 'loaded'}];
        }
        if (key === `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${REPORT_ID}`) {
            return [actions, {status: 'loaded'}];
        }
        if (key === `${ONYXKEYS.COLLECTION.REPORT_ACTIONS_PAGES}${REPORT_ID}`) {
            return [pages, {status: 'loaded'}];
        }
        return [undefined, {status: 'loaded'}];
    });
}

function actionIds(actions: ReportAction[] | undefined): string[] {
    return (actions ?? []).map((action) => action.reportActionID);
}

describe('usePaginatedReportActions', () => {
    beforeEach(() => {
        mockUseOnyx.mockReset();
        jest.mocked(useReportIsArchived).mockReturnValue(false);
    });

    describe('when the linked action exists in this report (no behavior change)', () => {
        it('anchors to the linked action and returns the report actions with pages absent', () => {
            const actions = makeActions(['c', 'b', LINKED_ACTION_ID]);
            wireOnyx({report: makeReport(), actions, pages: []});

            const {result} = renderHook(() => usePaginatedReportActions(REPORT_ID, LINKED_ACTION_ID));

            // Non-empty result and the linked action is surfaced — identical to pre-change behavior.
            expect(actionIds(result.current.reportActions)).toEqual(['c', 'b', LINKED_ACTION_ID]);
            expect(result.current.linkedAction?.reportActionID).toBe(LINKED_ACTION_ID);
        });

        it('anchors to the linked action within its page when pages are present', () => {
            const actions = makeActions(['e', 'd', 'c', 'b', 'a']);
            const pages: Pages = [['e', 'd', 'c', 'b', 'a']];
            wireOnyx({report: makeReport(), actions, pages});

            const {result} = renderHook(() => usePaginatedReportActions(REPORT_ID, 'c'));

            expect(result.current.reportActions.length).toBeGreaterThan(0);
            expect(result.current.linkedAction?.reportActionID).toBe('c');
        });
    });

    describe('when the linked action is NOT in this report (the fix)', () => {
        it('falls back to the newest window instead of returning an empty list, with pages absent', () => {
            const actions = makeActions(['c', 'b', 'a']);
            wireOnyx({report: makeReport(), actions, pages: []});

            // SIBLING_ACTION_ID lives in the transaction thread, not in this report's own actions.
            const {result} = renderHook(() => usePaginatedReportActions(REPORT_ID, SIBLING_ACTION_ID));

            // Before the fix this was [] (getContinuousChain empty-array behavior); now it is the newest window.
            expect(actionIds(result.current.reportActions)).toEqual(['c', 'b', 'a']);
            // No linked action is surfaced from this report — the host screen merges the thread separately.
            expect(result.current.linkedAction).toBeUndefined();
        });

        it('falls back to the newest page instead of returning an empty list, with pages present', () => {
            const actions = makeActions(['e', 'd', 'c', 'b', 'a']);
            const pages: Pages = [['e', 'd', 'c']];
            wireOnyx({report: makeReport(), actions, pages});

            const {result} = renderHook(() => usePaginatedReportActions(REPORT_ID, SIBLING_ACTION_ID));

            expect(result.current.reportActions.length).toBeGreaterThan(0);
            expect(result.current.linkedAction).toBeUndefined();
        });
    });

    describe('unchanged paths', () => {
        it('returns the newest window when no reportActionID is provided', () => {
            const actions = makeActions(['c', 'b', 'a']);
            wireOnyx({report: makeReport(), actions, pages: []});

            const {result} = renderHook(() => usePaginatedReportActions(REPORT_ID));

            expect(actionIds(result.current.reportActions)).toEqual(['c', 'b', 'a']);
            expect(result.current.linkedAction).toBeUndefined();
        });

        it('ignores the anchor and never surfaces a linked action when treatAsNoPaginationAnchor is set, even if the action exists', () => {
            const actions = makeActions(['c', 'b', LINKED_ACTION_ID]);
            wireOnyx({report: makeReport(), actions, pages: []});

            const {result} = renderHook(() => usePaginatedReportActions(REPORT_ID, LINKED_ACTION_ID, {treatAsNoPaginationAnchor: true}));

            expect(result.current.reportActions.length).toBeGreaterThan(0);
            expect(result.current.linkedAction).toBeUndefined();
        });

        it('resolves the oldest-unread anchor when shouldLinkToOldestUnreadReportAction is set and no reportActionID is provided', () => {
            // lastReadTime is older than "b"/"c" but newer than "a", so the oldest unread action is "b".
            const actions = makeActions(['c', 'b', 'a']);
            const report = makeReport({lastReadTime: '2024-01-01 10:01:30.000'});
            wireOnyx({report, actions, pages: []});

            const {result} = renderHook(() => usePaginatedReportActions(REPORT_ID, undefined, {shouldLinkToOldestUnreadReportAction: true}));

            expect(result.current.reportActions.length).toBeGreaterThan(0);
            expect(result.current.oldestUnreadReportAction?.reportActionID).toBe('b');
        });

        it('returns an empty list without crashing when the report has no actions', () => {
            wireOnyx({report: makeReport(), actions: [], pages: []});

            const {result} = renderHook(() => usePaginatedReportActions(REPORT_ID, SIBLING_ACTION_ID));

            expect(result.current.reportActions).toEqual([]);
            expect(result.current.linkedAction).toBeUndefined();
        });
    });
});
