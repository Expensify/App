import {act, render, waitFor} from '@testing-library/react-native';

import type {TextSelection} from '@components/Composer/types';
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

import {searchUserInServer} from '@libs/actions/Report';

import SuggestionMention from '@pages/inbox/report/ReportActionCompose/SuggestionMention';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {PersonalDetails, PersonalDetailsList, PolicyEmployeeList, Report} from '@src/types/onyx';

import React from 'react';
import Onyx from 'react-native-onyx';

import createRandomPolicy from '../utils/collections/policies';
import createMock from '../utils/createMock';
import {formatPhoneNumber, localeCompare} from '../utils/TestHelper';

type MentionSuggestionsProps = {
    mentions: Mention[];
    prefix: string;
    onSelect: (index: number) => void;
};

const mockMentionSuggestionsSpy = jest.fn<void, [MentionSuggestionsProps]>();
const mockSetHighlightedMentionIndex = jest.fn<void, [number]>();
const mockIcons = createMock<ReturnType<typeof useMemoizedLazyExpensifyIcons>>({Megaphone: PlaceholderIcon, FallbackAvatar: PlaceholderIcon});
const mockTranslate: ReturnType<typeof useLocalize>['translate'] = (key, ...parameters) => {
    for (const parameter of parameters) {
        if (parameter) {
            return String(key);
        }
    }
    return String(key);
};
const mockLocalize: ReturnType<typeof useLocalize> = {
    translate: mockTranslate,
    numberFormat: () => '',
    getLocalDateFromDatetime: () => new Date(),
    datetimeToRelative: () => '',
    datetimeToCalendarTime: () => '',
    formatPhoneNumber: (value: string) => value,
    toLocaleDigit: () => '',
    toLocaleOrdinal: () => '',
    toLocaleOrdinalWithWords: () => '',
    fromLocaleDigit: () => '',
    localeCompare: (first: string, second: string) => first.localeCompare(second),
    formatTravelDate: () => '',
    preferredLocale: CONST.LOCALES.DEFAULT,
    dateFnsLocale: undefined,
};

let mockPersonalDetails: PersonalDetailsList = {};

jest.mock('@components/MentionSuggestions', () => {
    const ReactLib = jest.requireActual<typeof React>('react');
    const module = {
        default: (props: MentionSuggestionsProps) => {
            mockMentionSuggestionsSpy(props);
            return ReactLib.createElement('mock-mention-suggestions', props);
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

const mockUsePersonalDetails = jest.mocked(usePersonalDetails);
const mockUseArrowKeyFocusManager = jest.mocked(useArrowKeyFocusManager);
const mockUseCurrentReportIDState = jest.mocked(useCurrentReportIDState);
const mockUseCurrentUserPersonalDetails = jest.mocked(useCurrentUserPersonalDetails);
const mockUseDebounce = jest.mocked(useDebounce);
const mockUseMemoizedLazyExpensifyIcons = jest.mocked(useMemoizedLazyExpensifyIcons);
const mockUseLocalize = jest.mocked(useLocalize);
const mockUsePolicy = jest.mocked(usePolicy);
const mockSearchUserInServer = jest.mocked(searchUserInServer);

function renderSuggestionMention(value: string, updateComment = jest.fn(), selection: TextSelection = {start: value.length, end: value.length}) {
    const setSelection = jest.fn();
    const suggestionMention = (
        <SuggestionMention
            value={value}
            selection={selection}
            setSelection={setSelection}
            updateComment={updateComment}
            isAutoSuggestionPickerLarge
            measureParentContainerAndReportCursor={() => {}}
            isComposerFocused
            isGroupPolicyReport={false}
            policyID="policyID"
        />
    );
    const {rerender} = render(suggestionMention);

    return {setSelection, updateComment, rerender: () => rerender(React.cloneElement(suggestionMention))};
}

function getLastMentionSuggestionsProps(): MentionSuggestionsProps {
    const {calls} = mockMentionSuggestionsSpy.mock;
    const props = calls.at(-1)?.[0];
    if (!props) {
        throw new Error('Expected mention suggestions props to be available');
    }
    return props;
}

describe('SuggestionMention', () => {
    beforeEach(() => {
        mockMentionSuggestionsSpy.mockClear();
        mockSetHighlightedMentionIndex.mockClear();
        mockSearchUserInServer.mockClear();
        mockPersonalDetails = {};

        mockUsePersonalDetails.mockImplementation(() => mockPersonalDetails);
        mockUseArrowKeyFocusManager.mockReturnValue([0, mockSetHighlightedMentionIndex]);
        mockUseCurrentReportIDState.mockReturnValue({currentReportID: ''});
        mockUseCurrentUserPersonalDetails.mockReturnValue({accountID: 1, login: 'current@gmail.com'});
        mockUseDebounce.mockImplementation((callback) => {
            const callbackRef = React.useRef(callback);
            callbackRef.current = callback;
            return React.useCallback((...args: unknown[]) => callbackRef.current(...args), []) as typeof callback;
        });
        mockUseMemoizedLazyExpensifyIcons.mockImplementation(() => mockIcons);
        mockUseLocalize.mockImplementation(() => createMock<ReturnType<typeof useLocalize>>(mockLocalize));
        mockUsePolicy.mockReturnValue(undefined);
    });

    afterEach(async () => {
        await act(async () => {
            await Onyx.clear();
        });
    });

    it('searches for uncached users while typing an @ mention', async () => {
        // Given an uncached user mention
        const value = '@alice';

        // When the mention suggestions are rendered
        renderSuggestionMention(value);

        // Then the user is searched for on the server
        await waitFor(() => expect(mockSearchUserInServer).toHaveBeenCalledWith('alice'));
    });

    it('does not search for the built-in @here mention', async () => {
        // Given the built-in @here mention
        const value = CONST.AUTO_COMPLETE_SUGGESTER.HERE_TEXT;

        // When the mention suggestions are rendered
        renderSuggestionMention(value);

        // Then suggestions are shown without searching the server
        await waitFor(() => expect(mockMentionSuggestionsSpy).toHaveBeenCalled());
        expect(mockSearchUserInServer).not.toHaveBeenCalled();
    });

    it('does not search the server for a multi-word mention', () => {
        // Given a rendered multi-word mention
        renderSuggestionMention('@alice are');
        const calculateMentionSuggestions = mockUseDebounce.mock.calls.at(-1)?.[0];
        if (!calculateMentionSuggestions) {
            throw new Error('Expected the mention calculation callback to be available');
        }

        // When the mention suggestions are calculated
        act(() => calculateMentionSuggestions('@alice are', 10, 10));

        // Then the server is not searched
        expect(mockSearchUserInServer).not.toHaveBeenCalled();
    });

    it('does not update mention state while typing ordinary text', () => {
        // Given ordinary text with no active mention
        renderSuggestionMention('hello friend');
        const calculateMentionSuggestions = mockUseDebounce.mock.calls.at(-1)?.[0];
        if (!calculateMentionSuggestions) {
            throw new Error('Expected the mention calculation callback to be available');
        }
        mockSetHighlightedMentionIndex.mockClear();

        // When more ordinary text is typed
        act(() => calculateMentionSuggestions('hello friends', 13, 13));

        // Then the highlighted mention is not updated
        expect(mockSetHighlightedMentionIndex).not.toHaveBeenCalled();
    });

    it('does not search for the same user again when server results hydrate', async () => {
        // Given an initial user search
        const {rerender} = renderSuggestionMention('@alice');
        await waitFor(() => expect(mockSearchUserInServer).toHaveBeenCalledTimes(1));

        // When the matching server result hydrates and suggestions are recalculated
        mockPersonalDetails[2] = {
            accountID: 2,
            login: 'alice@example.com',
            firstName: 'Alice',
            lastName: 'Tester',
        };
        rerender();

        const calculateMentionSuggestions = mockUseDebounce.mock.calls.at(-1)?.[0];
        if (!calculateMentionSuggestions) {
            throw new Error('Expected the mention calculation callback to be available');
        }
        act(() => calculateMentionSuggestions('@alice', 6, 6));

        // Then the hydrated result is shown without another server search
        await waitFor(() => expect(mockMentionSuggestionsSpy).toHaveBeenCalled());
        expect(getLastMentionSuggestionsProps().mentions).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    handle: 'alice@example.com',
                }),
            ]),
        );
        expect(mockSearchUserInServer).toHaveBeenCalledTimes(1);
    });

    it('shows user mention suggestions when prefix has a trailing dot', async () => {
        // Given a matching personal detail and a mention prefix with a trailing dot
        mockPersonalDetails = {};
        mockPersonalDetails[2] = {
            accountID: 2,
            login: 'adam@example.com',
            firstName: 'Adam',
            lastName: 'Tester',
        };

        // When the mention suggestions are rendered
        renderSuggestionMention('@a.');

        // Then the prefix is preserved and the matching user is suggested
        await waitFor(() => expect(mockMentionSuggestionsSpy).toHaveBeenCalled());
        const {prefix, mentions} = getLastMentionSuggestionsProps();

        expect(prefix).toBe('a.');
        expect(mockSearchUserInServer).toHaveBeenCalledWith('a');
        expect(mentions).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    handle: 'adam@example.com',
                    alternateText: '@adam@example.com',
                }),
            ]),
        );
    });

    it('preserves trailing punctuation dot and inserts trailing space when selected mention does not include dotted prefix', async () => {
        // Given a mention with a trailing dot that is not part of the selected login
        mockPersonalDetails = {};
        mockPersonalDetails[2] = {
            accountID: 2,
            login: 'adam@example.com',
            firstName: 'Adam',
            lastName: 'Tester',
        };

        const updateComment = jest.fn();
        const {setSelection} = renderSuggestionMention('@a.', updateComment);

        await waitFor(() => expect(mockMentionSuggestionsSpy).toHaveBeenCalled());
        const {onSelect} = getLastMentionSuggestionsProps();

        // When the mention is selected
        act(() => onSelect(0));

        // Then the dot is preserved and a trailing space is inserted
        expect(updateComment).toHaveBeenCalledWith('@adam@example.com. ', true);
        expect(setSelection).toHaveBeenCalledWith({start: 19, end: 19});
    });

    it('does not append an extra trailing dot and inserts trailing space when selected mention already matches dotted prefix', async () => {
        // Given a mention with a trailing dot that is part of the selected login
        mockPersonalDetails = {};
        mockPersonalDetails[2] = {
            accountID: 2,
            login: 'a.smith@example.com',
            firstName: 'Alice',
            lastName: 'Smith',
        };

        const updateComment = jest.fn();
        const {setSelection} = renderSuggestionMention('@a.', updateComment);

        await waitFor(() => expect(mockMentionSuggestionsSpy).toHaveBeenCalled());
        const {onSelect} = getLastMentionSuggestionsProps();

        // When the mention is selected
        act(() => onSelect(0));

        // Then no extra dot is added and a trailing space is inserted
        expect(updateComment).toHaveBeenCalledWith('@a.smith@example.com ', true);
        expect(setSelection).toHaveBeenCalledWith({start: 21, end: 21});
    });

    it('does not insert trailing space when mention is followed by a comma (punctuation)', async () => {
        // Given a mention followed by punctuation
        mockPersonalDetails = {};
        mockPersonalDetails[2] = {
            accountID: 2,
            login: 'adam@example.com',
            firstName: 'Adam',
            lastName: 'Tester',
        };

        const updateComment = jest.fn();
        const {setSelection} = renderSuggestionMention('@a, thanks', updateComment, {start: 2, end: 2});

        await waitFor(() => expect(mockMentionSuggestionsSpy).toHaveBeenCalled());
        const {onSelect} = getLastMentionSuggestionsProps();

        // When the mention is selected
        act(() => onSelect(0));

        // Then the punctuation remains directly after the mention
        expect(updateComment).toHaveBeenCalledWith('@adam@example.com, thanks', true);
        expect(setSelection).toHaveBeenCalledWith({start: 17, end: 17});
    });

    it('inserts trailing space when mention is followed by a regular word', async () => {
        // Given a mention followed by a regular word
        mockPersonalDetails = {};
        mockPersonalDetails[2] = {
            accountID: 2,
            login: 'adam@example.com',
            firstName: 'Adam',
            lastName: 'Tester',
        };

        const updateComment = jest.fn();
        const {setSelection} = renderSuggestionMention('@a thanks', updateComment, {start: 2, end: 2});

        await waitFor(() => expect(mockMentionSuggestionsSpy).toHaveBeenCalled());
        const {onSelect} = getLastMentionSuggestionsProps();

        // When the mention is selected
        act(() => onSelect(0));

        // Then a space separates the mention from the following word
        expect(updateComment).toHaveBeenCalledWith('@adam@example.com thanks', true);
        expect(setSelection).toHaveBeenCalledWith({start: 18, end: 18});
    });

    describe('shouldWeightDetails', () => {
        const PARTICIPANT_ACCOUNT_ID = 2;
        const POLICY_EMPLOYEE_ACCOUNT_ID = 3;
        const UNRELATED_ACCOUNT_ID = 4;
        // eslint-disable-next-line @typescript-eslint/naming-convention
        const ubEmployeeList: PolicyEmployeeList = {'ub@example.com': {}};
        const policyWithEmployeeUb = {...createRandomPolicy(1), employeeList: ubEmployeeList};

        const setupPersonalDetails = () => {
            mockPersonalDetails = {};
            // Alphabetical order is ua, ub, uc - weighted order should be uc, ub, ua.
            mockPersonalDetails[PARTICIPANT_ACCOUNT_ID] = {accountID: PARTICIPANT_ACCOUNT_ID, login: 'uc@example.com'};
            mockPersonalDetails[POLICY_EMPLOYEE_ACCOUNT_ID] = {accountID: POLICY_EMPLOYEE_ACCOUNT_ID, login: 'ub@example.com'};
            mockPersonalDetails[UNRELATED_ACCOUNT_ID] = {accountID: UNRELATED_ACCOUNT_ID, login: 'ua@example.com'};
        };

        const buildReportWithParticipant = (overrides: Partial<Report>): Report => {
            const participants = {
                [PARTICIPANT_ACCOUNT_ID]: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS},
            };
            return createMock<Report>({...overrides, participants});
        };

        it('weights report participants above policy employees and everyone else for a group chat', async () => {
            // Given a group chat with a report participant and a policy employee
            setupPersonalDetails();
            const currentReportID = 'group1';
            mockUseCurrentReportIDState.mockReturnValue({currentReportID});
            const report = buildReportWithParticipant({
                reportID: 'group1',
                chatType: CONST.REPORT.CHAT_TYPE.GROUP,
            });
            mockUsePolicy.mockReturnValue(policyWithEmployeeUb);

            await act(async () => {
                await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${currentReportID}`, report);
            });

            // When matching mention suggestions are rendered
            renderSuggestionMention('@u');

            // Then the report participant is weighted above the policy employee and everyone else
            await waitFor(() => expect(mockMentionSuggestionsSpy).toHaveBeenCalled());
            const {mentions} = getLastMentionSuggestionsProps();

            expect(mentions.map((mention) => mention.handle)).toEqual(['uc@example.com', 'ub@example.com', 'ua@example.com']);
        });

        it('weights details when the current report belongs to the active workspace', async () => {
            // Given a workspace chat from the active workspace
            setupPersonalDetails();
            const currentReportID = 'wsp1';
            mockUseCurrentReportIDState.mockReturnValue({currentReportID});
            const report = buildReportWithParticipant({
                reportID: 'wsp1',
                chatType: CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT,
                policyID: 'policyID',
            });
            mockUsePolicy.mockReturnValue(policyWithEmployeeUb);

            await act(async () => {
                await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${currentReportID}`, report);
            });

            // When matching mention suggestions are rendered
            renderSuggestionMention('@u');

            // Then report participants and policy employees are weighted first
            await waitFor(() => expect(mockMentionSuggestionsSpy).toHaveBeenCalled());
            const {mentions} = getLastMentionSuggestionsProps();

            expect(mentions.map((mention) => mention.handle)).toEqual(['uc@example.com', 'ub@example.com', 'ua@example.com']);
        });

        it('weights the report owner and manager as participants even when they are not in the participants list', async () => {
            // Given a workspace room whose owner and manager are missing from its participants list
            setupPersonalDetails();
            const OWNER_ACCOUNT_ID = 5;
            const MANAGER_ACCOUNT_ID = 6;
            mockPersonalDetails[OWNER_ACCOUNT_ID] = {accountID: OWNER_ACCOUNT_ID, login: 'ud@example.com'};
            mockPersonalDetails[MANAGER_ACCOUNT_ID] = {accountID: MANAGER_ACCOUNT_ID, login: 'ue@example.com'};
            const currentReportID = 'room1';
            mockUseCurrentReportIDState.mockReturnValue({currentReportID});
            const report = buildReportWithParticipant({
                reportID: 'room1',
                chatType: CONST.REPORT.CHAT_TYPE.POLICY_ROOM,
                policyID: 'policyID',
                ownerAccountID: OWNER_ACCOUNT_ID,
                managerID: MANAGER_ACCOUNT_ID,
            });
            mockUsePolicy.mockReturnValue(policyWithEmployeeUb);

            await act(async () => {
                await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${currentReportID}`, report);
            });

            // When matching mention suggestions are rendered
            renderSuggestionMention('@u');

            // Then the owner and manager are listed with the participants, before the policy employee and everyone else
            await waitFor(() => expect(mockMentionSuggestionsSpy).toHaveBeenCalled());
            const {mentions} = getLastMentionSuggestionsProps();

            expect(mentions.map((mention) => mention.handle)).toEqual(['uc@example.com', 'ud@example.com', 'ue@example.com', 'ub@example.com', 'ua@example.com']);
        });

        it('never weights a detail with a zero account ID as a participant', async () => {
            // Given a group chat whose participants list has a 0 key, and a detail whose account ID is 0
            const ZERO_ACCOUNT_ID = 0;
            mockPersonalDetails = {
                [ZERO_ACCOUNT_ID]: {accountID: ZERO_ACCOUNT_ID, login: 'ua@example.com'},
                [PARTICIPANT_ACCOUNT_ID]: {accountID: PARTICIPANT_ACCOUNT_ID, login: 'uc@example.com'},
                [POLICY_EMPLOYEE_ACCOUNT_ID]: {accountID: POLICY_EMPLOYEE_ACCOUNT_ID, login: 'ub@example.com'},
            };
            const currentReportID = 'group2';
            mockUseCurrentReportIDState.mockReturnValue({currentReportID});
            const report = createMock<Report>({
                reportID: 'group2',
                chatType: CONST.REPORT.CHAT_TYPE.GROUP,
                participants: {
                    [ZERO_ACCOUNT_ID]: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS},
                    [PARTICIPANT_ACCOUNT_ID]: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS},
                },
            });
            mockUsePolicy.mockReturnValue(policyWithEmployeeUb);

            await act(async () => {
                await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${currentReportID}`, report);
            });

            // When matching mention suggestions are rendered
            renderSuggestionMention('@u');

            // Then the zero account ID detail stays in the last group
            await waitFor(() => expect(mockMentionSuggestionsSpy).toHaveBeenCalled());
            const {mentions} = getLastMentionSuggestionsProps();

            expect(mentions.map((mention) => mention.handle)).toEqual(['uc@example.com', 'ub@example.com', 'ua@example.com']);
        });

        it('skips weighting for a 1:1 DM and falls back to alphabetical order', async () => {
            // Given a one-to-one direct message
            setupPersonalDetails();
            const currentReportID = 'dm1';
            mockUseCurrentReportIDState.mockReturnValue({currentReportID});
            const report = buildReportWithParticipant({reportID: 'dm1'});
            mockUsePolicy.mockReturnValue(policyWithEmployeeUb);

            await act(async () => {
                await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${currentReportID}`, report);
            });

            // When matching mention suggestions are rendered
            renderSuggestionMention('@u');

            // Then the suggestions remain in alphabetical order
            await waitFor(() => expect(mockMentionSuggestionsSpy).toHaveBeenCalled());
            const {mentions} = getLastMentionSuggestionsProps();

            expect(mentions.map((mention) => mention.handle)).toEqual(['ua@example.com', 'ub@example.com', 'uc@example.com']);
        });
    });

    describe('order and size of the suggestion list', () => {
        const MAX_SUGGESTIONS = CONST.AUTO_COMPLETE_SUGGESTER.MAX_AMOUNT_OF_SUGGESTIONS;
        const CURRENT_USER_ACCOUNT_ID = 1;
        // eslint-disable-next-line @typescript-eslint/naming-convention
        const employeeList: PolicyEmployeeList = {'employee1@example.com': {}, 'employee2@example.com': {}};
        const policyWithEmployees = {...createRandomPolicy(1), employeeList};

        beforeEach(() => {
            // Compare names with the same collator settings the app uses
            mockUseLocalize.mockImplementation(() => createMock<ReturnType<typeof useLocalize>>({...mockLocalize, localeCompare}));
        });

        /** The composer gets the personal details from usePersonalDetails, and the sort reads display names from the Onyx store, so both get them */
        async function setPersonalDetails(people: PersonalDetails[]) {
            const personalDetails: PersonalDetailsList = {};
            for (const person of people) {
                personalDetails[person.accountID] = person;
            }
            mockPersonalDetails = personalDetails;
            await act(async () => {
                await Onyx.set(ONYXKEYS.PERSONAL_DETAILS_LIST, personalDetails);
            });
        }

        async function openReport(report: Report) {
            mockUseCurrentReportIDState.mockReturnValue({currentReportID: report.reportID});
            await act(async () => {
                await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`, report);
            });
        }

        async function openRoomWithParticipants(participantAccountIDs: number[]) {
            mockUsePolicy.mockReturnValue(policyWithEmployees);
            const participants: Report['participants'] = {};
            for (const accountID of participantAccountIDs) {
                participants[accountID] = {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS};
            }
            await openReport(createMock<Report>({reportID: 'room', chatType: CONST.REPORT.CHAT_TYPE.POLICY_ROOM, policyID: 'policyID', participants}));
        }

        async function openDirectMessage() {
            await openReport(createMock<Report>({reportID: 'dm', participants: {[CURRENT_USER_ACCOUNT_ID]: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS}}}));
        }

        /** Renders the composer with the given text and returns the suggestions it shows */
        async function getMentions(value: string) {
            renderSuggestionMention(value);
            await waitFor(() => expect(mockMentionSuggestionsSpy).toHaveBeenCalled());
            return getLastMentionSuggestionsProps().mentions;
        }

        /** The suggested handles, or the text for the @here suggestion */
        async function getSuggestions(value: string) {
            const mentions = await getMentions(value);
            return mentions.map((mention) => mention.handle ?? mention.text);
        }

        /** `count` people named "Person <n>", added in an order unrelated to their names, so the list order comes from sorting */
        function buildNumberedPeople(count: number): PersonalDetails[] {
            return Array.from({length: count}, (_, index) => {
                const nameNumber = (index * 11) % count;
                return {accountID: 100 + index, login: `person${nameNumber}@example.com`, displayName: `Person ${nameNumber}`};
            });
        }

        it('orders a room by weight, then by display name with the locale collator, then by account ID', async () => {
            // Given a room with two participants, two workspace employees and everyone else, with names that only a numeric,
            // accent and case aware comparison orders correctly, and two people with the same name
            await setPersonalDetails([
                {accountID: 10, login: 'participant1@example.com', displayName: 'Zed'},
                {accountID: 11, login: 'participant2@example.com', displayName: 'Amy'},
                {accountID: 12, login: 'employee1@example.com', displayName: 'Yara'},
                {accountID: 13, login: 'employee2@example.com', displayName: 'Bea'},
                {accountID: 14, login: 'kim10@example.com', displayName: 'Kim 10'},
                {accountID: 15, login: 'kim9@example.com', displayName: 'Kim 9'},
                {accountID: 16, login: 'emile-accent@example.com', displayName: 'émile'},
                {accountID: 17, login: 'emile-upper@example.com', displayName: 'Emile'},
                {accountID: 18, login: 'emile-lower@example.com', displayName: 'emile'},
                {accountID: 19, login: 'same2@example.com', displayName: 'Same Name'},
                {accountID: 20, login: 'same1@example.com', displayName: 'Same Name'},
            ]);
            await openRoomWithParticipants([10, 11]);

            // When the mention list for "@e" is shown
            const suggestions = await getSuggestions('@e');

            // Then participants come first, then employees, then everyone else, each group by name and then by account ID.
            // "@here" matches "e" too and comes first.
            expect(suggestions).toEqual([
                CONST.AUTO_COMPLETE_SUGGESTER.HERE_TEXT,
                'participant2@example.com',
                'participant1@example.com',
                'employee2@example.com',
                'employee1@example.com',
                'emile-upper@example.com',
                'emile-lower@example.com',
                'emile-accent@example.com',
                'kim9@example.com',
                'kim10@example.com',
                'same2@example.com',
                'same1@example.com',
            ]);
        });

        it('orders a direct message by display name, then by account ID, without weights', async () => {
            // Given the same people in a direct message
            await setPersonalDetails([
                {accountID: 10, login: 'participant1@example.com', displayName: 'Zed'},
                {accountID: 12, login: 'employee1@example.com', displayName: 'Yara'},
                {accountID: 14, login: 'kim10@example.com', displayName: 'Kim 10'},
                {accountID: 15, login: 'kim9@example.com', displayName: 'Kim 9'},
                {accountID: 19, login: 'same2@example.com', displayName: 'Same Name'},
                {accountID: 20, login: 'same1@example.com', displayName: 'Same Name'},
            ]);
            await openDirectMessage();

            // When the mention list for a bare "@" is shown
            const suggestions = await getSuggestions('@');

            // Then @here comes first, then everyone ordered by name, and people with the same name by account ID
            expect(suggestions).toEqual([
                CONST.AUTO_COMPLETE_SUGGESTER.HERE_TEXT,
                'kim9@example.com',
                'kim10@example.com',
                'same2@example.com',
                'same1@example.com',
                'employee1@example.com',
                'participant1@example.com',
            ]);
        });

        it('sorts a person by login when they have no display name', async () => {
            // Given one person without a display name, whose login sorts between the other two names
            await setPersonalDetails([
                {accountID: 10, login: 'zack@example.com', displayName: 'Zack'},
                {accountID: 11, login: 'nobody@example.com'},
                {accountID: 12, login: 'adam@example.com', displayName: 'Adam'},
            ]);
            await openDirectMessage();

            // When the mention list for "@example" is shown
            const suggestions = await getSuggestions('@example');

            // Then the person without a name is placed by their login
            expect(suggestions).toEqual(['adam@example.com', 'nobody@example.com', 'zack@example.com']);
        });

        it('matches the search text in the display name or the login, ignoring case', async () => {
            // Given people whose name, login, or neither contains "ali"
            await setPersonalDetails([
                {accountID: 10, login: 'first@example.com', displayName: 'Alice Smith'},
                {accountID: 11, login: 'kalinda@example.com', displayName: 'Kay Linda'},
                {accountID: 12, login: 'bob@example.com', displayName: 'Bob'},
                {accountID: 13, login: 'natali@example.com'},
            ]);
            await openDirectMessage();

            // When the mention list for "@ALI" is shown
            const suggestions = await getSuggestions('@ALI');

            // Then only the people with "ali" in their name or login are suggested
            expect(suggestions).toEqual(['first@example.com', 'kalinda@example.com', 'natali@example.com']);
        });

        it('leaves out people without a login, optimistic people, system accounts and repeated logins', async () => {
            // Given one person of each kind that cannot be mentioned, and two people with the same login
            await setPersonalDetails([
                {accountID: 10, displayName: 'Uma No Login'},
                {accountID: 11, login: 'optimistic@example.com', displayName: 'Uma Optimistic', isOptimisticPersonalDetail: true},
                {accountID: 12, login: CONST.EMAIL.NOTIFICATIONS, displayName: 'Uma Notifications'},
                {accountID: CONST.ACCOUNT_ID.NOTIFICATIONS, login: 'system@example.com', displayName: 'Uma System'},
                {accountID: 14, login: 'repeated@example.com', displayName: 'Uma Zulu'},
                {accountID: 15, login: 'repeated@example.com', displayName: 'Uma Alpha'},
                {accountID: 16, login: 'kept@example.com', displayName: 'Uma Kept'},
            ]);
            await openDirectMessage();

            // When the mention list for "@uma" is shown
            const mentions = await getMentions('@uma');

            // Then only the first person with the repeated login and the ordinary person are suggested
            expect(mentions.map((mention) => [mention.handle, mention.text])).toEqual([
                ['kept@example.com', 'Uma Kept'],
                ['repeated@example.com', 'Uma Zulu'],
            ]);
        });

        it.each([
            {count: 7, expectedCount: 7},
            {count: MAX_SUGGESTIONS, expectedCount: MAX_SUGGESTIONS},
            {count: MAX_SUGGESTIONS + 1, expectedCount: MAX_SUGGESTIONS},
            {count: 45, expectedCount: MAX_SUGGESTIONS},
        ])('shows the first $expectedCount of $count matching people in order', async ({count, expectedCount}) => {
            // Given `count` people whose names are numbered in an order unrelated to how they were added
            await setPersonalDetails(buildNumberedPeople(count));
            await openDirectMessage();

            // When the mention list for "@person" is shown
            const suggestions = await getSuggestions('@person');

            // Then the people with the lowest numbers are shown, in number order, up to the maximum
            expect(suggestions).toEqual(Array.from({length: expectedCount}, (_, nameNumber) => `person${nameNumber}@example.com`));
        });

        it('gives one of the places to @here when it matches', async () => {
            // Given more matching people than fit in the list
            await setPersonalDetails(buildNumberedPeople(45));
            await openDirectMessage();

            // When the mention list for a bare "@" is shown, which also matches @here
            const suggestions = await getSuggestions('@');

            // Then @here comes first and the people fill the remaining places
            expect(suggestions).toEqual([CONST.AUTO_COMPLETE_SUGGESTER.HERE_TEXT, ...Array.from({length: MAX_SUGGESTIONS - 1}, (_, nameNumber) => `person${nameNumber}@example.com`)]);
        });

        it.each(['', 'a', 'jo', 'bob 1'])('shows the same people as sorting every match for "@%s" in a room with many repeated names', async (searchText) => {
            // Given 300 people with few distinct names, some names equal to the login, and participants and employees spread through them
            const names = ['Ann', 'ann', 'Ánn', 'Bob', 'Bob 2', 'Bob 10', 'Joan', 'Jo', 'Zoë', 'Zoe'];
            const people: PersonalDetails[] = [];
            const participantAccountIDs: number[] = [];
            const employees: PolicyEmployeeList = {};
            for (let index = 0; index < 300; index++) {
                const accountID = 1000 + index;
                const login = `user${(index * 37) % 300}@example.com`;
                const displayName = index % 9 === 0 ? login : (names.at((index * 13) % names.length) ?? '');
                people.push({accountID, login, displayName});
                if (index % 23 === 0) {
                    participantAccountIDs.push(accountID);
                } else if (index % 5 === 0) {
                    employees[login] = {};
                }
            }
            await setPersonalDetails(people);
            await openRoomWithParticipants(participantAccountIDs);
            mockUsePolicy.mockReturnValue({...policyWithEmployees, employeeList: employees});

            // When the mention list for the search text is shown
            const suggestions = await getSuggestions(`@${searchText}`);

            // Then it equals the first of every matching person sorted by weight, then name, then account ID
            const getWeight = (accountID: number, login: string) => {
                if (participantAccountIDs.includes(accountID)) {
                    return 0;
                }
                return employees[login] ? 1 : 2;
            };
            const expectedPeople = people
                .map((person) => ({accountID: person.accountID, login: person.login ?? '', name: person.displayName ?? ''}))
                .filter((person) => (person.name === person.login ? person.login : `${person.name} ${person.login}`).toLowerCase().includes(searchText))
                .sort(
                    (first, second) =>
                        getWeight(first.accountID, first.login) - getWeight(second.accountID, second.login) || localeCompare(first.name, second.name) || first.accountID - second.accountID,
                )
                .map((person) => person.login);
            const hereSuggestion = CONST.AUTO_COMPLETE_SUGGESTER.HERE_TEXT.includes(searchText) ? [CONST.AUTO_COMPLETE_SUGGESTER.HERE_TEXT] : [];
            expect(suggestions).toEqual([...hereSuggestion, ...expectedPeople].slice(0, MAX_SUGGESTIONS));
        });
    });

    it('preserves the first mention when a second mention is inserted before it', async () => {
        // Given a complete mention after the active mention
        mockPersonalDetails = {};
        mockPersonalDetails[2] = {
            accountID: 2,
            login: 'adam@example.com',
            firstName: 'Adam',
            lastName: 'Tester',
        };
        mockPersonalDetails[3] = {
            accountID: 3,
            login: 'bob@example.com',
            firstName: 'Bob',
            lastName: 'Tester',
        };

        const updateComment = jest.fn();
        const {setSelection} = renderSuggestionMention('@b@adam@example.com ', updateComment, {start: 2, end: 2});

        await waitFor(() => expect(mockMentionSuggestionsSpy).toHaveBeenCalled());
        const {onSelect} = getLastMentionSuggestionsProps();

        // When the active mention is selected
        act(() => onSelect(0));

        // Then both mentions are preserved and separated by a space
        expect(updateComment).toHaveBeenCalledWith('@bob@example.com @adam@example.com ', true);
        expect(setSelection).toHaveBeenCalledWith({start: 17, end: 17});
    });

    it('preserves a trailing @here mention when inserting a new mention before it', async () => {
        // Given an @here mention after the active mention
        mockPersonalDetails = {};
        mockPersonalDetails[2] = {
            accountID: 2,
            login: 'adam@example.com',
            firstName: 'Adam',
            lastName: 'Tester',
        };

        const updateComment = jest.fn();
        const {setSelection} = renderSuggestionMention('@adam@here', updateComment, {start: 5, end: 5});

        await waitFor(() => expect(mockMentionSuggestionsSpy).toHaveBeenCalled());
        const {onSelect} = getLastMentionSuggestionsProps();

        // When the active mention is selected
        act(() => onSelect(0));

        // Then the trailing @here mention is preserved
        expect(updateComment).toHaveBeenCalledWith('@adam@example.com @here', true);
        expect(setSelection).toHaveBeenCalledWith({start: 18, end: 18});
    });

    it('preserves a trailing phone number mention when inserting a new mention before it', async () => {
        // Given a phone number mention after the active mention
        mockPersonalDetails = {};
        mockPersonalDetails[2] = {
            accountID: 2,
            login: 'adam@example.com',
            firstName: 'Adam',
            lastName: 'Tester',
        };

        const updateComment = jest.fn();
        const {setSelection} = renderSuggestionMention('@adam@+14404589784', updateComment, {start: 5, end: 5});

        await waitFor(() => expect(mockMentionSuggestionsSpy).toHaveBeenCalled());
        const {onSelect} = getLastMentionSuggestionsProps();

        // When the active mention is selected
        act(() => onSelect(0));

        // Then the trailing phone number mention is preserved
        expect(updateComment).toHaveBeenCalledWith('@adam@example.com @+14404589784', true);
        expect(setSelection).toHaveBeenCalledWith({start: 18, end: 18});
    });

    it('preserves a trailing private domain short mention when inserting a new mention before it', async () => {
        // Given a private domain short mention after the active mention
        mockPersonalDetails = {};
        mockPersonalDetails[2] = {
            accountID: 2,
            login: 'adam@example.com',
            firstName: 'Adam',
            lastName: 'Tester',
        };
        mockPersonalDetails[3] = {
            accountID: 3,
            login: 'charlie@company.com',
            firstName: 'Charlie',
            lastName: 'Tester',
        };

        // Override to a private domain so charlie@company.com shows as @charlie in the composer
        mockUseCurrentUserPersonalDetails.mockReturnValue({accountID: 1, login: 'current@company.com'});

        const updateComment = jest.fn();
        const {setSelection} = renderSuggestionMention('@adam@charlie', updateComment, {start: 5, end: 5});

        await waitFor(() => expect(mockMentionSuggestionsSpy).toHaveBeenCalled());
        const {onSelect} = getLastMentionSuggestionsProps();

        // When the active mention is selected
        act(() => onSelect(0));

        // Then the trailing private domain mention is preserved
        expect(updateComment).toHaveBeenCalledWith('@adam@example.com @charlie', true);
        expect(setSelection).toHaveBeenCalledWith({start: 18, end: 18});
    });

    it('preserves a trailing #room mention when inserting a new mention before it', async () => {
        // Given a room mention after the active mention
        mockPersonalDetails = {};
        mockPersonalDetails[2] = {
            accountID: 2,
            login: 'adam@example.com',
            firstName: 'Adam',
            lastName: 'Tester',
        };

        const updateComment = jest.fn();
        const {setSelection} = renderSuggestionMention('@adam#admins', updateComment, {start: 5, end: 5});

        await waitFor(() => expect(mockMentionSuggestionsSpy).toHaveBeenCalled());
        const {onSelect} = getLastMentionSuggestionsProps();

        // When the active mention is selected
        act(() => onSelect(0));

        // Then the trailing room mention is preserved
        expect(updateComment).toHaveBeenCalledWith('@adam@example.com #admins', true);
        expect(setSelection).toHaveBeenCalledWith({start: 18, end: 18});
    });

    it('removes junk between the new mention and a trailing complete mention', async () => {
        // Given junk between the active mention and a trailing complete mention
        mockPersonalDetails = {};
        mockPersonalDetails[2] = {
            accountID: 2,
            login: 'alice@example.com',
            firstName: 'Alice',
            lastName: 'Tester',
        };

        const updateComment = jest.fn();
        // "@alice@exam@alice@example.com" — cursor at index 6 (after "@alice").
        // The user partially typed "alice" before a stale/duplicate mention.
        // Inserting the full mention should drop the "@exam" junk and keep the trailing mention.
        const {setSelection} = renderSuggestionMention('@alice@exam@alice@example.com', updateComment, {start: 6, end: 6});

        await waitFor(() => expect(mockMentionSuggestionsSpy).toHaveBeenCalled());
        const {onSelect} = getLastMentionSuggestionsProps();

        // When the active mention is selected
        act(() => onSelect(0));

        // Then the junk is removed and the trailing mention is preserved
        expect(updateComment).toHaveBeenCalledWith('@alice@example.com @alice@example.com', true);
        expect(setSelection).toHaveBeenCalledWith({start: 19, end: 19});
    });

    it('removes junk between the new mention and a trailing private domain short mention', async () => {
        // Given junk between the active mention and a trailing private domain mention
        mockPersonalDetails = {};
        mockPersonalDetails[2] = {
            accountID: 2,
            login: 'bob@company.com',
            firstName: 'Bob',
            lastName: 'Tester',
        };
        mockPersonalDetails[3] = {
            accountID: 3,
            login: 'charlie@company.com',
            firstName: 'Charlie',
            lastName: 'Tester',
        };

        // Override to a private domain so charlie@company.com shows as @charlie in the composer
        mockUseCurrentUserPersonalDetails.mockReturnValue({accountID: 1, login: 'current@company.com'});

        const updateComment = jest.fn();
        // "@b@comp@charlie" — cursor at index 2 (after "@b").
        // Inserting the full @bob mention should drop the "@comp" junk and keep the trailing @charlie short mention.
        const {setSelection} = renderSuggestionMention('@b@comp@charlie', updateComment, {start: 2, end: 2});

        await waitFor(() => expect(mockMentionSuggestionsSpy).toHaveBeenCalled());
        const {onSelect} = getLastMentionSuggestionsProps();

        // When the active mention is selected
        act(() => onSelect(0));

        // Then the junk is removed and the trailing private domain mention is preserved
        expect(updateComment).toHaveBeenCalledWith('@bob @charlie', true);
        expect(setSelection).toHaveBeenCalledWith({start: 5, end: 5});
    });

    it('removes junk between the new mention and a trailing phone number mention', async () => {
        // Given junk between the active mention and a trailing phone number mention
        mockPersonalDetails = {};
        mockPersonalDetails[2] = {
            accountID: 2,
            login: 'adam@example.com',
            firstName: 'Adam',
            lastName: 'Tester',
        };

        const updateComment = jest.fn();
        // "@adam@exam@+14404589784" — cursor at index 5 (after "@adam").
        // Inserting the full mention should drop the "@exam" junk and keep the trailing phone number mention.
        const {setSelection} = renderSuggestionMention('@adam@exam@+14404589784', updateComment, {start: 5, end: 5});

        await waitFor(() => expect(mockMentionSuggestionsSpy).toHaveBeenCalled());
        const {onSelect} = getLastMentionSuggestionsProps();

        // When the active mention is selected
        act(() => onSelect(0));

        // Then the junk is removed and the trailing phone number mention is preserved
        expect(updateComment).toHaveBeenCalledWith('@adam@example.com @+14404589784', true);
        expect(setSelection).toHaveBeenCalledWith({start: 18, end: 18});
    });

    it('removes junk between the new mention and a trailing room mention', async () => {
        // Given junk between the active mention and a trailing room mention
        mockPersonalDetails = {};
        mockPersonalDetails[2] = {
            accountID: 2,
            login: 'alice@example.com',
            firstName: 'Alice',
            lastName: 'Tester',
        };

        const updateComment = jest.fn();
        // "@alice@exam#admins" — cursor at index 6 (after "@alice").
        // Inserting the full mention should drop the "@exam" junk and keep the trailing #admins room mention.
        const {setSelection} = renderSuggestionMention('@alice@exam#admins', updateComment, {start: 6, end: 6});

        await waitFor(() => expect(mockMentionSuggestionsSpy).toHaveBeenCalled());
        const {onSelect} = getLastMentionSuggestionsProps();

        // When the active mention is selected
        act(() => onSelect(0));

        // Then the junk is removed and the trailing room mention is preserved
        expect(updateComment).toHaveBeenCalledWith('@alice@example.com #admins', true);
        expect(setSelection).toHaveBeenCalledWith({start: 19, end: 19});
    });

    it('matches a phone contact when searching by unformatted digits', async () => {
        // Given a phone contact with a formatted display name
        // The display name of a phone contact is the formatted number, so the raw login has to stay searchable.
        mockUseLocalize.mockImplementation(() => createMock<ReturnType<typeof useLocalize>>({...mockLocalize, formatPhoneNumber}));
        mockPersonalDetails = {};
        mockPersonalDetails[2] = {
            accountID: 2,
            login: '+18332403627@expensify.sms',
            displayName: '+18332403627@expensify.sms',
        };

        // When searching by unformatted digits
        renderSuggestionMention('@8332403627');

        // Then the phone contact is included in the suggestions
        await waitFor(() => expect(mockMentionSuggestionsSpy).toHaveBeenCalled());
        const {mentions} = getLastMentionSuggestionsProps();

        expect(mentions).toEqual(expect.arrayContaining([expect.objectContaining({handle: '+18332403627@expensify.sms', text: '(833) 240-3627'})]));
    });
});
