import React, {useContext} from 'react';
import {View} from 'react-native';
import Button from '@components/Button';
import ButtonWithDropdownMenu from '@components/ButtonWithDropdownMenu';
import type {DropdownOption} from '@components/ButtonWithDropdownMenu/types';
import {useDelegateNoAccessActions, useDelegateNoAccessState} from '@components/DelegateNoAccessModalProvider';
import KYCWall from '@components/KYCWall';
import {KYCWallContext} from '@components/KYCWall/KYCWallContext';
import type {PaymentMethodType} from '@components/KYCWall/types';
import {LockedAccountContext} from '@components/LockedAccountModalProvider';
import {useSearchSelectionContext} from '@components/Search/SearchSelectionContext';
import type {BankAccountMenuItem, SearchQueryJSON} from '@components/Search/types';
import {handleBulkPayItemSelected} from '@libs/actions/Search';
import Navigation from '@libs/Navigation/Navigation';
import {isExpenseReport} from '@libs/ReportUtils';
import useLocalize from '@hooks/useLocalize';
import usePolicy from '@hooks/usePolicy';
import useSortedActiveAdminPolicies from '@hooks/useSortedActiveAdminPolicies';
import useThemeStyles from '@hooks/useThemeStyles';
import {isUserValidatedSelector} from '@selectors/Account';
import useOnyx from '@hooks/useOnyx';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {SearchHeaderOptionValue} from './SearchPageHeader';

type SearchSelectionBarProps = {
    queryJSON?: SearchQueryJSON;
    headerButtonsOptions: Array<DropdownOption<SearchHeaderOptionValue>>;
    currentSelectedPolicyID?: string | undefined;
    currentSelectedReportID?: string | undefined;
    confirmPayment?: (paymentMethod?: PaymentMethodType) => void;
    latestBankItems?: BankAccountMenuItem[] | undefined;
};

function SearchSelectionBar({queryJSON, headerButtonsOptions, currentSelectedPolicyID, currentSelectedReportID, confirmPayment, latestBankItems}: SearchSelectionBarProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {selectedTransactions, selectAllMatchingItems, areAllMatchingItemsSelected, showSelectAllMatchingItems} = useSearchSelectionContext();
    const selectedTransactionsKeys = Object.keys(selectedTransactions ?? {});
    const currentPolicy = usePolicy(currentSelectedPolicyID);
    const kycWallRef = useContext(KYCWallContext);
    const {isDelegateAccessRestricted} = useDelegateNoAccessState();
    const {showDelegateNoAccessModal} = useDelegateNoAccessActions();
    const {isAccountLocked, showLockedAccountModal} = useContext(LockedAccountContext);
    const activeAdminPolicies = useSortedActiveAdminPolicies();
    const [isUserValidated] = useOnyx(ONYXKEYS.ACCOUNT, {selector: isUserValidatedSelector});
    const [selectedIOUReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${currentSelectedReportID}`);
    const isCurrentSelectedExpenseReport = isExpenseReport(currentSelectedReportID);

    const isExpenseReportType = queryJSON?.type === CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT;
    const selectedItemsCount = (() => {
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
    })();

    const selectionButtonText = areAllMatchingItemsSelected ? translate('search.exportAll.allMatchingItemsSelected') : translate('workspace.common.selected', {count: selectedItemsCount});

    return (
        <View style={[styles.ph5, styles.mb2, styles.searchFiltersBarContainer]}>
            <KYCWall
                ref={kycWallRef}
                chatReportID={currentSelectedReportID}
                enablePaymentsRoute={ROUTES.ENABLE_PAYMENTS}
                iouReport={selectedIOUReport}
                addBankAccountRoute={
                    isCurrentSelectedExpenseReport
                        ? ROUTES.BANK_ACCOUNT_WITH_STEP_TO_OPEN.getRoute({
                              policyID: currentSelectedPolicyID,
                              backTo: Navigation.getActiveRoute(),
                          })
                        : undefined
                }
                onSuccessfulKYC={(paymentType) => confirmPayment?.(paymentType)}
            >
                {(triggerKYCFlow, buttonRef) => (
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
                        {!areAllMatchingItemsSelected && showSelectAllMatchingItems && (
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
                )}
            </KYCWall>
        </View>
    );
}

export default SearchSelectionBar;
