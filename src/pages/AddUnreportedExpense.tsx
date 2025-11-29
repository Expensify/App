import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {InteractionManager} from 'react-native';
import type {OnyxCollection} from 'react-native-onyx';
import Button from '@components/Button';
import EmptyStateComponent from '@components/EmptyStateComponent';
import FormHelpMessage from '@components/FormHelpMessage';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import LottieAnimations from '@components/LottieAnimations';
import {useSession} from '@components/OnyxListItemProvider';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionListWithSections';
import type {ListItem, SectionListDataType, SelectionListHandle} from '@components/SelectionListWithSections/types';
import UnreportedExpensesSkeleton from '@components/Skeletons/UnreportedExpensesSkeleton';
import useDebouncedState from '@hooks/useDebouncedState';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import usePolicy from '@hooks/usePolicy';
import useThemeStyles from '@hooks/useThemeStyles';
import {fetchUnreportedExpenses} from '@libs/actions/UnreportedExpenses';
import {convertToDisplayString} from '@libs/CurrencyUtils';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import interceptAnonymousUser from '@libs/interceptAnonymousUser';
import type {AddUnreportedExpensesParamList} from '@libs/Navigation/types';
import {canSubmitPerDiemExpenseFromWorkspace, getPerDiemCustomUnit} from '@libs/PolicyUtils';
import {getTransactionDetails, isIOUReport} from '@libs/ReportUtils';
import {shouldRestrictUserBillableActions} from '@libs/SubscriptionUtils';
import tokenizedSearch from '@libs/tokenizedSearch';
import {createUnreportedExpenseSections, getAmount, getCurrency, getDescription, getMerchant, isPerDiemRequest} from '@libs/TransactionUtils';
import Navigation from '@navigation/Navigation';
import type {PlatformStackScreenProps} from '@navigation/PlatformStackNavigation/types';
import {convertBulkTrackedExpensesToIOU, startMoneyRequest} from '@userActions/IOU';
import {changeTransactionsReport} from '@userActions/Transaction';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type Transaction from '@src/types/onyx/Transaction';
import getEmptyArray from '@src/types/utils/getEmptyArray';
import NewChatSelectorPage from './NewChatSelectorPage';
import UnreportedExpenseListItem from './UnreportedExpenseListItem';

type AddUnreportedExpensePageType = PlatformStackScreenProps<AddUnreportedExpensesParamList, typeof SCREENS.ADD_UNREPORTED_EXPENSES_ROOT>;

function AddUnreportedExpense({route}: AddUnreportedExpensePageType) {
    const {translate} = useLocalize();
    const [errorMessage, setErrorMessage] = useState<string>('');
    const [offset, setOffset] = useState(0);
    const {isOffline} = useNetwork();
    const [selectedIds, setSelectedIds] = useState(new Set<string>());
    const [searchValue, debouncedSearchValue, setSearchValue] = useDebouncedState('');
    const {reportID, backToReport} = route.params;
    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, {canBeMissing: true});
    const [reportToConfirm] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${report?.reportID ?? CONST.REPORT.UNREPORTED_REPORT_ID}`, {canBeMissing: true});
    const [reportNextStep] = useOnyx(`${ONYXKEYS.COLLECTION.NEXT_STEP}${reportID}`, {canBeMissing: true});
    const policy = usePolicy(report?.policyID);
    const [policyCategories] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${getNonEmptyStringOnyxID(report?.policyID)}`, {canBeMissing: true});
    const [hasMoreUnreportedTransactionsResults] = useOnyx(ONYXKEYS.HAS_MORE_UNREPORTED_TRANSACTIONS_RESULTS, {canBeMissing: true});
    const [isLoadingUnreportedTransactions] = useOnyx(ONYXKEYS.IS_LOADING_UNREPORTED_TRANSACTIONS, {canBeMissing: true});
    const {isBetaEnabled} = usePermissions();
    const isASAPSubmitBetaEnabled = isBetaEnabled(CONST.BETAS.ASAP_SUBMIT);
    const session = useSession();
    const [transactionViolations] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS, {canBeMissing: true});
    const shouldShowUnreportedTransactionsSkeletons = isLoadingUnreportedTransactions && hasMoreUnreportedTransactionsResults && !isOffline;

    const getUnreportedTransactions = useCallback(
        (transactions: OnyxCollection<Transaction>) => {
            if (!transactions) {
                return [];
            }
            return Object.values(transactions || {}).filter((item) => {
                const isUnreported = item?.reportID === CONST.REPORT.UNREPORTED_REPORT_ID || item?.reportID === '';
                if (!isUnreported) {
                    return false;
                }

                // Negative values are not allowed for unreported expenses
                if ((getTransactionDetails(item)?.amount ?? 0) < 0) {
                    return false;
                }

                if (isPerDiemRequest(item)) {
                    // Only show per diem expenses if the target workspace has per diem enabled and the per diem expense was created in the same workspace
                    const workspacePerDiemUnit = getPerDiemCustomUnit(policy);
                    const perDiemCustomUnitID = item?.comment?.customUnit?.customUnitID;

                    return canSubmitPerDiemExpenseFromWorkspace(policy) && (!perDiemCustomUnitID || perDiemCustomUnitID === workspacePerDiemUnit?.customUnitID);
                }

                return true;
            });
        },
        [policy],
    );

    const [transactions = getEmptyArray<Transaction>()] = useOnyx(
        ONYXKEYS.COLLECTION.TRANSACTION,
        {
            selector: getUnreportedTransactions,
            canBeMissing: true,
        },
        [getUnreportedTransactions],
    );

    const fetchMoreUnreportedTransactions = () => {
        if (!hasMoreUnreportedTransactionsResults || isLoadingUnreportedTransactions) {
            return;
        }
        fetchUnreportedExpenses(offset + CONST.UNREPORTED_EXPENSES_PAGE_SIZE);
        setOffset((prevOffset) => prevOffset + CONST.UNREPORTED_EXPENSES_PAGE_SIZE);
    };

    useEffect(() => {
        fetchUnreportedExpenses(0);
    }, []);

    const styles = useThemeStyles();
    const selectionListRef = useRef<SelectionListHandle>(null);

    const shouldShowTextInput = useMemo(() => {
        return transactions.length >= CONST.SEARCH_ITEM_LIMIT;
    }, [transactions.length]);

    const filteredTransactions = useMemo(() => {
        if (!debouncedSearchValue.trim() || !shouldShowTextInput) {
            return transactions;
        }

        return tokenizedSearch(transactions, debouncedSearchValue, (transaction) => {
            const searchableFields: string[] = [];

            const merchant = getMerchant(transaction);
            if (merchant !== CONST.TRANSACTION.PARTIAL_TRANSACTION_MERCHANT) {
                searchableFields.push(merchant);
            }

            const description = getDescription(transaction);
            if (description.trim()) {
                searchableFields.push(description);
            }

            const amount = getAmount(transaction);
            const currency = getCurrency(transaction);
            const formattedAmount = convertToDisplayString(amount, currency);
            searchableFields.push(formattedAmount);

            // This allows users to search "2000" and find "$2,000.00" for example
            const normalizedAmount = (amount / 100).toString();
            searchableFields.push(normalizedAmount);

            return searchableFields;
        });
    }, [debouncedSearchValue, shouldShowTextInput, transactions]);

    const sections: Array<SectionListDataType<Transaction & ListItem>> = useMemo(() => createUnreportedExpenseSections(filteredTransactions), [filteredTransactions]);

    const handleConfirm = useCallback(() => {
        if (selectedIds.size === 0) {
            setErrorMessage(translate('iou.selectUnreportedExpense'));
            return;
        }
        Navigation.dismissModal();
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        InteractionManager.runAfterInteractions(() => {
            if (report && isIOUReport(report)) {
                convertBulkTrackedExpensesToIOU(
                    [...selectedIds],
                    report.reportID,
                    isASAPSubmitBetaEnabled,
                    session?.accountID ?? CONST.DEFAULT_NUMBER_ID,
                    session?.email ?? '',
                    transactionViolations,
                );
            } else {
                changeTransactionsReport(
                    [...selectedIds],
                    isASAPSubmitBetaEnabled,
                    session?.accountID ?? CONST.DEFAULT_NUMBER_ID,
                    session?.email ?? '',
                    reportToConfirm,
                    policy,
                    reportNextStep,
                    policyCategories,
                );
            }
        });
        setErrorMessage('');
    }, [selectedIds, translate, report, isASAPSubmitBetaEnabled, session?.accountID, session?.email, transactionViolations, reportToConfirm, policy, reportNextStep, policyCategories]);

    const footerContent = useMemo(() => {
        return (
            <>
                {!!errorMessage && (
                    <FormHelpMessage
                        style={[styles.ph1, styles.mb2]}
                        isError
                        message={errorMessage}
                    />
                )}
                <Button
                    success
                    large
                    style={[styles.w100, styles.justifyContentCenter]}
                    text={translate('iou.addUnreportedExpenseConfirm')}
                    onPress={handleConfirm}
                    pressOnEnter
                    enterKeyEventListenerPriority={1}
                />
            </>
        );
    }, [errorMessage, styles, translate, handleConfirm]);

    const headerMessage = useMemo(() => {
        if (debouncedSearchValue.trim() && sections.at(0)?.data.length === 0) {
            return translate('common.noResultsFound');
        }
        return '';
    }, [debouncedSearchValue, sections, translate]);

    const hasSearchTerm = debouncedSearchValue.trim().length > 0;
    const isShowingEmptyState = !hasSearchTerm && transactions.length === 0;

    if (isShowingEmptyState && isLoadingUnreportedTransactions) {
        return (
            <ScreenWrapper
                shouldEnableKeyboardAvoidingView={false}
                includeSafeAreaPaddingBottom
                shouldShowOfflineIndicator={false}
                shouldEnablePickerAvoiding={false}
                testID={NewChatSelectorPage.displayName}
                focusTrapSettings={{active: false}}
            >
                <HeaderWithBackButton
                    title={translate('iou.addUnreportedExpense')}
                    onBackButtonPress={Navigation.goBack}
                />
                <UnreportedExpensesSkeleton />
            </ScreenWrapper>
        );
    }

    if (isShowingEmptyState) {
        return (
            <ScreenWrapper
                shouldEnableKeyboardAvoidingView={false}
                includeSafeAreaPaddingBottom
                shouldEnablePickerAvoiding={false}
                testID={NewChatSelectorPage.displayName}
                focusTrapSettings={{active: false}}
            >
                <HeaderWithBackButton
                    title={translate('iou.addUnreportedExpense')}
                    onBackButtonPress={Navigation.goBack}
                />
                <EmptyStateComponent
                    cardStyles={[styles.appBG]}
                    cardContentStyles={[styles.pt5, styles.pb0]}
                    headerMediaType={CONST.EMPTY_STATE_MEDIA.ANIMATION}
                    headerMedia={LottieAnimations.GenericEmptyState}
                    title={translate('iou.emptyStateUnreportedExpenseTitle')}
                    subtitle={translate('iou.emptyStateUnreportedExpenseSubtitle')}
                    headerStyles={[styles.emptyStateMoneyRequestReport]}
                    lottieWebViewStyles={styles.emptyStateFolderWebStyles}
                    headerContentStyles={styles.emptyStateFolderWebStyles}
                    buttons={[
                        {
                            buttonText: translate('iou.createExpense'),
                            buttonAction: () => {
                                if (report && report.policyID && shouldRestrictUserBillableActions(report.policyID)) {
                                    Navigation.navigate(ROUTES.RESTRICTED_ACTION.getRoute(report.policyID));
                                    return;
                                }
                                interceptAnonymousUser(() => {
                                    startMoneyRequest(CONST.IOU.TYPE.SUBMIT, reportID, undefined, false, backToReport);
                                });
                            },
                            success: true,
                        },
                    ]}
                />
            </ScreenWrapper>
        );
    }

    return (
        <ScreenWrapper
            shouldEnableKeyboardAvoidingView
            includeSafeAreaPaddingBottom
            shouldEnablePickerAvoiding={false}
            shouldEnableMaxHeight
            enableEdgeToEdgeBottomSafeAreaPadding
            testID={NewChatSelectorPage.displayName}
            focusTrapSettings={{active: false}}
        >
            <HeaderWithBackButton
                title={translate('iou.addUnreportedExpense')}
                onBackButtonPress={Navigation.goBack}
            />
            <SelectionList<Transaction & ListItem>
                ref={selectionListRef}
                onSelectRow={(item) => {
                    setSelectedIds((prevIds) => {
                        const newIds = new Set(prevIds);
                        if (newIds.has(item.transactionID)) {
                            newIds.delete(item.transactionID);
                        } else {
                            newIds.add(item.transactionID);
                            if (errorMessage) {
                                setErrorMessage('');
                            }
                        }

                        return newIds;
                    });
                }}
                isSelected={(item) => selectedIds.has(item.transactionID)}
                shouldShowTextInput={shouldShowTextInput}
                textInputValue={searchValue}
                textInputLabel={shouldShowTextInput ? translate('iou.findExpense') : undefined}
                onChangeText={setSearchValue}
                headerMessage={headerMessage}
                canSelectMultiple
                sections={sections}
                ListItem={UnreportedExpenseListItem}
                onEndReached={fetchMoreUnreportedTransactions}
                onEndReachedThreshold={0.75}
                addBottomSafeAreaPadding
                listFooterContent={shouldShowUnreportedTransactionsSkeletons ? <UnreportedExpensesSkeleton fixedNumberOfItems={3} /> : undefined}
                footerContent={footerContent}
            />
        </ScreenWrapper>
    );
}

AddUnreportedExpense.displayName = 'AddUnreportedExpense';

export default AddUnreportedExpense;
