import React from 'react';
import type {StyleProp, ViewStyle} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import type {OnyxEntry} from 'react-native-onyx';
import RenderHTML from '@components/RenderHTML';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useThemeStyles from '@hooks/useThemeStyles';
import * as IOUUtils from '@libs/IOUUtils';
import Navigation from '@libs/Navigation/Navigation';
import * as ReportActionsUtils from '@libs/ReportActionsUtils';
import type {ContextMenuAnchor} from '@pages/home/report/ContextMenu/ReportActionContextMenu';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type * as OnyxTypes from '@src/types/onyx';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import MoneyRequestPreview from './MoneyRequestPreview';

type MoneyRequestActionOnyxProps = {
    /** Chat report associated with iouReport */
    chatReport: OnyxEntry<OnyxTypes.Report>;

    /** IOU report data object */
    iouReport: OnyxEntry<OnyxTypes.Report>;

    /** Report actions for this report */
    reportActions: OnyxEntry<OnyxTypes.ReportActions>;
};

type MoneyRequestActionProps = MoneyRequestActionOnyxProps & {
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
    chatReport,
    iouReport,
    reportActions,
    isHovered = false,
    style,
    isWhisper = false,
    shouldDisplayContextMenu = true,
}: MoneyRequestActionProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {isOffline} = useNetwork();
    const isSplitBillAction = ReportActionsUtils.isSplitBillAction(action);
    const isTrackExpenseAction = ReportActionsUtils.isTrackExpenseAction(action);

    const onMoneyRequestPreviewPressed = () => {
        if (isSplitBillAction) {
            const reportActionID = action.reportActionID ?? '-1';
            Navigation.navigate(ROUTES.SPLIT_BILL_DETAILS.getRoute(chatReportID, reportActionID, Navigation.getReportRHPActiveRoute()));
            return;
        }

        const childReportID = action?.childReportID ?? '-1';
        Navigation.navigate(ROUTES.REPORT_WITH_ID.getRoute(childReportID));
    };

    let shouldShowPendingConversionMessage = false;
    const isDeletedParentAction = ReportActionsUtils.isDeletedParentAction(action);
    const isReversedTransaction = ReportActionsUtils.isReversedTransaction(action);
    if (
        !isEmptyObject(iouReport) &&
        !isEmptyObject(reportActions) &&
        chatReport?.iouReportID &&
        isMostRecentIOUReportAction &&
        action.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD &&
        isOffline
    ) {
        shouldShowPendingConversionMessage = IOUUtils.isIOUReportPendingCurrencyConversion(iouReport);
    }

    if (isDeletedParentAction || isReversedTransaction) {
        let message: TranslationPaths;
        if (isReversedTransaction) {
            message = 'parentReportAction.reversedTransaction';
        } else {
            message = 'parentReportAction.deletedExpense';
        }
        return <RenderHTML html={`<comment>${translate(message)}</comment>`} />;
    }
    return (
        <MoneyRequestPreview
            iouReportID={requestReportID}
            chatReportID={chatReportID}
            reportID={reportID}
            isBillSplit={isSplitBillAction}
            isTrackExpense={isTrackExpenseAction}
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

export default withOnyx<MoneyRequestActionProps, MoneyRequestActionOnyxProps>({
    chatReport: {
        key: ({chatReportID}) => `${ONYXKEYS.COLLECTION.REPORT}${chatReportID}`,
    },
    iouReport: {
        key: ({requestReportID}) => `${ONYXKEYS.COLLECTION.REPORT}${requestReportID}`,
    },
    reportActions: {
        key: ({chatReportID}) => `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${chatReportID}`,
        canEvict: false,
    },
})(MoneyRequestAction);
