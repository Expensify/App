/** Covers the real Suggestions forwarding interface for clear and caret notifications. */
import {act, render} from '@testing-library/react-native';

import type {CustomSelectionChangeEvent} from '@components/Composer/types';

import type {SuggestionsRef} from '@pages/inbox/report/ReportActionCompose/ComposerContext';
import Suggestions from '@pages/inbox/report/ReportActionCompose/Suggestions';

import type {TextInputSelectionChangeEvent} from 'react-native';

import React from 'react';

import createMock from '../utils/createMock';

const mockEmojiSelection = jest.fn<ReturnType<NonNullable<SuggestionsRef['onSelectionChange']>>, Parameters<NonNullable<SuggestionsRef['onSelectionChange']>>>();
const mockMentionSelection = jest.fn<ReturnType<NonNullable<SuggestionsRef['onSelectionChange']>>, Parameters<NonNullable<SuggestionsRef['onSelectionChange']>>>();

jest.mock('@components/DragAndDrop/Provider', () => ({useDragAndDropState: () => ({isDraggingOver: false})}));
jest.mock('@pages/inbox/report/ReportActionCompose/SuggestionEmoji', () => {
    const ReactModule = jest.requireActual<typeof React>('react');
    return ({ref}: {ref: React.Ref<SuggestionsRef>}) => {
        ReactModule.useImperativeHandle(ref, () => ({
            onSelectionChange: mockEmojiSelection,
            resetSuggestions: jest.fn<ReturnType<SuggestionsRef['resetSuggestions']>, Parameters<SuggestionsRef['resetSuggestions']>>(),
            triggerHotkeyActions: jest.fn<ReturnType<SuggestionsRef['triggerHotkeyActions']>, Parameters<SuggestionsRef['triggerHotkeyActions']>>(),
            updateShouldShowSuggestionMenuToFalse: jest.fn<
                ReturnType<SuggestionsRef['updateShouldShowSuggestionMenuToFalse']>,
                Parameters<SuggestionsRef['updateShouldShowSuggestionMenuToFalse']>
            >(),
            setShouldBlockSuggestionCalc: jest.fn<ReturnType<SuggestionsRef['setShouldBlockSuggestionCalc']>, Parameters<SuggestionsRef['setShouldBlockSuggestionCalc']>>(),
            getSuggestions: () => [],
            getIsSuggestionsMenuVisible: () => false,
        }));
        return null;
    };
});
jest.mock('@pages/inbox/report/ReportActionCompose/SuggestionMention', () => {
    const ReactModule = jest.requireActual<typeof React>('react');
    return ({ref}: {ref: React.Ref<SuggestionsRef>}) => {
        ReactModule.useImperativeHandle(ref, () => ({
            onSelectionChange: mockMentionSelection,
            resetSuggestions: jest.fn<ReturnType<SuggestionsRef['resetSuggestions']>, Parameters<SuggestionsRef['resetSuggestions']>>(),
            triggerHotkeyActions: jest.fn<ReturnType<SuggestionsRef['triggerHotkeyActions']>, Parameters<SuggestionsRef['triggerHotkeyActions']>>(),
            updateShouldShowSuggestionMenuToFalse: jest.fn<
                ReturnType<SuggestionsRef['updateShouldShowSuggestionMenuToFalse']>,
                Parameters<SuggestionsRef['updateShouldShowSuggestionMenuToFalse']>
            >(),
            setShouldBlockSuggestionCalc: jest.fn<ReturnType<SuggestionsRef['setShouldBlockSuggestionCalc']>, Parameters<SuggestionsRef['setShouldBlockSuggestionCalc']>>(),
            getSuggestions: () => [],
            getIsSuggestionsMenuVisible: () => false,
        }));
        return null;
    };
});

describe('Suggestions selection notifications', () => {
    beforeEach(() => jest.clearAllMocks());

    it.each([
        {nativeEvent: {selection: {start: 0, end: 0}}} satisfies CustomSelectionChangeEvent,
        createMock<TextInputSelectionChangeEvent>({nativeEvent: {selection: {start: 2, end: 4}}}),
        {nativeEvent: {selection: {start: 3, end: 3, positionX: 10, positionY: 20}}} satisfies CustomSelectionChangeEvent,
    ])('forwards selection $nativeEvent.selection in emoji then mention order', (notification) => {
        // Given clear supplies a minimal notification while real input/caret notifications retain their fields.
        const ref = React.createRef<SuggestionsRef>();
        render(
            <Suggestions
                ref={ref}
                value="text"
                selection={{start: 0, end: 0}}
                setSelection={() => {}}
                updateComment={() => {}}
                measureParentContainerAndReportCursor={() => {}}
                isGroupPolicyReport={false}
            />,
        );
        const selectionChanged = ref.current?.onSelectionChange;
        if (!selectionChanged) {
            throw new Error('Expected Suggestions selection interface');
        }

        // When the existing imperative interface receives the producer's notification.
        act(() => selectionChanged(notification));

        // Then both consumers receive the same object, preserving caret data and forwarding order.
        expect(mockEmojiSelection).toHaveBeenCalledWith(notification);
        expect(mockMentionSelection).toHaveBeenCalledWith(notification);
        const emojiCall = mockEmojiSelection.mock.calls.at(0);
        const mentionCall = mockMentionSelection.mock.calls.at(0);
        if (!emojiCall || !mentionCall) {
            throw new Error('Expected both selection notification calls');
        }
        expect(emojiCall[0]).toBe(notification);
        expect(mentionCall[0]).toBe(notification);
        const earlierCallOrder1 = mockEmojiSelection.mock.invocationCallOrder.at(0);
        const laterCallOrder1 = mockMentionSelection.mock.invocationCallOrder.at(0);
        if (earlierCallOrder1 === undefined || laterCallOrder1 === undefined) {
            throw new Error('Expected both invocation order values');
        }
        expect(earlierCallOrder1).toBeLessThan(laterCallOrder1);
    });
});
