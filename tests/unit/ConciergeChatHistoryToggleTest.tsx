import {fireEvent, render, screen} from '@testing-library/react-native';

import OnyxListItemProvider from '@components/OnyxListItemProvider';

import {IsInSidePanelContext} from '@hooks/useIsInSidePanel';

import ConciergeChatHistoryToggle from '@pages/inbox/report/ConciergeChatHistoryToggle';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import React from 'react';
import Onyx from 'react-native-onyx';

import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

jest.mock('@hooks/useLazyAsset', () => ({
    useMemoizedLazyExpensifyIcons: () => ({UpArrow: 'UpArrow', DownArrow: 'DownArrow'}),
}));

const mockSetShowFullHistory = jest.fn();
let showFullHistory = false;

jest.mock('@pages/inbox/ConciergeSessionContext', () => ({
    useConciergeSessionState: () => ({sessionStartTime: '2024-06-01 12:00:00.000', showFullHistory, hadMessagesAtSessionStart: false}),
    useConciergeSessionActions: () => ({setShowFullHistory: mockSetShowFullHistory}),
}));

const CONCIERGE_REPORT_ID = '1';

const renderToggle = (overrides: {hasPreviousMessages?: boolean} = {}) => {
    const onShowPreviousMessages = jest.fn();
    render(
        <OnyxListItemProvider>
            <IsInSidePanelContext.Provider value={false}>
                <ConciergeChatHistoryToggle
                    reportID={CONCIERGE_REPORT_ID}
                    hasPreviousMessages={overrides.hasPreviousMessages ?? true}
                    onShowPreviousMessages={onShowPreviousMessages}
                />
            </IsInSidePanelContext.Provider>
        </OnyxListItemProvider>,
    );
    return {onShowPreviousMessages};
};

describe('ConciergeChatHistoryToggle', () => {
    beforeAll(async () => {
        await Onyx.set(ONYXKEYS.CONCIERGE_REPORT_ID, CONCIERGE_REPORT_ID);
        await Onyx.set(ONYXKEYS.BETAS, [CONST.BETAS.CONCIERGE_RESPOND_IN_THREAD]);
        await waitForBatchedUpdates();
    });

    beforeEach(() => {
        jest.clearAllMocks();
        showFullHistory = false;
    });

    it('reveals the earlier conversation when history is hidden', () => {
        const {onShowPreviousMessages} = renderToggle();

        expect(screen.getByText('View chat history')).toBeTruthy();
        fireEvent.press(screen.getByRole('button'));
        expect(onShowPreviousMessages).toHaveBeenCalledTimes(1);
    });

    it('collapses the earlier conversation when history is shown', () => {
        showFullHistory = true;
        const {onShowPreviousMessages} = renderToggle();

        expect(screen.getByText('Hide chat history')).toBeTruthy();
        fireEvent.press(screen.getByRole('button'));
        expect(mockSetShowFullHistory).toHaveBeenCalledWith(false);
        expect(onShowPreviousMessages).not.toHaveBeenCalled();
    });

    it('renders nothing when there is no earlier conversation to reveal', () => {
        renderToggle({hasPreviousMessages: false});
        expect(screen.queryByRole('button')).toBeNull();
    });

    it('renders nothing when the Ask Concierge beta is disabled', async () => {
        await Onyx.set(ONYXKEYS.BETAS, []);
        await waitForBatchedUpdates();

        renderToggle();
        expect(screen.queryByRole('button')).toBeNull();

        await Onyx.set(ONYXKEYS.BETAS, [CONST.BETAS.CONCIERGE_RESPOND_IN_THREAD]);
        await waitForBatchedUpdates();
    });
});
