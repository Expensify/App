import {useMemo} from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import {getPolicyExpenseChat} from '@libs/ReportUtils';
import shouldUseDefaultExpensePolicy from '@libs/shouldUseDefaultExpensePolicy';
import {getMoneyRequestParticipantsFromReport} from '@userActions/IOU/MoneyRequest';
import type {IOUType} from '@src/CONST';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report, Transaction} from '@src/types/onyx';
import type {Participant} from '@src/types/onyx/IOU';
import useCurrentUserPersonalDetails from './useCurrentUserPersonalDetails';
import useDefaultExpensePolicy from './useDefaultExpensePolicy';
import useOnyx from './useOnyx';
import usePersonalPolicy from './usePersonalPolicy';
import useSelfDMReport from './useSelfDMReport';

type UseDefaultParticipantsParams = {
    /** The report the expense is being created from. Participants are derived from this report when it has any. */
    sourceReport: OnyxEntry<Report>;

    /** The current draft transaction, used to detect the global-create (FAB) entry point. */
    transaction: OnyxEntry<Transaction>;

    /** The IOU type from the route params. */
    iouType?: IOUType;
};

/**
 * Resolves the participants an expense should be created with.
 *
 * First it derives participants from the source report (workspace-chat entry point). When there are none and the
 * expense is started from the global "Create" (FAB) entry point, it falls back to the default expense policy chat
 * (or the selfDM report when auto-reporting is off), mirroring the resolution the confirmation step performs.
 *
 * Shared by `useResetIOUType` (to seed the freshly-rebuilt transaction so the confirmation's auto-assign effect
 * short-circuits) and `IOURequestStepConfirmation` (to compute the participants it auto-assigns) so both stay in sync.
 */
function useDefaultParticipants({sourceReport, transaction, iouType}: UseDefaultParticipantsParams): Participant[] {
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const defaultExpensePolicy = useDefaultExpensePolicy();
    const personalPolicy = usePersonalPolicy();
    const selfDMReport = useSelfDMReport();
    const [amountOwed] = useOnyx(ONYXKEYS.NVP_PRIVATE_AMOUNT_OWED);
    const [userBillingGracePeriodEnds] = useOnyx(ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_USER_BILLING_GRACE_PERIOD_END);
    const [ownerBillingGracePeriodEnd] = useOnyx(ONYXKEYS.NVP_PRIVATE_OWNER_BILLING_GRACE_PERIOD_END);

    const accountID = currentUserPersonalDetails.accountID;

    return useMemo(() => {
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
}

export default useDefaultParticipants;
