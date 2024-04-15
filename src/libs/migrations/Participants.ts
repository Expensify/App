import Onyx from 'react-native-onyx';
import type {NullishDeep, OnyxCollection} from 'react-native-onyx';
import Log from '@libs/Log';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report} from '@src/types/onyx';
import type {Participant, Participants} from '@src/types/onyx/Report';

type ReportKey = `${typeof ONYXKEYS.COLLECTION.REPORT}${string}`;
type OldReport = Report & {participantAccountIDs?: number[]; visibleChatMemberAccountIDs?: number[]};
type OldReportCollection = Record<ReportKey, NullishDeep<OldReport>>;

function getReports(): Promise<OnyxCollection<OldReport>> {
    return new Promise((resolve) => {
        const connectionID = Onyx.connect({
            key: ONYXKEYS.COLLECTION.REPORT,
            waitForCollectionCallback: true,
            callback: (reports) => {
                Onyx.disconnect(connectionID);
                return resolve(reports);
            },
        });
    });
}

export default function (): Promise<void> {
    return getReports().then((reports) => {
        if (!reports) {
            Log.info('[Migrate Onyx] Skipped Participants migration because there are no reports');
            return;
        }

        const collection = Object.entries(reports).reduce<OldReportCollection>((reportsCollection, [onyxKey, report]) => {
            // If we have participantAccountIDs then this report is eligible for migration
            if (report?.participantAccountIDs) {
                const visibleParticipants = new Set(report.visibleChatMemberAccountIDs);
                const participants = report.participantAccountIDs.reduce<Participants>((reportParticipants, accountID) => {
                    const participant: Participant = {
                        hidden: !visibleParticipants.has(accountID),
                    };

                    // eslint-disable-next-line no-param-reassign
                    reportParticipants[accountID] = participant;
                    return reportParticipants;
                }, {});

                // eslint-disable-next-line no-param-reassign
                reportsCollection[onyxKey as ReportKey] = {
                    participants,
                    participantAccountIDs: null,
                    visibleChatMemberAccountIDs: null,
                };
            }

            return reportsCollection;
        }, {});

        // eslint-disable-next-line rulesdir/prefer-actions-set-data
        return Onyx.mergeCollection(ONYXKEYS.COLLECTION.REPORT, collection).then(() => Log.info('[Migrate Onyx] Ran migration Participants successfully'));
    });
}
