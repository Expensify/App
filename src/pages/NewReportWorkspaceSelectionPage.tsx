import {accountIDSelector, emailSelector} from '@selectors/Session';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import type {OnyxCollection} from 'react-native-onyx';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import {useSearchContext} from '@components/Search/SearchContext';
import SelectionList from '@components/SelectionList';
import UserListItem from '@components/SelectionList/ListItem/UserListItem';
import type {ListItem} from '@components/SelectionList/types';
import Text from '@components/Text';
import useCreateEmptyReportConfirmation from '@hooks/useCreateEmptyReportConfirmation';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useDebouncedState from '@hooks/useDebouncedState';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import {createNewReport} from '@libs/actions/Report';
import isSearchTopmostFullScreenRoute from '@libs/Navigation/helpers/isSearchTopmostFullScreenRoute';
import setNavigationActionToMicrotaskQueue from '@libs/Navigation/helpers/setNavigationActionToMicrotaskQueue';
import Navigation from '@libs/Navigation/Navigation';
import type {NewReportWorkspaceSelectionNavigatorParamList} from '@libs/Navigation/types';
import {getHeaderMessageForNonUserList} from '@libs/OptionsListUtils';
import {canSubmitPerDiemExpenseFromWorkspace, isPolicyAdmin, shouldShowPolicy} from '@libs/PolicyUtils';
import {getDefaultWorkspaceAvatar, getPolicyIDsWithEmptyReportsForAccount, hasViolations as hasViolationsReportUtils} from '@libs/ReportUtils';
import {buildCannedSearchQuery} from '@libs/SearchQueryUtils';
import {shouldRestrictUserBillableActions} from '@libs/SubscriptionUtils';
import {isPerDiemRequest} from '@libs/TransactionUtils';
import isRHPOnSearchMoneyRequestReportPage from '@navigation/helpers/isRHPOnSearchMoneyRequestReportPage';
import type {PlatformStackScreenProps} from '@navigation/PlatformStackNavigation/types';
import {changeTransactionsReport} from '@userActions/Transaction';
import {setNameValuePair} from '@userActions/User';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type * as OnyxTypes from '@src/types/onyx';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

type WorkspaceListItem = {
    text: string;
    policyID?: string;
    isPolicyAdmin?: boolean;
} & ListItem;

type NewReportWorkspaceSelectionPageProps = PlatformStackScreenProps<NewReportWorkspaceSelectionNavigatorParamList, typeof SCREENS.NEW_REPORT_WORKSPACE_SELECTION.ROOT>;

function NewReportWorkspaceSelectionPage({route}: NewReportWorkspaceSelectionPageProps) {
    const {isMovingExpenses, backTo} = route.params ?? {};
    const {isOffline} = useNetwork();
    const icons = useMemoizedLazyExpensifyIcons(['FallbackWorkspaceAvatar']);
    const {selectedTransactions, selectedTransactionIDs, clearAllSelectedTransactions, clearSelectedTransactionsByHash} = useSearchContext();
    const styles = useThemeStyles();
    const [searchTerm, debouncedSearchTerm, setSearchTerm] = useDebouncedState('');
    const {translate, localeCompare} = useLocalize();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const [allReportNextSteps] = useOnyx(ONYXKEYS.COLLECTION.NEXT_STEP, {canBeMissing: true});
    const isRHPOnReportInSearch = isRHPOnSearchMoneyRequestReportPage();
    const [transactionViolations] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS, {canBeMissing: true});
    const {isBetaEnabled} = usePermissions();
    const isASAPSubmitBetaEnabled = isBetaEnabled(CONST.BETAS.ASAP_SUBMIT);
    const [accountID] = useOnyx(ONYXKEYS.SESSION, {selector: accountIDSelector, canBeMissing: true});
    const [email] = useOnyx(ONYXKEYS.SESSION, {selector: emailSelector, canBeMissing: true});
    const hasViolations = hasViolationsReportUtils(undefined, transactionViolations, accountID ?? CONST.DEFAULT_NUMBER_ID, email ?? '');
    const [activePolicyID] = useOnyx(ONYXKEYS.NVP_ACTIVE_POLICY_ID, {canBeMissing: true});
    const [hasDismissedEmptyReportsConfirmation] = useOnyx(ONYXKEYS.NVP_EMPTY_REPORTS_CONFIRMATION_DISMISSED, {canBeMissing: true});

    const [policies, fetchStatus] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {canBeMissing: true});
    const [allTransactions] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION, {canBeMissing: true});
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();

    const [isLoadingApp] = useOnyx(ONYXKEYS.IS_LOADING_APP, {canBeMissing: true});
    const shouldShowLoadingIndicator = isLoadingApp && !isOffline;
    const [pendingPolicySelection, setPendingPolicySelection] = useState<{policy: WorkspaceListItem; shouldShowEmptyReportConfirmation: boolean} | null>(null);

    const policiesWithEmptyReportsSelector = useCallback(
        (reports: OnyxCollection<OnyxTypes.Report>) => {
            if (!accountID) {
                return {};
            }

            return getPolicyIDsWithEmptyReportsForAccount(reports, accountID);
        },
        [accountID],
    );

    const [policiesWithEmptyReports] = useOnyx(
        ONYXKEYS.COLLECTION.REPORT,
        {
            canBeMissing: true,
            selector: policiesWithEmptyReportsSelector,
        },
        [policiesWithEmptyReportsSelector],
    );

    const navigateToNewReport = useCallback(
        (optimisticReportID: string) => {
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
        },
        [isRHPOnReportInSearch, shouldUseNarrowLayout],
    );

    const createReport = useCallback(
        (policyID: string, shouldDismissEmptyReportsConfirmation?: boolean) => {
            const optimisticReport = createNewReport(
                currentUserPersonalDetails,
                isASAPSubmitBetaEnabled,
                hasViolations,
                policies?.[`${ONYXKEYS.COLLECTION.POLICY}${policyID}`],
                false,
                shouldDismissEmptyReportsConfirmation,
            );
            const selectedTransactionsKeys = Object.keys(selectedTransactions);

            if (isMovingExpenses && (!!selectedTransactionsKeys.length || !!selectedTransactionIDs.length)) {
                const reportNextStep = allReportNextSteps?.[`${ONYXKEYS.COLLECTION.NEXT_STEP}${optimisticReport.reportID}`];
                setNavigationActionToMicrotaskQueue(() => {
                    changeTransactionsReport({
                        transactionIDs: selectedTransactionsKeys.length ? selectedTransactionsKeys : selectedTransactionIDs,
                        isASAPSubmitBetaEnabled,
                        accountID: currentUserPersonalDetails?.accountID ?? CONST.DEFAULT_NUMBER_ID,
                        email: currentUserPersonalDetails?.email ?? '',
                        newReport: optimisticReport,
                        policy: policies?.[`${ONYXKEYS.COLLECTION.POLICY}${policyID}`],
                        reportNextStep,
                        policyCategories: undefined,
                        allTransactions,
                    });

                    // eslint-disable-next-line rulesdir/no-default-id-values
                    setNameValuePair(ONYXKEYS.NVP_ACTIVE_POLICY_ID, policyID, activePolicyID ?? '');

                    if (selectedTransactionIDs.length) {
                        clearAllSelectedTransactions();
                    }
                    if (selectedTransactionsKeys.length) {
                        clearSelectedTransactionsByHash();
                    }
                });

                Navigation.dismissModal();
                Navigation.goBack(backTo ?? ROUTES.SEARCH_ROOT.getRoute({query: buildCannedSearchQuery()}));
                return;
            }
            navigateToNewReport(optimisticReport.reportID);
        },
        [
            currentUserPersonalDetails,
            isASAPSubmitBetaEnabled,
            hasViolations,
            policies,
            selectedTransactions,
            isMovingExpenses,
            selectedTransactionIDs,
            navigateToNewReport,
            allReportNextSteps,
            backTo,
            allTransactions,
            activePolicyID,
            clearAllSelectedTransactions,
            clearSelectedTransactionsByHash,
        ],
    );

    const handleConfirmCreateReport = useCallback(
        (shouldDismissEmptyReportsConfirmation: boolean) => {
            if (!pendingPolicySelection?.policy.policyID) {
                return;
            }

            createReport(pendingPolicySelection.policy.policyID, shouldDismissEmptyReportsConfirmation);
            setPendingPolicySelection(null);
        },
        [createReport, pendingPolicySelection?.policy.policyID],
    );

    const handleCancelCreateReport = useCallback(() => {
        setPendingPolicySelection(null);
    }, []);

    const {openCreateReportConfirmation, CreateReportConfirmationModal} = useCreateEmptyReportConfirmation({
        policyID: pendingPolicySelection?.policy.policyID,
        policyName: pendingPolicySelection?.policy.text ?? '',
        onConfirm: handleConfirmCreateReport,
        onCancel: handleCancelCreateReport,
    });

    useEffect(() => {
        if (!pendingPolicySelection) {
            return;
        }

        const {policy, shouldShowEmptyReportConfirmation} = pendingPolicySelection;
        const policyID = policy.policyID;

        if (!policyID) {
            return;
        }

        if (!shouldShowEmptyReportConfirmation) {
            // No empty report confirmation needed - create report directly and clear pending selection
            // policyID is guaranteed to be defined by the check above
            createReport(policyID, false);
            setPendingPolicySelection(null);
            return;
        }

        // Empty report confirmation needed - open confirmation modal (modal handles clearing pending selection via onConfirm/onCancel)
        openCreateReportConfirmation();
    }, [createReport, openCreateReportConfirmation, pendingPolicySelection]);

    const selectPolicy = useCallback(
        (policy?: WorkspaceListItem) => {
            if (!policy?.policyID) {
                return;
            }

            if (shouldRestrictUserBillableActions(policy.policyID)) {
                Navigation.navigate(ROUTES.RESTRICTED_ACTION.getRoute(policy.policyID));
                return;
            }

            // Capture the decision about whether to show empty report confirmation
            setPendingPolicySelection({
                policy,
                shouldShowEmptyReportConfirmation: !!policiesWithEmptyReports?.[policy.policyID] && hasDismissedEmptyReportsConfirmation !== true,
            });
        },
        [hasDismissedEmptyReportsConfirmation, policiesWithEmptyReports],
    );

    const hasPerDiemTransactions = useMemo(() => {
        if (selectedTransactionIDs && selectedTransactionIDs.length > 0 && allTransactions) {
            return selectedTransactionIDs.some((transactionID) => {
                const transaction = allTransactions[`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`];
                return transaction && isPerDiemRequest(transaction);
            });
        }

        return false;
    }, [selectedTransactionIDs, allTransactions]);

    const usersWorkspaces = useMemo<WorkspaceListItem[]>(() => {
        if (!policies || isEmptyObject(policies)) {
            return [];
        }

        return Object.values(policies)
            .filter(
                (policy) =>
                    shouldShowPolicy(policy, false, currentUserPersonalDetails?.login) &&
                    !policy?.isJoinRequestPending &&
                    policy?.isPolicyExpenseChatEnabled &&
                    (!hasPerDiemTransactions || canSubmitPerDiemExpenseFromWorkspace(policy)),
            )
            .map((policy, index) => ({
                text: policy?.name ?? '',
                policyID: policy?.id,
                icons: [
                    {
                        source: policy?.avatarURL ? policy.avatarURL : getDefaultWorkspaceAvatar(policy?.name),
                        fallbackIcon: icons.FallbackWorkspaceAvatar,
                        name: policy?.name,
                        type: CONST.ICON_TYPE_WORKSPACE,
                        id: policy?.id,
                    },
                ],
                keyForList: `${policy?.id}-${index}`,
                isPolicyAdmin: isPolicyAdmin(policy),
                shouldSyncFocus: true,
            }))
            .sort((a, b) => localeCompare(a.text, b.text));
    }, [policies, currentUserPersonalDetails?.login, localeCompare, hasPerDiemTransactions, icons.FallbackWorkspaceAvatar]);

    const filteredAndSortedUserWorkspaces = useMemo<WorkspaceListItem[]>(
        () => usersWorkspaces.filter((policy) => policy.text?.toLowerCase().includes(debouncedSearchTerm?.toLowerCase() ?? '')),
        [debouncedSearchTerm, usersWorkspaces],
    );

    const areResultsFound = filteredAndSortedUserWorkspaces.length > 0;

    const textInputOptions = useMemo(
        () => ({
            label: usersWorkspaces.length >= CONST.STANDARD_LIST_ITEM_LIMIT ? translate('common.search') : undefined,
            value: searchTerm,
            onChangeText: setSearchTerm,
            headerMessage: getHeaderMessageForNonUserList(areResultsFound, debouncedSearchTerm),
        }),
        [areResultsFound, debouncedSearchTerm, searchTerm, setSearchTerm, translate, usersWorkspaces.length],
    );

    return (
        <ScreenWrapper
            testID="NewReportWorkspaceSelectionPage"
            includeSafeAreaPaddingBottom
            shouldEnableMaxHeight
        >
            {({didScreenTransitionEnd}) => (
                <>
                    <HeaderWithBackButton
                        title={translate('report.newReport.createReport')}
                        onBackButtonPress={Navigation.goBack}
                    />
                    {CreateReportConfirmationModal}
                    {shouldShowLoadingIndicator ? (
                        <FullScreenLoadingIndicator style={[styles.flex1, styles.pRelative]} />
                    ) : (
                        <>
                            <Text style={[styles.ph5, styles.mb3]}>{translate('report.newReport.chooseWorkspace')}</Text>
                            <SelectionList<WorkspaceListItem>
                                data={filteredAndSortedUserWorkspaces}
                                ListItem={UserListItem}
                                onSelectRow={selectPolicy}
                                textInputOptions={textInputOptions}
                                showLoadingPlaceholder={fetchStatus.status === 'loading' || !didScreenTransitionEnd}
                            />
                        </>
                    )}
                </>
            )}
        </ScreenWrapper>
    );
}

export default NewReportWorkspaceSelectionPage;
