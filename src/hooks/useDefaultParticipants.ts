import {getPolicyExpenseChat} from '@libs/ReportUtils';
import shouldUseDefaultExpensePolicy from '@libs/shouldUseDefaultExpensePolicy';

import {getMoneyRequestParticipantsFromReport} from '@userActions/IOU/MoneyRequest';

import type {IOUType} from '@src/CONST';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report, Transaction} from '@src/types/onyx';
import type {Participant} from '@src/types/onyx/IOU';

import type {OnyxEntry} from 'react-native-onyx';

import {useMemo} from 'react';

import useCurrentUserPersonalDetails from './useCurrentUserPersonalDetails';
import useDefaultExpensePolicy from './useDefaultExpensePolicy';
import useOnyx from './useOnyx';
import usePersonalPolicy from './usePersonalPolicy';
import useSelfDMReport from './useSelfDMReport';

/**
 * Stable selector used purely to read a collection's load status without subscribing to its value. Returning a
 * constant keeps the selected value identical across updates, so these subscriptions only re-render on the
 * loading -> loaded transition rather than on every policy/report change.
 */
const readLoadStatusOnly = () => true;

type UseDefaultParticipantsParams = {
    /** The report the expense is being created from. Participants are derived from this report when it has any. */
    sourceReport: OnyxEntry<Report>;

    /** The current draft transaction, used to detect the global-create (FAB) entry point. */
    transaction: OnyxEntry<Transaction>;

    /** The IOU type from the route params. */
    iouType?: IOUType;
};

type DefaultParticipantsResult = {
    /** The participants an expense should be created with. */
    participants: Participant[];

    /** Whether the Onyx data that backs the resolution is still hydrating. While true, an empty `participants` list
     * means "not resolved yet" rather than "no default", so callers must not treat it as a final answer. */
    isLoading: boolean;
};

/**
 * Resolves the participants an expense should be created with.
 *
 * First it derives participants from the source report (workspace-chat entry point). When there are none and the
 * expense is started from the global "Create" (FAB) entry point, it falls back to the default expense policy chat
 * (or the selfDM report when auto-reporting is off), mirroring the resolution the confirmation step performs.
 *
 * Also reports whether the Onyx sources it depends on are still loading, so callers can distinguish "no default
 * participants" from "defaults not resolved yet" (e.g. to avoid briefly auto-opening the participant picker while
 * the policy/report data is still hydrating).
 *
 * Shared by `useResetIOUType` (to seed the freshly-rebuilt transaction so the confirmation's auto-assign effect
 * short-circuits) and `IOURequestStepConfirmation` (to compute the participants it auto-assigns) so both stay in sync.
 */
function useDefaultParticipants({sourceReport, transaction, iouType}: UseDefaultParticipantsParams): DefaultParticipantsResult {
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const defaultExpensePolicy = useDefaultExpensePolicy();
    const personalPolicy = usePersonalPolicy();
    const selfDMReport = useSelfDMReport();
    const [amountOwed, amountOwedMetadata] = useOnyx(ONYXKEYS.NVP_PRIVATE_AMOUNT_OWED);
    const [userBillingGracePeriodEnds, userBillingGracePeriodEndsMetadata] = useOnyx(ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_USER_BILLING_GRACE_PERIOD_END);
    const [ownerBillingGracePeriodEnd, ownerBillingGracePeriodEndMetadata] = useOnyx(ONYXKEYS.NVP_PRIVATE_OWNER_BILLING_GRACE_PERIOD_END);
    // Status-only subscriptions for the collections that back the fallback resolution (`defaultExpensePolicy` reads the
    // policy collection, `selfDMReport`/the policy expense chat read the report collection). See `readLoadStatusOnly`.
    const [, policyMetadata] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {selector: readLoadStatusOnly});
    const [, reportMetadata] = useOnyx(ONYXKEYS.COLLECTION.REPORT, {selector: readLoadStatusOnly});

    const accountID = currentUserPersonalDetails.accountID;

    const isLoading =
        amountOwedMetadata.status === 'loading' ||
        userBillingGracePeriodEndsMetadata.status === 'loading' ||
        ownerBillingGracePeriodEndMetadata.status === 'loading' ||
        policyMetadata.status === 'loading' ||
        reportMetadata.status === 'loading';

    const participants = useMemo(() => {
        const reportParticipants = getMoneyRequestParticipantsFromReport(sourceReport, accountID).filter((participant) => participant.selected);
        if (reportParticipants.length > 0) {
            return reportParticipants;
        }

        const isGlobalCreateFlow = transaction?.isFromGlobalCreate ?? transaction?.isFromFloatingActionButton ?? iouType === CONST.IOU.TYPE.CREATE;
        if (!isGlobalCreateFlow || !iouType) {
            return [];
        }

        const canUseDefaultPolicy = shouldUseDefaultExpensePolicy(iouType, defaultExpensePolicy, amountOwed, userBillingGracePeriodEnds, ownerBillingGracePeriodEnd, accountID);
        if (!canUseDefaultPolicy) {
            return [];
        }

        const shouldAutoReport = !!defaultExpensePolicy?.autoReporting || !!personalPolicy?.autoReporting;
        const defaultTargetReport = shouldAutoReport ? getPolicyExpenseChat(accountID, defaultExpensePolicy?.id) : selfDMReport;
        return getMoneyRequestParticipantsFromReport(defaultTargetReport, accountID).filter((participant) => participant.selected);
    }, [
        sourceReport,
        accountID,
        transaction?.isFromGlobalCreate,
        transaction?.isFromFloatingActionButton,
        iouType,
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
