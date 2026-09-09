import {act} from '@testing-library/react-native';

import useSyncModalWithHistory from '@components/Modal/useSyncModalWithHistory';

import CONST from '@src/CONST';

import React from 'react';

import renderScreenWithCover from '../../utils/ScreenCoverHarness';
import waitForBatchedUpdatesWithAct from '../../utils/waitForBatchedUpdatesWithAct';

type ToggleModalWithHistoryAction = {
    type: string;
    payload: {isVisible: boolean; modalId: string};
};

/** Stand-in for the root navigator: it holds the guard entries the hook dispatches and notifies its state listeners. */
const mockRootNavigation = {
    history: [] as string[],
    routes: [{key: 'home'}],
    listeners: new Set<() => void>(),
    reset() {
        this.history = [];
        this.listeners = new Set();
    },
    notify() {
        for (const listener of this.listeners) {
            listener();
        }
    },
    toggleGuard({payload}: ToggleModalWithHistoryAction) {
        const guardEntry = `${CONST.NAVIGATION.CUSTOM_HISTORY_ENTRY_MODAL}:${payload.modalId}`;
        this.history = payload.isVisible ? [...this.history, guardEntry] : this.history.filter((entry) => entry !== guardEntry);
        this.notify();
    },
};

jest.mock('@libs/Navigation/navigationRef', () => ({
    __esModule: true,
    default: {
        isReady: () => true,
        getRootState: () => ({history: mockRootNavigation.history, routes: mockRootNavigation.routes}),
        addListener: (_event: string, listener: () => void) => {
            mockRootNavigation.listeners.add(listener);
            return () => mockRootNavigation.listeners.delete(listener);
        },
        dispatch: (action: ToggleModalWithHistoryAction) => mockRootNavigation.toggleGuard(action),
    },
}));

// jest resolves the native no-op of this hook by default, and the guard only exists on web.
jest.mock('@components/Modal/useSyncModalWithHistory', (): unknown => jest.requireActual('@components/Modal/useSyncModalWithHistory/index.ts'));

jest.mock('@libs/Navigation/Navigation', () => ({
    __esModule: true,
    default: {isNavigationReady: () => Promise.resolve()},
}));

/** The hook is the whole subject, so the host only exists to run it. */
function BackGuardedModal({isVisible, onClose}: {isVisible: boolean; onClose: () => void}) {
    useSyncModalWithHistory({isVisible, shouldHandleNavigationBack: true, onClose});
    return null;
}

/**
 * A Home popover that handles browser Back registers a tagged entry in root history and reads that entry back through
 * a store subscription. A cover drops both, so the reveal compares a snapshot taken before the cover against a root
 * history that moved while nobody was listening. Reduced as a real Back press, that closes a popover the user left
 * open.
 */
describe('useSyncModalWithHistory', () => {
    beforeEach(() => {
        mockRootNavigation.reset();
    });

    it('does not close a back-guarded modal that was open across a cover and reveal', async () => {
        const onClose = jest.fn();

        const screenCover = renderScreenWithCover(
            <BackGuardedModal
                isVisible
                onClose={onClose}
            />,
        );
        await waitForBatchedUpdatesWithAct();
        expect(mockRootNavigation.history).toHaveLength(1);

        await screenCover.hide();
        await screenCover.reveal();
        await waitForBatchedUpdatesWithAct();

        expect(onClose).not.toHaveBeenCalled();
        screenCover.unmount();
    });

    it('still closes the modal when the guard entry is removed by a browser Back', async () => {
        const onClose = jest.fn();

        const screenCover = renderScreenWithCover(
            <BackGuardedModal
                isVisible
                onClose={onClose}
            />,
        );
        await waitForBatchedUpdatesWithAct();

        // A browser Back drops the guard entry from root history and the navigator notifies its state listeners.
        mockRootNavigation.history = [];
        act(() => mockRootNavigation.notify());
        await waitForBatchedUpdatesWithAct();

        expect(onClose).toHaveBeenCalledTimes(1);
        screenCover.unmount();
    });
});
