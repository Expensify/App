import type * as ContextMenuActionsModule from '@pages/inbox/report/ContextMenu/ContextMenuActions';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ReportAction} from '@src/types/onyx';

import Onyx from 'react-native-onyx';

import createMock from '../utils/createMock';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

jest.mock('expo-web-browser', () => ({
    openAuthSessionAsync: jest.fn(),
}));

jest.mock('@components/Reactions/MiniQuickEmojiReactions', () => 'MiniQuickEmojiReactions');
jest.mock('@components/Reactions/QuickEmojiReactions', () => 'QuickEmojiReactions');

const {default: ContextMenuActions} = jest.requireActual<typeof ContextMenuActionsModule>('@pages/inbox/report/ContextMenu/ContextMenuActions');

const unholdAction = ContextMenuActions.find((action) => 'textTranslateKey' in action && action.textTranslateKey === 'iou.unhold');
if (!unholdAction) {
    throw new Error('Unhold context menu action was not found');
}

const CURRENT_USER_ACCOUNT_ID = 1;
const OTHER_USER_ACCOUNT_ID = 2;

describe('ContextMenuActions unhold action', () => {
    beforeAll(async () => {
        Onyx.init({keys: ONYXKEYS});
        // canHoldUnholdReportAction compares the hold action's actor with the signed-in account
        await Onyx.set(ONYXKEYS.SESSION, {accountID: CURRENT_USER_ACCOUNT_ID});
        await waitForBatchedUpdates();
    });

    it.each([
        ['shows Unhold when the current user', CURRENT_USER_ACCOUNT_ID, true],
        ['hides Unhold when another user', OTHER_USER_ACCOUNT_ID, false],
    ])('%s put the IOU expense on hold', (_, holdActorAccountID, expectedShouldShow) => {
        // Given a held IOU expense whose hold action is passed in the payload, with nothing about that hold stored in Onyx
        const payload = createMock<Parameters<typeof unholdAction.shouldShow>[0]>({
            type: CONST.CONTEXT_MENU_TYPES.REPORT_ACTION,
            areHoldRequirementsMet: true,
            moneyRequestReport: {reportID: '10', type: CONST.REPORT.TYPE.IOU, stateNum: CONST.REPORT.STATE_NUM.SUBMITTED, statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED},
            moneyRequestAction: {reportActionID: '14', actionName: CONST.REPORT.ACTIONS.TYPE.IOU, actorAccountID: OTHER_USER_ACCOUNT_ID, childReportID: '11', message: [{html: ''}]},
            iouTransaction: {transactionID: '12', reportID: '10', comment: {hold: '13'}},
            holdReportAction: createMock<ReportAction>({reportActionID: '13', actionName: CONST.REPORT.ACTIONS.TYPE.HOLD, actorAccountID: holdActorAccountID}),
            currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
        });

        // When the context menu decides which actions to show
        const shouldShowUnhold = unholdAction.shouldShow(payload);

        // Then only the person who held an IOU expense sees Unhold, judged from the hold action in the payload
        expect(shouldShowUnhold).toBe(expectedShouldShow);
    });
});
