import {isGroupPolicy} from '@libs/PolicyUtils';
import {getPolicyExpenseChat} from '@libs/ReportUtils';
import shouldUseDefaultExpensePolicy from '@libs/shouldUseDefaultExpensePolicy';

import {getMoneyRequestParticipantsFromReport} from '@userActions/IOU/MoneyRequest';

import type {IOUType} from '@src/CONST';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy, Report, Transaction} from '@src/types/onyx';
import type {Participant} from '@src/types/onyx/IOU';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';

import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';

import {useCallback, useMemo} from 'react';

import useCurrentUserPersonalDetails from './useCurrentUserPersonalDetails';
import useDefaultExpensePolicy from './useDefaultExpensePolicy';
import useOnyx from './useOnyx';
import usePersonalPolicy from './usePersonalPolicy';
import usePreferredPolicy from './usePreferredPolicy';
import {useResolvedSelfDMReport} from './useSelfDMReport';

type UseDefaultParticipantsParams = {
    /** The report the expense is being created from. Participants are derived from this report when it has any. */
    sourceReport: OnyxEntry<Report>;

    /** The current draft transaction, used to detect the global-create (FAB) entry point. */
    transaction: OnyxEntry<Transaction>;

    /** The IOU type from the route params. */
    iouType?: IOUType;
};

type UseDefaultParticipantsResult = {
    /** The participants the expense should be created with (empty until they can be resolved). */
    participants: Participant[];

    isLoading: boolean;
};

/**
 * Resolves the participants an expense should be created with.
 *
 * First it derives participants from the source report (workspace-chat entry point). When there are none and the
 * expense is started from the global "Create" (FAB) entry point, it falls back to the default expense policy chat
 * (or the selfDM report when auto-reporting is off or an explicit personal destination is selected, and always for
 * a track expense), mirroring the resolution the confirmation step performs. A restricted preferred workspace takes
 * precedence over an explicit personal destination.
 *
 * Shared by `useResetIOUType` (to seed the freshly-rebuilt transaction so the confirmation's auto-assign effect
 * short-circuits) and `IOURequestStepConfirmation` (to compute the participants it auto-assigns) so both stay in sync.
 */
function useDefaultParticipants({sourceReport, transaction, iouType}: UseDefaultParticipantsParams): UseDefaultParticipantsResult {
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const defaultExpensePolicy = useDefaultExpensePolicy();
    const personalPolicy = usePersonalPolicy();
    const {isRestrictedToPreferredPolicy} = usePreferredPolicy();
    const {selfDMReport, isLoading: isLoadingSelfDMReport} = useResolvedSelfDMReport();
    const [activePolicyID, activePolicyIDResult] = useOnyx(ONYXKEYS.NVP_ACTIVE_POLICY_ID);
    const hasExplicitPersonalDestinationSelector = useCallback(
        (policies: OnyxCollection<Policy>) => !!activePolicyID && !isGroupPolicy(policies?.[`${ONYXKEYS.COLLECTION.POLICY}${activePolicyID}`]),
        [activePolicyID],
    );
    const [hasExplicitPersonalDestination, policyCollectionResult] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {selector: hasExplicitPersonalDestinationSelector});
    const [amountOwed, amountOwedResult] = useOnyx(ONYXKEYS.NVP_PRIVATE_AMOUNT_OWED);
    const [userBillingGracePeriodEnds, userBillingGracePeriodEndsResult] = useOnyx(ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_USER_BILLING_GRACE_PERIOD_END);
    const [ownerBillingGracePeriodEnd, ownerBillingGracePeriodEndResult] = useOnyx(ONYXKEYS.NVP_PRIVATE_OWNER_BILLING_GRACE_PERIOD_END);
    const accountID = currentUserPersonalDetails.accountID;

    const isLoading =
        !accountID ||
        isLoadingSelfDMReport ||
        isLoadingOnyxValue(activePolicyIDResult, policyCollectionResult, amountOwedResult, userBillingGracePeriodEndsResult, ownerBillingGracePeriodEndResult);

    const participants = useMemo(() => {
        const reportParticipants = getMoneyRequestParticipantsFromReport(sourceReport, accountID).filter((participant) => participant.selected);
        if (reportParticipants.length > 0) {
            return reportParticipants;
        }

        const isGlobalCreateFlow = transaction?.isFromGlobalCreate ?? transaction?.isFromFloatingActionButton ?? iouType === CONST.IOU.TYPE.CREATE;
        if (!isGlobalCreateFlow || !iouType) {
            return [];
        }

        if (iouType === CONST.IOU.TYPE.TRACK) {
            return getMoneyRequestParticipantsFromReport(selfDMReport, accountID).filter((participant) => participant.selected);
        }

        if (hasExplicitPersonalDestination && !isRestrictedToPreferredPolicy) {
            return getMoneyRequestParticipantsFromReport(selfDMReport, accountID).filter((participant) => participant.selected);
        }

        const canUseDefaultPolicy = shouldUseDefaultExpensePolicy(iouType, defaultExpensePolicy, amountOwed, userBillingGracePeriodEnds, ownerBillingGracePeriodEnd, accountID);
        if (!canUseDefaultPolicy) {
            return [];
        }

        const shouldAutoReport = !!defaultExpensePolicy?.autoReporting || !!personalPolicy?.autoReporting;
        const defaultTargetReport = !shouldAutoReport ? selfDMReport : getPolicyExpenseChat(accountID, defaultExpensePolicy?.id);
        return getMoneyRequestParticipantsFromReport(defaultTargetReport, accountID).filter((participant) => participant.selected);
    }, [
        sourceReport,
        accountID,
        transaction?.isFromGlobalCreate,
        transaction?.isFromFloatingActionButton,
        iouType,
        hasExplicitPersonalDestination,
        isRestrictedToPreferredPolicy,
        defaultExpensePolicy,
        amountOwed,
        userBillingGracePeriodEnds,
        ownerBillingGracePeriodEnd,
        personalPolicy?.autoReporting,
        selfDMReport,
    ]);

    return useMemo(() => ({participants, isLoading}), [participants, isLoading]);
}

export default useDefaultParticipants;
