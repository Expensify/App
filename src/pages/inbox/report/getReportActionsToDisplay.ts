import type {OnyxInputValue} from 'react-native-onyx';
import DateUtils from '@libs/DateUtils';
import {rand64} from '@libs/NumberUtils';
import {getOriginalMessage, isMoneyRequestAction} from '@libs/ReportActionsUtils';
import {buildOptimisticCreatedReportAction, buildOptimisticIOUReportAction, isMoneyRequestReport} from '@libs/ReportUtils';
import CONST from '@src/CONST';
import type * as OnyxTypes from '@src/types/onyx';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

function getReportActionsToDisplay(
    allReportActions: OnyxTypes.ReportAction[],
    lastAction: OnyxTypes.ReportAction | undefined,
    report: OnyxTypes.Report | undefined,
    reportPreviewAction: OnyxInputValue<OnyxTypes.ReportAction<'REPORTPREVIEW'>> | undefined,
    transactionThreadReport: OnyxTypes.Report | undefined,
    shouldAddCreatedAction: boolean,
) {
    const actions = [...(allReportActions ?? [])];

    if (shouldAddCreatedAction) {
        const createdTime = lastAction?.created && DateUtils.subtractMillisecondsFromDateTime(lastAction.created, 1);
        const optimisticCreatedAction = buildOptimisticCreatedReportAction({
            emailCreatingAction: String(report?.ownerAccountID),
            created: createdTime,
        });
        optimisticCreatedAction.pendingAction = null;
        actions.push(optimisticCreatedAction);
    }

    if (!isMoneyRequestReport(report) || !allReportActions?.length) {
        return actions;
    }

    const moneyRequestActions = allReportActions.filter((action) => {
        const originalMessage = isMoneyRequestAction(action) ? getOriginalMessage(action) : undefined;
        return (
            isMoneyRequestAction(action) &&
            originalMessage &&
            (originalMessage?.type === CONST.IOU.REPORT_ACTION_TYPE.CREATE ||
                !!(originalMessage?.type === CONST.IOU.REPORT_ACTION_TYPE.PAY && originalMessage?.IOUDetails) ||
                originalMessage?.type === CONST.IOU.REPORT_ACTION_TYPE.TRACK)
        );
    });

    if (report?.total && moneyRequestActions.length < (reportPreviewAction?.childMoneyRequestCount ?? 0) && isEmptyObject(transactionThreadReport)) {
        const optimisticIOUAction = buildOptimisticIOUReportAction({
            type: CONST.IOU.REPORT_ACTION_TYPE.CREATE,
            amount: 0,
            currency: CONST.CURRENCY.USD,
            comment: '',
            participants: [],
            transactionID: rand64(),
            iouReportID: report?.reportID,
            created: DateUtils.subtractMillisecondsFromDateTime(actions.at(-1)?.created ?? '', 1),
        }) as OnyxTypes.ReportAction;
        moneyRequestActions.push(optimisticIOUAction);
        actions.splice(actions.length - 1, 0, optimisticIOUAction);
    }

    // Update pending action of created action if we have some requests that are pending
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const createdAction = actions.pop()!;
    if (moneyRequestActions.filter((action) => !!action.pendingAction).length > 0) {
        createdAction.pendingAction = CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE;
    }

    return [...actions, createdAction];
}

export default getReportActionsToDisplay;
