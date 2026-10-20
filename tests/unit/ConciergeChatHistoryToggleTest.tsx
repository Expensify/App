import {fireEvent, render, screen} from '@testing-library/react-native';

import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';

import {IsInSidePanelContext} from '@hooks/useIsInSidePanel';

import ConciergeChatHistoryToggle from '@pages/inbox/report/ConciergeChatHistoryToggle';

import CONST from '@src/CONST';
import IntlStore from '@src/languages/IntlStore';
import ONYXKEYS from '@src/ONYXKEYS';

import React from 'react';
import Onyx from 'react-native-onyx';

import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

jest.mock('@hooks/useLazyAsset', () => ({
    useMemoizedLazyExpensifyIcons: () => ({UpArrow: 'UpArrow', DownArrow: 'DownArrow'}),
}));

const mockSetShowFullHistory = jest.fn();

jest.mock('@pages/inbox/ConciergeChatHistoryContext', () => ({
    useConciergeChatHistoryState: () => ({showFullHistory: false}),
    useConciergeChatHistoryActions: () => ({setShowFullHistory: mockSetShowFullHistory}),
}));

const CONCIERGE_REPORT_ID = '1';

const renderToggle = (overrides: {hasPreviousMessages?: boolean; shouldShowFullHistory?: boolean} = {}) => {
    const onShowPreviousMessages = jest.fn();
    render(
        <OnyxListItemProvider>
            <LocaleContextProvider>
                <IsInSidePanelContext.Provider value={false}>
                    <ConciergeChatHistoryToggle
                        reportID={CONCIERGE_REPORT_ID}
                        hasPreviousMessages={overrides.hasPreviousMessages ?? true}
                        shouldShowFullHistory={overrides.shouldShowFullHistory ?? false}
                        onShowPreviousMessages={onShowPreviousMessages}
                    />
                </IsInSidePanelContext.Provider>
            </LocaleContextProvider>
        </OnyxListItemProvider>,
    );
    return {onShowPreviousMessages};
};

describe('ConciergeChatHistoryToggle', () => {
    beforeAll(async () => {
        await IntlStore.load(CONST.LOCALES.EN);
        await Onyx.set(ONYXKEYS.CONCIERGE_REPORT_ID, CONCIERGE_REPORT_ID);
        await waitForBatchedUpdates();
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('reveals the earlier conversation when history is hidden', () => {
        // Given the earlier conversation is hidden
        const {onShowPreviousMessages} = renderToggle();
        expect(screen.getByText('View chat history')).toBeTruthy();

        // When the user presses the toggle
        fireEvent.press(screen.getByRole('button'));

        // Then the earlier conversation is revealed
        expect(onShowPreviousMessages).toHaveBeenCalledTimes(1);
    });

    it('collapses the earlier conversation when history is shown', () => {
        // Given the earlier conversation is shown
        const {onShowPreviousMessages} = renderToggle({shouldShowFullHistory: true});
        expect(screen.getByText('Hide chat history')).toBeTruthy();

        // When the user presses the toggle
        fireEvent.press(screen.getByRole('button'));

        // Then the history collapses, so the chat goes back to its welcome state
        expect(mockSetShowFullHistory).toHaveBeenCalledWith(false);
        expect(onShowPreviousMessages).not.toHaveBeenCalled();
    });

    it('renders nothing when there is no earlier conversation to reveal', () => {
        // Given a Concierge chat with no earlier conversation
        // When the toggle renders
        renderToggle({hasPreviousMessages: false});

        // Then there is nothing to toggle, so no button shows
        expect(screen.queryByRole('button')).toBeNull();
    });
});
