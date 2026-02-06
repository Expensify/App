import React from 'react';
import {View} from 'react-native';
import type {OnyxCollection} from 'react-native-onyx';
import TransactionPreview from '@components/ReportActionItem/TransactionPreview';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useReportWithTransactionsAndViolations from '@hooks/useReportWithTransactionsAndViolations';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import Performance from '@libs/Performance';
import {getIOUActionForReportID, isSplitBillAction as isSplitBillActionReportActionsUtils, isTrackExpenseAction as isTrackExpenseActionReportActionsUtils} from '@libs/ReportActionsUtils';
import {isIOUReport} from '@libs/ReportUtils';
import {contextMenuRef} from '@pages/inbox/report/ContextMenu/ReportActionContextMenu';
import Timing from '@userActions/Timing';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {Report} from '@src/types/onyx';

type MultifactorAuthenticationAuthorizeTransactionContentProps = {
    transactionID: string;
};

function MultifactorAuthenticationAuthorizeTransactionContent({transactionID}: MultifactorAuthenticationAuthorizeTransactionContentProps) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {translate} = useLocalize();
    const {shouldUseNarrowLayout} = useResponsiveLayout();

    // Fetch transaction and related data
    const [transaction] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`, {canBeMissing: true});
    const iouReportID = transaction?.reportID;
    const [iouReport, transactions] = useReportWithTransactionsAndViolations(iouReportID ?? undefined);
    const chatReportID = iouReport?.chatReportID ?? iouReportID;
    const reportID = chatReportID ?? iouReportID;

    // Calculate action
    const action = getIOUActionForReportID(chatReportID, transactionID) ?? getIOUActionForReportID(iouReportID, transactionID);
    const isTrackExpenseAction = isTrackExpenseActionReportActionsUtils(action);
    const isSplitBillAction = isSplitBillActionReportActionsUtils(action);

    // Only subscribe to chatReport if it's different from iouReport (we already have iouReport from useReportWithTransactionsAndViolations)
    // This avoids subscribing to ALL reports which is expensive and triggers re-renders on every report change
    const needsChatReport = !!chatReportID && chatReportID !== iouReportID;

    const chatReportKey = `${ONYXKEYS.COLLECTION.REPORT}${needsChatReport && chatReportID ? chatReportID : undefined}` as const;

    const [chatReportFromOnyx] = useOnyx(chatReportKey, {canBeMissing: true});

    // Use chatReport from Onyx if it's different from iouReport, otherwise use iouReport
    const chatReport = needsChatReport ? chatReportFromOnyx : iouReport;

    // Create minimal allReports object for TransactionPreview - only include the reports we actually need
    // This avoids subscribing to ALL reports which triggers re-renders whenever any report changes
    const allReports: OnyxCollection<Report> = {};
    if (iouReportID && iouReport) {
        const reportKey = `${ONYXKEYS.COLLECTION.REPORT}${iouReportID}` as const;
        allReports[reportKey] = iouReport;
    }
    if (needsChatReport && chatReportID && chatReport) {
        const reportKey = `${ONYXKEYS.COLLECTION.REPORT}${chatReportID}` as const;
        allReports[reportKey] = chatReport;
    }

    const reportPreviewStyles = StyleUtils.getMoneyRequestReportPreviewStyle(shouldUseNarrowLayout, transactions.length);

    const isIllegibleForShowingPayerAndReceiver = !action || (!isIOUReport(iouReport) && action.childType !== CONST.REPORT.TYPE.IOU);

    // || operator is needed to handle both empty string and undefined cases
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    const shouldShowPayerAndReceiver = isIllegibleForShowingPayerAndReceiver ? false : transactions.some((transactionX) => Number(transactionX?.modifiedAmount || transactionX?.amount) < 0);

    const handlePreviewPressed = () => {
        if (!iouReportID || contextMenuRef.current?.isContextMenuOpening) {
            return;
        }

        Performance.markStart(CONST.TIMING.OPEN_REPORT_FROM_PREVIEW);
        Timing.start(CONST.TIMING.OPEN_REPORT_FROM_PREVIEW);
        Navigation.navigate(ROUTES.REPORT_WITH_ID.getRoute(iouReportID, undefined, undefined, Navigation.getActiveRoute()));
    };

    // Context menu is not needed for MultifactorAuthentication flow
    const contextMenuAnchor = undefined;
    const shouldDisplayContextMenu = false;

    return (
        <View style={styles.mh5}>
            <View style={[styles.gap2, styles.mb6]}>
                <Text style={styles.textHeadlineLineHeightXXL}>{translate('multifactorAuthentication.reviewTransaction.pleaseReview')}</Text>
                <Text style={styles.textSupporting}>{translate('multifactorAuthentication.reviewTransaction.requiresYourReview')}</Text>
            </View>
            <View style={styles.mb2}>
                <Text style={styles.textMicroSupporting}>{translate('multifactorAuthentication.reviewTransaction.transactionDetails')}</Text>
            </View>
            <TransactionPreview
                allReports={allReports}
                chatReportID={chatReportID}
                action={action}
                contextAction={action}
                reportID={reportID}
                isBillSplit={isSplitBillAction}
                isTrackExpense={isTrackExpenseAction}
                contextMenuAnchor={contextMenuAnchor}
                iouReportID={iouReportID}
                containerStyles={[reportPreviewStyles.transactionPreviewStandaloneStyle]}
                shouldDisplayContextMenu={shouldDisplayContextMenu}
                transactionPreviewWidth={reportPreviewStyles.transactionPreviewStandaloneStyle.width}
                transactionID={transactionID}
                reportPreviewAction={action}
                onPreviewPressed={handlePreviewPressed}
                shouldShowPayerAndReceiver={shouldShowPayerAndReceiver}
            />
        </View>
    );
}

MultifactorAuthenticationAuthorizeTransactionContent.displayName = 'MultifactorAuthenticationAuthorizeTransactionContent';

export default MultifactorAuthenticationAuthorizeTransactionContent;
