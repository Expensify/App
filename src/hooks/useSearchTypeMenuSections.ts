import {createPoliciesSelector} from '@selectors/Policy';
import {useMemo} from 'react';
import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import {hasViolations as hasViolationsReportUtils} from '@libs/ReportUtils';
import type {SearchTypeMenuItem, SearchTypeMenuSection} from '@libs/SearchUIUtils';
import {createTypeMenuSections, getSuggestedSearches, getSuggestedSearchesVisibility} from '@libs/SearchUIUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy, Session} from '@src/types/onyx';
import {getEmptyObject} from '@src/types/utils/EmptyObject';
import getEmptyArray from '@src/types/utils/getEmptyArray';
import useCardFeedsForDisplay from './useCardFeedsForDisplay';
import useNetwork from './useNetwork';
import useOnyx from './useOnyx';
import usePermissions from './usePermissions';

const policySelector = (policy: OnyxEntry<Policy>): OnyxEntry<Policy> =>
    policy && {
        id: policy.id,
        name: policy.name,
        type: policy.type,
        role: policy.role,
        owner: policy.owner,
        connections: policy.connections,
        outputCurrency: policy.outputCurrency,
        isPolicyExpenseChatEnabled: policy.isPolicyExpenseChatEnabled,
        reimburser: policy.reimburser,
        exporter: policy.exporter,
        approver: policy.approver,
        approvalMode: policy.approvalMode,
        employeeList: policy.employeeList,
        reimbursementChoice: policy.reimbursementChoice,
        areCompanyCardsEnabled: policy.areCompanyCardsEnabled,
        areExpensifyCardsEnabled: policy.areExpensifyCardsEnabled,
        achAccount: policy.achAccount,
    };

const policiesSelector = (policies: OnyxCollection<Policy>) => createPoliciesSelector(policies, policySelector);

const currentUserLoginAndAccountIDSelector = (session: OnyxEntry<Session>) => ({
    email: session?.email,
    accountID: session?.accountID,
});
/**
 * Get a list of all search groupings, along with their search items. Also returns the
 * currently focused search, based on the hash
 */
const useSearchTypeMenuSections = () => {
    const {defaultCardFeed, cardFeedsByPolicy, defaultExpensifyCard} = useCardFeedsForDisplay();
    const {isOffline} = useNetwork();
    const [allPolicies] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {selector: policiesSelector, canBeMissing: true});
    const [workspaceCardFeeds] = useOnyx(ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST, {canBeMissing: true});
    const [userCardList] = useOnyx(ONYXKEYS.CARD_LIST, {canBeMissing: true});
    const [currentUserLoginAndAccountID] = useOnyx(ONYXKEYS.SESSION, {selector: currentUserLoginAndAccountIDSelector, canBeMissing: false});
    const [activePolicyID] = useOnyx(ONYXKEYS.NVP_ACTIVE_POLICY_ID, {canBeMissing: true});
    const [savedSearches] = useOnyx(ONYXKEYS.SAVED_SEARCHES, {canBeMissing: true});
    const [transactionViolations] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS, {canBeMissing: true});
    const {isBetaEnabled} = usePermissions();
    const isASAPSubmitBetaEnabled = isBetaEnabled(CONST.BETAS.ASAP_SUBMIT);
    const hasViolations = hasViolationsReportUtils(undefined, transactionViolations);

    const policiesReady = useMemo(() => {
        if (!allPolicies) {
            return false;
        }

        return Object.values(allPolicies).some((policy) => {
            if (!policy) {
                return false;
            }

            const hasEmployeeList = policy.employeeList !== undefined;
            const hasExporter = policy.exporter !== undefined;

            return hasEmployeeList && hasExporter;
        });
    }, [allPolicies]);

    const cardFeedsReady = workspaceCardFeeds !== undefined && userCardList !== undefined;
    const sessionReady = !!currentUserLoginAndAccountID?.email && currentUserLoginAndAccountID?.accountID !== undefined;

    const suggestedSearchesReady = policiesReady && cardFeedsReady && sessionReady;

    const defaultFeedForSuggestedSearches = defaultCardFeed ?? defaultExpensifyCard;

    const suggestedSearches = useMemo<Record<string, SearchTypeMenuItem>>(() => {
        if (!suggestedSearchesReady) {
            return getEmptyObject<Record<string, SearchTypeMenuItem>>();
        }

        return getSuggestedSearches(currentUserLoginAndAccountID?.accountID ?? CONST.DEFAULT_NUMBER_ID, defaultFeedForSuggestedSearches?.id);
    }, [currentUserLoginAndAccountID?.accountID, defaultFeedForSuggestedSearches?.id, suggestedSearchesReady]);

    const suggestedSearchesVisibility = useMemo<Record<string, boolean>>(() => {
        if (!suggestedSearchesReady) {
            return getEmptyObject<Record<string, boolean>>();
        }

        return getSuggestedSearchesVisibility(currentUserLoginAndAccountID?.email, cardFeedsByPolicy, allPolicies, defaultExpensifyCard, reports, currentUserLoginAndAccountID?.accountID);
    }, [allPolicies, cardFeedsByPolicy, currentUserLoginAndAccountID?.accountID, currentUserLoginAndAccountID?.email, defaultExpensifyCard, reports, suggestedSearchesReady]);

    const typeMenuSections = useMemo<SearchTypeMenuSection[]>(() => {
        if (!suggestedSearchesReady) {
            return getEmptyArray<SearchTypeMenuSection>();
        }

        return createTypeMenuSections(
            currentUserLoginAndAccountID?.email,
            currentUserLoginAndAccountID?.accountID,
            cardFeedsByPolicy,
            defaultCardFeed ?? defaultExpensifyCard,
            allPolicies,
            activePolicyID,
            savedSearches,
            isOffline,
            defaultExpensifyCard,
            isASAPSubmitBetaEnabled,
            hasViolations,
            
        );
    }, [
        currentUserLoginAndAccountID?.email,
        currentUserLoginAndAccountID?.accountID,
        cardFeedsByPolicy,
        defaultCardFeed,
        defaultExpensifyCard,
        allPolicies,
        activePolicyID,
        savedSearches,
        isOffline,
        isASAPSubmitBetaEnabled,
        hasViolations,
        
        suggestedSearchesReady,
    ]);

    return {typeMenuSections, suggestedSearchesReady, suggestedSearches, suggestedSearchesVisibility};
};

export default useSearchTypeMenuSections;
