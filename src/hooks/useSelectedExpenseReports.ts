import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';

import ONYXKEYS from '@src/ONYXKEYS';
import type {Report} from '@src/types/onyx';

import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';

import useOnyx from './useOnyx';

type PolicyExpenseParticipant = {
    /** The report ID of the participant */
    reportID?: string;

    /** Whether the participant is a policy expense chat */
    isPolicyExpenseChat?: boolean;
};

/**
 * Resolves the expense reports for the policy expense chat participants without subscribing the consumer to the
 * entire reports collection. Returns a `getReportByID` resolver so callers only re-render when one of the relevant
 * reports changes.
 */
export default function useSelectedExpenseReports(participants: readonly PolicyExpenseParticipant[]) {
    const expenseReportIDs = participants
        .filter((participant): participant is PolicyExpenseParticipant & {reportID: string} => !!participant.isPolicyExpenseChat && !!participant.reportID)
        .map((participant) => participant.reportID);

    // Serialized key used to refresh the selector only when the set of relevant report IDs actually changes.
    const expenseReportIDsKey = expenseReportIDs.join(',');

    const [expenseReports] = useOnyx(
        ONYXKEYS.COLLECTION.REPORT,
        {
            selector: (reports: OnyxCollection<Report>) => {
                const result: OnyxCollection<Report> = {};
                for (const reportID of expenseReportIDs) {
                    const key = `${ONYXKEYS.COLLECTION.REPORT}${getNonEmptyStringOnyxID(reportID)}` as const;
                    result[key] = reports?.[key];
                }
                return result;
            },
        },
        [expenseReportIDsKey],
    );

    return (reportID: string | undefined): OnyxEntry<Report> => expenseReports?.[`${ONYXKEYS.COLLECTION.REPORT}${getNonEmptyStringOnyxID(reportID)}`];
}
