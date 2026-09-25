import oneOnOneChatReportIDsConfig from '@libs/actions/OnyxDerived/configs/oneOnOneChatReportIDs';
import {buildParticipantsFromAccountIDs, getParticipantsChatKey} from '@libs/ReportUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report, Session} from '@src/types/onyx';

import type {OnyxCollection} from 'react-native-onyx';

const ME = 1;
const ALICE = 2;
const BOB = 3;

const session: Session = {accountID: ME};

function chatWith(reportID: string, otherAccountID: number): Report {
    return {
        reportID,
        type: CONST.REPORT.TYPE.CHAT,
        participants: buildParticipantsFromAccountIDs([ME, otherAccountID]),
    };
}

function collection(...reports: Report[]): OnyxCollection<Report> {
    return Object.fromEntries(reports.map((report) => [`${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`, report]));
}

function delta(...reports: Array<[string, Report | undefined]>) {
    return {
        [ONYXKEYS.COLLECTION.REPORT]: Object.fromEntries(reports.map(([reportID, report]) => [`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, report])),
    };
}

function index(reportIDs: Record<string, string>, accountID = ME) {
    return {reportIDs, accountID};
}

const aliceKey = getParticipantsChatKey([ME, ALICE]);
const bobKey = getParticipantsChatKey([ME, BOB]);

describe('oneOnOneChatReportIDs', () => {
    it('indexes 1:1 chats by participant set on a full compute', () => {
        const reports = collection(chatWith('10', ALICE), chatWith('20', BOB));

        expect(oneOnOneChatReportIDsConfig.compute([reports, session], {})).toEqual(index({[aliceKey]: '10', [bobKey]: '20'}));
    });

    it('adds a newly created chat without rebuilding', () => {
        const initial = collection(chatWith('10', ALICE));
        const currentValue = oneOnOneChatReportIDsConfig.compute([initial, session], {});

        const withBob = collection(chatWith('10', ALICE), chatWith('20', BOB));
        const next = oneOnOneChatReportIDsConfig.compute([withBob, session], {currentValue, sourceValues: delta(['20', chatWith('20', BOB)])});

        expect(next).toEqual(index({[aliceKey]: '10', [bobKey]: '20'}));
    });

    it('drops the entry when a chat is deleted', () => {
        const initial = collection(chatWith('10', ALICE), chatWith('20', BOB));
        const currentValue = oneOnOneChatReportIDsConfig.compute([initial, session], {});

        const withoutBob = collection(chatWith('10', ALICE));
        const next = oneOnOneChatReportIDsConfig.compute([withoutBob, session], {currentValue, sourceValues: delta(['20', undefined])});

        expect(next).toEqual(index({[aliceKey]: '10'}));
    });

    it('moves the entry when a chat changes participants', () => {
        const initial = collection(chatWith('10', ALICE));
        const currentValue = oneOnOneChatReportIDsConfig.compute([initial, session], {});

        const nowWithBob = collection(chatWith('10', BOB));
        const next = oneOnOneChatReportIDsConfig.compute([nowWithBob, session], {currentValue, sourceValues: delta(['10', chatWith('10', BOB)])});

        expect(next).toEqual(index({[bobKey]: '10'}));
    });

    it('keeps the first chat when two share a participant set, and leaves it alone when the other one goes', () => {
        const duplicates = collection(chatWith('10', ALICE), chatWith('20', ALICE));
        const currentValue = oneOnOneChatReportIDsConfig.compute([duplicates, session], {});
        expect(currentValue).toEqual(index({[aliceKey]: '10'}));

        const remaining = collection(chatWith('10', ALICE));
        const next = oneOnOneChatReportIDsConfig.compute([remaining, session], {currentValue, sourceValues: delta(['20', undefined])});

        expect(next).toEqual(index({[aliceKey]: '10'}));
    });

    it('promotes the remaining chat when the indexed one is deleted, as happens when an optimistic chat is replaced', () => {
        // The optimistic chat is indexed first, then the server report arrives on the same participants.
        const optimisticOnly = collection(chatWith('optimistic-1', ALICE));
        const afterOptimistic = oneOnOneChatReportIDsConfig.compute([optimisticOnly, session], {});
        expect(afterOptimistic).toEqual(index({[aliceKey]: 'optimistic-1'}));

        const bothReports = collection(chatWith('optimistic-1', ALICE), chatWith('30', ALICE));
        const afterServerReport = oneOnOneChatReportIDsConfig.compute([bothReports, session], {
            currentValue: afterOptimistic,
            sourceValues: delta(['30', chatWith('30', ALICE)]),
        });
        expect(afterServerReport).toEqual(index({[aliceKey]: 'optimistic-1'}));

        // The optimistic report is cleaned up, so the real one has to take over rather than the key disappearing.
        const serverOnly = collection(chatWith('30', ALICE));
        const afterCleanup = oneOnOneChatReportIDsConfig.compute([serverOnly, session], {
            currentValue: afterServerReport,
            sourceValues: delta(['optimistic-1', undefined]),
        });

        expect(afterCleanup).toEqual(index({[aliceKey]: '30'}));
    });

    it('rebuilds when SESSION carries a different account ID, because that changes what counts as a 1:1 chat', () => {
        const reports = collection(chatWith('10', ALICE), chatWith('20', BOB));
        const currentValue = oneOnOneChatReportIDsConfig.compute([reports, session], {});
        expect(currentValue).toEqual(index({[aliceKey]: '10', [bobKey]: '20'}));

        const asOutsider = oneOnOneChatReportIDsConfig.compute([reports, {accountID: 99}], {currentValue, sourceValues: {}, triggeredKeys: new Set([ONYXKEYS.SESSION])});

        expect(asOutsider).toEqual(index({}, 99));
    });

    it('keeps the index when SESSION changes without changing the account ID', () => {
        const reports = collection(chatWith('10', ALICE));
        const currentValue = oneOnOneChatReportIDsConfig.compute([reports, session], {});

        const withBob = collection(chatWith('10', ALICE), chatWith('20', BOB));
        const next = oneOnOneChatReportIDsConfig.compute([withBob, {accountID: ME, authToken: 'refreshed'}], {
            currentValue,
            sourceValues: {[ONYXKEYS.SESSION]: {authToken: 'refreshed'}},
            triggeredKeys: new Set([ONYXKEYS.SESSION]),
        });

        expect(next).toBe(currentValue);
    });

    it('rebuilds on the first compute after a reload, so a stale restored index is corrected', () => {
        const reports = collection(chatWith('10', ALICE));
        // Bob's chat was deleted after the index was last written, and Alice's chat arrived before the first compute.
        const staleValue = index({[bobKey]: '99'});

        // The engine's first flush has no baselines to diff against, so it passes no sourceValues, while
        // triggeredKeys holds every dependency.
        const next = oneOnOneChatReportIDsConfig.compute([reports, session], {
            currentValue: staleValue,
            triggeredKeys: new Set([ONYXKEYS.COLLECTION.REPORT, ONYXKEYS.SESSION]),
        });

        expect(next).toEqual(index({[aliceKey]: '10'}));
    });

    it('builds nothing until the current account ID is known', () => {
        const reports = collection(chatWith('10', ALICE));

        expect(oneOnOneChatReportIDsConfig.compute([reports, {}], {})).toEqual({reportIDs: {}});
    });
});
