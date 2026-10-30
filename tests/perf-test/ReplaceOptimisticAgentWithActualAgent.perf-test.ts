import type * as ReplacementModule from '@libs/actions/replaceOptimisticAgentWithActualAgent';

import CONST from '@src/CONST';
import type * as OnyxKeysModule from '@src/ONYXKEYS';
import type {Report} from '@src/types/onyx';
import type {Participant} from '@src/types/onyx/Report';

import {measureAsyncFunction} from 'reassure';

const REPORT_COUNT = 10000;
const OPTIMISTIC_ACCOUNT_ID = 7123456789012345;
const REAL_ACCOUNT_ID = 12001;
const RETAINED_MAPPINGS = {
    [OPTIMISTIC_ACCOUNT_ID]: REAL_ACCOUNT_ID,
    [OPTIMISTIC_ACCOUNT_ID + 1]: REAL_ACCOUNT_ID + 1,
    [OPTIMISTIC_ACCOUNT_ID + 2]: REAL_ACCOUNT_ID + 2,
};

let mockReports: Record<string, Report> = {};
let mockMappingCallback: (mapping: typeof RETAINED_MAPPINGS) => void;
let mockCompleteReplacement: () => void;
const mockMerge = jest.fn<Promise<void>, [string, unknown]>(() => Promise.resolve());
const mockUpdate = jest.fn<Promise<void>, [unknown]>(() => Promise.resolve());
const mockGetRootState = jest.fn(() => ({routes: []}));

// Storage and navigation are outside this CPU benchmark. The production listener, batching and report scan run unchanged.
jest.mock('react-native-onyx', () => ({
    init: jest.fn(),
    clear: jest.fn(() => Promise.resolve()),
    connectWithoutView: ({key, callback}: {key: string; callback: (value: unknown) => void}) => {
        const keys = jest.requireActual<typeof OnyxKeysModule>('@src/ONYXKEYS').default;
        if (key === keys.COLLECTION.REPORT) {
            callback(mockReports);
        } else if (key === keys.COLLECTION.AGENT) {
            callback({});
        } else if (key === keys.OPTIMISTIC_AGENT_ACCOUNT_ID_MAPPING) {
            mockMappingCallback = callback;
        }
    },
    merge: mockMerge,
    update: mockUpdate,
}));
jest.mock('@libs/PersonalDetailsStore', () => ({getPersonalDetail: () => undefined, personalDetailsHydrationPromise: Promise.resolve()}));
jest.mock('@libs/PersonalDetailsUtils', () => ({buildPersonalDetailsUpdate: jest.fn()}));
jest.mock('@libs/Navigation/Navigation', () => ({
    __esModule: true,
    default: {isNavigationReady: () => Promise.resolve(), setParams: jest.fn()},
    navigationRef: {isReady: () => true, getRootState: () => mockGetRootState()},
}));
jest.mock('@libs/Navigation/TransitionTracker', () => ({
    runAfterTransitions: ({callback}: {callback: () => void}) => {
        callback();
        mockCompleteReplacement();
    },
}));

describe('retained agent mappings on startup', () => {
    test.each([
        {participantCount: 2, hasOrphanReport: false},
        {participantCount: 20, hasOrphanReport: false},
        {participantCount: 2, hasOrphanReport: true},
        {participantCount: 20, hasOrphanReport: true},
    ])('10,000 reports, $participantCount participants each, orphan repair: $hasOrphanReport', async ({participantCount, hasOrphanReport}) => {
        // Given retained mappings outlive agent cleanup, measure both normal reloads and report-only recovery.
        const participants: Record<number, Participant> = Object.fromEntries(
            Array.from({length: participantCount}, (_, index) => [index + 100, {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS}]),
        );
        const orphanReportID = String(REPORT_COUNT);
        const realParticipant = {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.DAILY};
        mockReports = Object.fromEntries(
            Array.from({length: REPORT_COUNT}, (_, index) => {
                const reportID = String(index + 1);
                return [`report_${reportID}`, {reportID, participants}];
            }),
        );
        if (hasOrphanReport) {
            mockReports[`report_${orphanReportID}`] = {
                reportID: orphanReportID,
                participants: {...participants, [OPTIMISTIC_ACCOUNT_ID]: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.HIDDEN}, [REAL_ACCOUNT_ID]: realParticipant},
            };
        }
        let replacementCompleted: Promise<void>;

        // When a fresh listener receives all mappings, await the scheduled scan rather than timing just its enqueue.
        await measureAsyncFunction(
            async () => {
                mockMappingCallback(RETAINED_MAPPINGS);
                await replacementCompleted;
            },
            {
                beforeEach: () => {
                    // Module loading and fixtures stay outside the measurement; resetting also clears per-tab deduplication.
                    jest.resetModules();
                    jest.clearAllMocks();
                    replacementCompleted = new Promise<void>((resolve) => {
                        mockCompleteReplacement = resolve;
                    });
                    require<typeof ReplacementModule>('@libs/actions/replaceOptimisticAgentWithActualAgent');
                },
                afterEach: () => {
                    // Then every sample really scans once, skips completed cleanup and preserves real participant details.
                    expect(mockGetRootState).toHaveBeenCalledTimes(1);
                    expect(mockUpdate).not.toHaveBeenCalled();
                    expect(mockMerge).toHaveBeenCalledTimes(hasOrphanReport ? 1 : 0);
                    if (hasOrphanReport) {
                        expect(mockMerge).toHaveBeenCalledWith(`report_${orphanReportID}`, {
                            participants: {[OPTIMISTIC_ACCOUNT_ID]: null, [REAL_ACCOUNT_ID]: realParticipant},
                        });
                    }
                },
            },
        );
    });
});
