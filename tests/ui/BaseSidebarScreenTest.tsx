import {act, render, screen} from '@testing-library/react-native';

import type useOnyx from '@hooks/useOnyx';

import {WRITE_COMMANDS} from '@libs/API/types';
import type * as NetworkStateModule from '@libs/NetworkState';

import BaseSidebarScreen from '@pages/inbox/sidebar/BaseSidebarScreen';

import ONYXKEYS from '@src/ONYXKEYS';
import type {AnyRequest} from '@src/types/onyx';

import React from 'react';
import Onyx from 'react-native-onyx';

import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

let mockHasLoadedAppStatus: 'loading' | 'loaded' = 'loaded';

jest.mock('@hooks/useOnyx', () => {
    const actualUseOnyx = jest.requireActual<{default: typeof useOnyx}>('@hooks/useOnyx').default;

    return {
        __esModule: true,
        default: (...args: Parameters<typeof useOnyx>) => {
            const result = actualUseOnyx(...args);
            return args.at(0) === 'hasLoadedApp' ? [result.at(0), {status: mockHasLoadedAppStatus}] : result;
        },
    };
});

jest.mock('@libs/NetworkState', () => ({
    ...jest.requireActual<typeof NetworkStateModule>('@libs/NetworkState'),
    getIsOffline: () => true,
}));

jest.mock('@components/ScreenWrapper', () => {
    const ReactModule = jest.requireActual<typeof React>('react');

    return function MockScreenWrapper({children}: {children: (args: {insets: Record<string, number>}) => React.ReactNode}) {
        return ReactModule.createElement('View', {testID: 'base-sidebar-screen'}, children({insets: {}}));
    };
});

jest.mock('@components/Navigation/TopBarWithLoadingBar', () => () => null);
jest.mock('@components/Navigation/TabBarBottomContent', () => () => null);
jest.mock('@pages/inbox/sidebar/InboxTabSelector', () => () => null);
jest.mock('@components/OptionsListSkeletonView', () => {
    const ReactModule = jest.requireActual<typeof React>('react');
    return () => ReactModule.createElement('View', {testID: 'sidebar-skeleton'});
});
jest.mock('@pages/inbox/sidebar/SidebarLinksData', () => {
    const ReactModule = jest.requireActual<typeof React>('react');
    return () => ReactModule.createElement('View', {testID: 'sidebar-content'});
});

const buildRequest = (command: AnyRequest['command'], initiatedOffline = false): AnyRequest => ({
    command,
    data: {},
    initiatedOffline,
});

async function setAppLoadState({hasLoadedApp, isLoadingApp, requests = []}: {hasLoadedApp: boolean; isLoadingApp: boolean; requests?: AnyRequest[]}) {
    await act(async () => {
        await Onyx.multiSet({
            [ONYXKEYS.HAS_LOADED_APP]: hasLoadedApp,
            [ONYXKEYS.IS_LOADING_APP]: isLoadingApp,
            [ONYXKEYS.PERSISTED_REQUESTS]: requests,
            [ONYXKEYS.PERSISTED_ONGOING_REQUESTS]: null,
        });
    });
    await waitForBatchedUpdatesWithAct();
}

describe('BaseSidebarScreen app load gate', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(() => {
        mockHasLoadedAppStatus = 'loaded';
    });

    afterEach(async () => {
        await act(async () => {
            await Onyx.clear();
        });
        await waitForBatchedUpdatesWithAct();
    });

    it('shows the skeleton during a cold OpenApp load', async () => {
        await setAppLoadState({
            hasLoadedApp: false,
            isLoadingApp: false,
            requests: [buildRequest(WRITE_COMMANDS.OPEN_APP)],
        });

        render(<BaseSidebarScreen />);
        await waitForBatchedUpdatesWithAct();

        expect(screen.getByTestId('sidebar-skeleton')).toBeOnTheScreen();
        expect(screen.queryByTestId('sidebar-content')).not.toBeOnTheScreen();
    });

    it('keeps the skeleton visible while HAS_LOADED_APP is hydrating', async () => {
        mockHasLoadedAppStatus = 'loading';
        await setAppLoadState({
            hasLoadedApp: false,
            isLoadingApp: true,
        });

        render(<BaseSidebarScreen />);
        await waitForBatchedUpdatesWithAct();

        expect(screen.getByTestId('sidebar-skeleton')).toBeOnTheScreen();
        expect(screen.queryByTestId('sidebar-content')).not.toBeOnTheScreen();
    });

    it('uses IS_LOADING_APP as a cold restart recovery fallback after HAS_LOADED_APP hydrates false', async () => {
        mockHasLoadedAppStatus = 'loaded';
        await setAppLoadState({
            hasLoadedApp: false,
            isLoadingApp: true,
        });

        render(<BaseSidebarScreen />);
        await waitForBatchedUpdatesWithAct();

        expect(screen.getByTestId('sidebar-skeleton')).toBeOnTheScreen();
        expect(screen.queryByTestId('sidebar-content')).not.toBeOnTheScreen();
    });

    it('shows content after loading settles without an OpenApp request', async () => {
        mockHasLoadedAppStatus = 'loaded';
        await setAppLoadState({
            hasLoadedApp: false,
            isLoadingApp: false,
        });

        render(<BaseSidebarScreen />);
        await waitForBatchedUpdatesWithAct();

        expect(screen.queryByTestId('sidebar-skeleton')).not.toBeOnTheScreen();
        expect(screen.getByTestId('sidebar-content')).toBeOnTheScreen();
    });

    it('does not show the skeleton on a cached start with a stranded loading flag', async () => {
        mockHasLoadedAppStatus = 'loading';
        await setAppLoadState({
            hasLoadedApp: true,
            isLoadingApp: true,
        });

        render(<BaseSidebarScreen />);
        await waitForBatchedUpdatesWithAct();

        expect(screen.queryByTestId('sidebar-skeleton')).not.toBeOnTheScreen();
        expect(screen.getByTestId('sidebar-content')).toBeOnTheScreen();
    });

    it('does not show the skeleton for a warm ReconnectApp', async () => {
        await setAppLoadState({
            hasLoadedApp: true,
            isLoadingApp: true,
            requests: [buildRequest(WRITE_COMMANDS.RECONNECT_APP)],
        });

        render(<BaseSidebarScreen />);
        await waitForBatchedUpdatesWithAct();

        expect(screen.queryByTestId('sidebar-skeleton')).not.toBeOnTheScreen();
        expect(screen.getByTestId('sidebar-content')).toBeOnTheScreen();
    });

    it('does not show the skeleton for an account switch after the app has loaded', async () => {
        await setAppLoadState({
            hasLoadedApp: true,
            isLoadingApp: true,
            requests: [buildRequest(WRITE_COMMANDS.OPEN_APP)],
        });

        render(<BaseSidebarScreen />);
        await waitForBatchedUpdatesWithAct();

        expect(screen.queryByTestId('sidebar-skeleton')).not.toBeOnTheScreen();
        expect(screen.getByTestId('sidebar-content')).toBeOnTheScreen();
    });

    it('preserves the cold load skeleton for an OpenApp request initiated offline', async () => {
        await setAppLoadState({
            hasLoadedApp: false,
            isLoadingApp: true,
            requests: [buildRequest(WRITE_COMMANDS.OPEN_APP, true)],
        });

        render(<BaseSidebarScreen />);
        await waitForBatchedUpdatesWithAct();

        expect(screen.getByTestId('sidebar-skeleton')).toBeOnTheScreen();
    });
});
