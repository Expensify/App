import {render} from '@testing-library/react-native';

import TransitionTracker from '@libs/Navigation/TransitionTracker';

import DeleteTransactionNavigateBackHandler from '@pages/inbox/DeleteTransactionNavigateBackHandler';

import {setDeleteTransactionNavigateBackUrl} from '@userActions/Report';

import ONYXKEYS from '@src/ONYXKEYS';

import type * as Navigation from '@react-navigation/native';

import Onyx from 'react-native-onyx';

import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

jest.mock('@react-navigation/native', () => ({
    ...jest.requireActual<typeof Navigation>('@react-navigation/native'),
    useIsFocused: jest.fn(() => true),
}));

jest.mock('@libs/Navigation/TransitionTracker', () => ({
    runAfterTransitions: jest.fn(({callback}: {callback: () => void}) => {
        callback();
        return {cancel: jest.fn()};
    }),
}));

const REPORT_URL = 'r/123';
const NEXT_REPORT_URL = 'r/456';
const DUPLICATES_REVIEW_URL = 'r/123/duplicates/review';

async function flushClear() {
    await waitForBatchedUpdates();
    await new Promise<void>((resolve) => {
        requestAnimationFrame(() => resolve());
    });
    await waitForBatchedUpdates();
}

async function getNavigateBackUrl() {
    return new Promise<string | undefined>((resolve) => {
        const connection = Onyx.connectWithoutView({
            key: ONYXKEYS.NVP_DELETE_TRANSACTION_NAVIGATE_BACK_URL,
            callback: (value) => {
                Onyx.disconnect(connection);
                resolve(value);
            },
        });
    });
}

describe('DeleteTransactionNavigateBackHandler', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        await Onyx.clear();
        await waitForBatchedUpdates();
    });

    it('clears the navigate back URL when the focused screen unmounts', async () => {
        // Given a focused expense screen that was just deleted, so the URL is set while it is still focused
        const {unmount} = render(<DeleteTransactionNavigateBackHandler />);
        await Onyx.set(ONYXKEYS.NVP_DELETE_TRANSACTION_NAVIGATE_BACK_URL, REPORT_URL);
        await waitForBatchedUpdates();

        // When the native stack pops it, it unmounts without ever rendering unfocused
        unmount();
        await flushClear();

        // Then the URL is cleared so it does not leak into the next expense
        expect(await getNavigateBackUrl()).toBeUndefined();
    });

    it('keeps the navigate back URL while the screen stays focused', async () => {
        // Given a focused expense screen with the URL set
        render(<DeleteTransactionNavigateBackHandler />);
        await Onyx.set(ONYXKEYS.NVP_DELETE_TRANSACTION_NAVIGATE_BACK_URL, REPORT_URL);

        // When nothing navigates away
        await flushClear();

        // Then the URL stays, so the deleted expense does not flash Not Found before the pop
        expect(await getNavigateBackUrl()).toBe(REPORT_URL);
    });

    it('keeps the duplicates review URL when the screen unmounts', async () => {
        // Given a focused screen whose URL points to duplicates review, which clears the URL by itself
        const {unmount} = render(<DeleteTransactionNavigateBackHandler />);
        await Onyx.set(ONYXKEYS.NVP_DELETE_TRANSACTION_NAVIGATE_BACK_URL, DUPLICATES_REVIEW_URL);
        await waitForBatchedUpdates();

        // When the screen unmounts
        unmount();
        await flushClear();

        // Then the URL is left for the duplicates review flow
        expect(await getNavigateBackUrl()).toBe(DUPLICATES_REVIEW_URL);
    });

    it('does not clear a newer deletion URL from a remount clear that is still waiting', async () => {
        // Given a screen that remounts without a deletion, so its clear waits for a later transition
        let pendingCallback: (() => void) | undefined;
        let isCancelled = false;
        jest.mocked(TransitionTracker.runAfterTransitions).mockImplementationOnce(({callback}) => {
            pendingCallback = () => {
                callback();
            };
            return {
                cancel: () => {
                    isCancelled = true;
                },
            };
        });
        const {unmount} = render(<DeleteTransactionNavigateBackHandler />);
        unmount();

        // When the next expense is deleted before that transition finishes
        setDeleteTransactionNavigateBackUrl(NEXT_REPORT_URL);
        await waitForBatchedUpdates();
        if (!isCancelled) {
            pendingCallback?.();
        }
        await flushClear();

        // Then the stale clear is cancelled and the new URL stays until its own screen leaves
        expect(isCancelled).toBe(true);
        expect(await getNavigateBackUrl()).toBe(NEXT_REPORT_URL);
    });
});
