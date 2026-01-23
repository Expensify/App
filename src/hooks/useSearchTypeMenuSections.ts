import {createPoliciesSelector} from '@selectors/Policy';
import {useCallback, useEffect, useMemo, useState} from 'react';
import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import {areAllGroupPoliciesExpenseChatDisabled} from '@libs/PolicyUtils';
import {createTypeMenuSections} from '@libs/SearchUIUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy, Session} from '@src/types/onyx';
import useCardFeedsForDisplay from './useCardFeedsForDisplay';
import useCreateEmptyReportConfirmation from './useCreateEmptyReportConfirmation';
import {useMemoizedLazyExpensifyIcons} from './useLazyAsset';
import useNetwork from './useNetwork';
import useOnyx from './useOnyx';
import useTodos from './useTodos';

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

    const icons = useMemoizedLazyExpensifyIcons(['Document', 'Pencil', 'ThumbsUp']);
    const {isOffline} = useNetwork();
    const [allPolicies] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {selector: policiesSelector, canBeMissing: true});
    const [currentUserLoginAndAccountID] = useOnyx(ONYXKEYS.SESSION, {selector: currentUserLoginAndAccountIDSelector, canBeMissing: false});
    const [savedSearches] = useOnyx(ONYXKEYS.SAVED_SEARCHES, {canBeMissing: true});
    const [allTransactionDrafts] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_DRAFT, {canBeMissing: true});
    const shouldRedirectToExpensifyClassic = useMemo(() => areAllGroupPoliciesExpenseChatDisabled(allPolicies ?? {}), [allPolicies]);
    const [pendingReportCreation, setPendingReportCreation] = useState<{policyID: string; policyName?: string; onConfirm: (shouldDismissEmptyReportsConfirmation: boolean) => void} | null>(
        null,
    );
    const {reportCounts} = useTodos();

    const handlePendingConfirm = useCallback(
        (shouldDismissEmptyReportsConfirmation: boolean) => {
            pendingReportCreation?.onConfirm(shouldDismissEmptyReportsConfirmation);
            setPendingReportCreation(null);
        },
        [pendingReportCreation, setPendingReportCreation],
    );

    const handlePendingCancel = useCallback(() => {
        setPendingReportCreation(null);
    }, [setPendingReportCreation]);

    const {openCreateReportConfirmation, CreateReportConfirmationModal} = useCreateEmptyReportConfirmation({
        policyID: pendingReportCreation?.policyID,
        policyName: pendingReportCreation?.policyName ?? '',
        onConfirm: handlePendingConfirm,
        onCancel: handlePendingCancel,
    });

    useEffect(() => {
        if (!pendingReportCreation) {
            return;
        }
        openCreateReportConfirmation();
    }, [pendingReportCreation, openCreateReportConfirmation]);

    const isSuggestedSearchDataReady = useMemo(() => {
        const policiesList = Object.values(allPolicies ?? {}).filter((policy): policy is NonNullable<typeof policy> => policy !== null && policy !== undefined);

        return policiesList.some((policy) => policy.employeeList !== undefined && policy.exporter !== undefined);
    }, [allPolicies]);

    const typeMenuSections = useMemo(
        () =>
            createTypeMenuSections(
                icons,
                currentUserLoginAndAccountID?.email,
                currentUserLoginAndAccountID?.accountID,
                cardFeedsByPolicy,
                defaultCardFeed ?? defaultExpensifyCard,
                allPolicies,
                savedSearches,
                isOffline,
                defaultExpensifyCard,
                shouldRedirectToExpensifyClassic,
                allTransactionDrafts,
                reportCounts,
            ),
        [
            currentUserLoginAndAccountID?.email,
            currentUserLoginAndAccountID?.accountID,
            cardFeedsByPolicy,
            defaultCardFeed,
            defaultExpensifyCard,
            allPolicies,
            savedSearches,
            isOffline,
            shouldRedirectToExpensifyClassic,
            allTransactionDrafts,
            icons,
            reportCounts,
        ],
    );

    return {
        typeMenuSections,
        CreateReportConfirmationModal,
        shouldShowSuggestedSearchSkeleton: !isSuggestedSearchDataReady && !isOffline,
    };
};

export default useSearchTypeMenuSections;
