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
import type {PersonalDetailsList, PolicyEmployeeList, Report} from '@src/types/onyx';

import React from 'react';
import Onyx from 'react-native-onyx';

import createRandomPolicy from '../utils/collections/policies';
import createMock from '../utils/createMock';
import {formatPhoneNumber} from '../utils/TestHelper';

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
        mockUseCurrentReportIDState.mockReturnValue({currentReportID: '', currentRHPReportID: ''});
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
            mockUseCurrentReportIDState.mockReturnValue({currentReportID, currentRHPReportID: ''});
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
            mockUseCurrentReportIDState.mockReturnValue({currentReportID, currentRHPReportID: ''});
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

        it('skips weighting for a 1:1 DM and falls back to alphabetical order', async () => {
            // Given a one-to-one direct message
            setupPersonalDetails();
            const currentReportID = 'dm1';
            mockUseCurrentReportIDState.mockReturnValue({currentReportID, currentRHPReportID: ''});
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
