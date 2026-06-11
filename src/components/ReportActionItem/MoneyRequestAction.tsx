import {useRoute} from '@react-navigation/native';
import lodashIsEmpty from 'lodash/isEmpty';
import React, {useMemo} from 'react';
import type {StyleProp, ViewStyle} from 'react-native';
import RenderHTML from '@components/RenderHTML';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import {createTransactionThreadReport} from '@libs/actions/Report';
import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import getReportRouteForCurrentContext from '@libs/Navigation/helpers/getReportRouteForCurrentContext';
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
import {contextMenuRef} from '@pages/inbox/report/ContextMenu/ReportActionContextMenu';
import {useReportActionItemActions} from '@pages/inbox/report/ReportActionItemContext';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import {DYNAMIC_ROUTES} from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import type * as OnyxTypes from '@src/types/onyx';
import TransactionPreview from './TransactionPreview';

type MoneyRequestActionProps = {
    /** All the data of the action */
    action: OnyxTypes.ReportAction;

    /** The ID of the associated chatReport */
    chatReportID: string | undefined;

    /** The ID of the associated expense report */
    requestReportID: string | undefined;

    /** The ID of the current report */
    reportID: string | undefined;

    /** Whether the IOU is hovered so we can modify its style */
    isHovered?: boolean;

    /** Whether a message is a whisper */
    isWhisper?: boolean;

    /** Styles to be assigned to Container */
    style?: StyleProp<ViewStyle>;
};

function MoneyRequestAction({action, chatReportID, requestReportID, reportID, isHovered = false, style, isWhisper = false}: MoneyRequestActionProps) {
    const {onPreviewPressed} = useReportActionItemActions();
    const [iouReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${requestReportID}`);
    const [introSelected] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED);
    const [betas] = useOnyx(ONYXKEYS.BETAS);
    const StyleUtils = useStyleUtils();
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const {email: currentUserEmail, accountID: currentUserAccountID} = useCurrentUserPersonalDetails();
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
            Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.SPLIT_BILL_DETAILS.getRoute(action.reportActionID)));
            return;
        }

        // In case the childReportID is not present it probably means the transaction thread was not created yet,
        // so we need to send the parentReportActionID and the transactionID to the route so we can call OpenReport correctly
        const transactionID = isMoneyRequestAction(action) ? getOriginalMessage(action)?.IOUTransactionID : CONST.DEFAULT_NUMBER_ID;

        if (!action?.childReportID && transactionID && action.reportActionID) {
            const transactionThreadReport = createTransactionThreadReport({
                introSelected,
                currentUserLogin: currentUserEmail ?? '',
                currentUserAccountID,
                betas,
                iouReport,
                iouReportAction: action,
            });
            Navigation.navigate(getReportRouteForCurrentContext({reportID: transactionThreadReport?.reportID}));
            return;
        }

        Navigation.navigate(getReportRouteForCurrentContext({reportID: action?.childReportID}));
    };

    const isDeletedParentAction = isDeletedParentActionReportActionsUtils(action);
    const isReversedTransaction = isReversedTransactionReportActionsUtils(action);

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
            iouReportID={requestReportID}
            chatReportID={chatReportID}
            reportID={reportID}
            action={action}
            transactionPreviewWidth={reportPreviewStyles.transactionPreviewStandaloneStyle.width}
            isBillSplit={isSplitBillAction}
            isTrackExpense={isTrackExpenseAction}
            onPreviewPressed={onMoneyRequestPreviewPressed}
            containerStyles={[reportPreviewStyles.transactionPreviewStandaloneStyle, isReviewDuplicateTransactionPage ? [containerStyles, styles.borderNone] : styles.mt2]}
            isHovered={isHovered}
            isWhisper={isWhisper}
        />
    );
}

export default MoneyRequestAction;
