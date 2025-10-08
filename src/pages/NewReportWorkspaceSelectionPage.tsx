import React, {useCallback, useMemo} from 'react';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import * as Expensicons from '@components/Icon/Expensicons';
import ScreenWrapper from '@components/ScreenWrapper';
import {useSearchContext} from '@components/Search/SearchContext';
import SelectionList from '@components/SelectionListWithSections';
import type {ListItem, SectionListDataType} from '@components/SelectionListWithSections/types';
import UserListItem from '@components/SelectionListWithSections/UserListItem';
import Text from '@components/Text';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useDebouncedState from '@hooks/useDebouncedState';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import {createNewReport} from '@libs/actions/Report';
import Navigation from '@libs/Navigation/Navigation';
import type {NewReportWorkspaceSelectionNavigatorParamList} from '@libs/Navigation/types';
import {getHeaderMessageForNonUserList} from '@libs/OptionsListUtils';
import Permissions from '@libs/Permissions';
import {isPolicyAdmin, shouldShowPolicy} from '@libs/PolicyUtils';
import {getDefaultWorkspaceAvatar, hasViolations as hasViolationsReportUtils} from '@libs/ReportUtils';
import {buildCannedSearchQuery} from '@libs/SearchQueryUtils';
import {shouldRestrictUserBillableActions} from '@libs/SubscriptionUtils';
import isRHPOnSearchMoneyRequestReportPage from '@navigation/helpers/isRHPOnSearchMoneyRequestReportPage';
import type {PlatformStackScreenProps} from '@navigation/PlatformStackNavigation/types';
import {changeTransactionsReport} from '@userActions/Transaction';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

type WorkspaceListItem = {
    text: string;
    policyID?: string;
    isPolicyAdmin?: boolean;
} & ListItem;

type NewReportWorkspaceSelectionPageProps = PlatformStackScreenProps<NewReportWorkspaceSelectionNavigatorParamList, typeof SCREENS.NEW_REPORT_WORKSPACE_SELECTION.ROOT>;

function NewReportWorkspaceSelectionPage({route}: NewReportWorkspaceSelectionPageProps) {
    const {isMovingExpenses} = route.params ?? {};
    const {isOffline} = useNetwork();
    const {selectedTransactions, clearSelectedTransactions} = useSearchContext();
    const styles = useThemeStyles();
    const [searchTerm, debouncedSearchTerm, setSearchTerm] = useDebouncedState('');
    const {translate, localeCompare} = useLocalize();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const [allReportNextSteps] = useOnyx(ONYXKEYS.COLLECTION.NEXT_STEP, {canBeMissing: true});
    const isRHPOnReportInSearch = isRHPOnSearchMoneyRequestReportPage();
    const [transactionViolations] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS, {canBeMissing: true});
    const [allBetas] = useOnyx(ONYXKEYS.BETAS, {canBeMissing: true});
    const isASAPSubmitBetaEnabled = Permissions.isBetaEnabled(CONST.BETAS.ASAP_SUBMIT, allBetas);
    const hasViolations = hasViolationsReportUtils(undefined, transactionViolations);

    const [policies, fetchStatus] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {canBeMissing: true});
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();

    const [isLoadingApp] = useOnyx(ONYXKEYS.IS_LOADING_APP, {canBeMissing: true});
    const shouldShowLoadingIndicator = isLoadingApp && !isOffline;
    const navigateToNewReport = useCallback(
        (optimisticReportID: string) => {
            if (isRHPOnReportInSearch) {
                Navigation.setNavigationActionToMicrotaskQueue(() => {
                    Navigation.dismissModal();
                });
            }

            Navigation.setNavigationActionToMicrotaskQueue(() => {
                Navigation.navigate(ROUTES.SEARCH_MONEY_REQUEST_REPORT.getRoute({reportID: optimisticReportID}), {forceReplace: isRHPOnReportInSearch || shouldUseNarrowLayout});
            });
        },
        [isRHPOnReportInSearch, shouldUseNarrowLayout],
    );

    const selectPolicy = useCallback(
        (policyID?: string) => {
            if (!policyID) {
                return;
            }
            if (shouldRestrictUserBillableActions(policyID)) {
                Navigation.navigate(ROUTES.RESTRICTED_ACTION.getRoute(policyID));
                return;
            }
            const optimisticReportID = createNewReport(currentUserPersonalDetails, isASAPSubmitBetaEnabled, hasViolations, policyID);
            const selectedTransactionsKeys = Object.keys(selectedTransactions);
            if (isMovingExpenses && !!selectedTransactionsKeys.length) {
                const reportNextStep = allReportNextSteps?.[`${ONYXKEYS.COLLECTION.NEXT_STEP}${optimisticReportID}`];
                changeTransactionsReport(
                    selectedTransactionsKeys,
                    optimisticReportID,
                    isASAPSubmitBetaEnabled,
                    currentUserPersonalDetails?.accountID ?? CONST.DEFAULT_NUMBER_ID,
                    currentUserPersonalDetails?.email ?? '',
                    policies?.[`${ONYXKEYS.COLLECTION.POLICY}${policyID}`],
                    reportNextStep,
                );
                clearSelectedTransactions();
                Navigation.dismissModal();
                Navigation.goBack(ROUTES.SEARCH_ROOT.getRoute({query: buildCannedSearchQuery()}));
                return;
            }
            navigateToNewReport(optimisticReportID);
        },
        [
            allReportNextSteps,
            clearSelectedTransactions,
            currentUserPersonalDetails,
            isASAPSubmitBetaEnabled,
            isMovingExpenses,
            navigateToNewReport,
            policies,
            selectedTransactions,
            hasViolations,
        ],
    );

    const usersWorkspaces = useMemo<WorkspaceListItem[]>(() => {
        if (!policies || isEmptyObject(policies)) {
            return [];
        }

        return Object.values(policies)
            .filter((policy) => shouldShowPolicy(policy, !!isOffline, currentUserPersonalDetails?.login) && !policy?.isJoinRequestPending && policy?.isPolicyExpenseChatEnabled)
            .map((policy) => ({
                text: policy?.name ?? '',
                policyID: policy?.id,
                icons: [
                    {
                        source: policy?.avatarURL ? policy.avatarURL : getDefaultWorkspaceAvatar(policy?.name),
                        fallbackIcon: Expensicons.FallbackWorkspaceAvatar,
                        name: policy?.name,
                        type: CONST.ICON_TYPE_WORKSPACE,
                        id: policy?.id,
                    },
                ],
                keyForList: policy?.id,
                isPolicyAdmin: isPolicyAdmin(policy),
                shouldSyncFocus: true,
            }))
            .sort((a, b) => localeCompare(a.text, b.text));
    }, [policies, isOffline, currentUserPersonalDetails?.login, localeCompare]);

    const filteredAndSortedUserWorkspaces = useMemo<WorkspaceListItem[]>(
        () => usersWorkspaces.filter((policy) => policy.text?.toLowerCase().includes(debouncedSearchTerm?.toLowerCase() ?? '')),
        [debouncedSearchTerm, usersWorkspaces],
    );

    const sections = useMemo(() => {
        const options: Array<SectionListDataType<WorkspaceListItem>> = [
            {
                data: filteredAndSortedUserWorkspaces,
                shouldShow: true,
            },
        ];
        return options;
    }, [filteredAndSortedUserWorkspaces]);

    const areResultsFound = filteredAndSortedUserWorkspaces.length > 0;
    const headerMessage = getHeaderMessageForNonUserList(areResultsFound, debouncedSearchTerm);

    return (
        <ScreenWrapper
            testID={NewReportWorkspaceSelectionPage.displayName}
            includeSafeAreaPaddingBottom
            shouldEnableMaxHeight
        >
            {({didScreenTransitionEnd}) => (
                <>
                    <HeaderWithBackButton
                        title={translate('report.newReport.createReport')}
                        onBackButtonPress={Navigation.goBack}
                    />
                    {shouldShowLoadingIndicator ? (
                        <FullScreenLoadingIndicator style={[styles.flex1, styles.pRelative]} />
                    ) : (
                        <>
                            <Text style={[styles.ph5, styles.mb3]}>{translate('report.newReport.chooseWorkspace')}</Text>
                            <SelectionList<WorkspaceListItem>
                                ListItem={UserListItem}
                                sections={sections}
                                onSelectRow={(option) => selectPolicy(option.policyID)}
                                textInputLabel={usersWorkspaces.length >= CONST.STANDARD_LIST_ITEM_LIMIT ? translate('common.search') : undefined}
                                textInputValue={searchTerm}
                                onChangeText={setSearchTerm}
                                headerMessage={headerMessage}
                                showLoadingPlaceholder={fetchStatus.status === 'loading' || !didScreenTransitionEnd}
                            />
                        </>
                    )}
                </>
            )}
        </ScreenWrapper>
    );
}

NewReportWorkspaceSelectionPage.displayName = 'NewReportWorkspaceSelectionPage';

export default NewReportWorkspaceSelectionPage;
