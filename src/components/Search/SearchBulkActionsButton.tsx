import {isUserValidatedSelector} from '@selectors/Account';
import React, {useContext, useMemo, useRef} from 'react';
import {View} from 'react-native';
import ButtonWithDropdownMenu from '@components/ButtonWithDropdownMenu';
import DecisionModal from '@components/DecisionModal';
import {useDelegateNoAccessActions, useDelegateNoAccessState} from '@components/DelegateNoAccessModalProvider';
import ExportDownloadStatusModal from '@components/ExportDownloadStatusModal';
import HoldOrRejectEducationalModal from '@components/HoldOrRejectEducationalModal';
import HoldSubmitterEducationalModal from '@components/HoldSubmitterEducationalModal';
import KYCWall from '@components/KYCWall';
import {KYCWallContext} from '@components/KYCWall/KYCWallContext';
import {useLockedAccountActions, useLockedAccountState} from '@components/LockedAccountModalProvider';
import ReportPDFDownloadModal from '@components/ReportPDFDownloadModal';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePolicy from '@hooks/usePolicy';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useSearchBulkActions from '@hooks/useSearchBulkActions';
import useSortedActiveAdminPolicies from '@hooks/useSortedActiveAdminPolicies';
import useThemeStyles from '@hooks/useThemeStyles';
import {handleBulkPayItemSelected} from '@libs/actions/Search';
import Navigation from '@libs/Navigation/Navigation';
import {isExpenseReport} from '@libs/ReportUtils';
import shouldPopoverUseScrollView from '@libs/shouldPopoverUseScrollView';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import BulkDuplicateHandler from './BulkDuplicateHandler';
import BulkDuplicateReportHandler from './BulkDuplicateReportHandler';
import {useSearchSelectionContext} from './SearchContext';
import type {BulkPaySelectionData, SearchQueryJSON} from './types';

type SearchBulkActionsButtonProps = {
    queryJSON: SearchQueryJSON;
};

function SearchBulkActionsButton({queryJSON}: SearchBulkActionsButtonProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    // We need isSmallScreenWidth (not just shouldUseNarrowLayout) because DecisionModal requires it for correct modal type
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {shouldUseNarrowLayout, isSmallScreenWidth} = useResponsiveLayout();
    const {selectedTransactions, selectedReports, areAllMatchingItemsSelected} = useSearchSelectionContext();
    const kycWallRef = useContext(KYCWallContext);
    const {isAccountLocked} = useLockedAccountState();
    const {showLockedAccountModal} = useLockedAccountActions();
    const {isDelegateAccessRestricted} = useDelegateNoAccessState();
    const {showDelegateNoAccessModal} = useDelegateNoAccessActions();
    const [userBillingGracePeriodEnds] = useOnyx(ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_USER_BILLING_GRACE_PERIOD_END);
    const [isUserValidated] = useOnyx(ONYXKEYS.ACCOUNT, {selector: isUserValidatedSelector});
    const activeAdminPolicies = useSortedActiveAdminPolicies();
    const [amountOwed] = useOnyx(ONYXKEYS.NVP_PRIVATE_AMOUNT_OWED);
    const [ownerBillingGracePeriodEnd] = useOnyx(ONYXKEYS.NVP_PRIVATE_OWNER_BILLING_GRACE_PERIOD_END);

    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const {
        headerButtonsOptions,
        selectedPolicyIDs,
        selectedTransactionReportIDs,
        selectedReportIDs,
        businessBankAccountOptions,
        confirmPayment,
        isOfflineModalVisible,
        isDownloadErrorModalVisible,
        isHoldEducationalModalVisible,
        rejectModalAction,
        emptyReportsCount,
        handleOfflineModalClose,
        handleDownloadErrorModalClose,
        isPdfModalVisible,
        setIsPdfModalVisible,
        pdfReportID,
        handlePdfModalHide,
        dismissModalAndUpdateUseHold,
        dismissRejectModalBasedOnAction,
        isDuplicateOptionVisible,
        setDuplicateHandler,
        isDuplicateReportOptionVisible,
        setDuplicateReportHandler,
        allTransactions,
        allReports,
        searchData,
        activeExportID,
        handleExportModalClose,
    } = useSearchBulkActions({queryJSON});
    const currentSelectedPolicyID = selectedPolicyIDs?.at(0);
    const currentSelectedReportID = selectedTransactionReportIDs?.at(0) ?? selectedReportIDs?.at(0);
    const currentPolicy = usePolicy(currentSelectedPolicyID);
    const [selectedIOUReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${currentSelectedReportID}`);
    const isCurrentSelectedExpenseReport = isExpenseReport(currentSelectedReportID);
    const pendingPaymentAdditionalDataRef = useRef<BulkPaySelectionData | undefined>(undefined);

    const selectedTransactionsKeys = Object.keys(selectedTransactions ?? {});
    const isExpenseReportType = queryJSON.type === CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT;

    const popoverUseScrollView = shouldPopoverUseScrollView(headerButtonsOptions);
    const selectedItemsCount = useMemo(() => {
        if (!selectedTransactions) {
            return 0;
        }

        if (isExpenseReportType) {
            const reportIDs = new Set(
                Object.values(selectedTransactions)
                    .map((transaction) => transaction?.reportID)
                    .filter((reportID): reportID is string => !!reportID),
            );
            return reportIDs.size;
        }

        return selectedTransactionsKeys.reduce((count, key) => {
            if (key.startsWith(CONST.SEARCH.GROUP_PREFIX)) {
                const group = searchData?.[key as keyof typeof searchData] as {count?: number} | undefined;
                return count + (group?.count ?? 0);
            }
            return count + 1;
        }, 0);
    }, [selectedTransactions, selectedTransactionsKeys, isExpenseReportType, searchData]);

    const selectionButtonText = areAllMatchingItemsSelected ? translate('search.exportAll.allMatchingItemsSelected') : translate('workspace.common.selected', {count: selectedItemsCount});

    return (
        <>
            {isDuplicateOptionVisible && (
                <BulkDuplicateHandler
                    selectedTransactionsKeys={selectedTransactionsKeys}
                    allTransactions={allTransactions}
                    allReports={allReports}
                    searchData={searchData}
                    onHandlerReady={setDuplicateHandler}
                />
            )}
            {isDuplicateReportOptionVisible && (
                <BulkDuplicateReportHandler
                    selectedReports={selectedReports}
                    allReports={allReports}
                    searchData={searchData}
                    onHandlerReady={setDuplicateReportHandler}
                />
            )}
            <KYCWall
                ref={kycWallRef}
                chatReportID={currentSelectedReportID}
                enablePaymentsRoute={ROUTES.ENABLE_PAYMENTS}
                iouReport={selectedIOUReport}
                addBankAccountRoute={
                    isCurrentSelectedExpenseReport ? ROUTES.BANK_ACCOUNT_WITH_STEP_TO_OPEN.getRoute({policyID: currentSelectedPolicyID, backTo: Navigation.getActiveRoute()}) : undefined
                }
                onSuccessfulKYC={(paymentType) => {
                    confirmPayment?.(paymentType, pendingPaymentAdditionalDataRef.current);
                    pendingPaymentAdditionalDataRef.current = undefined;
                }}
            >
                {(triggerKYCFlow, buttonRef) =>
                    shouldUseNarrowLayout ? (
                        <View style={[styles.pb3]}>
                            <ButtonWithDropdownMenu
                                buttonRef={buttonRef}
                                options={headerButtonsOptions}
                                customText={selectionButtonText}
                                shouldAlwaysShowDropdownMenu
                                isDisabled={headerButtonsOptions.length === 0}
                                onPress={() => null}
                                shouldPopoverUseScrollView={popoverUseScrollView}
                                onSubItemSelected={(subItem) =>
                                    handleBulkPayItemSelected({
                                        item: subItem,
                                        triggerKYCFlow,
                                        isAccountLocked,
                                        showLockedAccountModal,
                                        policy: currentPolicy,
                                        businessBankAccountOptions,
                                        activeAdminPolicies,
                                        isUserValidated,
                                        isDelegateAccessRestricted,
                                        showDelegateNoAccessModal,
                                        confirmPayment,
                                        userBillingGracePeriodEnds,
                                        amountOwed,
                                        ownerBillingGracePeriodEnd,
                                        setPendingPaymentAdditionalData: (data) => {
                                            pendingPaymentAdditionalDataRef.current = data;
                                        },
                                        currentUserAccountID: currentUserPersonalDetails.accountID,
                                    })
                                }
                                success
                                isSplitButton={false}
                                style={[styles.w100, styles.ph5]}
                                anchorAlignment={{
                                    horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.LEFT,
                                    vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.BOTTOM,
                                }}
                                shouldUseModalPaddingStyle
                                sentryLabel={CONST.SENTRY_LABEL.SEARCH.NARROW_BULK_ACTIONS_DROPDOWN}
                            />
                        </View>
                    ) : (
                        <View style={[styles.flexRow, styles.alignItemsCenter, styles.gap3]}>
                            <ButtonWithDropdownMenu
                                onPress={() => null}
                                shouldAlwaysShowDropdownMenu
                                customText={selectionButtonText}
                                options={headerButtonsOptions}
                                shouldPopoverUseScrollView={popoverUseScrollView}
                                onSubItemSelected={(subItem) =>
                                    handleBulkPayItemSelected({
                                        item: subItem,
                                        triggerKYCFlow,
                                        isAccountLocked,
                                        showLockedAccountModal,
                                        policy: currentPolicy,
                                        businessBankAccountOptions,
                                        activeAdminPolicies,
                                        isUserValidated,
                                        isDelegateAccessRestricted,
                                        showDelegateNoAccessModal,
                                        confirmPayment,
                                        userBillingGracePeriodEnds,
                                        amountOwed,
                                        ownerBillingGracePeriodEnd,
                                        setPendingPaymentAdditionalData: (data) => {
                                            pendingPaymentAdditionalDataRef.current = data;
                                        },
                                        currentUserAccountID: currentUserPersonalDetails.accountID,
                                    })
                                }
                                isSplitButton={false}
                                buttonRef={buttonRef}
                                anchorAlignment={{
                                    horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.LEFT,
                                    vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.TOP,
                                }}
                                sentryLabel={CONST.SENTRY_LABEL.SEARCH.BULK_ACTIONS_DROPDOWN}
                            />
                        </View>
                    )
                }
            </KYCWall>
            <DecisionModal
                title={translate('common.youAppearToBeOffline')}
                prompt={translate('common.offlinePrompt')}
                isSmallScreenWidth={isSmallScreenWidth}
                onSecondOptionSubmit={handleOfflineModalClose}
                secondOptionText={translate('common.buttonConfirm')}
                isVisible={isOfflineModalVisible}
                onClose={handleOfflineModalClose}
            />
            <DecisionModal
                title={translate('common.downloadFailedTitle')}
                prompt={emptyReportsCount ? translate('common.downloadFailedEmptyReportDescription', {count: emptyReportsCount}) : translate('common.downloadFailedDescription')}
                isSmallScreenWidth={isSmallScreenWidth}
                onSecondOptionSubmit={handleDownloadErrorModalClose}
                secondOptionText={translate('common.buttonConfirm')}
                isVisible={isDownloadErrorModalVisible}
                onClose={handleDownloadErrorModalClose}
            />
            {!!pdfReportID && (
                <ReportPDFDownloadModal
                    reportID={pdfReportID}
                    isVisible={isPdfModalVisible}
                    onClose={() => setIsPdfModalVisible(false)}
                    onModalHide={handlePdfModalHide}
                />
            )}
            {!!rejectModalAction && (
                <HoldOrRejectEducationalModal
                    onClose={dismissRejectModalBasedOnAction}
                    onConfirm={dismissRejectModalBasedOnAction}
                />
            )}
            {!!isHoldEducationalModalVisible && (
                <HoldSubmitterEducationalModal
                    onClose={dismissModalAndUpdateUseHold}
                    onConfirm={dismissModalAndUpdateUseHold}
                />
            )}
            {!!activeExportID && (
                <ExportDownloadStatusModal
                    exportID={activeExportID}
                    isVisible
                    onClose={handleExportModalClose}
                    failedBody={translate('exportDownload.csvFailedBody')}
                />
            )}
        </>
    );
}

SearchBulkActionsButton.displayName = 'SearchBulkActionsButton';

export default SearchBulkActionsButton;
