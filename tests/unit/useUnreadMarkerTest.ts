import useUnreadMarker from '@hooks/useUnreadMarker';

import ONYXKEYS from '@src/ONYXKEYS';
import type * as OnyxTypes from '@src/types/onyx';

import {act, renderHook} from '@testing-library/react-native';
import {DeviceEventEmitter} from 'react-native';

import {getFakeReportAction} from '../utils/ReportTestUtils';

const REPORT_ID = '1';
const CURRENT_USER_ACCOUNT_ID = 1;
const OTHER_USER_ACCOUNT_ID = 99;
const LAST_READ_TIME = '2023-01-01 10:00:00.000';

let mockIsAnonymousUser = false;
let mockLastReadTime: string = LAST_READ_TIME;
let mockLastReadTimeByReportID: Record<string, string> = {};

jest.mock('@hooks/useCurrentUserPersonalDetails', () => ({
    __esModule: true,
    default: () => ({accountID: CURRENT_USER_ACCOUNT_ID}),
}));

jest.mock('@hooks/useIsAnonymousUser', () => ({
    __esModule: true,
    default: () => mockIsAnonymousUser,
}));

// The hook subscribes to `${ONYXKEYS.COLLECTION.REPORT}${reportID}` with a selector that returns
// `lastReadTime`. The implementation is set in beforeEach so it can use ONYXKEYS freely (a jest.mock
// factory cannot reference out-of-scope variables).
const mockUseOnyx = jest.fn<[string], [string]>();
jest.mock('@hooks/useOnyx', () => ({
    __esModule: true,
    default: (key: string) => mockUseOnyx(key),
}));

function makeAction(reportActionID: string, overrides: Partial<OnyxTypes.ReportAction> = {}): OnyxTypes.ReportAction {
    return getFakeReportAction(OTHER_USER_ACCOUNT_ID, {
        reportActionID,
        actorAccountID: OTHER_USER_ACCOUNT_ID,
        created: '2023-01-01 11:00:00.000',
        ...overrides,
    });
}

function renderUnreadMarker(params: Partial<Parameters<typeof useUnreadMarker>[0]> = {}) {
    const actions = params.sortedVisibleReportActions ?? [makeAction('m1')];
    return renderHook(() =>
        useUnreadMarker({
            reportID: REPORT_ID,
            sortedVisibleReportActions: actions,
            sortedReportActions: actions,
            oldestUnreadReportActionID: undefined,
            isScrolledOverThreshold: false,
            hasOnceLoadedReportActions: true,
            ...params,
        }),
    );
}

describe('useUnreadMarker', () => {
    beforeEach(() => {
        mockIsAnonymousUser = false;
        mockLastReadTime = LAST_READ_TIME;
        mockLastReadTimeByReportID = {};
        mockUseOnyx.mockImplementation((key) => {
            const reportID = key.replace(ONYXKEYS.COLLECTION.REPORT, '');
            return [mockLastReadTimeByReportID[reportID] ?? mockLastReadTime];
        });
    });

    it('returns [null, -1] for an anonymous user', () => {
        mockIsAnonymousUser = true;
        const {result} = renderUnreadMarker();

        expect(result.current.unreadMarkerReportActionID).toBeNull();
        expect(result.current.unreadMarkerReportActionIndex).toBe(-1);
    });

    it('places the marker on an unread message from another user', () => {
        const {result} = renderUnreadMarker({sortedVisibleReportActions: [makeAction('m1')]});

        expect(result.current.unreadMarkerReportActionID).toBe('m1');
        expect(result.current.unreadMarkerReportActionIndex).toBe(0);
    });

    it('prefers the oldestUnread pagination anchor over the scan on first open when the scan finds nothing', () => {
        const readAction = makeAction('a', {created: '2023-01-01 09:00:00.000'});
        const {result} = renderUnreadMarker({
            sortedVisibleReportActions: [readAction],
            oldestUnreadReportActionID: 'a',
            hasOnceLoadedReportActions: false,
        });

        expect(result.current.unreadMarkerReportActionID).toBe('a');
        expect(result.current.unreadMarkerReportActionIndex).toBe(0);
    });

    it('ignores the oldestUnread anchor once the report actions have loaded', () => {
        const readAction = makeAction('a', {created: '2023-01-01 09:00:00.000'});
        const {result} = renderUnreadMarker({
            sortedVisibleReportActions: [readAction],
            oldestUnreadReportActionID: 'a',
            hasOnceLoadedReportActions: true,
        });

        expect(result.current.unreadMarkerReportActionID).toBeNull();
        expect(result.current.unreadMarkerReportActionIndex).toBe(-1);
    });

    it('clears the marker when an unreadAction event advances the unread marker time past the message', () => {
        const {result} = renderUnreadMarker({sortedVisibleReportActions: [makeAction('m1')]});
        expect(result.current.unreadMarkerReportActionID).toBe('m1');

        act(() => {
            DeviceEventEmitter.emit(`unreadAction_${REPORT_ID}`, '2023-01-01 12:00:00.000');
        });

        expect(result.current.unreadMarkerReportActionID).toBeNull();
        expect(result.current.unreadMarkerReportActionIndex).toBe(-1);
    });

    it('seeds the marker from the switched-to report lastReadTime (one mount per report)', () => {
        // Setup: report 'A' was last read at 10:00 and 'B' at 12:00; one action from another user lands
        // at 11:00 — after A's read time (unread on A) but before B's read time (already read on B).
        mockLastReadTimeByReportID = {
            A: '2023-01-01 10:00:00.000',
            B: '2023-01-01 12:00:00.000',
        };
        const action = makeAction('msg', {created: '2023-01-01 11:00:00.000'});

        // Mounted on A: 11:00 is after A's 10:00 read time → unread → marker lands on the action.
        const {result: resultA} = renderUnreadMarker({reportID: 'A', sortedVisibleReportActions: [action], sortedReportActions: [action]});
        expect(resultA.current.unreadMarkerReportActionID).toBe('msg');
        expect(resultA.current.unreadMarkerReportActionIndex).toBe(0);

        // Mounted on B: 11:00 is before B's 12:00 read time → already read → no marker.
        const {result: resultB} = renderUnreadMarker({reportID: 'B', sortedVisibleReportActions: [action], sortedReportActions: [action]});
        expect(resultB.current.unreadMarkerReportActionID).toBeNull();
        expect(resultB.current.unreadMarkerReportActionIndex).toBe(-1);
    });
});
