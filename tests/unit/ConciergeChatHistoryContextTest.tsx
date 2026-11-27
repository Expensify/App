import {act, render} from '@testing-library/react-native';

import {IsInSidePanelContext} from '@hooks/useIsInSidePanel';

import {ConciergeChatHistoryProvider, useConciergeChatHistoryActions, useConciergeChatHistoryState} from '@pages/inbox/ConciergeChatHistoryContext';

import {readNewestAction} from '@userActions/Report';

import React from 'react';

const MOCK_CONCIERGE_REPORT_ID = '100';

jest.mock('@hooks/useOnyx', () => jest.fn(() => [MOCK_CONCIERGE_REPORT_ID]));
jest.mock('@userActions/Report', () => ({readNewestAction: jest.fn()}));

type PaneHandle = {
    renderCount: number;
    showFullHistory: boolean;
    setShowFullHistory: (show: boolean) => void;
    collapseHistory: () => void;
};

type PaneProbeProps = {
    handle: Partial<PaneHandle>;
    isInSidePanelOverride?: boolean;
};

function PaneProbe({handle, isInSidePanelOverride}: PaneProbeProps) {
    const {showFullHistory} = useConciergeChatHistoryState();
    const {setShowFullHistory, collapseHistory} = useConciergeChatHistoryActions(isInSidePanelOverride);
    Object.assign(handle, {renderCount: (handle.renderCount ?? 0) + 1, showFullHistory, setShowFullHistory, collapseHistory});
    return null;
}

function renderPanes() {
    const main: Partial<PaneHandle> = {};
    const sidePanel: Partial<PaneHandle> = {};
    const outsideSidePanelTargetingIt: Partial<PaneHandle> = {};
    render(
        <ConciergeChatHistoryProvider>
            <PaneProbe handle={main} />
            <PaneProbe
                handle={outsideSidePanelTargetingIt}
                isInSidePanelOverride
            />
            <IsInSidePanelContext.Provider value>
                <PaneProbe handle={sidePanel} />
            </IsInSidePanelContext.Provider>
        </ConciergeChatHistoryProvider>,
    );
    return {main, sidePanel, outsideSidePanelTargetingIt};
}

describe('ConciergeChatHistoryContext', () => {
    it('keeps the main pane history open when the side panel collapses its own', () => {
        // Given both panes show the Concierge chat with the history open
        const {main, sidePanel} = renderPanes();
        act(() => {
            main.setShowFullHistory?.(true);
            sidePanel.setShowFullHistory?.(true);
        });

        // When the side panel starts a new chat, which collapses its history
        act(() => sidePanel.collapseHistory?.());

        // Then only the side panel goes back to the welcome screen
        expect(sidePanel.showFullHistory).toBe(false);
        expect(main.showFullHistory).toBe(true);
    });

    it('keeps the side panel history closed when the main pane opens its own', () => {
        // Given both panes show the Concierge welcome screen
        const {main, sidePanel} = renderPanes();

        // When the main pane opens its history
        act(() => main.setShowFullHistory?.(true));

        // Then the side panel stays on the welcome screen
        expect(main.showFullHistory).toBe(true);
        expect(sidePanel.showFullHistory).toBe(false);
    });

    it('lets a caller outside the side panel open the history there', () => {
        // Given a caller outside the side panel that opens the Concierge chat in it, like Ask Concierge on web
        const {main, sidePanel, outsideSidePanelTargetingIt} = renderPanes();

        // When it opens the history so a task it created is visible
        act(() => outsideSidePanelTargetingIt.setShowFullHistory?.(true));

        // Then the side panel shows the history and the main pane is left alone
        expect(sidePanel.showFullHistory).toBe(true);
        expect(main.showFullHistory).toBe(false);
    });

    it('marks the Concierge chat as read when a pane collapses its history', () => {
        // Given the side panel shows the Concierge chat with the history open
        const {sidePanel} = renderPanes();
        act(() => sidePanel.setShowFullHistory?.(true));

        // When the side panel collapses its history
        act(() => sidePanel.collapseHistory?.());

        // Then the chat is marked as read, so an unread reply doesn't reopen the history in either pane
        expect(readNewestAction).toHaveBeenCalledWith(MOCK_CONCIERGE_REPORT_ID, true);
    });

    it('does not rerender either pane when the history is set to the value it already has', () => {
        // Given the side panel history is open
        const {main, sidePanel} = renderPanes();
        act(() => sidePanel.setShowFullHistory?.(true));
        const mainRenderCount = main.renderCount;
        const sidePanelRenderCount = sidePanel.renderCount;

        // When something opens it again, like a second unread reply arriving
        act(() => sidePanel.setShowFullHistory?.(true));

        // Then nothing rerenders, because the state did not change
        expect(main.renderCount).toBe(mainRenderCount);
        expect(sidePanel.renderCount).toBe(sidePanelRenderCount);
    });
});
