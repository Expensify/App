import {defaultExpensifyCardSelector} from '@selectors/Card';
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
import useReportCounts from './useReportCounts';

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
        areCategoriesEnabled: policy.areCategoriesEnabled,
    };

const policiesSelector = (policies: OnyxCollection<Policy>) => createPoliciesSelector(policies, policySelector);

const currentUserLoginAndAccountIDSelector = (session: OnyxEntry<Session>) => ({
    email: session?.email,
    accountID: session?.accountID,
});

/**
 * Selector to determine if suggested search data is ready to display
 * Returns true if at least one policy has both employeeList and exporter defined
 */
const isSuggestedSearchDataReadySelector = (policies: OnyxCollection<Policy>): boolean => {
    const policiesList = Object.values(policies ?? {}).filter((policy): policy is NonNullable<typeof policy> => policy !== null && policy !== undefined);

    return policiesList.some((policy) => policy.employeeList !== undefined && policy.exporter !== undefined);
};

const useSearchTypeMenuSections = () => {
    const [defaultExpensifyCard] = useOnyx(ONYXKEYS.DERIVED.NON_PERSONAL_AND_WORKSPACE_CARD_LIST, {canBeMissing: true, selector: defaultExpensifyCardSelector});

    const {defaultCardFeed, cardFeedsByPolicy} = useCardFeedsForDisplay();

    const icons = useMemoizedLazyExpensifyIcons(['Document', 'Pencil', 'ThumbsUp']);
    const {isOffline} = useNetwork();
    const [allPolicies] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {selector: policiesSelector, canBeMissing: true});
    const [currentUserLoginAndAccountID] = useOnyx(ONYXKEYS.SESSION, {selector: currentUserLoginAndAccountIDSelector, canBeMissing: false});
    const [savedSearches] = useOnyx(ONYXKEYS.SAVED_SEARCHES, {canBeMissing: true});
    const [allTransactionDrafts] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_DRAFT, {canBeMissing: true});
    const [isSuggestedSearchDataReady] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {selector: isSuggestedSearchDataReadySelector, canBeMissing: true});
    const shouldRedirectToExpensifyClassic = useMemo(() => areAllGroupPoliciesExpenseChatDisabled(allPolicies ?? {}), [allPolicies]);
    const [pendingReportCreation, setPendingReportCreation] = useState<{policyID: string; policyName?: string; onConfirm: (shouldDismissEmptyReportsConfirmation: boolean) => void} | null>(
        null,
    );
    const reportCounts = useReportCounts();

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

    const getTypeMenuSections = useCallback(() => typeMenuSections, [typeMenuSections]);

    return {
        getTypeMenuSections,
        CreateReportConfirmationModal,
        shouldShowSuggestedSearchSkeleton: !isSuggestedSearchDataReady && !isOffline,
    };
};

export default useSearchTypeMenuSections;
