import Navigation from '@libs/Navigation/Navigation';
import {canEditReportAction} from '@libs/ReportUtils';

import type * as ContextMenuActionsModule from '@pages/inbox/report/ContextMenu/ContextMenuActions';

import CONST from '@src/CONST';
import type {Report, ReportAction, ReportActions} from '@src/types/onyx';

import createMock from '../utils/createMock';

jest.mock('expo-web-browser', () => ({
    openAuthSessionAsync: jest.fn(),
}));
jest.mock('@components/Reactions/MiniQuickEmojiReactions', () => 'MiniQuickEmojiReactions');
jest.mock('@components/Reactions/QuickEmojiReactions', () => 'QuickEmojiReactions');
const {default: ContextMenuActions} = jest.requireActual<typeof ContextMenuActionsModule>('@pages/inbox/report/ContextMenu/ContextMenuActions');
const editAction = ContextMenuActions.find((action) => 'sentryLabel' in action && action.sentryLabel === CONST.SENTRY_LABEL.CONTEXT_MENU.EDIT_COMMENT);
if (!editAction?.shouldShow) {
    throw new Error('Edit comment context menu action was not found');
}
const shouldShowEditAction = editAction.shouldShow;
type ShouldShowArgs = Parameters<typeof shouldShowEditAction>[0];
if (!('onPress' in editAction)) {
    throw new Error('Edit comment context menu action has no onPress');
}
const pressEditAction = editAction.onPress;
describe('ContextMenuActions editAction', () => {
    afterEach(() => {
        jest.restoreAllMocks();
    });
    it('pairs each action with the history of its own report when checking edit permissions', () => {
        // Given a context-menu action read from the original report and a money request action that belongs to a
        // different report (the money request report), each report having its own action history
        const reportAction = createMock<ReportAction>({reportActionID: 'comment1', actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT, reportID: 'original1'});
        const moneyRequestAction = createMock<ReportAction>({reportActionID: 'iouAction1', actionName: CONST.REPORT.ACTIONS.TYPE.IOU, reportID: 'iou1'});
        const originalReportActions: ReportActions = {[reportAction.reportActionID]: reportAction};
        const moneyRequestReportActions: ReportActions = {[moneyRequestAction.reportActionID]: moneyRequestAction};
        jest.spyOn(require('@libs/ReportUtils'), 'canEditReportAction').mockReturnValue(false);
        const mockCanEditReportAction = jest.mocked(canEditReportAction);
        // When evaluating whether the edit action should show
        const args = createMock<ShouldShowArgs>({
            type: CONST.CONTEXT_MENU_TYPES.REPORT_ACTION,
            reportAction,
            moneyRequestAction,
            originalReportActions,
            moneyRequestReportActions,
            isArchivedRoom: false,
            isChronosReport: false,
        });
        shouldShowEditAction(args);
        // Then canEditReportAction receives each action together with its own report's history, so the
        // forwarded-since-last-submit check inside canEditMoneyRequest reads the right report's actions
        expect(mockCanEditReportAction).toHaveBeenNthCalledWith(1, reportAction, args.iouTransaction, args.rules, originalReportActions);
        expect(mockCanEditReportAction).toHaveBeenNthCalledWith(2, moneyRequestAction, args.iouTransaction, args.rules, moneyRequestReportActions);
    });
    it('shows the edit option when only the money request action is editable', () => {
        // Given the comment action is not editable but the money request action is
        jest.spyOn(require('@libs/ReportUtils'), 'canEditReportAction').mockReturnValueOnce(false).mockReturnValueOnce(true);
        // When evaluating whether the edit action should show for a non-archived, non-Chronos report action
        const result = shouldShowEditAction(
            createMock<ShouldShowArgs>({
                type: CONST.CONTEXT_MENU_TYPES.REPORT_ACTION,
                isArchivedRoom: false,
                isChronosReport: false,
            }),
        );
        // Then the edit option is offered because the second (money request) check allowed it
        expect(result).toBe(true);
    });
    it('hides the edit option when neither action is editable', () => {
        // Given neither the comment action nor the money request action can be edited
        jest.spyOn(require('@libs/ReportUtils'), 'canEditReportAction').mockReturnValue(false);
        // When evaluating whether the edit action should show for a non-archived, non-Chronos report action
        const result = shouldShowEditAction(
            createMock<ShouldShowArgs>({
                type: CONST.CONTEXT_MENU_TYPES.REPORT_ACTION,
                isArchivedRoom: false,
                isChronosReport: false,
            }),
        );
        // Then the edit option is hidden because both edit-permission checks rejected it
        expect(result).toBe(false);
    });
    it("sends the report policy's full policy snapshot marker when opening the expense to edit it", () => {
        // Given a money request action in a workspace expense report whose full policy snapshot is already cached
        const openReportSpy = jest.spyOn(require('@userActions/Report'), 'openReport').mockImplementation(() => {});
        jest.spyOn(Navigation, 'navigate').mockImplementation(() => {});
        const reportAction = createMock<ReportAction>({reportActionID: 'iouAction1', actionName: CONST.REPORT.ACTIONS.TYPE.IOU, reportID: 'iou1', childReportID: 'thread1'});

        // When Edit expense is pressed from the context menu
        pressEditAction(
            false,
            createMock<ContextMenuActionsModule.ContextMenuActionPayload>({
                reportAction,
                report: createMock<Report>({reportID: 'iou1', policyID: 'policy1'}),
                fullPolicySnapshotLastModified: 123,
            }),
        );

        // Then the transaction thread is fetched with the marker, since the thread shares the expense report's policy
        expect(openReportSpy).toHaveBeenCalledWith(expect.objectContaining({reportID: 'thread1', fullPolicySnapshot: {policyID: 'policy1', lastModified: 123}}));
    });
    it('hides the edit option in archived rooms and Chronos reports even when the action is editable', () => {
        // Given an action that is editable on its own
        jest.spyOn(require('@libs/ReportUtils'), 'canEditReportAction').mockReturnValue(true);
        // When the report is archived or is a Chronos report
        const archivedResult = shouldShowEditAction(
            createMock<ShouldShowArgs>({
                type: CONST.CONTEXT_MENU_TYPES.REPORT_ACTION,
                isArchivedRoom: true,
                isChronosReport: false,
            }),
        );
        const chronosResult = shouldShowEditAction(
            createMock<ShouldShowArgs>({
                type: CONST.CONTEXT_MENU_TYPES.REPORT_ACTION,
                isArchivedRoom: false,
                isChronosReport: true,
            }),
        );
        // Then the edit option stays hidden because archived and Chronos reports never allow editing
        expect(archivedResult).toBe(false);
        expect(chronosResult).toBe(false);
    });
});
