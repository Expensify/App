import {isUserValidatedSelector} from '@selectors/Account';
import React, {useContext, useMemo} from 'react';
import {View} from 'react-native';
import Button from '@components/Button';
import ButtonWithDropdownMenu from '@components/ButtonWithDropdownMenu';
import DecisionModal from '@components/DecisionModal';
import {useDelegateNoAccessActions, useDelegateNoAccessState} from '@components/DelegateNoAccessModalProvider';
import HoldOrRejectEducationalModal from '@components/HoldOrRejectEducationalModal';
import HoldSubmitterEducationalModal from '@components/HoldSubmitterEducationalModal';
import KYCWall from '@components/KYCWall';
import {KYCWallContext} from '@components/KYCWall/KYCWallContext';
import {useLockedAccountActions, useLockedAccountState} from '@components/LockedAccountModalProvider';
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
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import {useSearchActionsContext, useSearchStateContext} from './SearchContext';
import type {SearchQueryJSON} from './types';

type SearchBulkActionsButtonProps = {
    queryJSON: SearchQueryJSON;
};

function SearchBulkActionsButton({queryJSON}: SearchBulkActionsButtonProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    // We need isSmallScreenWidth (not just shouldUseNarrowLayout) because DecisionModal requires it for correct modal type
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {shouldUseNarrowLayout, isSmallScreenWidth} = useResponsiveLayout();
    const {selectedTransactions, areAllMatchingItemsSelected, shouldShowSelectAllMatchingItems} = useSearchStateContext();
    const {selectAllMatchingItems} = useSearchActionsContext();
    const kycWallRef = useContext(KYCWallContext);
    const {isAccountLocked} = useLockedAccountState();
    const {showLockedAccountModal} = useLockedAccountActions();
    const {isDelegateAccessRestricted} = useDelegateNoAccessState();
    const {showDelegateNoAccessModal} = useDelegateNoAccessActions();
    const [isUserValidated] = useOnyx(ONYXKEYS.ACCOUNT, {selector: isUserValidatedSelector});
    const activeAdminPolicies = useSortedActiveAdminPolicies();

    const {
        headerButtonsOptions,
        selectedPolicyIDs,
        selectedTransactionReportIDs,
        selectedReportIDs,
        latestBankItems,
        confirmPayment,
        isOfflineModalVisible,
        isDownloadErrorModalVisible,
        isHoldEducationalModalVisible,
        rejectModalAction,
        emptyReportsCount,
        handleOfflineModalClose,
        handleDownloadErrorModalClose,
        dismissModalAndUpdateUseHold,
        dismissRejectModalBasedOnAction,
    } = useSearchBulkActions({queryJSON});

    const currentSelectedPolicyID = selectedPolicyIDs?.at(0);
    const currentSelectedReportID = selectedTransactionReportIDs?.at(0) ?? selectedReportIDs?.at(0);
    const currentPolicy = usePolicy(currentSelectedPolicyID);
    const [selectedIOUReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${currentSelectedReportID}`);
    const isCurrentSelectedExpenseReport = isExpenseReport(currentSelectedReportID);

    const selectedTransactionsKeys = Object.keys(selectedTransactions ?? {});
    const isExpenseReportType = queryJSON.type === CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT;

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

        return selectedTransactionsKeys.length;
    }, [selectedTransactions, selectedTransactionsKeys.length, isExpenseReportType]);

    const selectionButtonText = areAllMatchingItemsSelected ? translate('search.exportAll.allMatchingItemsSelected') : translate('workspace.common.selected', {count: selectedItemsCount});

    return (
        <>
            <KYCWall
                ref={kycWallRef}
                chatReportID={currentSelectedReportID}
                enablePaymentsRoute={ROUTES.ENABLE_PAYMENTS}
                iouReport={selectedIOUReport}
                addBankAccountRoute={
                    isCurrentSelectedExpenseReport ? ROUTES.BANK_ACCOUNT_WITH_STEP_TO_OPEN.getRoute({policyID: currentSelectedPolicyID, backTo: Navigation.getActiveRoute()}) : undefined
                }
                onSuccessfulKYC={(paymentType) => confirmPayment?.(paymentType)}
            >
                {(triggerKYCFlow, buttonRef) =>
                    shouldUseNarrowLayout ? (
                        <View style={[styles.pb3]}>
                            <ButtonWithDropdownMenu
                                buttonRef={buttonRef}
                                options={headerButtonsOptions}
                                customText={translate('workspace.common.selected', {count: selectedItemsCount})}
                                shouldAlwaysShowDropdownMenu
                                isDisabled={headerButtonsOptions.length === 0}
                                onPress={() => null}
                                shouldPopoverUseScrollView={headerButtonsOptions.length >= CONST.DROPDOWN_SCROLL_THRESHOLD}
                                onSubItemSelected={(subItem) =>
                                    handleBulkPayItemSelected({
                                        item: subItem,
                                        triggerKYCFlow,
                                        isAccountLocked,
                                        showLockedAccountModal,
                                        policy: currentPolicy,
                                        latestBankItems,
                                        activeAdminPolicies,
                                        isUserValidated,
                                        isDelegateAccessRestricted,
                                        showDelegateNoAccessModal,
                                        confirmPayment,
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
                        <View style={[styles.flexRow, styles.gap3]}>
                            <ButtonWithDropdownMenu
                                onPress={() => null}
                                shouldAlwaysShowDropdownMenu
                                buttonSize={CONST.DROPDOWN_BUTTON_SIZE.SMALL}
                                customText={selectionButtonText}
                                options={headerButtonsOptions}
                                onSubItemSelected={(subItem) =>
                                    handleBulkPayItemSelected({
                                        item: subItem,
                                        triggerKYCFlow,
                                        isAccountLocked,
                                        showLockedAccountModal,
                                        policy: currentPolicy,
                                        latestBankItems,
                                        activeAdminPolicies,
                                        isUserValidated,
                                        isDelegateAccessRestricted,
                                        showDelegateNoAccessModal,
                                        confirmPayment,
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
                            {!areAllMatchingItemsSelected && shouldShowSelectAllMatchingItems && (
                                <Button
                                    link
                                    small
                                    shouldUseDefaultHover={false}
                                    innerStyles={styles.p0}
                                    onPress={() => selectAllMatchingItems(true)}
                                    text={translate('search.exportAll.selectAllMatchingItems')}
                                    sentryLabel={CONST.SENTRY_LABEL.SEARCH.SELECT_ALL_MATCHING_BUTTON}
                                />
                            )}
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
        </>
    );
}

SearchBulkActionsButton.displayName = 'SearchBulkActionsButton';

export default SearchBulkActionsButton;
