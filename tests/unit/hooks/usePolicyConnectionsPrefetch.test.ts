import {act, renderHook, waitFor} from '@testing-library/react-native';

import useAppFocusEvent from '@hooks/useAppFocusEvent';
import useIsScreenFocused from '@hooks/useIsScreenFocused';
import useNetwork from '@hooks/useNetwork';
import usePolicyConnectionsPrefetch from '@hooks/usePolicyConnectionsPrefetch';

import * as PolicyConnections from '@libs/actions/PolicyConnections';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy} from '@src/types/onyx';

import Onyx from 'react-native-onyx';

import createRandomPolicy from '../../utils/collections/policies';
import waitForBatchedUpdates from '../../utils/waitForBatchedUpdates';

jest.mock('@hooks/useAppFocusEvent', () => ({__esModule: true, default: jest.fn()}));
jest.mock('@hooks/useIsScreenFocused', () => ({__esModule: true, default: jest.fn(() => true)}));
jest.mock('@hooks/useNetwork', () => ({__esModule: true, default: jest.fn(() => ({isOffline: false}))}));

jest.mock('@libs/actions/PolicyConnections', () => {
    const actual: typeof PolicyConnections = jest.requireActual('@libs/actions/PolicyConnections');
    return {
        ...actual,
        openPolicyAccountingPage: jest.fn(),
    };
});

const useAppFocusEventMock = jest.mocked(useAppFocusEvent);
const useIsScreenFocusedMock = jest.mocked(useIsScreenFocused);
const useNetworkMock = jest.mocked(useNetwork);
const openPolicyAccountingPageMock = jest.mocked(PolicyConnections.openPolicyAccountingPage);

const POLICY_ID = '1';
const REFRESH_DEADLINE_KEY = `${ONYXKEYS.COLLECTION.POLICY_CONNECTIONS_REFRESH_DEADLINE}${POLICY_ID}` as const;

/**
 * Builds a policy with a Xero connection in the given configured state, or with no connections when `undefined`.
 * The code under test only reads `xero.config.isConfigured`, so the connection is deliberately minimal.
 */
const buildPolicy = (xeroIsConfigured?: boolean): Policy => ({
    ...createRandomPolicy(Number(POLICY_ID), CONST.POLICY.TYPE.CORPORATE),
    id: POLICY_ID,
    areConnectionsEnabled: true,
    // Spelling out a full Xero connection would add dozens of fields none of this code reads.
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
    connections: (xeroIsConfigured === undefined ? {} : {[CONST.POLICY.CONNECTIONS.NAME.XERO]: {config: {isConfigured: xeroIsConfigured}}}) as Policy['connections'],
});

/** Renders the hook for a policy whose connections were already lazily fetched, so only the post-setup refresh can fire. */
const renderForPolicy = async (policy: Policy) => {
    const utils = renderHook(({currentPolicy}: {currentPolicy: Policy}) => usePolicyConnectionsPrefetch(currentPolicy, true), {initialProps: {currentPolicy: policy}});
    await waitForBatchedUpdates();
    return utils;
};

/** Fires the app-focus event the hook subscribed to (the web signal — returning to the NewDot browser tab). */
const fireAppFocus = async () => {
    const callback = useAppFocusEventMock.mock.calls.at(-1)?.[0];
    act(() => callback?.());
    await waitForBatchedUpdates();
};

/** Reads the current stale marker straight out of Onyx. */
const readDeadline = () =>
    new Promise<number | undefined>((resolve) => {
        const connection = Onyx.connect({
            key: REFRESH_DEADLINE_KEY,
            callback: (value) => {
                Onyx.disconnect(connection);
                resolve(value);
            },
        });
    });

describe('usePolicyConnectionsPrefetch', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        jest.clearAllMocks();
        useIsScreenFocusedMock.mockReturnValue(true);
        useNetworkMock.mockReturnValue({isOffline: false} as ReturnType<typeof useNetwork>);
        await Onyx.clear();
        // The bug this covers only happens once the write-once lazy fetch has already run for this policy.
        await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY_HAS_CONNECTIONS_DATA_BEEN_FETCHED}${POLICY_ID}`, true);
        await waitForBatchedUpdates();
    });

    afterEach(async () => {
        await Onyx.clear();
    });

    describe('marking connections stale at an external setup handoff', () => {
        it('records a future deadline without issuing a read of its own', async () => {
            PolicyConnections.markPolicyConnectionsAsStale(POLICY_ID);
            await waitForBatchedUpdates();

            const deadline = await readDeadline();

            expect(deadline).toBeGreaterThan(Date.now());
            expect(deadline).toBeLessThanOrEqual(Date.now() + CONST.POLICY.CONNECTIONS.REFRESH_AFTER_SETUP_WINDOW_MS);
            expect(openPolicyAccountingPageMock).not.toHaveBeenCalled();
        });
    });

    describe('refreshing after the handoff', () => {
        it('does not refresh a policy that was never marked stale', async () => {
            await renderForPolicy(buildPolicy());

            await fireAppFocus();

            expect(openPolicyAccountingPageMock).not.toHaveBeenCalled();
        });

        it('refreshes on app focus, which is the signal on web where setup opens a separate browser tab', async () => {
            await Onyx.merge(REFRESH_DEADLINE_KEY, Date.now() + CONST.POLICY.CONNECTIONS.REFRESH_AFTER_SETUP_WINDOW_MS);
            await renderForPolicy(buildPolicy(false));
            openPolicyAccountingPageMock.mockClear();

            await fireAppFocus();

            expect(openPolicyAccountingPageMock).toHaveBeenCalledWith(POLICY_ID);
        });

        it('refreshes when the screen regains focus, which is the only signal on native where setup runs in an in-app WebView', async () => {
            await Onyx.merge(REFRESH_DEADLINE_KEY, Date.now() + CONST.POLICY.CONNECTIONS.REFRESH_AFTER_SETUP_WINDOW_MS);
            useIsScreenFocusedMock.mockReturnValue(false);
            const {rerender} = await renderForPolicy(buildPolicy(false));
            openPolicyAccountingPageMock.mockClear();

            useIsScreenFocusedMock.mockReturnValue(true);
            rerender({currentPolicy: buildPolicy(false)});
            await waitForBatchedUpdates();

            expect(openPolicyAccountingPageMock).toHaveBeenCalledWith(POLICY_ID);
        });

        it('does not refresh while offline', async () => {
            useNetworkMock.mockReturnValue({isOffline: true} as ReturnType<typeof useNetwork>);
            await Onyx.merge(REFRESH_DEADLINE_KEY, Date.now() + CONST.POLICY.CONNECTIONS.REFRESH_AFTER_SETUP_WINDOW_MS);
            await renderForPolicy(buildPolicy(false));
            openPolicyAccountingPageMock.mockClear();

            await fireAppFocus();

            expect(openPolicyAccountingPageMock).not.toHaveBeenCalled();
        });
    });

    describe('clearing the stale marker', () => {
        it('keeps the marker when the refresh lands before the sync has configured the connection', async () => {
            await Onyx.merge(REFRESH_DEADLINE_KEY, Date.now() + CONST.POLICY.CONNECTIONS.REFRESH_AFTER_SETUP_WINDOW_MS);
            await renderForPolicy(buildPolicy(false));

            await fireAppFocus();

            // Without this the switch would be stranded OFF until a manual re-sync — the reported bug.
            await expect(readDeadline()).resolves.toBeGreaterThan(Date.now());
        });

        it('clears the marker and stops refreshing once the connection reports isConfigured', async () => {
            await Onyx.merge(REFRESH_DEADLINE_KEY, Date.now() + CONST.POLICY.CONNECTIONS.REFRESH_AFTER_SETUP_WINDOW_MS);
            const {rerender} = await renderForPolicy(buildPolicy(false));

            rerender({currentPolicy: buildPolicy(true)});
            await waitForBatchedUpdates();

            await waitFor(async () => {
                await expect(readDeadline()).resolves.toBeUndefined();
            });

            openPolicyAccountingPageMock.mockClear();
            await fireAppFocus();
            expect(openPolicyAccountingPageMock).not.toHaveBeenCalled();
        });

        it('clears the marker without refreshing once the window has passed', async () => {
            await Onyx.merge(REFRESH_DEADLINE_KEY, Date.now() - 1);
            await renderForPolicy(buildPolicy(false));
            openPolicyAccountingPageMock.mockClear();

            await fireAppFocus();

            expect(openPolicyAccountingPageMock).not.toHaveBeenCalled();
            await waitFor(async () => {
                await expect(readDeadline()).resolves.toBeUndefined();
            });
        });
    });
});
