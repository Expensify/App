import type {ConciergePendingFollowupList, PersonalDetailsList} from '@src/types/onyx';
import type Report from '@src/types/onyx/Report';

import type {OnyxEntry} from 'react-native-onyx';

const getReportParticipantAccountIDs = (report: OnyxEntry<Report>): number[] => (report?.participants ? Object.keys(report.participants).map(Number) : []);

/**
 * Returns the first participant accountID flagged as a custom agent (`isCustomAgent` on its
 * personalDetails entry, stamped server-side in `Account::formatNewDotPersonalDetails`), or
 * `undefined` when no participant is an agent.
 *
 * Parameterized so the closure captures only the report's small `participantAccountIDs` array —
 * the selector iterates those (small N) against `personalDetailsList`, not the full list. Output
 * is a primitive `number | undefined`, so `deepEqual` short-circuits cheaply and re-renders fire
 * only when an agent participant's flag flips.
 */
const getCustomAgentParticipantAccountID =
    (participantAccountIDs: number[] | undefined) =>
    (personalDetails: OnyxEntry<PersonalDetailsList>): number | undefined => {
        if (!participantAccountIDs?.length || !personalDetails) {
            return undefined;
        }
        return participantAccountIDs.find((accountID) => !!personalDetails[accountID]?.isCustomAgent);
    };

const hasPendingFollowupListSkeletonSelector =
    (reportActionID: string) =>
    (pending: OnyxEntry<ConciergePendingFollowupList>): boolean =>
        !pending?.hidden && pending?.reportActionID === reportActionID;

export {getReportParticipantAccountIDs, getCustomAgentParticipantAccountID, hasPendingFollowupListSkeletonSelector};
