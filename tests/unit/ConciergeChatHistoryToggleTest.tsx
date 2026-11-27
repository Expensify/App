import {fireEvent, render, screen} from '@testing-library/react-native';

import {LocaleContextProvider} from '@components/LocaleContextProvider';

import {AskConciergeContext} from '@hooks/useIsInAskConcierge';

import ConciergeChatHistoryToggle from '@pages/inbox/report/ConciergeChatHistoryToggle';

import CONST from '@src/CONST';
import IntlStore from '@src/languages/IntlStore';

import React from 'react';

jest.mock('@hooks/useLazyAsset', () => ({
    useMemoizedLazyExpensifyIcons: () => ({UpArrow: 'UpArrow', DownArrow: 'DownArrow'}),
}));

const renderToggle = (isHistoryShown: boolean, isInAskConcierge = false) => {
    const onPress = jest.fn();
    render(
        <LocaleContextProvider>
            <AskConciergeContext.Provider value={isInAskConcierge}>
                <ConciergeChatHistoryToggle
                    isHistoryShown={isHistoryShown}
                    onPress={onPress}
                />
            </AskConciergeContext.Provider>
        </LocaleContextProvider>,
    );
    return {onPress};
};

describe('ConciergeChatHistoryToggle', () => {
    beforeAll(async () => {
        await IntlStore.load(CONST.LOCALES.EN);
    });

    it('offers to show the earlier conversation while it is hidden', () => {
        // Given the earlier conversation is hidden
        const {onPress} = renderToggle(false);

        // When the user presses `View chat history`
        fireEvent.press(screen.getByText('View chat history'));

        // Then the press is handled
        expect(onPress).toHaveBeenCalledTimes(1);
    });

    it('offers to hide the earlier conversation while it is shown', () => {
        // Given the earlier conversation is shown
        const {onPress} = renderToggle(true);

        // When the user presses `Hide chat history`
        fireEvent.press(screen.getByText('Hide chat history'));

        // Then the press is handled
        expect(onPress).toHaveBeenCalledTimes(1);
    });

    it.each([false, true])('renders no history button or dividers on the Concierge page when history is shown: %s', (isHistoryShown) => {
        // Given the dedicated Concierge page, which already has its own Recents list
        // When the shared history toggle is rendered in either history state
        renderToggle(isHistoryShown, true);

        // Then neither the button nor its surrounding row occupies space on the page
        expect(screen.toJSON()).toBeNull();
        expect(screen.queryByText('View chat history')).toBeNull();
        expect(screen.queryByText('Hide chat history')).toBeNull();
    });
});
