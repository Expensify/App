/**
 * Measures one @mention lookup in the composer of a workspace room, for accounts with many personal details and rooms
 * with many participants. Each measured run renders the real SuggestionMention with the text `@al`, which runs
 * getUserMentionOptions (weighting every personal detail, filtering, sorting) and renders the suggestion list.
 *
 * Run with: npx jest --testMatch '<rootDir>/tests/perf-local/SuggestionMention.perf-local.tsx' --runInBand
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

// One first name in ten contains "al", so a stable tenth of the personal details match the `@al` search.
const FIRST_NAMES = ['Alice', 'Bob', 'Chris', 'Dana', 'Evan', 'Fiona', 'Greg', 'Hugo', 'Ivy', 'Jon'];

type MentionSuggestionsProps = {
    mentions: Mention[];
};

let mockPersonalDetails: PersonalDetailsList = {};
let mockPolicy: Policy | undefined;
let mockLastMentions: Mention[] = [];

const mockCollator = getCollator(CONST.LOCALES.EN);
const mockTranslate: ReturnType<typeof useLocalize>['translate'] = (key) => String(key);
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
    return (
        <SuggestionMention
            value={value}
            selection={{start: value.length, end: value.length}}
            setSelection={() => {}}
            updateComment={() => {}}
            isAutoSuggestionPickerLarge
            measureParentContainerAndReportCursor={() => {}}
            isComposerFocused
            isGroupPolicyReport
            policyID={POLICY_ID}
        />
    );
}

function writeResult(label: string, result: {meanDuration: number; stdevDuration: number; durations: number[]; runs: number; outlierDurations?: number[]}) {
    // Written to stdout directly so the numbers reach the CI log even when Jest runs with --silent.
    const durations = result.durations.map((duration) => duration.toFixed(1)).join(', ');
    const outliers = (result.outlierDurations ?? []).map((duration) => duration.toFixed(1)).join(', ');
    process.stdout.write(
        `[SuggestionMentionBench] ${label} mean=${result.meanDuration.toFixed(1)}ms stdev=${result.stdevDuration.toFixed(1)}ms runs=${result.runs} durations=[${durations}] outliers=[${outliers}]\n`,
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
                act(() => {
                    rerender(renderComposer('@al'));
                });
                if (mockLastMentions.length > 0) {
                    completedLookups++;
                }
            },
            {
                beforeEach: () => {
                    act(() => {
                        rerender(renderComposer(''));
                    });
                    mockLastMentions = [];
                },
            },
        );

        writeResult(`details=${personalDetailsCount} participants=${participantsCount}`, result);
        unmount();

        // Every measured run (plus the warmup run) produced the suggestion list, so the timing covers a real lookup.
        expect(completedLookups).toBe(result.runs + result.warmupDurations.length);
        expect(mockLastMentions).toHaveLength(CONST.AUTO_COMPLETE_SUGGESTER.MAX_AMOUNT_OF_SUGGESTIONS);
    });
});
