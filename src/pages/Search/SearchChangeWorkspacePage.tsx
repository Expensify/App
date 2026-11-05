import ActivityIndicator from '@components/ActivityIndicator';
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
import {useIsAppLoadPending} from '@hooks/useInFlightRequests';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import {useAllPersonalDetails} from '@hooks/usePersonalDetails';
import useThemeStyles from '@hooks/useThemeStyles';
import useWorkspaceList from '@hooks/useWorkspaceList';

import {getReportFromSearchSnapshot, queueBulkChangeReportPolicy} from '@libs/actions/Search';
import Log from '@libs/Log';
import Navigation from '@libs/Navigation/Navigation';
import {getLoginByAccountID} from '@libs/PersonalDetailsUtils';
import {isPolicyAdmin} from '@libs/PolicyUtils';
import {isSettled, isWorkspaceEligibleForReportChange} from '@libs/ReportUtils';
import {buildSearchQueryJSON, getAllMatchingReportQuery, serializeQueryJSONForBackend} from '@libs/SearchQueryUtils';
import {shouldRestrictUserBillableActions} from '@libs/SubscriptionUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {Policy} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import React, {useLayoutEffect, useRef, useState} from 'react';
import {View} from 'react-native';

/** Lets the user pick the workspace to move the reports selected on Search to. */
function SearchChangeWorkspacePage() {
    const {translate, localeCompare} = useLocalize();
    const styles = useThemeStyles();
    const {isOffline} = useNetwork();
    const isAppLoadPending = useIsAppLoadPending();
    const session = useSession();
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const [searchTerm, debouncedSearchTerm, setSearchTerm] = useDebouncedState('');
    const [policyID, setPolicyID] = useState<string>();
    const [policies] = useOnyx(ONYXKEYS.COLLECTION.POLICY);
    const [ownerBillingGracePeriodEnd] = useOnyx(ONYXKEYS.NVP_PRIVATE_OWNER_BILLING_GRACE_PERIOD_END);
    const [userBillingGracePeriods] = useOnyx(ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_USER_BILLING_GRACE_PERIOD_END);
    const [amountOwed] = useOnyx(ONYXKEYS.NVP_PRIVATE_AMOUNT_OWED);
    const {currentSearchQueryJSON} = useSearchQueryContext();
    const {selectedReports, excludedTransactions, areAllMatchingItemsSelected} = useSearchSelectionContext();
    const {clearSelectedTransactions} = useSearchSelectionActions();
    const {currentSearchResults} = useSearchResultsContext();
    const [personalDetails] = useAllPersonalDetails();
    const [allReports] = useOnyx(ONYXKEYS.COLLECTION.REPORT);

    const loadedReports = selectedReports.map((selectedReport) => getReportFromSearchSnapshot(selectedReport.reportID, currentSearchResults?.data, allReports)).filter((report) => !!report);

    // The backend skips the reports that can't move to a workspace, so it's offered when one loaded report can.
    const canMoveAReportTo = (policy: OnyxEntry<Policy>) =>
        loadedReports.some(
            (report) =>
                isWorkspaceEligibleForReportChange(getLoginByAccountID(report.ownerAccountID, personalDetails), policy, report) &&
                (!isSettled(report) || isPolicyAdmin(policy, session?.email)),
        );

    const {data, shouldShowNoResultsFoundMessage, shouldShowSearchInput} = useWorkspaceList({
        policies,
        currentUserLogin: session?.email,
        shouldShowPendingDeletePolicy: false,
        selectedPolicyIDs: policyID ? [policyID] : undefined,
        // An empty list keeps the picked workspace where it is instead of moving it to the top.
        policyIDsToSortToTop: [],
        searchTerm: debouncedSearchTerm,
        localeCompare,
        additionalFilter: canMoveAReportTo,
    });

    const getJSONQuery = () => {
        if (areAllMatchingItemsSelected) {
            const allMatchingQuery = currentSearchQueryJSON ? getAllMatchingReportQuery(currentSearchQueryJSON, excludedTransactions) : undefined;
            return allMatchingQuery ? serializeQueryJSONForBackend(allMatchingQuery) : undefined;
        }
        const uniqueReportIDs = [...new Set(selectedReports.map((report) => report.reportID).filter((reportID): reportID is string => !!reportID))];
        const queryJSON = buildSearchQueryJSON(`type:${CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT} ${CONST.SEARCH.SYNTAX_FILTER_KEYS.REPORT_ID}:${uniqueReportIDs.join(',')}`);
        return uniqueReportIDs.length && queryJSON ? serializeQueryJSONForBackend(queryJSON) : undefined;
    };

    const hasQueuedChangeRef = useRef(false);

    // A refresh or a direct link opens this page with nothing selected, so there are no reports to move.
    useLayoutEffect(() => {
        if (selectedReports.length || hasQueuedChangeRef.current) {
            return;
        }
        Navigation.setNavigationActionToMicrotaskQueue(() => {
            Navigation.closeRHPFlow();
        });
    }, [selectedReports.length]);

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
        hasQueuedChangeRef.current = true;
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
                {isAppLoadPending && !isOffline ? (
                    <View style={[styles.flex1, styles.fullScreenLoading]}>
                        <ActivityIndicator size={CONST.ACTIVITY_INDICATOR_SIZE.LARGE} />
                    </View>
                ) : (
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
                            isDisabled: !policyID || (!areAllMatchingItemsSelected && selectedReports.every((report) => report.policyID === policyID)),
                        }}
                        initiallyFocusedItemKey={policyID}
                        shouldUpdateFocusedIndex
                        addBottomSafeAreaPadding
                    />
                )}
            </FullPageOfflineBlockingView>
        </ScreenWrapper>
    );
}

export default SearchChangeWorkspacePage;
