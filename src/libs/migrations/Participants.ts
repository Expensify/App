import Onyx from 'react-native-onyx';
import type {NullishDeep, OnyxCollection} from 'react-native-onyx';
import Log from '@libs/Log';
import * as ReportConnection from '@libs/ReportConnection';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report} from '@src/types/onyx';
import type {Participants} from '@src/types/onyx/Report';

type ReportKey = `${typeof ONYXKEYS.COLLECTION.REPORT}${string}`;
type OldReport = Report & {participantAccountIDs?: number[]; visibleChatMemberAccountIDs?: number[]};
type OldReportCollection = Record<ReportKey, NullishDeep<OldReport>>;

function getReports(): Promise<OnyxCollection<OldReport>> {
    return new Promise((resolve) => {
        resolve(ReportConnection.getAllReports());
    });
}

function getCurrentUserAccountID(): Promise<number | undefined> {
    return new Promise((resolve) => {
        const connectionID = Onyx.connect({
            key: ONYXKEYS.SESSION,
            callback: (session) => {
                Onyx.disconnect(connectionID);
                return resolve(session?.accountID);
            },
        });
    });
}

export default function (): Promise<void> {
    return Promise.all([getCurrentUserAccountID(), getReports()]).then(([currentUserAccountID, reports]) => {
        if (!reports) {
            Log.info('[Migrate Onyx] Skipped Participants migration because there are no reports');
            return;
        }

        const collection = Object.entries(reports).reduce<OldReportCollection>((reportsCollection, [onyxKey, report]) => {
            // If we have non-empty participantAccountIDs then this report is eligible for migration
            if (report?.participantAccountIDs?.length) {
                const participants: NullishDeep<Participants> = {};

                const deprecatedParticipants = new Set(report.participantAccountIDs);
                const deprecatedVisibleParticipants = new Set(report.visibleChatMemberAccountIDs);

                // Check all possible participants because some of these may be invalid https://github.com/Expensify/App/pull/40254#issuecomment-2096867084
                const possibleParticipants = new Set([
                    ...report.participantAccountIDs,
                    ...Object.keys(report.participants ?? {}).map(Number),
                    ...(currentUserAccountID !== undefined ? [currentUserAccountID] : []),
                ]);

                possibleParticipants.forEach((accountID) => {
                    if (deprecatedParticipants.has(accountID) || accountID === currentUserAccountID) {
                        participants[accountID] = {
                            hidden: report.participants?.[accountID]?.hidden ?? (!deprecatedVisibleParticipants.has(accountID) && accountID !== currentUserAccountID),
                        };
                    } else {
                        participants[accountID] = null;
                    }
                });

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
