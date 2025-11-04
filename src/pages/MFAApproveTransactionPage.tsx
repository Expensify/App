import React, {useCallback, useMemo, useState} from 'react';
import {View} from 'react-native';
import FullPageOfflineBlockingView from '@components/BlockingViews/FullPageOfflineBlockingView';
import Button from '@components/Button';
import ConfirmModal from '@components/ConfirmModal';
import FixedFooter from '@components/FixedFooter';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import TransactionPreview from '@components/ReportActionItem/TransactionPreview';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useReportWithTransactionsAndViolations from '@hooks/useReportWithTransactionsAndViolations';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {MultiFactorAuthenticationParamList} from '@libs/Navigation/types';
import Performance from '@libs/Performance';
import {getIOUActionForReportID, isSplitBillAction as isSplitBillActionReportActionsUtils, isTrackExpenseAction as isTrackExpenseActionReportActionsUtils} from '@libs/ReportActionsUtils';
import {isIOUReport} from '@libs/ReportUtils';
import Timing from '@userActions/Timing';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import {contextMenuRef} from './home/report/ContextMenu/ReportActionContextMenu';

type MFAApproveTransactionPageProps = PlatformStackScreenProps<MultiFactorAuthenticationParamList, typeof SCREENS.MULTIFACTORAUTHENTICATION.APPROVE_TRANSACTION>;

function MFAScenarioApproveTransactionPage({route}: MFAApproveTransactionPageProps) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {translate} = useLocalize();
    const {shouldUseNarrowLayout} = useResponsiveLayout();

    const transactionID = route.params.transactionID;
    const [transaction] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`, {canBeMissing: true});
    const iouReportID = transaction?.reportID;
    const [iouReport, transactions] = useReportWithTransactionsAndViolations(iouReportID);
    const chatReportID = iouReport?.chatReportID ?? iouReportID;
    const reportID = chatReportID ?? iouReportID;
    const action = useMemo(() => {
        return getIOUActionForReportID(chatReportID, transactionID) ?? getIOUActionForReportID(iouReportID, transactionID);
    }, [chatReportID, iouReportID, transactionID]);
    const isTrackExpenseAction = isTrackExpenseActionReportActionsUtils(action);
    const isSplitBillAction = isSplitBillActionReportActionsUtils(action);

    const [allReports] = useOnyx(ONYXKEYS.COLLECTION.REPORT, {canBeMissing: false});

    // Context menu is not needed for MFA flow
    const contextMenuAnchor = undefined;
    const shouldDisplayContextMenu = false;

    const [isConfirmModalVisible, setConfirmModalVisibility] = useState(false);

    const onGoBackPress = useCallback(() => {
        Navigation.goBack();
    }, []);

    const showConfirmModal = () => {
        setConfirmModalVisibility(true);
    };

    const hideConfirmModal = () => {
        setConfirmModalVisibility(false);
    };

    // TODO: replace with proper logic from MFAContext - now only for testing
    const approveTransaction = useCallback(() => {
        Navigation.navigate(ROUTES.MULTIFACTORAUTHENTICATION_PROMPT.getRoute('enable-biometrics'));
    }, []);

    const reportPreviewStyles = useMemo(
        () => StyleUtils.getMoneyRequestReportPreviewStyle(shouldUseNarrowLayout, transactions.length),
        [StyleUtils, shouldUseNarrowLayout, transactions.length],
    );

    const shouldShowPayerAndReceiver = useMemo(() => {
        if (!action || (!isIOUReport(iouReport) && action.childType !== CONST.REPORT.TYPE.IOU)) {
            return false;
        }

        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        return transactions.some((tx) => (tx?.modifiedAmount || tx?.amount) < 0);
    }, [transactions, action, iouReport]);

    const openReportFromPreview = useCallback(() => {
        if (!iouReportID || contextMenuRef.current?.isContextMenuOpening) {
            return;
        }

        Performance.markStart(CONST.TIMING.OPEN_REPORT_FROM_PREVIEW);
        Timing.start(CONST.TIMING.OPEN_REPORT_FROM_PREVIEW);
        Navigation.navigate(ROUTES.REPORT_WITH_ID.getRoute(iouReportID, undefined, undefined, Navigation.getActiveRoute()));
    }, [iouReportID]);

    const denyTransaction = () => {
        if (isConfirmModalVisible) {
            hideConfirmModal();
        }
        // MFAdenyTransaction(); // TODO: update context or sth
        onGoBackPress();
    };

    return (
        <ScreenWrapper testID={MFAScenarioApproveTransactionPage.displayName}>
            <HeaderWithBackButton
                title={translate('multiFactorAuthentication.approveTransaction.headerButtonTitle')}
                onBackButtonPress={showConfirmModal}
                shouldShowBackButton
            />
            <FullPageOfflineBlockingView>
                <View style={[styles.flex1, styles.flexColumn, styles.justifyContentBetween]}>
                    <View style={styles.mh5}>
                        <View style={[styles.gap2, styles.mb6]}>
                            <Text style={styles.textHeadlineLineHeightXXL}>{translate('multiFactorAuthentication.approveTransaction.pageTitle')}</Text>
                            <Text style={styles.textSupporting}>{translate('multiFactorAuthentication.approveTransaction.pageContent')}</Text>
                        </View>
                        <View style={styles.mb2}>
                            <Text style={styles.textMicroSupporting}>{translate('multiFactorAuthentication.approveTransaction.transactionDetails')}</Text>
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
                            onPreviewPressed={openReportFromPreview}
                            shouldShowPayerAndReceiver={shouldShowPayerAndReceiver}
                        />
                    </View>
                    <FixedFooter style={[styles.flexRow, styles.gap2]}>
                        <Button
                            danger
                            large
                            style={styles.flex1}
                            onPress={denyTransaction}
                            text={translate('common.deny')}
                        />
                        <Button
                            success
                            large
                            style={styles.flex1}
                            onPress={approveTransaction}
                            text={translate('common.approve')}
                        />
                    </FixedFooter>
                    <ConfirmModal
                        danger
                        title={translate('common.areYouSure')}
                        onConfirm={denyTransaction}
                        onCancel={hideConfirmModal}
                        isVisible={isConfirmModalVisible}
                        prompt={translate('multiFactorAuthentication.approveTransaction.denyTransactionContent')}
                        confirmText={translate('multiFactorAuthentication.approveTransaction.denyTransactionButton')}
                        cancelText={translate('common.cancel')}
                        shouldShowCancelButton
                    />
                </View>
            </FullPageOfflineBlockingView>
        </ScreenWrapper>
    );
}

MFAScenarioApproveTransactionPage.displayName = 'MFAScenarioApproveTransactionPage';

export default MFAScenarioApproveTransactionPage;
