import FullPageOfflineBlockingView from '@components/BlockingViews/FullPageOfflineBlockingView';
import HeaderWithBackButtonAndTitle from '@components/Header/composed/HeaderWithBackButtonAndTitle';
import {useSession} from '@components/OnyxListItemProvider';
import ScreenWrapper from '@components/ScreenWrapper';
import {useSearchQueryContext, useSearchResultsContext, useSearchSelectionActions, useSearchSelectionContext} from '@components/Search/SearchContext';
import SelectionList from '@components/SelectionList';
import type {WorkspaceListItemType} from '@components/SelectionList/ListItem/types';
import UserListItem from '@components/SelectionList/ListItem/UserListItem';

import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useDebouncedState from '@hooks/useDebouncedState';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import {getAllMatchingExpenseActionQuery} from '@hooks/useSearchBulkActions';
import useWorkspaceList from '@hooks/useWorkspaceList';

import {queueBulkChangeReportPolicy} from '@libs/actions/Search';
import Log from '@libs/Log';
import Navigation from '@libs/Navigation/Navigation';
import {isWorkspaceEligibleForReportChange} from '@libs/ReportUtils';
import {buildSearchQueryJSON, serializeQueryJSONForBackend} from '@libs/SearchQueryUtils';
import {shouldRestrictUserBillableActions} from '@libs/SubscriptionUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

import React, {useState} from 'react';

/** Lets the user pick the workspace to move the reports selected on Search to. */
function SearchChangeWorkspacePage() {
    const {translate, localeCompare} = useLocalize();
    const session = useSession();
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const [searchTerm, debouncedSearchTerm, setSearchTerm] = useDebouncedState('');
    const [policyID, setPolicyID] = useState<string>();
    const [policies] = useOnyx(ONYXKEYS.COLLECTION.POLICY);
    const [ownerBillingGracePeriodEnd] = useOnyx(ONYXKEYS.NVP_PRIVATE_OWNER_BILLING_GRACE_PERIOD_END);
    const [userBillingGracePeriods] = useOnyx(ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_USER_BILLING_GRACE_PERIOD_END);
    const [amountOwed] = useOnyx(ONYXKEYS.NVP_PRIVATE_AMOUNT_OWED);
    const {currentSearchQueryJSON} = useSearchQueryContext();
    const {currentSearchResults} = useSearchResultsContext();
    const {selectedReports, selectedTransactions, excludedTransactions, areAllMatchingItemsSelected} = useSearchSelectionContext();
    const {clearSelectedTransactions} = useSearchSelectionActions();

    const {data, shouldShowNoResultsFoundMessage, shouldShowSearchInput} = useWorkspaceList({
        policies,
        currentUserLogin: session?.email,
        shouldShowPendingDeletePolicy: false,
        selectedPolicyIDs: policyID ? [policyID] : undefined,
        searchTerm: debouncedSearchTerm,
        localeCompare,
        additionalFilter: (policy) => isWorkspaceEligibleForReportChange(session?.email, policy),
    });

    const getJSONQuery = () => {
        if (areAllMatchingItemsSelected) {
            return currentSearchQueryJSON ? getAllMatchingExpenseActionQuery(currentSearchQueryJSON, excludedTransactions, currentSearchResults?.data)?.jsonQuery : undefined;
        }
        const reportIDs = selectedReports.length ? selectedReports.map((report) => report.reportID) : Object.values(selectedTransactions).map((transaction) => transaction.reportID);
        const uniqueReportIDs = [...new Set(reportIDs.filter((reportID): reportID is string => !!reportID))];
        const queryJSON = buildSearchQueryJSON(`type:${CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT} ${CONST.SEARCH.SYNTAX_FILTER_KEYS.REPORT_ID}:${uniqueReportIDs.join(',')}`);
        return uniqueReportIDs.length && queryJSON ? serializeQueryJSONForBackend(queryJSON) : undefined;
    };

    const changeWorkspace = () => {
        const policy = policies?.[`${ONYXKEYS.COLLECTION.POLICY}${policyID}`];
        if (!policyID || !policy) {
            return;
        }
        if (shouldRestrictUserBillableActions(policy, ownerBillingGracePeriodEnd, userBillingGracePeriods, amountOwed, currentUserPersonalDetails.accountID)) {
            Navigation.navigate(ROUTES.RESTRICTED_ACTION.getRoute(policy.id));
            return;
        }
        const jsonQuery = getJSONQuery();
        if (!jsonQuery) {
            Log.info('[BulkChangeWorkspace] Dropping bulk workspace change: no reports to move');
            return;
        }
        queueBulkChangeReportPolicy(jsonQuery, policyID);
        clearSelectedTransactions();
        Navigation.goBack();
    };

    return (
        <ScreenWrapper
            testID="SearchChangeWorkspacePage"
            enableEdgeToEdgeBottomSafeAreaPadding
            shouldEnableMaxHeight
        >
            <HeaderWithBackButtonAndTitle
                title={translate('iou.changeWorkspace')}
                onBackButtonPress={Navigation.goBack}
            />
            <FullPageOfflineBlockingView>
                <SelectionList<WorkspaceListItemType>
                    ListItem={UserListItem}
                    data={data}
                    onSelectRow={(option) => setPolicyID(option.policyID)}
                    textInputOptions={{
                        label: shouldShowSearchInput ? translate('common.search') : undefined,
                        value: searchTerm,
                        onChangeText: setSearchTerm,
                        headerMessage: shouldShowNoResultsFoundMessage ? translate('common.noResultsFound') : '',
                    }}
                    confirmButtonOptions={{
                        showButton: true,
                        text: translate('common.save'),
                        onConfirm: changeWorkspace,
                        isDisabled: !policyID,
                    }}
                    initiallyFocusedItemKey={policyID}
                    shouldUpdateFocusedIndex
                    addBottomSafeAreaPadding
                />
            </FullPageOfflineBlockingView>
        </ScreenWrapper>
    );
}

export default SearchChangeWorkspacePage;
