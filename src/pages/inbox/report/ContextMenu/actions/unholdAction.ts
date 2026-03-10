import type {OnyxEntry} from 'react-native-onyx';
import interceptAnonymousUser from '@libs/interceptAnonymousUser';
import {getReportAction} from '@libs/ReportActionsUtils';
import {canHoldUnholdReportAction, changeMoneyRequestHoldStatus} from '@libs/ReportUtils';
import {hideContextMenu} from '@pages/inbox/report/ContextMenu/ReportActionContextMenu';
import CONST from '@src/CONST';
import type {Policy, ReportAction, Report as ReportType, Transaction} from '@src/types/onyx';
import type IconAsset from '@src/types/utils/IconAsset';
import type {BaseContextMenuActionParams, ContextMenuAction} from './actionConfig';

type UnholdActionParams = BaseContextMenuActionParams & {
    moneyRequestAction: ReportAction | undefined;
    isDelegateAccessRestricted: boolean;
    showDelegateNoAccessModal: (() => void) | undefined;
    hideAndRun: (callback?: () => void) => void;
    stopwatchIcon: IconAsset;
};

function shouldShowUnholdAction({
    moneyRequestReport,
    moneyRequestAction,
    moneyRequestPolicy,
    areHoldRequirementsMet,
    iouTransaction,
}: {
    moneyRequestReport: OnyxEntry<ReportType>;
    moneyRequestAction: ReportAction | undefined;
    moneyRequestPolicy: OnyxEntry<Policy>;
    areHoldRequirementsMet: boolean;
    iouTransaction: OnyxEntry<Transaction>;
}): boolean {
    if (!areHoldRequirementsMet) {
        return false;
    }
    const holdReportAction = getReportAction(moneyRequestAction?.childReportID, `${iouTransaction?.comment?.hold ?? ''}`);
    return canHoldUnholdReportAction(moneyRequestReport, moneyRequestAction, holdReportAction, iouTransaction, moneyRequestPolicy).canUnholdRequest;
}

function createUnholdAction({moneyRequestAction, isDelegateAccessRestricted, showDelegateNoAccessModal, hideAndRun, translate, stopwatchIcon}: UnholdActionParams): ContextMenuAction {
    return {
        id: 'unhold',
        icon: stopwatchIcon,
        text: translate('iou.unhold'),
        onPress: () =>
            interceptAnonymousUser(() => {
                if (isDelegateAccessRestricted) {
                    hideContextMenu(false, showDelegateNoAccessModal);
                    return;
                }
                hideAndRun(() => changeMoneyRequestHoldStatus(moneyRequestAction));
            }, false),
        sentryLabel: CONST.SENTRY_LABEL.CONTEXT_MENU.UNHOLD,
    };
}

export default createUnholdAction;
export {shouldShowUnholdAction};
