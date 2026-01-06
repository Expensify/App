import {useRoute} from '@react-navigation/native';
import lodashIsEmpty from 'lodash/isEmpty';
import React, {useContext, useMemo} from 'react';
import type {StyleProp, ViewStyle} from 'react-native';
import type {OnyxCollection} from 'react-native-onyx';
import RenderHTML from '@components/RenderHTML';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import {createTransactionThreadReport} from '@libs/actions/Report';
import {isIOUReportPendingCurrencyConversion} from '@libs/IOUUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackRouteProp} from '@libs/Navigation/PlatformStackNavigation/types';
import type {TransactionDuplicateNavigatorParamList} from '@libs/Navigation/types';
import {
    getOriginalMessage,
    isDeletedParentAction as isDeletedParentActionReportActionsUtils,
    isMoneyRequestAction,
    isReversedTransaction as isReversedTransactionReportActionsUtils,
    isSplitBillAction as isSplitBillActionReportActionsUtils,
    isTrackExpenseAction as isTrackExpenseActionReportActionsUtils,
} from '@libs/ReportActionsUtils';
import type {ContextMenuAnchor} from '@pages/home/report/ContextMenu/ReportActionContextMenu';
import {contextMenuRef} from '@pages/home/report/ContextMenu/ReportActionContextMenu';
import ReportActionItemContext from '@pages/home/report/ReportActionItemContext';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import type * as OnyxTypes from '@src/types/onyx';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import TransactionPreview from './TransactionPreview';

type MoneyRequestActionProps = {
    /** All the data of the report collection */
    allReports: OnyxCollection<OnyxTypes.Report>;

    /** All the data of the action */
    action: OnyxTypes.ReportAction;

    /** The ID of the associated chatReport */
    chatReportID: string | undefined;

    /** The ID of the associated expense report */
    requestReportID: string | undefined;

    /** The ID of the current report */
    reportID: string | undefined;

    /** Is this IOU ACTION the most recent? */
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
    allReports,
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
    const {shouldOpenReportInRHP, onPreviewPressed} = useContext(ReportActionItemContext);
    const chatReport = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${chatReportID}`];
    const iouReport = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${requestReportID}`];
    const [reportActions] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${chatReportID}`, {canEvict: false, canBeMissing: true});
    const StyleUtils = useStyleUtils();
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {isOffline} = useNetwork();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const route = useRoute<PlatformStackRouteProp<TransactionDuplicateNavigatorParamList, typeof SCREENS.TRANSACTION_DUPLICATE.REVIEW>>();
    const isReviewDuplicateTransactionPage = route.name === SCREENS.TRANSACTION_DUPLICATE.REVIEW;
    const isSplitBillAction = isSplitBillActionReportActionsUtils(action);
    const isTrackExpenseAction = isTrackExpenseActionReportActionsUtils(action);
    const containerStyles = useMemo(
        () => [styles.cursorPointer, isHovered ? styles.reportPreviewBoxHoverBorder : undefined, style],
        [isHovered, style, styles.cursorPointer, styles.reportPreviewBoxHoverBorder],
    );

    const reportPreviewStyles = StyleUtils.getMoneyRequestReportPreviewStyle(shouldUseNarrowLayout, 1, undefined, undefined);

    const onMoneyRequestPreviewPressed = () => {
        if (onPreviewPressed && action?.childReportID) {
            onPreviewPressed(action?.childReportID);
            return;
        }
        if (contextMenuRef.current?.isContextMenuOpening) {
            return;
        }
        if (isSplitBillAction) {
            Navigation.navigate(ROUTES.SPLIT_BILL_DETAILS.getRoute(chatReportID, action.reportActionID, Navigation.getReportRHPActiveRoute()));
            return;
        }

        // In case the childReportID is not present it probably means the transaction thread was not created yet,
        // so we need to send the parentReportActionID and the transactionID to the route so we can call OpenReport correctly
        const transactionID = isMoneyRequestAction(action) ? getOriginalMessage(action)?.IOUTransactionID : CONST.DEFAULT_NUMBER_ID;

        if (!action?.childReportID && transactionID && action.reportActionID) {
            const transactionThreadReport = createTransactionThreadReport(iouReport, action);
            if (shouldOpenReportInRHP) {
                Navigation.navigate(ROUTES.SEARCH_REPORT.getRoute({reportID: transactionThreadReport?.reportID, backTo: Navigation.getActiveRoute()}));
                return;
            }
            Navigation.navigate(ROUTES.REPORT_WITH_ID.getRoute(transactionThreadReport?.reportID, undefined, undefined, Navigation.getActiveRoute()));
            return;
        }

        if (shouldOpenReportInRHP) {
            Navigation.navigate(ROUTES.SEARCH_REPORT.getRoute({reportID: action?.childReportID, backTo: Navigation.getActiveRoute()}));
            return;
        }

        Navigation.navigate(ROUTES.REPORT_WITH_ID.getRoute(action?.childReportID, undefined, undefined, Navigation.getActiveRoute()));
    };

    let shouldShowPendingConversionMessage = false;
    const isDeletedParentAction = isDeletedParentActionReportActionsUtils(action);
    const isReversedTransaction = isReversedTransactionReportActionsUtils(action);
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

    if (isDeletedParentAction || isReversedTransaction) {
        let message: TranslationPaths;
        if (isReversedTransaction) {
            message = 'parentReportAction.reversedTransaction';
        } else {
            message = 'parentReportAction.deletedExpense';
        }
        return <RenderHTML html={`<deleted-action ${CONST.REVERSED_TRANSACTION_ATTRIBUTE}="${isReversedTransaction}">${translate(message)}</deleted-action>`} />;
    }

    if (lodashIsEmpty(iouReport) && !(isSplitBillAction || isTrackExpenseAction)) {
        return null;
    }

    return (
        <TransactionPreview
            allReports={allReports}
            iouReportID={requestReportID}
            chatReportID={chatReportID}
            reportID={reportID}
            action={action}
            transactionPreviewWidth={reportPreviewStyles.transactionPreviewStandaloneStyle.width}
            isBillSplit={isSplitBillAction}
            isTrackExpense={isTrackExpenseAction}
            contextMenuAnchor={contextMenuAnchor}
            checkIfContextMenuActive={checkIfContextMenuActive}
            shouldShowPendingConversionMessage={shouldShowPendingConversionMessage}
            onPreviewPressed={onMoneyRequestPreviewPressed}
            containerStyles={[reportPreviewStyles.transactionPreviewStandaloneStyle, isReviewDuplicateTransactionPage ? [containerStyles, styles.borderNone] : styles.mt2]}
            isHovered={isHovered}
            isWhisper={isWhisper}
            shouldDisplayContextMenu={shouldDisplayContextMenu}
        />
    );
}

export default MoneyRequestAction;
