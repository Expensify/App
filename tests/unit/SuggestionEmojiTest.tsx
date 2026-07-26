import {act, render, waitFor} from '@testing-library/react-native';

import type {Emoji} from '@assets/emojis/types';

import type {TextSelection} from '@components/Composer/types';

import useArrowKeyFocusManager from '@hooks/useArrowKeyFocusManager';
import useDebounce from '@hooks/useDebounce';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';

import {suggestEmojis} from '@libs/EmojiUtils';

import type {SuggestionsRef} from '@pages/inbox/report/ReportActionCompose/ReportActionCompose';
import SuggestionEmoji from '@pages/inbox/report/ReportActionCompose/SuggestionEmoji';

import CONST from '@src/CONST';

import type {UseOnyxResult} from 'react-native-onyx';

import React from 'react';

type EmojiSuggestionsProps = {
    emojis: Emoji[];
    prefix: string;
};

const mockEmojiSuggestionsSpy = jest.fn<void, [EmojiSuggestionsProps]>();
const mockSetHighlightedEmojiIndex = jest.fn<void, [number]>();
const mockLocalize: ReturnType<typeof useLocalize> = {
    translate: () => '',
    numberFormat: () => '',
    getLocalDateFromDatetime: () => new Date(),
    datetimeToRelative: () => '',
    datetimeToCalendarTime: () => '',
    formatPhoneNumber: () => '',
    toLocaleDigit: () => '',
    toLocaleOrdinal: () => '',
    fromLocaleDigit: () => '',
    localeCompare: () => 0,
    formatTravelDate: () => '',
    preferredLocale: CONST.LOCALES.DEFAULT,
};
const mockEmoji: Emoji = {code: '😄', name: 'smile', hexcode: '1F604', types: []};

function createOnyxResult<T>(value: NonNullable<T> | undefined): UseOnyxResult<T> {
    return [value, {status: 'loaded'}];
}

jest.mock('@components/EmojiSuggestions', () => {
    const ReactLib = jest.requireActual<typeof React>('react');
    const module = {
        default: (props: EmojiSuggestionsProps) => {
            mockEmojiSuggestionsSpy(props);
            return ReactLib.createElement('mock-emoji-suggestions', props);
        },
    };
    Object.defineProperty(module, '__esModule', {value: true});
    return module;
});

jest.mock('@hooks/useArrowKeyFocusManager', () => jest.fn());
jest.mock('@hooks/useDebounce', () => jest.fn());
jest.mock('@hooks/useLocalize', () => jest.fn());
jest.mock('@hooks/useOnyx', () => jest.fn());
jest.mock('@libs/EmojiUtils', () => ({
    suggestEmojis: jest.fn(),
    isPositionInsideCodeBlock: jest.fn().mockReturnValue(false),
    getEmojiCodeForInsertion: jest.fn(),
}));

const mockUseArrowKeyFocusManager = jest.mocked(useArrowKeyFocusManager);
const mockUseDebounce = jest.mocked(useDebounce);
const mockUseLocalize = jest.mocked(useLocalize);
const mockUseOnyx = jest.mocked(useOnyx);
const mockSuggestEmojis = jest.mocked(suggestEmojis);

function renderSuggestionEmoji(value: string, selection: TextSelection = {start: value.length, end: value.length}, isComposerFocused = true) {
    const ref = React.createRef<SuggestionsRef>();
    const {rerender} = render(
        <SuggestionEmoji
            ref={ref}
            value={value}
            selection={selection}
            setSelection={jest.fn()}
            updateComment={jest.fn()}
            isAutoSuggestionPickerLarge
            measureParentContainerAndReportCursor={() => {}}
            isComposerFocused={isComposerFocused}
            isGroupPolicyReport={false}
        />,
    );

    const update = (nextValue: string, nextSelection: TextSelection = {start: nextValue.length, end: nextValue.length}, nextIsComposerFocused = true) =>
        rerender(
            <SuggestionEmoji
                ref={ref}
                value={nextValue}
                selection={nextSelection}
                setSelection={jest.fn()}
                updateComment={jest.fn()}
                isAutoSuggestionPickerLarge
                measureParentContainerAndReportCursor={() => {}}
                isComposerFocused={nextIsComposerFocused}
                isGroupPolicyReport={false}
            />,
        );

    return {ref, update};
}

function pressEscape(ref: React.RefObject<SuggestionsRef | null>) {
    act(() => {
        ref.current?.triggerHotkeyActions(new KeyboardEvent('keydown', {key: CONST.KEYBOARD_SHORTCUTS.ESCAPE.shortcutKey}));
    });
}

describe('SuggestionEmoji', () => {
    beforeEach(() => {
        mockEmojiSuggestionsSpy.mockClear();
        mockSetHighlightedEmojiIndex.mockClear();

        mockUseArrowKeyFocusManager.mockReturnValue([0, mockSetHighlightedEmojiIndex]);
        mockUseDebounce.mockImplementation((callback) => {
            const callbackRef = React.useRef(callback);
            callbackRef.current = callback;
            return React.useCallback((...args: unknown[]) => callbackRef.current(...args), []) as typeof callback;
        });
        mockUseLocalize.mockReturnValue(mockLocalize);
        mockUseOnyx.mockReturnValue(createOnyxResult<number>(CONST.EMOJI_DEFAULT_SKIN_TONE));
        mockSuggestEmojis.mockReturnValue([mockEmoji]);
    });

    it('shows the emoji suggestion list while typing a shortcode', async () => {
        const {ref} = renderSuggestionEmoji(':sm');

        await waitFor(() => expect(mockEmojiSuggestionsSpy).toHaveBeenCalled());
        expect(ref.current?.getIsSuggestionsMenuVisible()).toBe(true);
    });

    it('keeps the list closed when the composer is refocused after dismissing with ESC', async () => {
        const {ref, update} = renderSuggestionEmoji(':sm');

        await waitFor(() => expect(ref.current?.getIsSuggestionsMenuVisible()).toBe(true));

        // Dismiss the list with ESC, then simulate closing the FAB popover which refocuses the composer
        // with the same value/cursor (isComposerFocused flips false -> true).
        pressEscape(ref);
        expect(ref.current?.getIsSuggestionsMenuVisible()).toBe(false);

        act(() => update(':sm', {start: 3, end: 3}, false));
        act(() => update(':sm', {start: 3, end: 3}, true));

        expect(ref.current?.getIsSuggestionsMenuVisible()).toBe(false);
    });

    it('re-shows suggestions when the user types another character after dismissing with ESC', async () => {
        const {ref, update} = renderSuggestionEmoji(':sm');

        await waitFor(() => expect(ref.current?.getIsSuggestionsMenuVisible()).toBe(true));

        pressEscape(ref);
        expect(ref.current?.getIsSuggestionsMenuVisible()).toBe(false);

        // Typing another character changes the value, so the dismissal must not swallow it.
        act(() => update(':smi', {start: 4, end: 4}));

        await waitFor(() => expect(ref.current?.getIsSuggestionsMenuVisible()).toBe(true));
    });
});
