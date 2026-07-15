import {getSuggestedSearches, getSuggestedSearchesVisibility} from '@libs/SearchUIUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy, Session} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import {defaultExpensifyCardSelector} from '@selectors/Card';
import {useMemo} from 'react';

import useCardFeedsForDisplay from './useCardFeedsForDisplay';
import useMappedPolicies from './useMappedPolicies';
import useOnyx from './useOnyx';

// Keep this mapper in sync with the one in `useSearchTypeMenuSections`. Both feed
// `getSuggestedSearchesVisibility`, which must see the same policy fields so the suggested searches
// built here match the ones the type menu routes to (see `useSuggestedSearches` note below).
const policyMapper = (policy: OnyxEntry<Policy>): OnyxEntry<Policy> =>
    policy && {
        id: policy.id,
        name: policy.name,
        type: policy.type,
        role: policy.role,
        owner: policy.owner,
        connections: policy.connections,
        outputCurrency: policy.outputCurrency,
        isPolicyExpenseChatEnabled: policy.isPolicyExpenseChatEnabled,
        isJoinRequestPending: policy.isJoinRequestPending,
        pendingAction: policy.pendingAction,
        errors: policy.errors,
        reimburser: policy.reimburser,
        exporter: policy.exporter,
        approver: policy.approver,
        approvalMode: policy.approvalMode,
        employeeList: policy.employeeList,
        reimbursementChoice: policy.reimbursementChoice,
        areCompanyCardsEnabled: policy.areCompanyCardsEnabled,
        areExpensifyCardsEnabled: policy.areExpensifyCardsEnabled,
        achAccount: policy.achAccount,
        areCategoriesEnabled: policy.areCategoriesEnabled,
        areWorkflowsEnabled: policy.areWorkflowsEnabled,
    };

const currentUserLoginAndAccountIDSelector = (session: OnyxEntry<Session>) => ({
    email: session?.email,
    accountID: session?.accountID,
});

/**
 * Builds the full list of suggested searches, scoped identically to the type menu
 * (`createTypeMenuSections` in `SearchUIUtils`). This must use the same inputs as the type menu
 * (`shouldShowExpensifyCard`, `topSpendersPolicyIDs`, and the default feed fallback) so that
 * suggested searches whose query depends on those inputs (Top Spenders, Reconciliation, Statements,
 * Unapproved card) produce the same hashes. Otherwise `SearchQueryProvider` can't resolve the
 * current query to its search key, which breaks `searchKey`/totals for those searches.
 */
function useSuggestedSearches() {
    const [defaultExpensifyCard] = useOnyx(ONYXKEYS.DERIVED.NON_PERSONAL_AND_WORKSPACE_CARD_LIST, {selector: defaultExpensifyCardSelector});
    const {defaultCardFeed, cardFeedsByPolicy} = useCardFeedsForDisplay();
    const [allPolicies] = useMappedPolicies(policyMapper);
    const [currentUserLoginAndAccountID] = useOnyx(ONYXKEYS.SESSION, {selector: currentUserLoginAndAccountIDSelector});

    return useMemo(() => {
        const {shouldShowExpensifyCard, topSpendersPolicyIDs} = getSuggestedSearchesVisibility(currentUserLoginAndAccountID?.email, cardFeedsByPolicy, allPolicies, defaultExpensifyCard);
        return getSuggestedSearches(
            currentUserLoginAndAccountID?.accountID ?? CONST.DEFAULT_NUMBER_ID,
            (defaultCardFeed ?? defaultExpensifyCard)?.id,
            shouldShowExpensifyCard,
            topSpendersPolicyIDs,
        );
    }, [currentUserLoginAndAccountID?.email, currentUserLoginAndAccountID?.accountID, cardFeedsByPolicy, allPolicies, defaultExpensifyCard, defaultCardFeed]);
}

export default useSuggestedSearches;
