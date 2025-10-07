import {createPoliciesSelector} from '@selectors/Policy';
import {useMemo} from 'react';
import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import Permissions from '@libs/Permissions';
import {hasViolations as hasViolationsReportUtils} from '@libs/ReportUtils';
import {createTypeMenuSections} from '@libs/SearchUIUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy, Session} from '@src/types/onyx';
import useCardFeedsForDisplay from './useCardFeedsForDisplay';
import useNetwork from './useNetwork';
import useOnyx from './useOnyx';

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
    const [currentUserLoginAndAccountID] = useOnyx(ONYXKEYS.SESSION, {selector: currentUserLoginAndAccountIDSelector, canBeMissing: false});
    const [activePolicyID] = useOnyx(ONYXKEYS.NVP_ACTIVE_POLICY_ID, {canBeMissing: true});
    const [savedSearches] = useOnyx(ONYXKEYS.SAVED_SEARCHES, {canBeMissing: true});
    const [reports] = useOnyx(ONYXKEYS.COLLECTION.REPORT, {canBeMissing: true});
    const [transactionViolations] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS, {canBeMissing: true});
    const [allBetas] = useOnyx(ONYXKEYS.BETAS, {canBeMissing: true});
    const isASAPSubmitBetaEnabled = Permissions.isBetaEnabled(CONST.BETAS.ASAP_SUBMIT, allBetas);
    const hasViolations = hasViolationsReportUtils(undefined, transactionViolations);

    const typeMenuSections = useMemo(
        () =>
            createTypeMenuSections(
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
                reports,
            ),
        [
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
            reports,
        ],
    );

    return {typeMenuSections};
};

export default useSearchTypeMenuSections;
