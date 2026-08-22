import ActivityIndicator from '@components/ActivityIndicator';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import {useSearchSelectionActions, useSearchSelectionContext} from '@components/Search/SearchContext';
import SelectionList from '@components/SelectionList';
import UserListItem from '@components/SelectionList/ListItem/UserListItem';
import type {ListItem} from '@components/SelectionList/types';
import Text from '@components/Text';

import useChangeTransactionsReportReports from '@hooks/useChangeTransactionsReportReports';
import useCreateEmptyReportConfirmation from '@hooks/useCreateEmptyReportConfirmation';
import useCreateNewReport from '@hooks/useCreateNewReport';
import {useCurrencyListActions} from '@hooks/useCurrencyList';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useDebouncedState from '@hooks/useDebouncedState';
import useDelegateAccountID from '@hooks/useDelegateAccountID';
import useDynamicBackPath from '@hooks/useDynamicBackPath';
import {useIsAppLoadPending} from '@hooks/useInFlightRequests';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import usePersonalPolicy from '@hooks/usePersonalPolicy';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import useTransactionsByID from '@hooks/useTransactionsByID';

import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import isSearchTopmostFullScreenRoute from '@libs/Navigation/helpers/isSearchTopmostFullScreenRoute';
import setNavigationActionToMicrotaskQueue from '@libs/Navigation/helpers/setNavigationActionToMicrotaskQueue';
import Navigation from '@libs/Navigation/Navigation';
import type {NewReportWorkspaceSelectionNavigatorParamList} from '@libs/Navigation/types';
import {getHeaderMessageForNonUserList} from '@libs/OptionsListUtils';
import {canSubmitPerDiemExpenseFromWorkspace, getGroupPoliciesWhereReportCanBeCreated, isPolicyAdmin} from '@libs/PolicyUtils';
import {shouldRestrictUserBillableActions} from '@libs/SubscriptionUtils';
import {buildTransactionsByReportID} from '@libs/TodosUtils';
import {isPerDiemRequest} from '@libs/TransactionUtils';

import isRHPOnSearchMoneyRequestReportPage from '@navigation/helpers/isRHPOnSearchMoneyRequestReportPage';
import type {PlatformStackScreenProps} from '@navigation/PlatformStackNavigation/types';

import {changeTransactionsReport} from '@userActions/Transaction';
import {setNameValuePair} from '@userActions/User';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES, {DYNAMIC_ROUTES} from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

import {isTrackIntentUserSelector} from '@selectors/Onboarding';
import {policyIDsWithEmptyReportsSelector} from '@selectors/Report';
import {accountIDSelector} from '@selectors/Session';
import React, {useEffect, useState} from 'react';
import {View} from 'react-native';

type WorkspaceListItem = {
    text: string;
    policyID: string;
    isPolicyAdmin?: boolean;
} & ListItem;

type NewReportWorkspaceSelectionPageProps = PlatformStackScreenProps<NewReportWorkspaceSelectionNavigatorParamList, typeof SCREENS.NEW_REPORT_WORKSPACE_SELECTION.DYNAMIC_ROOT>;

function DynamicNewReportWorkspaceSelectionPage({route}: NewReportWorkspaceSelectionPageProps) {
    const {isMovingExpenses} = route.params ?? {};
    const backPath = useDynamicBackPath(DYNAMIC_ROUTES.NEW_REPORT_WORKSPACE_SELECTION.path);
    const {isOffline} = useNetwork();
    const {selectedTransactions, selectedTransactionIDs} = useSearchSelectionContext();
    const {clearSelectedTransactions} = useSearchSelectionActions();
    const styles = useThemeStyles();
    const [searchTerm, debouncedSearchTerm, setSearchTerm] = useDebouncedState('');
    const {translate, localeCompare} = useLocalize();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const isRHPOnReportInSearch = isRHPOnSearchMoneyRequestReportPage();
    const {isBetaEnabled} = usePermissions();
    const isASAPSubmitBetaEnabled = isBetaEnabled(CONST.BETAS.ASAP_SUBMIT);
    const [accountID] = useOnyx(ONYXKEYS.SESSION, {selector: accountIDSelector});
    const [activePolicyID] = useOnyx(ONYXKEYS.NVP_ACTIVE_POLICY_ID);
    const [hasDismissedEmptyReportsConfirmation] = useOnyx(ONYXKEYS.NVP_EMPTY_REPORTS_CONFIRMATION_DISMISSED);
    const createNewReport = useCreateNewReport();
    const [ownerBillingGracePeriodEnd] = useOnyx(ONYXKEYS.NVP_PRIVATE_OWNER_BILLING_GRACE_PERIOD_END);
    const [userBillingGracePeriods] = useOnyx(ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_USER_BILLING_GRACE_PERIOD_END);
    const [amountOwed] = useOnyx(ONYXKEYS.NVP_PRIVATE_AMOUNT_OWED);
    const [policies, fetchStatus] = useOnyx(ONYXKEYS.COLLECTION.POLICY);
    const [allTransactions] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION);
    const [transactionViolations] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS);
    const [selfDMReportID] = useOnyx(ONYXKEYS.SELF_DM_REPORT_ID);
    const [selfDMReportActions] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${getNonEmptyStringOnyxID(selfDMReportID)}`);
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const delegateAccountID = useDelegateAccountID();
    const personalPolicy = usePersonalPolicy();
    const {getCurrencyDecimals} = useCurrencyListActions();

    const selectedTransactionsKeys = Object.keys(selectedTransactions);
    const transactionIDs = selectedTransactionsKeys.length ? selectedTransactionsKeys : selectedTransactionIDs;
    const [transactions] = useTransactionsByID(transactionIDs);
    const reports = useChangeTransactionsReportReports(transactions, undefined);

    const isAppLoadPending = useIsAppLoadPending();
    const shouldShowLoadingIndicator = isAppLoadPending && !isOffline;
    const [pendingPolicySelection, setPendingPolicySelection] = useState<{policy: WorkspaceListItem; shouldShowEmptyReportConfirmation: boolean} | null>(null);

    const [allPolicyTags] = useOnyx(ONYXKEYS.COLLECTION.POLICY_TAGS);

    const transactionsByReportID = buildTransactionsByReportID(allTransactions);

    const policiesWithEmptyReportsForAccountSelector = policyIDsWithEmptyReportsSelector(accountID, transactionsByReportID, !!hasDismissedEmptyReportsConfirmation);
    const [policiesWithEmptyReports] = useOnyx(ONYXKEYS.COLLECTION.REPORT, {selector: policiesWithEmptyReportsForAccountSelector});
    const [isTrackIntentUser] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED, {selector: isTrackIntentUserSelector});

    const navigateToNewReport = (optimisticReportID: string) => {
        if (isRHPOnReportInSearch) {
            Navigation.setNavigationActionToMicrotaskQueue(() => {
                Navigation.dismissModal();
            });
        }

        Navigation.setNavigationActionToMicrotaskQueue(() => {
            Navigation.navigate(
                isSearchTopmostFullScreenRoute() ? ROUTES.SEARCH_MONEY_REQUEST_REPORT.getRoute({reportID: optimisticReportID}) : ROUTES.REPORT_WITH_ID.getRoute(optimisticReportID),
                {forceReplace: isRHPOnReportInSearch || shouldUseNarrowLayout},
            );
        });
    };

    const createReport = (policyID: string, shouldDismissEmptyReportsConfirmation?: boolean) => {
        const optimisticReport = createNewReport(policyID, shouldDismissEmptyReportsConfirmation);

        if (isMovingExpenses && (!!selectedTransactionsKeys.length || !!selectedTransactionIDs.length)) {
            const policyTagList = policyID ? allPolicyTags?.[`${ONYXKEYS.COLLECTION.POLICY_TAGS}${policyID}`] : {};
            const reportsForCall = {
                ...reports,
                [`${ONYXKEYS.COLLECTION.REPORT}${optimisticReport.reportID}`]: {...optimisticReport, transactionCount: 0, unheldNonReimbursableTotal: 0},
            };
            setNavigationActionToMicrotaskQueue(() => {
                changeTransactionsReport({
                    transactionIDs,
                    isASAPSubmitBetaEnabled,
                    accountID: currentUserPersonalDetails?.accountID ?? CONST.DEFAULT_NUMBER_ID,
                    email: currentUserPersonalDetails?.email ?? '',
                    newReport: optimisticReport,
                    policy: policies?.[`${ONYXKEYS.COLLECTION.POLICY}${policyID}`],
                    policyCategories: undefined,
                    policyTagList,
                    transactions,
                    allTransactionViolation: transactionViolations,
                    reports: reportsForCall,
                    isTrackIntentUser,
                    personalPolicyOutputCurrency: personalPolicy?.outputCurrency,
                    selfDMReportActions,
                    delegateAccountID,
                    getCurrencyDecimals,
                });

                // eslint-disable-next-line rulesdir/no-default-id-values
                setNameValuePair(ONYXKEYS.NVP_ACTIVE_POLICY_ID, policyID, activePolicyID ?? '');

                if (selectedTransactionIDs.length) {
                    clearSelectedTransactions(true);
                }
                if (selectedTransactionsKeys.length) {
                    clearSelectedTransactions();
                }
            });

            Navigation.dismissModal();
            Navigation.goBack(backPath);
            return;
        }
        navigateToNewReport(optimisticReport.reportID);
    };

    const {openCreateReportConfirmation} = useCreateEmptyReportConfirmation({
        policyID: pendingPolicySelection?.policy.policyID,
        policyName: pendingPolicySelection?.policy.text ?? '',
        onConfirm: (shouldDismissEmptyReportsConfirmation: boolean) => {
            if (!pendingPolicySelection?.policy.policyID) {
                return;
            }

            createReport(pendingPolicySelection.policy.policyID, shouldDismissEmptyReportsConfirmation);
            setPendingPolicySelection(null);
        },
        onCancel: () => {
            setPendingPolicySelection(null);
        },
    });

    // Open the confirmation modal after pendingPolicySelection is committed so the hook has the correct policyName
    useEffect(() => {
        if (!pendingPolicySelection) {
            return;
        }

        openCreateReportConfirmation();
    }, [pendingPolicySelection, openCreateReportConfirmation]);

    const selectPolicy = (policy?: WorkspaceListItem) => {
        if (!policy?.policyID) {
            return;
        }

        const policyForRestriction = policies?.[`${ONYXKEYS.COLLECTION.POLICY}${policy.policyID}`];
        if (
            policyForRestriction &&
            shouldRestrictUserBillableActions(policyForRestriction, ownerBillingGracePeriodEnd, userBillingGracePeriods, amountOwed, currentUserPersonalDetails.accountID)
        ) {
            Navigation.navigate(ROUTES.RESTRICTED_ACTION.getRoute(policy.policyID));
            return;
        }

        const shouldShowEmptyReportConfirmation = !!policiesWithEmptyReports?.[policy.policyID];
        if (!shouldShowEmptyReportConfirmation) {
            createReport(policy.policyID, false);
            return;
        }

        setPendingPolicySelection({
            policy,
            shouldShowEmptyReportConfirmation: true,
        });
    };

    const hasPerDiemTransactions = transactions.length > 0 && transactions.some(isPerDiemRequest);

    let usersWorkspaces: WorkspaceListItem[] = [];
    if (policies && !isEmptyObject(policies)) {
        const result = [];
        let index = 0;
        const eligiblePolicies = getGroupPoliciesWhereReportCanBeCreated(policies, currentUserPersonalDetails?.login);
        for (const policy of eligiblePolicies) {
            if (hasPerDiemTransactions && !canSubmitPerDiemExpenseFromWorkspace(policy)) {
                continue;
            }

            result.push({
                text: policy.name,
                policyID: policy.id,
                keyForList: `${policy.id}-${index}`,
                isPolicyAdmin: isPolicyAdmin(policy),
                shouldSyncFocus: true,
            });
            index++;
        }
        usersWorkspaces = result.sort((a, b) => localeCompare(a.text, b.text));
    }

    const filteredAndSortedUserWorkspaces: WorkspaceListItem[] = usersWorkspaces.filter((policy) => policy.text?.toLowerCase().includes(debouncedSearchTerm?.toLowerCase() ?? ''));

    const areResultsFound = filteredAndSortedUserWorkspaces.length > 0;

    const textInputOptions = {
        label: usersWorkspaces.length >= CONST.STANDARD_LIST_ITEM_LIMIT ? translate('common.search') : undefined,
        value: searchTerm,
        onChangeText: setSearchTerm,
        headerMessage: getHeaderMessageForNonUserList(areResultsFound, debouncedSearchTerm),
    };

    return (
        <ScreenWrapper
            testID="DynamicNewReportWorkspaceSelectionPage"
            includeSafeAreaPaddingBottom
            shouldEnableMaxHeight
        >
            {({didScreenTransitionEnd}) => (
                <>
                    <HeaderWithBackButton
                        title={translate('report.newReport.createReport')}
                        onBackButtonPress={() => Navigation.goBack(backPath)}
                    />
                    {shouldShowLoadingIndicator ? (
                        <View style={[styles.flex1, styles.fullScreenLoading]}>
                            <ActivityIndicator size="large" />
                        </View>
                    ) : (
                        <>
                            <Text style={[styles.ph5, styles.mb3]}>{translate('report.newReport.chooseWorkspace')}</Text>
                            <SelectionList<WorkspaceListItem>
                                data={filteredAndSortedUserWorkspaces}
                                ListItem={UserListItem}
                                onSelectRow={selectPolicy}
                                textInputOptions={textInputOptions}
                                shouldShowLoadingPlaceholder={fetchStatus.status === 'loading' || !didScreenTransitionEnd}
                            />
                        </>
                    )}
                </>
            )}
        </ScreenWrapper>
    );
}

export default DynamicNewReportWorkspaceSelectionPage;
