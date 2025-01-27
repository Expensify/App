import React from 'react';
import type {StyleProp, ViewStyle} from 'react-native';
import RenderHTML from '@components/RenderHTML';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import {isIOUReportPendingCurrencyConversion} from '@libs/IOUUtils';
import Navigation from '@libs/Navigation/Navigation';
import {isDeletedParentAction, isReversedTransaction, isSplitBillAction, isTrackExpenseAction} from '@libs/ReportActionsUtils';
import type {ContextMenuAnchor} from '@pages/home/report/ContextMenu/ReportActionContextMenu';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type * as OnyxTypes from '@src/types/onyx';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import MoneyRequestPreview from './MoneyRequestPreview';

type MoneyRequestActionProps = {
    /** All the data of the action */
    action: OnyxTypes.ReportAction;

    /** The ID of the associated chatReport */
    chatReportID: string;

    /** The ID of the associated expense report */
    requestReportID: string;

    /** The ID of the current report */
    reportID: string;

    /** Is this IOUACTION the most recent? */
    isMostRecentIOUReportAction: boolean;

    /** Popover context menu anchor, used for showing context menu */
    contextMenuAnchor?: ContextMenuAnchor;

    /** Callback for updating context menu active state, used for showing context menu */
    checkIfContextMenuActive?: () => void;

    /** Whether the IOU is hovered so we can modify its style */
    isHovered?: boolean;

    /** Whether a message is a whisper */
    isWhisper?: boolean;

    /** Styles to be assigned to Container */
    style?: StyleProp<ViewStyle>;

    /** Whether  context menu should be shown on press */
    shouldDisplayContextMenu?: boolean;
};

function MoneyRequestAction({
    action,
    chatReportID,
    requestReportID,
    reportID,
    isMostRecentIOUReportAction,
    contextMenuAnchor,
    checkIfContextMenuActive = () => {},
    isHovered = false,
    style,
    isWhisper = false,
    shouldDisplayContextMenu = true,
}: MoneyRequestActionProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {isOffline} = useNetwork();
    const isActionSplitBill = isSplitBillAction(action);
    const isActionTrackExpense = isTrackExpenseAction(action);
    const [reportActions] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${chatReportID || CONST.DEFAULT_NUMBER_ID}`, {canEvict: false});
    const [chatReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${chatReportID || CONST.DEFAULT_NUMBER_ID}`);
    const [iouReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${requestReportID}`);

    const onMoneyRequestPreviewPressed = () => {
        if (isActionSplitBill) {
            const reportActionID = action.reportActionID;
            Navigation.navigate(ROUTES.SPLIT_BILL_DETAILS.getRoute(chatReportID, reportActionID, Navigation.getReportRHPActiveRoute()));
            return;
        }

        const childReportID = action?.childReportID;
        if (!childReportID) {
            return;
        }
        Navigation.navigate(ROUTES.REPORT_WITH_ID.getRoute(childReportID));
    };

    let shouldShowPendingConversionMessage = false;
    const isParentActionDeleted = isDeletedParentAction(action);
    const isTransactionReveresed = isReversedTransaction(action);
    if (
        !isEmptyObject(iouReport) &&
        !isEmptyObject(reportActions) &&
        chatReport?.iouReportID &&
        isMostRecentIOUReportAction &&
        action.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD &&
        isOffline
    ) {
        shouldShowPendingConversionMessage = isIOUReportPendingCurrencyConversion(iouReport);
    }

    if (isParentActionDeleted || isTransactionReveresed) {
        let message: TranslationPaths;
        if (isTransactionReveresed) {
            message = 'parentReportAction.reversedTransaction';
        } else {
            message = 'parentReportAction.deletedExpense';
        }
        return <RenderHTML html={`<deleted-action ${CONST.REVERSED_TRANSACTION_ATTRIBUTE}="${isTransactionReveresed}">${translate(message)}</deleted-action>`} />;
    }
    return (
        <MoneyRequestPreview
            iouReportID={requestReportID}
            chatReportID={chatReportID}
            reportID={reportID}
            isBillSplit={isActionSplitBill}
            isTrackExpense={isActionTrackExpense}
            action={action}
            contextMenuAnchor={contextMenuAnchor}
            checkIfContextMenuActive={checkIfContextMenuActive}
            shouldShowPendingConversionMessage={shouldShowPendingConversionMessage}
            onPreviewPressed={onMoneyRequestPreviewPressed}
            containerStyles={[styles.cursorPointer, isHovered ? styles.reportPreviewBoxHoverBorder : undefined, style]}
            isHovered={isHovered}
            isWhisper={isWhisper}
            shouldDisplayContextMenu={shouldDisplayContextMenu}
        />
    );
}

MoneyRequestAction.displayName = 'MoneyRequestAction';

export default MoneyRequestAction;
