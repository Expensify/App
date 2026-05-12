import {act, renderHook} from '@testing-library/react-native';
import useConciergeSidePanelReportActions from '@hooks/useConciergeSidePanelReportActions';
import CONST from '@src/CONST';
import type * as OnyxTypes from '@src/types/onyx';

const REPORT_ID = '1';
const CURRENT_USER_ACCOUNT_ID = 123;
const SESSION_START_TIME = '2026-05-12 10:00:00.000';

const createdAction = {
    reportActionID: 'created',
    reportID: REPORT_ID,
    actionName: CONST.REPORT.ACTIONS.TYPE.CREATED,
    actorAccountID: CURRENT_USER_ACCOUNT_ID,
    created: '2026-05-10 10:00:00.000',
} as OnyxTypes.ReportAction;

const previousUserAction = {
    reportActionID: 'previous-user-message',
    reportID: REPORT_ID,
    actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT,
    actorAccountID: CURRENT_USER_ACCOUNT_ID,
    created: '2026-05-11 10:00:00.000',
} as OnyxTypes.ReportAction;

const currentSessionUserAction = {
    reportActionID: 'current-session-user-message',
    reportID: REPORT_ID,
    actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT,
    actorAccountID: CURRENT_USER_ACCOUNT_ID,
    created: '2026-05-12 10:01:00.000',
} as OnyxTypes.ReportAction;

const defaultParams = {
    report: {
        reportID: REPORT_ID,
        lastReadTime: '2026-05-12 09:59:00.000',
    } as OnyxTypes.Report,
    reportActions: [createdAction],
    visibleReportActions: [createdAction],
    isConciergeSidePanel: true,
    hasUserSentMessage: false,
    hasOlderActions: false,
    sessionStartTime: SESSION_START_TIME,
    currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
    greetingText: 'How can I help?',
    loadOlderChats: jest.fn(),
};

describe('useConciergeSidePanelReportActions', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('shows previous message affordance when prior Concierge history is on older pages', () => {
        const {result} = renderHook(() =>
            useConciergeSidePanelReportActions({
                ...defaultParams,
                hasOlderActions: true,
            }),
        );

        expect(result.current.hasPreviousMessages).toBe(true);
    });

    it('loads older Concierge messages when showing previous messages', () => {
        const loadOlderChats = jest.fn();
        const {result} = renderHook(() =>
            useConciergeSidePanelReportActions({
                ...defaultParams,
                hasOlderActions: true,
                loadOlderChats,
            }),
        );

        act(() => {
            result.current.handleShowPreviousMessages();
        });

        expect(loadOlderChats).toHaveBeenCalledWith(true);
        expect(result.current.showFullHistory).toBe(true);
    });

    it('shows previous message affordance when prior Concierge history is already loaded', () => {
        const {result} = renderHook(() =>
            useConciergeSidePanelReportActions({
                ...defaultParams,
                reportActions: [createdAction, previousUserAction, currentSessionUserAction],
                visibleReportActions: [createdAction, previousUserAction, currentSessionUserAction],
                hasUserSentMessage: true,
            }),
        );

        expect(result.current.hasPreviousMessages).toBe(true);
    });

    it('does not show previous message affordance without prior Concierge history', () => {
        const {result} = renderHook(() =>
            useConciergeSidePanelReportActions({
                ...defaultParams,
                reportActions: [createdAction, currentSessionUserAction],
                visibleReportActions: [createdAction, currentSessionUserAction],
                hasUserSentMessage: true,
            }),
        );

        expect(result.current.hasPreviousMessages).toBe(false);
    });
});
