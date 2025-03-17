import Onyx from 'react-native-onyx';
import type {OnyxCollection} from 'react-native-onyx';
import CONST from '@src/CONST';
import type {OnyxValues} from '@src/ONYXKEYS';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Card, ReportAction, WorkspaceCardsList} from '@src/types/onyx';
import {getPolicy, getWorkspaceAccountID, isPolicyAdmin} from './PolicyUtils';
import {getOriginalMessage, isActionOfType} from './ReportActionsUtils';

let allUserCards: OnyxValues[typeof ONYXKEYS.CARD_LIST] = {};
Onyx.connect({
    key: ONYXKEYS.CARD_LIST,
    callback: (val) => {
        if (!val || Object.keys(val).length === 0) {
            return;
        }

        allUserCards = val;
    },
});

let allWorkspaceCards: OnyxCollection<WorkspaceCardsList> = {};
Onyx.connect({
    key: ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST,
    waitForCollectionCallback: true,
    callback: (value) => {
        allWorkspaceCards = value;
    },
});

function getExpensifyCardFromReportAction({reportAction, policyID}: {reportAction?: ReportAction; policyID?: string}): Card | undefined {
    const cardIssuedActionOriginalMessage = isActionOfType(
        reportAction,
        CONST.REPORT.ACTIONS.TYPE.CARD_ISSUED,
        CONST.REPORT.ACTIONS.TYPE.CARD_ISSUED_VIRTUAL,
        CONST.REPORT.ACTIONS.TYPE.CARD_ASSIGNED,
        CONST.REPORT.ACTIONS.TYPE.CARD_MISSING_ADDRESS,
    )
        ? getOriginalMessage(reportAction)
        : undefined;

    const cardID = cardIssuedActionOriginalMessage?.cardID ?? CONST.DEFAULT_NUMBER_ID;
    const workspaceAccountID = getWorkspaceAccountID(policyID);
    const allExpensifyCards = allWorkspaceCards?.[`cards_${workspaceAccountID}_${CONST.EXPENSIFY_CARD.BANK}`] ?? {};
    return isPolicyAdmin(getPolicy(policyID)) ? allExpensifyCards?.[cardID] : allUserCards[cardID];
}

export {
    // eslint-disable-next-line import/prefer-default-export
    getExpensifyCardFromReportAction,
};
