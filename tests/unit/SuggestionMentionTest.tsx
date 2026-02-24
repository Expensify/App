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
import SuggestionMention from '@pages/inbox/report/ReportActionCompose/SuggestionMention';
import ONYXKEYS from '@src/ONYXKEYS';
import type {PersonalDetailsList} from '@src/types/onyx';

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

const mockUsePersonalDetails = jest.mocked(usePersonalDetails);
const mockUseArrowKeyFocusManager = jest.mocked(useArrowKeyFocusManager);
const mockUseCurrentReportIDState = jest.mocked(useCurrentReportIDState);
const mockUseCurrentUserPersonalDetails = jest.mocked(useCurrentUserPersonalDetails);
const mockUseDebounce = jest.mocked(useDebounce);
const mockUseMemoizedLazyExpensifyIcons = jest.mocked(useMemoizedLazyExpensifyIcons);
const mockUseLocalize = jest.mocked(useLocalize);
const mockUseOnyx = jest.mocked(useOnyx);
const mockUsePolicy = jest.mocked(usePolicy);

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

        mockUsePersonalDetails.mockImplementation(() => mockPersonalDetails);
        mockUseArrowKeyFocusManager.mockReturnValue([0, mockSetHighlightedMentionIndex, {current: null}]);
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
            if (key === ONYXKEYS.COLLECTION.REPORT) {
                return createOnyxResult<typeof mockReports>(mockReports);
            }
            if (key === ONYXKEYS.CONCIERGE_REPORT_ID) {
                return createOnyxResult<string>('');
            }
            return createOnyxResult<unknown>(undefined);
        }) as typeof useOnyx);
        mockUsePolicy.mockReturnValue(undefined);
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

    it('preserves trailing punctuation dot when selected mention does not include dotted prefix', async () => {
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

        expect(updateComment).toHaveBeenCalledWith('@adam@example.com.', true);
        expect(setSelection).toHaveBeenCalledWith({start: 18, end: 18});
    });

    it('does not append an extra trailing dot when selected mention already matches dotted prefix', async () => {
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

        expect(updateComment).toHaveBeenCalledWith('@a.smith@example.com', true);
        expect(setSelection).toHaveBeenCalledWith({start: 21, end: 21});
    });
});
