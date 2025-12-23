import {useRoute} from '@react-navigation/native';
import React, {useCallback, useContext, useMemo, useState} from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import type {DropdownOption} from '@components/ButtonWithDropdownMenu/types';
import Checkbox from '@components/Checkbox';
import ConfirmModal from '@components/ConfirmModal';
import DecisionModal from '@components/DecisionModal';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import type {PopoverMenuItem} from '@components/PopoverMenu';
import {PressableWithFeedback} from '@components/Pressable';
import {useSearchContext} from '@components/Search/SearchContext';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useSelectedTransactionsActions from '@hooks/useSelectedTransactionsActions';
import useThemeStyles from '@hooks/useThemeStyles';
import {turnOffMobileSelectionMode} from '@libs/actions/MobileSelectionMode';
import {queueExportSearchWithTemplate} from '@libs/actions/Search';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackRouteProp} from '@libs/Navigation/PlatformStackNavigation/types';
import type {ReportsSplitNavigatorParamList} from '@libs/Navigation/types';
import {KYCFlowEvent, TriggerKYCFlow} from '@libs/PaymentUtils';
import {isTransactionPendingDelete} from '@libs/TransactionUtils';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {Policy, Report, ReportAction, Session, Transaction} from '@src/types/onyx';
import type {PendingAction} from '@src/types/onyx/OnyxCommon';
import {KYCWallContext} from './KYCWall/KYCWallContext';
import {PaymentMethodType} from './KYCWall/types';
import MoneyReportHeaderKYCDropdown from './MoneyReportHeaderKYCDropdown';
import {PaymentActionParams} from './SettlementButton/types';

type MobileSelectionModeHeaderProps = {
    /** All transactions in the report */
    transactions: Transaction[];

    /** Report level actions (Pay, Approve, Submit) - pre-built with proper handlers */
    reportLevelActions: Array<DropdownOption<string> & Pick<PopoverMenuItem, 'backButtonText' | 'rightIcon'>>;

    /** Report to operate on */
    report: OnyxEntry<Report>;

    /** Report actions for the report */
    reportActions: ReportAction[];

    /** Policy for the report */
    policy: OnyxEntry<Policy>;

    /** Session for current user */
    session: OnyxEntry<Session>;

    /** Chat report for navigation after delete */
    chatReport: OnyxEntry<Report>;

    /** The type of pending action on the report */
    reportPendingAction: PendingAction | undefined;

    /** Callback for payment selection */
    onPaymentSelect: (event: KYCFlowEvent, iouPaymentType: PaymentMethodType, triggerKYCFlow: TriggerKYCFlow) => void;
    /** Callback for payment confirmation */
    confirmPayment: (params: PaymentActionParams) => void;
};

function MobileSelectionModeHeader({
    transactions,
    reportLevelActions,
    report,
    reportActions,
    policy,
    session,
    chatReport,
    reportPendingAction,
    onPaymentSelect,
    confirmPayment,
}: MobileSelectionModeHeaderProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {selectedTransactionIDs, setSelectedTransactions, clearSelectedTransactions} = useSearchContext();
    const route = useRoute<PlatformStackRouteProp<ReportsSplitNavigatorParamList, typeof SCREENS.REPORT>>();

    const [offlineModalVisible, setOfflineModalVisible] = useState(false);
    const [isDownloadErrorModalVisible, setIsDownloadErrorModalVisible] = useState(false);
    const [isExportWithTemplateModalVisible, setIsExportWithTemplateModalVisible] = useState(false);

    const transactionsWithoutPendingDelete = useMemo(() => transactions.filter((t) => !isTransactionPendingDelete(t)), [transactions]);

    const isSelectAllChecked = selectedTransactionIDs.length > 0 && selectedTransactionIDs.length === transactionsWithoutPendingDelete.length;
    const kycWallRef = useContext(KYCWallContext);

    const beginExportWithTemplate = useCallback(
        (templateName: string, templateType: string, transactionIDList: string[]) => {
            if (!report) {
                return;
            }

            setIsExportWithTemplateModalVisible(true);
            queueExportSearchWithTemplate({
                templateName,
                templateType,
                jsonQuery: '{}',
                reportIDList: [report.reportID],
                transactionIDList,
                policyID: policy?.id,
            });
        },
        [report, policy?.id],
    );

    const {
        options: selectedTransactionsOptions,
        handleDeleteTransactions,
        isDeleteModalVisible,
        hideDeleteModal,
    } = useSelectedTransactionsActions({
        report,
        reportActions,
        allTransactionsLength: transactions.length,
        session,
        onExportFailed: () => setIsDownloadErrorModalVisible(true),
        onExportOffline: () => setOfflineModalVisible(true),
        policy,
        beginExportWithTemplate,
        reportLevelActions,
    });

    return (
        <>
            <HeaderWithBackButton
                title={translate('common.selectMultiple')}
                onBackButtonPress={() => {
                    clearSelectedTransactions(true);
                    turnOffMobileSelectionMode();
                }}
            />
            <OfflineWithFeedback pendingAction={reportPendingAction}>
                <MoneyReportHeaderKYCDropdown
                    chatReportID={chatReport?.reportID}
                    iouReport={report}
                    onPaymentSelect={onPaymentSelect}
                    onSuccessfulKYC={(paymentType) => confirmPayment({paymentType, skipAnimation: true})}
                    options={selectedTransactionsOptions}
                    customText={translate('workspace.common.selected', {count: selectedTransactionIDs.length})}
                    ref={kycWallRef}
                />
                <View style={[styles.alignItemsCenter, styles.userSelectNone, styles.flexRow, styles.pt6, styles.ph8, styles.pb3]}>
                    <Checkbox
                        accessibilityLabel={translate('workspace.people.selectAll')}
                        isChecked={isSelectAllChecked}
                        isIndeterminate={selectedTransactionIDs.length > 0 && selectedTransactionIDs.length !== transactionsWithoutPendingDelete.length}
                        onPress={() => {
                            if (selectedTransactionIDs.length !== 0) {
                                clearSelectedTransactions(true);
                            } else {
                                setSelectedTransactions(transactionsWithoutPendingDelete.map((t) => t.transactionID));
                            }
                        }}
                    />
                    <PressableWithFeedback
                        style={[styles.userSelectNone, styles.alignItemsCenter]}
                        onPress={() => {
                            if (isSelectAllChecked) {
                                clearSelectedTransactions(true);
                            } else {
                                setSelectedTransactions(transactionsWithoutPendingDelete.map((t) => t.transactionID));
                            }
                        }}
                        accessibilityLabel={translate('workspace.people.selectAll')}
                        role="button"
                        accessibilityState={{checked: isSelectAllChecked}}
                        dataSet={{[CONST.SELECTION_SCRAPER_HIDDEN_ELEMENT]: true}}
                    >
                        <Text style={[styles.textStrong, styles.ph3]}>{translate('workspace.people.selectAll')}</Text>
                    </PressableWithFeedback>
                </View>
            </OfflineWithFeedback>
            <ConfirmModal
                title={translate('iou.deleteExpense', {count: selectedTransactionIDs.length})}
                isVisible={isDeleteModalVisible}
                onConfirm={() => {
                    const shouldNavigateBack = transactions.filter((trans) => trans.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE).length === selectedTransactionIDs.length;
                    handleDeleteTransactions();
                    if (shouldNavigateBack) {
                        const backToRoute = route.params?.backTo ?? (chatReport?.reportID ? ROUTES.REPORT_WITH_ID.getRoute(chatReport.reportID) : undefined);
                        Navigation.goBack(backToRoute);
                    }
                }}
                onCancel={hideDeleteModal}
                prompt={translate('iou.deleteConfirmation', {count: selectedTransactionIDs.length})}
                confirmText={translate('common.delete')}
                cancelText={translate('common.cancel')}
                danger
                shouldEnableNewFocusManagement
            />
            <DecisionModal
                title={translate('common.youAppearToBeOffline')}
                prompt={translate('common.offlinePrompt')}
                isSmallScreenWidth
                onSecondOptionSubmit={() => setOfflineModalVisible(false)}
                secondOptionText={translate('common.buttonConfirm')}
                isVisible={offlineModalVisible}
                onClose={() => setOfflineModalVisible(false)}
            />
            <DecisionModal
                title={translate('common.downloadFailedTitle')}
                prompt={translate('common.downloadFailedDescription')}
                isSmallScreenWidth
                onSecondOptionSubmit={() => setIsDownloadErrorModalVisible(false)}
                secondOptionText={translate('common.buttonConfirm')}
                isVisible={isDownloadErrorModalVisible}
                onClose={() => setIsDownloadErrorModalVisible(false)}
            />
            <ConfirmModal
                onConfirm={() => {
                    setIsExportWithTemplateModalVisible(false);
                    clearSelectedTransactions(undefined, true);
                }}
                onCancel={() => setIsExportWithTemplateModalVisible(false)}
                isVisible={isExportWithTemplateModalVisible}
                title={translate('export.exportInProgress')}
                prompt={translate('export.conciergeWillSend')}
                confirmText={translate('common.buttonConfirm')}
                shouldShowCancelButton={false}
            />
        </>
    );
}

MobileSelectionModeHeader.displayName = 'MobileSelectionModeHeader';

export default MobileSelectionModeHeader;
