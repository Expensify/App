import {act, render, waitFor} from '@testing-library/react-native';
import React from 'react';
import type {UseOnyxResult} from 'react-native-onyx';
import type {TextSelection} from '@components/Composer/types';
import type {Mention} from '@components/MentionSuggestions';
import {usePersonalDetails} from '@components/OnyxListItemProvider';
import useArrowKeyFocusManager from '@hooks/useArrowKeyFocusManager';
import {useCurrentReportIDState} from '@hooks/useCurrentReportID';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useDebounce from '@hooks/useDebounce';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePolicy from '@hooks/usePolicy';
import {getPolicyEmployeeAccountIDs} from '@libs/PolicyUtils';
import SuggestionMention from '@pages/inbox/report/ReportActionCompose/SuggestionMention';
import ONYXKEYS from '@src/ONYXKEYS';
import type {PersonalDetailsList, Report} from '@src/types/onyx';

type MentionSuggestionsProps = {
    mentions: Mention[];
    prefix: string;
    onSelect: (index: number) => void;
};

const mockMentionSuggestionsSpy = jest.fn<void, [MentionSuggestionsProps]>();
const mockSetHighlightedMentionIndex = jest.fn<void, [number]>();
const mockIcons = {Megaphone: 'megaphone', FallbackAvatar: 'fallback'};
const mockLocalize = {
    translate: (key: string) => key,
    formatPhoneNumber: (value: string) => value,
    localeCompare: (first: string, second: string) => first.localeCompare(second),
};
const mockReports = {};

let mockPersonalDetails: PersonalDetailsList = {};
let mockCurrentReport: Report | undefined;

function createOnyxResult<T>(value: NonNullable<T> | undefined): UseOnyxResult<T> {
    return [value, {status: 'loaded'}];
}

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
jest.mock('@hooks/useOnyx', () => jest.fn());
jest.mock('@hooks/usePolicy', () => jest.fn());
jest.mock('@libs/PolicyUtils', () => ({
    getPolicyEmployeeAccountIDs: jest.fn(),
}));

const mockUsePersonalDetails = jest.mocked(usePersonalDetails);
const mockUseArrowKeyFocusManager = jest.mocked(useArrowKeyFocusManager);
const mockUseCurrentReportIDState = jest.mocked(useCurrentReportIDState);
const mockUseCurrentUserPersonalDetails = jest.mocked(useCurrentUserPersonalDetails);
const mockUseDebounce = jest.mocked(useDebounce);
const mockUseMemoizedLazyExpensifyIcons = jest.mocked(useMemoizedLazyExpensifyIcons);
const mockUseLocalize = jest.mocked(useLocalize);
const mockUseOnyx = jest.mocked(useOnyx);
const mockUsePolicy = jest.mocked(usePolicy);
const mockGetPolicyEmployeeAccountIDs = jest.mocked(getPolicyEmployeeAccountIDs);

function renderSuggestionMention(value: string, updateComment = jest.fn(), selection: TextSelection = {start: value.length, end: value.length}) {
    const setSelection = jest.fn();

    render(
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
        />,
    );

    return {setSelection, updateComment};
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
        mockPersonalDetails = {};
        mockCurrentReport = undefined;

        mockUsePersonalDetails.mockImplementation(() => mockPersonalDetails);
        mockUseArrowKeyFocusManager.mockReturnValue([0, mockSetHighlightedMentionIndex]);
        mockUseCurrentReportIDState.mockReturnValue({currentReportID: ''});
        mockUseCurrentUserPersonalDetails.mockReturnValue({accountID: 1, login: 'current@gmail.com'});
        mockUseDebounce.mockImplementation((callback) => {
            const callbackRef = React.useRef(callback);
            callbackRef.current = callback;
            return React.useCallback((...args: unknown[]) => callbackRef.current(...args), []) as typeof callback;
        });
        mockUseMemoizedLazyExpensifyIcons.mockImplementation((() => mockIcons) as unknown as typeof useMemoizedLazyExpensifyIcons);
        mockUseLocalize.mockImplementation(() => mockLocalize as ReturnType<typeof useLocalize>);
        mockUseOnyx.mockImplementation(((...args: Parameters<typeof useOnyx>) => {
            const key = args[0];
            if (key === ONYXKEYS.CONCIERGE_REPORT_ID) {
                return createOnyxResult<string>('');
            }
            if (key === ONYXKEYS.COLLECTION.REPORT) {
                return createOnyxResult<typeof mockReports>(mockReports);
            }
            if (typeof key === 'string' && key.startsWith(ONYXKEYS.COLLECTION.REPORT)) {
                return createOnyxResult<Report | undefined>(mockCurrentReport);
            }
            return createOnyxResult<unknown>(undefined);
        }) as typeof useOnyx);
        mockUsePolicy.mockReturnValue(undefined);
        mockGetPolicyEmployeeAccountIDs.mockReturnValue([]);
    });

    it('shows user mention suggestions when prefix has a trailing dot', async () => {
        mockPersonalDetails = {};
        mockPersonalDetails[2] = {
            accountID: 2,
            login: 'adam@example.com',
            firstName: 'Adam',
            lastName: 'Tester',
        };

        renderSuggestionMention('@a.');

        await waitFor(() => expect(mockMentionSuggestionsSpy).toHaveBeenCalled());
        const {prefix, mentions} = getLastMentionSuggestionsProps();

        expect(prefix).toBe('a.');
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

        act(() => onSelect(0));

        expect(updateComment).toHaveBeenCalledWith('@adam@example.com. ', true);
        expect(setSelection).toHaveBeenCalledWith({start: 19, end: 19});
    });

    it('does not append an extra trailing dot and inserts trailing space when selected mention already matches dotted prefix', async () => {
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

        act(() => onSelect(0));

        expect(updateComment).toHaveBeenCalledWith('@a.smith@example.com ', true);
        expect(setSelection).toHaveBeenCalledWith({start: 21, end: 21});
    });

    it('does not insert trailing space when mention is followed by a comma (punctuation)', async () => {
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

        act(() => onSelect(0));

        expect(updateComment).toHaveBeenCalledWith('@adam@example.com, thanks', true);
        expect(setSelection).toHaveBeenCalledWith({start: 17, end: 17});
    });

    it('inserts trailing space when mention is followed by a regular word', async () => {
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

        act(() => onSelect(0));

        expect(updateComment).toHaveBeenCalledWith('@adam@example.com thanks', true);
        expect(setSelection).toHaveBeenCalledWith({start: 18, end: 18});
    });

    describe('shouldWeightDetails', () => {
        const PARTICIPANT_ACCOUNT_ID = 2;
        const POLICY_EMPLOYEE_ACCOUNT_ID = 3;
        const UNRELATED_ACCOUNT_ID = 4;

        const setupPersonalDetails = () => {
            mockPersonalDetails = {};
            // Alphabetical order is ua, ub, uc - weighted order should be uc, ub, ua.
            mockPersonalDetails[PARTICIPANT_ACCOUNT_ID] = {accountID: PARTICIPANT_ACCOUNT_ID, login: 'uc@example.com'};
            mockPersonalDetails[POLICY_EMPLOYEE_ACCOUNT_ID] = {accountID: POLICY_EMPLOYEE_ACCOUNT_ID, login: 'ub@example.com'};
            mockPersonalDetails[UNRELATED_ACCOUNT_ID] = {accountID: UNRELATED_ACCOUNT_ID, login: 'ua@example.com'};
        };

        const buildReportWithParticipant = (overrides: Partial<Report>): Report => {
            const participants: Record<number, {notificationPreference: string}> = {};
            participants[PARTICIPANT_ACCOUNT_ID] = {notificationPreference: 'always'};
            return {...overrides, participants} as unknown as Report;
        };

        it('weights report participants above policy employees and everyone else for a group chat', async () => {
            setupPersonalDetails();
            mockUseCurrentReportIDState.mockReturnValue({currentReportID: 'group1'});
            mockCurrentReport = buildReportWithParticipant({
                reportID: 'group1',
                chatType: 'group' as Report['chatType'],
            });
            mockGetPolicyEmployeeAccountIDs.mockReturnValue([POLICY_EMPLOYEE_ACCOUNT_ID]);

            renderSuggestionMention('@u');

            await waitFor(() => expect(mockMentionSuggestionsSpy).toHaveBeenCalled());
            const {mentions} = getLastMentionSuggestionsProps();

            expect(mentions.map((mention) => mention.handle)).toEqual(['uc@example.com', 'ub@example.com', 'ua@example.com']);
        });

        it('weights details when the current report belongs to the active workspace', async () => {
            setupPersonalDetails();
            mockUseCurrentReportIDState.mockReturnValue({currentReportID: 'wsp1'});
            mockCurrentReport = buildReportWithParticipant({
                reportID: 'wsp1',
                chatType: 'policyExpenseChat' as Report['chatType'],
                policyID: 'policyID',
            });
            mockGetPolicyEmployeeAccountIDs.mockReturnValue([POLICY_EMPLOYEE_ACCOUNT_ID]);

            renderSuggestionMention('@u');

            await waitFor(() => expect(mockMentionSuggestionsSpy).toHaveBeenCalled());
            const {mentions} = getLastMentionSuggestionsProps();

            expect(mentions.map((mention) => mention.handle)).toEqual(['uc@example.com', 'ub@example.com', 'ua@example.com']);
        });

        it('skips weighting for a 1:1 DM and falls back to alphabetical order', async () => {
            setupPersonalDetails();
            mockUseCurrentReportIDState.mockReturnValue({currentReportID: 'dm1'});
            mockCurrentReport = buildReportWithParticipant({reportID: 'dm1'});
            mockGetPolicyEmployeeAccountIDs.mockReturnValue([POLICY_EMPLOYEE_ACCOUNT_ID]);

            renderSuggestionMention('@u');

            await waitFor(() => expect(mockMentionSuggestionsSpy).toHaveBeenCalled());
            const {mentions} = getLastMentionSuggestionsProps();

            expect(mentions.map((mention) => mention.handle)).toEqual(['ua@example.com', 'ub@example.com', 'uc@example.com']);
        });
    });
});
