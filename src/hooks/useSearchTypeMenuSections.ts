import {createPoliciesSelector} from '@selectors/Policy';
import {useCallback, useEffect, useMemo, useState} from 'react';
import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import {getPersonalDetailsForAccountID, hasEmptyReportsForPolicy, hasViolations as hasViolationsReportUtils} from '@libs/ReportUtils';
import {createTypeMenuSections} from '@libs/SearchUIUtils';
import {createNewReport} from '@userActions/Report';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {PersonalDetails, Policy, Session} from '@src/types/onyx';
import useCardFeedsForDisplay from './useCardFeedsForDisplay';
import useCreateEmptyReportConfirmation from './useCreateEmptyReportConfirmation';
import {useMemoizedLazyExpensifyIcons} from './useLazyAsset';
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

    const icons = useMemoizedLazyExpensifyIcons(['Document'] as const);
    const {isOffline} = useNetwork();
    const [allPolicies] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {selector: policiesSelector, canBeMissing: true});
    const [currentUserLoginAndAccountID] = useOnyx(ONYXKEYS.SESSION, {selector: currentUserLoginAndAccountIDSelector, canBeMissing: false});
    const [activePolicyID] = useOnyx(ONYXKEYS.NVP_ACTIVE_POLICY_ID, {canBeMissing: true});
    const [savedSearches] = useOnyx(ONYXKEYS.SAVED_SEARCHES, {canBeMissing: true});
    const [reports] = useOnyx(ONYXKEYS.COLLECTION.REPORT, {canBeMissing: true});
    const [transactionViolations] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS, {canBeMissing: true});
    const {isBetaEnabled} = usePermissions();
    const isASAPSubmitBetaEnabled = isBetaEnabled(CONST.BETAS.ASAP_SUBMIT);
    const hasViolations = hasViolationsReportUtils(undefined, transactionViolations);
    const [pendingReportCreation, setPendingReportCreation] = useState<{policyID: string; policyName?: string; onConfirm: () => void} | null>(null);

    const handlePendingConfirm = useCallback(() => {
        pendingReportCreation?.onConfirm();
        setPendingReportCreation(null);
    }, [pendingReportCreation, setPendingReportCreation]);

    const handlePendingCancel = useCallback(() => {
        setPendingReportCreation(null);
    }, [setPendingReportCreation]);

    const {openCreateReportConfirmation, CreateReportConfirmationModal} = useCreateEmptyReportConfirmation({
        policyID: pendingReportCreation?.policyID,
        policyName: pendingReportCreation?.policyName ?? '',
        onConfirm: handlePendingConfirm,
        onCancel: handlePendingCancel,
    });

    const createReportWithConfirmation = useCallback(
        ({policyID, policyName, onSuccess, personalDetails}: {policyID: string; policyName?: string; onSuccess: (reportID: string) => void; personalDetails?: PersonalDetails}) => {
            const accountID = currentUserLoginAndAccountID?.accountID;
            if (!accountID) {
                return;
            }

            const personalDetailsForCreation = personalDetails ?? (getPersonalDetailsForAccountID(accountID) as PersonalDetails | undefined);
            if (!personalDetailsForCreation) {
                return;
            }

            const executeCreate = () => {
                const {reportID: createdReportID} = createNewReport(personalDetailsForCreation, isASAPSubmitBetaEnabled, hasViolations, policyID);
                onSuccess(createdReportID);
            };

            if (hasEmptyReportsForPolicy(reports, policyID, accountID)) {
                setPendingReportCreation({
                    policyID,
                    policyName,
                    onConfirm: executeCreate,
                });
                return;
            }

            executeCreate();
        },
        [currentUserLoginAndAccountID?.accountID, hasViolations, isASAPSubmitBetaEnabled, reports, setPendingReportCreation],
    );

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
                activePolicyID,
                savedSearches,
                isOffline,
                defaultExpensifyCard,
                isASAPSubmitBetaEnabled,
                hasViolations,
                createReportWithConfirmation,
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
            createReportWithConfirmation,
            icons,
        ],
    );

    return {typeMenuSections, CreateReportConfirmationModal};
};

export default useSearchTypeMenuSections;
