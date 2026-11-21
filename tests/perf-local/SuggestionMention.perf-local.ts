// cspell:ignore Aiko Lucía Élodie Søren Müller Ivanov Okafor northwind -- fake names and e-mail domains in the benchmark data
/**
 * Measures one @mention lookup in the composer, for accounts with many personal details. Each measured run renders the real
 * SuggestionMention with a typed mention, which runs getUserMentionOptions (weighting every personal detail in rooms,
 * filtering, ordering) and renders the suggestion list.
 * - The first suite types `@al` in workspace rooms with many participants.
 * - The second suite types `@`, `@a` and `@jo` in a direct message and in a workspace room, with the personal details also
 *   in the Onyx store that display names are read from, and prints a fingerprint of the suggestions it shows.
 *
 * Run with: npm run perf-local -- --testMatch '<rootDir>/tests/perf-local/SuggestionMention.perf-local.ts'
 * It prints one line per scenario, so it also runs under plain Jest:
 * npx jest --testMatch '<rootDir>/tests/perf-local/SuggestionMention.perf-local.ts' --runInBand
 */
import {act, render} from '@testing-library/react-native';

import PlaceholderIcon from '@components/Icon/PlaceholderIcon';
import type Mention from '@components/MentionSuggestions/types';
import {usePersonalDetails} from '@components/OnyxListItemProvider';

import useArrowKeyFocusManager from '@hooks/useArrowKeyFocusManager';
import {useCurrentReportIDState} from '@hooks/useCurrentReportID';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useDebounce from '@hooks/useDebounce';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import usePolicy from '@hooks/usePolicy';

import getCollator from '@libs/CollatorUtils';

import SuggestionMention from '@pages/inbox/report/ReportActionCompose/SuggestionMention';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {PersonalDetailsList, Policy, PolicyEmployeeList, Report} from '@src/types/onyx';
import type {Participants} from '@src/types/onyx/Report';

import React from 'react';
import Onyx from 'react-native-onyx';
import {measureFunction} from 'reassure';

import createMock from '../utils/createMock';

const POLICY_ID = 'policyID';
const REPORT_ID = 'room1';
const CURRENT_USER_ACCOUNT_ID = 1;
const FIRST_DETAIL_ACCOUNT_ID = 1000;
const RUNS = 10;
const WARMUP_RUNS = 1;

// One first name in ten contains "al", so a stable tenth of the personal details match the `@al` search.
const FIRST_NAMES = ['Alice', 'Bob', 'Chris', 'Dana', 'Evan', 'Fiona', 'Greg', 'Hugo', 'Ivy', 'Jon'];

type MentionSuggestionsProps = {
    mentions: Mention[];
};

let mockPersonalDetails: PersonalDetailsList = {};
let mockPolicy: Policy | undefined;
let mockLastMentions: Mention[] = [];

const mockCollator = getCollator(CONST.LOCALES.EN);
const mockTranslate: ReturnType<typeof useLocalize>['translate'] = (key, ...parameters) => {
    for (const parameter of parameters) {
        if (parameter) {
            return String(key);
        }
    }
    return String(key);
};
const mockLocalize = createMock<ReturnType<typeof useLocalize>>({
    translate: mockTranslate,
    formatPhoneNumber: (value: string) => value,
    localeCompare: (first: string, second: string) => mockCollator.compare(first, second),
    preferredLocale: CONST.LOCALES.EN,
});
const mockIcons = createMock<ReturnType<typeof useMemoizedLazyExpensifyIcons>>({Megaphone: PlaceholderIcon, FallbackAvatar: PlaceholderIcon});

jest.mock('@components/MentionSuggestions', () => {
    const module = {
        default: (props: MentionSuggestionsProps) => {
            mockLastMentions = props.mentions;
            return null;
        },
    };
    Object.defineProperty(module, '__esModule', {value: true});
    return module;
});
jest.mock('@components/OnyxListItemProvider', () => ({
    usePersonalDetails: jest.fn(),
}));
jest.mock('@hooks/useArrowKeyFocusManager', () => jest.fn());
jest.mock('@hooks/useCurrentReportID', () => ({
    useCurrentReportIDState: jest.fn(),
}));
jest.mock('@hooks/useCurrentUserPersonalDetails', () => jest.fn());
jest.mock('@hooks/useDebounce', () => jest.fn());
jest.mock('@hooks/useLazyAsset', () => ({
    useMemoizedLazyExpensifyIcons: jest.fn(),
}));
jest.mock('@hooks/useLocalize', () => jest.fn());
jest.mock('@hooks/usePolicy', () => jest.fn());
jest.mock('@libs/actions/Report', () => ({
    searchInServer: jest.fn(),
    searchUserInServer: jest.fn(),
}));

/** Builds the personal details of the account and a workspace whose employees are every other one of them. */
function buildAccount(personalDetailsCount: number) {
    const personalDetails: PersonalDetailsList = {};
    const employeeList: PolicyEmployeeList = {};
    for (let index = 0; index < personalDetailsCount; index++) {
        const accountID = FIRST_DETAIL_ACCOUNT_ID + index;
        const login = `user${accountID}@example.com`;
        const firstName = FIRST_NAMES[index % FIRST_NAMES.length];
        personalDetails[accountID] = {accountID, login, firstName, lastName: `N${accountID}`, displayName: `${firstName} N${accountID}`};
        if (index % 2 === 0) {
            employeeList[login] = {email: login, role: CONST.POLICY.ROLE.USER};
        }
    }
    const policy = createMock<Policy>({id: POLICY_ID, type: CONST.POLICY.TYPE.CORPORATE, employeeList});
    return {personalDetails, policy};
}

/** A workspace room whose participants are the first `participantsCount` personal details. */
function buildRoom(participantsCount: number): Report {
    const participants: Participants = {};
    for (let index = 0; index < participantsCount; index++) {
        participants[FIRST_DETAIL_ACCOUNT_ID + index] = {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS};
    }
    return createMock<Report>({
        reportID: REPORT_ID,
        type: CONST.REPORT.TYPE.CHAT,
        chatType: CONST.REPORT.CHAT_TYPE.POLICY_ROOM,
        policyID: POLICY_ID,
        reportName: '#large-room',
        participants,
    });
}

function renderComposer(value: string) {
    return React.createElement(SuggestionMention, {
        value,
        selection: {start: value.length, end: value.length},
        setSelection: () => {},
        updateComment: () => {},
        isAutoSuggestionPickerLarge: true,
        measureParentContainerAndReportCursor: () => {},
        isComposerFocused: true,
        isGroupPolicyReport: true,
        policyID: POLICY_ID,
    });
}

function writeResult(label: string, result: {meanDuration: number; stdevDuration: number; durations: number[]; outlierDurations?: number[]}) {
    // Written to stdout directly so the numbers reach the CI log even when Jest runs with --silent.
    const durations = result.durations.map((duration) => duration.toFixed(1)).join(', ');
    const outliers = (result.outlierDurations ?? []).map((duration) => duration.toFixed(1)).join(', ');
    process.stdout.write(
        `[SuggestionMentionBench] ${label} mean=${result.meanDuration.toFixed(1)}ms stdev=${result.stdevDuration.toFixed(1)}ms runs=${RUNS} durations=[${durations}] outliers=[${outliers}]\n`,
    );
}

const SCENARIOS = [
    {personalDetailsCount: 17_000, participantsCount: 5},
    {personalDetailsCount: 17_000, participantsCount: 100},
    {personalDetailsCount: 17_000, participantsCount: 500},
    {personalDetailsCount: 17_000, participantsCount: 2_000},
    {personalDetailsCount: 5_000, participantsCount: 5_000},
];

describe('SuggestionMention @mention lookup in a workspace room', () => {
    beforeEach(() => {
        jest.mocked(usePersonalDetails).mockImplementation(() => mockPersonalDetails);
        jest.mocked(useArrowKeyFocusManager).mockReturnValue([0, () => {}]);
        jest.mocked(useCurrentReportIDState).mockReturnValue({currentReportID: REPORT_ID});
        jest.mocked(useCurrentUserPersonalDetails).mockReturnValue({accountID: CURRENT_USER_ACCOUNT_ID, login: 'current@example.com'});
        // Run the debounced lookup right away so each measured render includes it.
        jest.mocked(useDebounce).mockImplementation((callback) => {
            const callbackRef = React.useRef(callback);
            callbackRef.current = callback;
            return React.useCallback((...args: unknown[]) => callbackRef.current(...args), []) as typeof callback;
        });
        jest.mocked(useMemoizedLazyExpensifyIcons).mockImplementation(() => mockIcons);
        jest.mocked(useLocalize).mockImplementation(() => mockLocalize);
        jest.mocked(usePolicy).mockImplementation(() => mockPolicy);
    });

    afterEach(async () => {
        await act(async () => {
            await Onyx.clear();
        });
    });

    test.each(SCENARIOS)('$personalDetailsCount personal details, $participantsCount room participants', async ({personalDetailsCount, participantsCount}) => {
        const {personalDetails, policy} = buildAccount(personalDetailsCount);
        mockPersonalDetails = personalDetails;
        mockPolicy = policy;
        await act(async () => {
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, buildRoom(participantsCount));
        });

        const {rerender, unmount} = render(renderComposer(''));
        let completedLookups = 0;

        const result = await measureFunction(
            () => {
                rerender(renderComposer('@al'));
                if (mockLastMentions.length > 0) {
                    completedLookups++;
                }
            },
            {
                runs: RUNS,
                warmupRuns: WARMUP_RUNS,
                // The numbers are written to stdout below, so this also runs under plain Jest, which has no .reassure output folder
                writeFile: false,
                beforeEach: () => {
                    rerender(renderComposer(''));
                    mockLastMentions = [];
                },
            },
        );

        writeResult(`details=${personalDetailsCount} participants=${participantsCount}`, result);
        unmount();

        // Every measured run (plus the warmup run) produced the suggestion list, so the timing covers a real lookup.
        expect(completedLookups).toBe(RUNS + WARMUP_RUNS);
        expect(mockLastMentions).toHaveLength(CONST.AUTO_COMPLETE_SUGGESTER.MAX_AMOUNT_OF_SUGGESTIONS);
    });
});

// Fake names for the second suite. Accents and repeated names make the display name comparison do real work.
const BENCH_FIRST_NAMES = [
    'James',
    'Mary',
    'John',
    'Patricia',
    'Robert',
    'Jennifer',
    'Michael',
    'Linda',
    'David',
    'Elizabeth',
    'Joseph',
    'Sarah',
    'Chris',
    'Karen',
    'Aiko',
    'Priya',
    'Lucía',
    'Élodie',
    'Søren',
    'Zoë',
];
const BENCH_LAST_NAMES = [
    'Smith',
    'Johnson',
    'Williams',
    'Brown',
    'Jones',
    'Garcia',
    'Miller',
    'Davis',
    'Lopez',
    'Wilson',
    'Anderson',
    'Taylor',
    'Moore',
    'Lee',
    'Nguyen',
    'Kim',
    'Patel',
    'Müller',
    'Ivanov',
    'Okafor',
];
const BENCH_DOMAINS = ['acme.com', 'example.org', 'contoso.com', 'northwind.io'];

/** Personal details with fake names in a fixed pseudo-random order, a workspace whose employees are one in 34 of them, and room participants one in 340 */
function buildNamedAccount(personalDetailsCount: number) {
    // Park-Miller generator, so every run gets the same people
    let seed = personalDetailsCount;
    const nextRandom = () => {
        seed = (seed * 48271) % 2147483647;
        return seed / 2147483647;
    };
    const pick = (values: string[]) => values.at(Math.floor(nextRandom() * values.length)) ?? '';

    const personalDetails: PersonalDetailsList = {};
    const employeeList: PolicyEmployeeList = {};
    const participants: Participants = {};
    for (let index = 0; index < personalDetailsCount; index++) {
        const accountID = FIRST_DETAIL_ACCOUNT_ID + index;
        const firstName = pick(BENCH_FIRST_NAMES);
        const lastName = pick(BENCH_LAST_NAMES);
        const login = `${firstName}.${lastName}${index}@${pick(BENCH_DOMAINS)}`.toLowerCase();
        // People who never set a name have their login as display name
        const hasName = nextRandom() < 0.8;
        personalDetails[accountID] = {
            accountID,
            login,
            displayName: hasName ? `${firstName} ${lastName}` : login,
            firstName: hasName ? firstName : '',
            lastName: hasName ? lastName : '',
        };
        if (index % 34 === 0) {
            employeeList[login] = {email: login, role: CONST.POLICY.ROLE.USER};
        }
        if (index % 340 === 0) {
            participants[accountID] = {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS};
        }
    }
    const policy = createMock<Policy>({id: POLICY_ID, type: CONST.POLICY.TYPE.CORPORATE, employeeList});
    const room = createMock<Report>({
        reportID: REPORT_ID,
        type: CONST.REPORT.TYPE.CHAT,
        chatType: CONST.REPORT.CHAT_TYPE.POLICY_ROOM,
        policyID: POLICY_ID,
        reportName: '#room',
        participants,
    });
    const directMessage = createMock<Report>({
        reportID: REPORT_ID,
        type: CONST.REPORT.TYPE.CHAT,
        participants: {
            [CURRENT_USER_ACCOUNT_ID]: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS},
            [FIRST_DETAIL_ACCOUNT_ID]: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS},
        },
    });
    return {personalDetails, policy, room, directMessage};
}

/** A short fingerprint of the suggestions shown, so two builds can be checked for the same list in the same order */
function getSuggestionsFingerprint(mentions: Mention[]) {
    const text = mentions.map((mention) => `${mention.text}|${mention.alternateText}|${mention.handle ?? ''}`).join('\n');
    let hash = 0;
    for (const character of text) {
        hash = (hash * 31 + (character.codePointAt(0) ?? 0)) % 1_000_000_007;
    }
    return `${mentions.length}:${hash}:${mentions.at(1)?.handle ?? mentions.at(0)?.handle ?? ''}`;
}

const LOOKUP_SCENARIOS = [2_000, 5_000, 17_000].flatMap((personalDetailsCount) =>
    (['directMessage', 'room'] as const).flatMap((chat) => ['@', '@a', '@jo'].map((typedText) => ({personalDetailsCount, chat, typedText}))),
);

describe('SuggestionMention @mention lookup by typed text, in a direct message and in a workspace room', () => {
    beforeEach(() => {
        jest.mocked(usePersonalDetails).mockImplementation(() => mockPersonalDetails);
        jest.mocked(useArrowKeyFocusManager).mockReturnValue([0, () => {}]);
        jest.mocked(useCurrentReportIDState).mockReturnValue({currentReportID: REPORT_ID});
        jest.mocked(useCurrentUserPersonalDetails).mockReturnValue({accountID: CURRENT_USER_ACCOUNT_ID, login: 'current@example.com'});
        // Run the debounced lookup right away so each measured render includes it.
        jest.mocked(useDebounce).mockImplementation((callback) => {
            const callbackRef = React.useRef(callback);
            callbackRef.current = callback;
            return React.useCallback((...args: unknown[]) => callbackRef.current(...args), []) as typeof callback;
        });
        jest.mocked(useMemoizedLazyExpensifyIcons).mockImplementation(() => mockIcons);
        jest.mocked(useLocalize).mockImplementation(() => mockLocalize);
        jest.mocked(usePolicy).mockImplementation(() => mockPolicy);
    });

    afterEach(async () => {
        await act(async () => {
            await Onyx.clear();
        });
    });

    test.each(LOOKUP_SCENARIOS)('$personalDetailsCount personal details, $chat, typing $typedText', async ({personalDetailsCount, chat, typedText}) => {
        const {personalDetails, policy, room, directMessage} = buildNamedAccount(personalDetailsCount);
        mockPersonalDetails = personalDetails;
        mockPolicy = policy;
        await act(async () => {
            // The sort reads display names from the personal details store, so it gets the same people
            await Onyx.set(ONYXKEYS.PERSONAL_DETAILS_LIST, personalDetails);
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, chat === 'room' ? room : directMessage);
        });

        const {rerender, unmount} = render(renderComposer(''));
        let completedLookups = 0;

        const result = await measureFunction(
            () => {
                rerender(renderComposer(typedText));
                if (mockLastMentions.length > 0) {
                    completedLookups++;
                }
            },
            {
                runs: RUNS,
                warmupRuns: WARMUP_RUNS,
                // The numbers are written to stdout below, so this also runs under plain Jest, which has no .reassure output folder
                writeFile: false,
                beforeEach: () => {
                    rerender(renderComposer(''));
                    mockLastMentions = [];
                },
            },
        );

        writeResult(`lookup details=${personalDetailsCount} chat=${chat} typed=${typedText} suggestions=${getSuggestionsFingerprint(mockLastMentions)}`, result);
        unmount();

        // Every measured run (plus the warmup run) produced the suggestion list, so the timing covers a real lookup.
        expect(completedLookups).toBe(RUNS + WARMUP_RUNS);
        expect(mockLastMentions).toHaveLength(CONST.AUTO_COMPLETE_SUGGESTER.MAX_AMOUNT_OF_SUGGESTIONS);
    });
});
