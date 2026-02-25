import {accountIDSelector, emailSelector} from '@selectors/Session';
import React, {useEffect, useState} from 'react';
import type {OnyxCollection} from 'react-native-onyx';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import {useSearchActionsContext, useSearchStateContext} from '@components/Search/SearchContext';
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
    const {selectedTransactions, selectedTransactionIDs} = useSearchStateContext();
    const {clearSelectedTransactions} = useSearchActionsContext();
    const styles = useThemeStyles();
    const [searchTerm, debouncedSearchTerm, setSearchTerm] = useDebouncedState('');
    const {translate, localeCompare} = useLocalize();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const [allReportNextSteps] = useOnyx(ONYXKEYS.COLLECTION.NEXT_STEP);
    const isRHPOnReportInSearch = isRHPOnSearchMoneyRequestReportPage();
    const [transactionViolations] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS);
    const {isBetaEnabled} = usePermissions();
    const isASAPSubmitBetaEnabled = isBetaEnabled(CONST.BETAS.ASAP_SUBMIT);
    const [accountID] = useOnyx(ONYXKEYS.SESSION, {selector: accountIDSelector});
    const [email] = useOnyx(ONYXKEYS.SESSION, {selector: emailSelector});
    const hasViolations = hasViolationsReportUtils(undefined, transactionViolations, accountID ?? CONST.DEFAULT_NUMBER_ID, email ?? '');
    const [activePolicyID] = useOnyx(ONYXKEYS.NVP_ACTIVE_POLICY_ID);
    const [hasDismissedEmptyReportsConfirmation] = useOnyx(ONYXKEYS.NVP_EMPTY_REPORTS_CONFIRMATION_DISMISSED);
    const [betas] = useOnyx(ONYXKEYS.BETAS);
    const [policies, fetchStatus] = useOnyx(ONYXKEYS.COLLECTION.POLICY);
    const [allTransactions] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION);
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();

    const [isLoadingApp] = useOnyx(ONYXKEYS.IS_LOADING_APP);
    const shouldShowLoadingIndicator = isLoadingApp && !isOffline;
    const [pendingPolicySelection, setPendingPolicySelection] = useState<{policy: WorkspaceListItem; shouldShowEmptyReportConfirmation: boolean} | null>(null);

    const [policiesWithEmptyReports] = useOnyx(ONYXKEYS.COLLECTION.REPORT, {
        selector: (reports: OnyxCollection<OnyxTypes.Report>) => {
            if (!accountID) {
                return {};
            }

            return getPolicyIDsWithEmptyReportsForAccount(reports, accountID);
        },
    });

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
        const optimisticReport = createNewReport(
            currentUserPersonalDetails,
            isASAPSubmitBetaEnabled,
            hasViolations,
            policies?.[`${ONYXKEYS.COLLECTION.POLICY}${policyID}`],
            betas,
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
                    clearSelectedTransactions(true);
                }
                if (selectedTransactionsKeys.length) {
                    clearSelectedTransactions();
                }
            });

            Navigation.dismissModal();
            Navigation.goBack(backTo ?? ROUTES.SEARCH_ROOT.getRoute({query: buildCannedSearchQuery()}));
            return;
        }
        navigateToNewReport(optimisticReport.reportID);
    };

    const {openCreateReportConfirmation, CreateReportConfirmationModal} = useCreateEmptyReportConfirmation({
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

        if (shouldRestrictUserBillableActions(policy.policyID)) {
            Navigation.navigate(ROUTES.RESTRICTED_ACTION.getRoute(policy.policyID));
            return;
        }

        const shouldShowEmptyReportConfirmation = !!policiesWithEmptyReports?.[policy.policyID] && hasDismissedEmptyReportsConfirmation !== true;
        if (!shouldShowEmptyReportConfirmation) {
            createReport(policy.policyID, false);
            return;
        }

        setPendingPolicySelection({
            policy,
            shouldShowEmptyReportConfirmation: true,
        });
    };

    const hasPerDiemTransactions =
        selectedTransactionIDs &&
        selectedTransactionIDs.length > 0 &&
        allTransactions &&
        selectedTransactionIDs.some((transactionID) => {
            const transaction = allTransactions[`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`];
            return transaction && isPerDiemRequest(transaction);
        });

    let usersWorkspaces: WorkspaceListItem[] = [];
    if (policies && !isEmptyObject(policies)) {
        const result = [];
        let index = 0;
        for (const policy of Object.values(policies)) {
            if (
                policy?.isJoinRequestPending ||
                !policy?.isPolicyExpenseChatEnabled ||
                !shouldShowPolicy(policy, false, currentUserPersonalDetails?.login) ||
                (hasPerDiemTransactions && !canSubmitPerDiemExpenseFromWorkspace(policy))
            ) {
                continue;
            }

            result.push({
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
