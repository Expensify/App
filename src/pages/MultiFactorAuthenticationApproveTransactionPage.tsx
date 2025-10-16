import React, {useCallback, useMemo} from 'react';
import TransactionPreview from '@components/ReportActionItem/TransactionPreview';
import useReportWithTransactionsAndViolations from '@hooks/useReportWithTransactionsAndViolations';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import Performance from '@libs/Performance';
import {getIOUActionForReportID, isSplitBillAction as isSplitBillActionReportActionsUtils, isTrackExpenseAction as isTrackExpenseActionReportActionsUtils} from '@libs/ReportActionsUtils';
import {isIOUReport} from '@libs/ReportUtils';
import Timing from '@userActions/Timing';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import ScreenWrapper from '@components/ScreenWrapper';
import type {ReportAction} from '@src/types/onyx';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import useOnyx from '@hooks/useOnyx';
import useLocalize from '@hooks/useLocalize';
import ONYXKEYS from '@src/ONYXKEYS';
import { View } from 'react-native';
import Button from '@components/Button';
import Navigation from '@libs/Navigation/Navigation';
import Text from '@components/Text';
import {contextMenuRef} from './home/report/ContextMenu/ReportActionContextMenu';
import type {ContextMenuAnchor} from './home/report/ContextMenu/ReportActionContextMenu';

function ApproveTransactionPage() {
    // FAKE DATA 
    const transactionID = "9084365218195969699"; // TODO: replace with actual transactionID
    const chatReportID = "1995450016258047"; // TODO: replace with actual chatReportID
    const reportID = "3711684730350502"; // TODO: replace with actual reportID -> very often its same as chatReportID
    const iouReportID = "3711684730350502"; // TODO: replace with actual iouReportID
    const action = {} as ReportAction; // TODO: replace with actual action
    const contextMenuAnchor = {} as ContextMenuAnchor; // TODO: replace with actual contextMenuAnchor
    const shouldDisplayContextMenu = false; // TODO: replace with actual shouldDisplayContextMenu
    const isBiometryAvailable = false; // TODO: remove -> BIOMETRY WRAPPER WILL HANDLE IT

    const onGoBackPress = useCallback(() => {
        Navigation.goBack();
    }, []);

    const fakeBiometryCall = useCallback(() => {}); // TODO:remove -> AFTER DISCUSSION IT SEEMS THAT WE WILL USE WRAPPER SOMEWHERE IN THIS PAGE - PROBABLY SOMEWHERE AROUND THE VERIFY BUTTON

    // TODO: replace with the correct logic
    const approveTransaction = useCallback(() => {
        if (!isBiometryAvailable) {
            Navigation.navigate(ROUTES.MULTIFACTORAUTHENTICATION_FALLBACK);
        }
        fakeBiometryCall();
    }, [isBiometryAvailable]);

    const [allReports] = useOnyx(ONYXKEYS.COLLECTION.REPORT, {canBeMissing: false});

    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {translate} = useLocalize();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const [iouReport, transactions] = useReportWithTransactionsAndViolations(iouReportID);
    const isTrackExpenseAction = isTrackExpenseActionReportActionsUtils(action);
    const isSplitBillAction = isSplitBillActionReportActionsUtils(action);

    const reportPreviewStyles = useMemo(
        () => StyleUtils.getMoneyRequestReportPreviewStyle(shouldUseNarrowLayout, transactions.length),
        [StyleUtils, shouldUseNarrowLayout, transactions.length],
    );
    const shouldShowPayerAndReceiver = useMemo(() => {
        if (!isIOUReport(iouReport) && action.childType !== CONST.REPORT.TYPE.IOU) {
            return false;
        }

        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        return transactions.some((transaction) => (transaction?.modifiedAmount || transaction?.amount) < 0);
    }, [transactions, action.childType, iouReport]);

    const openReportFromPreview = useCallback(() => {
        if (!iouReportID || contextMenuRef.current?.isContextMenuOpening) {
            return;
        }

        Performance.markStart(CONST.TIMING.OPEN_REPORT_FROM_PREVIEW);
        Timing.start(CONST.TIMING.OPEN_REPORT_FROM_PREVIEW);
        Navigation.navigate(ROUTES.REPORT_WITH_ID.getRoute(iouReportID, undefined, undefined, Navigation.getActiveRoute()));
    }, [iouReportID]);

    return (
        <ScreenWrapper testID={ApproveTransactionPage.displayName}>
            <HeaderWithBackButton
                title={translate('multiFactorAuthentication.approveTransaction.headerButtonTitle')}
                onBackButtonPress={onGoBackPress}
                shouldShowBackButton
            />
            <View style={[styles.flex1, styles.flexColumn, styles.justifyContentBetween, styles.mh5, styles.mb5]}>
                <View>
                    <View style={[styles.gap2, styles.mb4]}>
                        <Text style={styles.textHeadlineLineHeightXXL}>
                            {translate('multiFactorAuthentication.approveTransaction.pageTitle')}
                        </Text>
                        <Text style={styles.textSupporting}>
                            {translate('multiFactorAuthentication.approveTransaction.pageContent')}
                        </Text>
                    </View>
                    <View style={styles.mb2}>
                        <Text style={styles.textMicroSupporting}>
                            {translate('multiFactorAuthentication.approveTransaction.transactionDetails')}
                        </Text>
                    </View>
                    <TransactionPreview
                        allReports={allReports}
                        chatReportID={chatReportID}
                        action={getIOUActionForReportID(chatReportID, transactionID)}
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
                        onPreviewPressed={openReportFromPreview}
                        shouldShowPayerAndReceiver={shouldShowPayerAndReceiver}
                    />
                </View>
                <View style={[styles.flexRow, styles.gap3, styles.justifyContentBetween]}>
                    <Button
                        danger
                        large
                        style={[styles.mvAuto, styles.mtAuto, styles.mhAuto, {width: '50%'}]}
                        onPress={onGoBackPress}
                        text={translate('common.deny')}
                        // isLoading={isValidateCodeFormSubmitting}
                        // isDisabled={isOffline}
                    />
                    <Button
                        success
                        large
                        style={[styles.mvAuto, styles.mtAuto, styles.mhAuto, {width: '50%'}]}
                        onPress={approveTransaction}
                        text={translate('common.approve')}
                        // isLoading={isValidateCodeFormSubmitting}
                        // isDisabled={isOffline}
                    />
                </View>
            </View>
        </ScreenWrapper>
    );
}

ApproveTransactionPage.displayName = 'ApproveTransactionPage';

export default ApproveTransactionPage;
