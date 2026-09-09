import {act, cleanup, screen} from '@testing-library/react-native';

import type useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useTodoCounts from '@hooks/useTodoCounts';

import * as API from '@libs/API';
import {WRITE_COMMANDS} from '@libs/API/types';
import type * as NetworkStateModule from '@libs/NetworkState';

import ForYouSection from '@pages/home/ForYouSection';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import type * as ReactNavigation from '@react-navigation/native';

import React from 'react';
import Onyx from 'react-native-onyx';

import renderScreenWithCover, {getCoverMode} from '../../utils/ScreenCoverHarness';
import waitForBatchedUpdatesWithAct from '../../utils/waitForBatchedUpdatesWithAct';

/**
 * The "For you" section persists a one-time NVP the first time a to-do shows up. Covering and uncovering the Home tab
 * re-runs that effect, so this suite proves the guarded write stays a single request across the whole cycle.
 *
 * The mocks mirror tests/ui/ForYouSectionTest.tsx so the section renders the same way it does there.
 */
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

jest.mock('@libs/Navigation/Navigation', () => ({
    navigate: jest.fn(),
    getActiveRouteWithoutParams: jest.fn(() => ''),
    isNavigationReady: jest.fn(() => Promise.resolve()),
}));

jest.mock('@hooks/useResponsiveLayout', () => jest.fn());

jest.mock('@hooks/useTodoCounts', () => jest.fn());

jest.mock('@libs/NetworkState', () => ({
    ...jest.requireActual<typeof NetworkStateModule>('@libs/NetworkState'),
    getIsOffline: () => true,
}));

jest.mock('@pages/home/ForYouSection/ForYouSkeleton', () => () => {
    const ReactModule = jest.requireActual<typeof React>('react');
    return ReactModule.createElement('View', {testID: 'for-you-skeleton'});
});

jest.mock('@pages/home/ForYouSection/ConciergePromptBox', () => () => {
    const ReactModule = jest.requireActual<typeof React>('react');
    return ReactModule.createElement('View', {testID: 'concierge-prompt-box'});
});

// The "Time sensitive" group has its own cover/reveal suite and needs a NavigationContainer this harness does not provide.
jest.mock('@pages/home/TimeSensitiveSection/useTimeSensitiveItems', () => jest.fn(() => []));
jest.mock('@pages/home/TimeSensitiveSection/TimeSensitiveGroup', () => () => null);

// The section renders outside a NavigationContainer, so the focus hook is a constant and the cover is the only thing that changes.
jest.mock('@react-navigation/native', () => {
    const actualNavigation = jest.requireActual<typeof ReactNavigation>('@react-navigation/native');
    return {
        ...actualNavigation,
        useIsFocused: () => true,
    };
});

jest.mock('@hooks/useNavigateToTransactionThread', () => jest.fn(() => jest.fn()));

jest.mock('@hooks/useLocalize', () =>
    jest.fn(() => ({
        translate: jest.fn((key: string, params?: Record<string, unknown>) => (params ? `${key}:${JSON.stringify(params)}` : key)),
        numberFormat: jest.fn((num: number) => num.toString()),
        localeCompare: jest.fn((a: string, b: string) => a.localeCompare(b)),
    })),
);

jest.mock('@hooks/useThemeStyles', () =>
    jest.fn(
        () =>
            new Proxy(
                {},
                {
                    get: () => jest.fn(() => ({})),
                },
            ),
    ),
);

jest.mock('@hooks/useTheme', () => jest.fn(() => ({})));

jest.mock('@hooks/useLazyAsset', () => ({
    useMemoizedLazyExpensifyIcons: jest.fn(() => ({
        MoneyBag: null,
        Send: null,
        ThumbsUp: null,
        Export: null,
        ReceiptSearch: null,
    })),
    useMemoizedLazyIllustrations: jest.fn(() => ({
        ThumbsUpStars: null,
        Fireworks: null,
    })),
}));

const mockUseResponsiveLayout = jest.mocked(useResponsiveLayout);
const mockUseTodoCounts = jest.mocked(useTodoCounts);

const ACCOUNT_ID = 12345;

// The write goes through the real action so its optimistic Onyx update flips the guard the way it does in the app.
const apiWriteSpy = jest.spyOn(API, 'write');

function countHasSeenForYouTodoWrites(): number {
    return apiWriteSpy.mock.calls.filter(
        ([command, parameters]) => command === WRITE_COMMANDS.SET_NAME_VALUE_PAIR && !!parameters && 'name' in parameters && parameters.name === ONYXKEYS.NVP_HAS_SEEN_FOR_YOU_TODO,
    ).length;
}

function setTodoCounts(submitCount: number) {
    mockUseTodoCounts.mockReturnValue({
        counts: {
            [CONST.SEARCH.SEARCH_KEYS.SUBMIT]: submitCount,
            [CONST.SEARCH.SEARCH_KEYS.APPROVE]: 0,
            [CONST.SEARCH.SEARCH_KEYS.PAY]: 0,
            [CONST.SEARCH.SEARCH_KEYS.EXPORT]: 0,
        },
        singleReportIDs: {
            [CONST.SEARCH.SEARCH_KEYS.SUBMIT]: submitCount === 1 ? '1' : undefined,
            [CONST.SEARCH.SEARCH_KEYS.APPROVE]: undefined,
            [CONST.SEARCH.SEARCH_KEYS.PAY]: undefined,
            [CONST.SEARCH.SEARCH_KEYS.EXPORT]: undefined,
        },
    });
}

// ConciergePromptBox is mocked, so these props are inert here. They only satisfy ForYouSection's required prop types.
const conciergeMenuProps = {isConciergeMenuVisible: false, setIsConciergeMenuVisible: () => {}};

describe('ForYouSection under a screen cover', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        mockHasLoadedAppStatus = 'loaded';
        mockUseResponsiveLayout.mockReturnValue({
            shouldUseNarrowLayout: false,
            isSmallScreenWidth: false,
            isInNarrowPaneModal: false,
            isExtraSmallScreenHeight: false,
            isMediumScreenWidth: false,
            isLargeScreenWidth: true,
            isExtraLargeScreenWidth: false,
            isExtraSmallScreenWidth: false,
            isSmallScreen: false,
            onboardingIsMediumOrLargerScreenWidth: true,
            isInLandscapeMode: false,
        });
        setTodoCounts(0);

        await act(async () => {
            await Onyx.multiSet({
                [ONYXKEYS.SESSION]: {accountID: ACCOUNT_ID, email: 'test@example.com'},
                [ONYXKEYS.HAS_LOADED_APP]: true,
                [ONYXKEYS.IS_LOADING_APP]: false,
                [ONYXKEYS.IS_LOADING_REPORT_DATA]: false,
                [ONYXKEYS.PERSISTED_REQUESTS]: [],
                [ONYXKEYS.PERSISTED_ONGOING_REQUESTS]: null,
                [ONYXKEYS.NVP_ONBOARDING]: {hasCompletedGuidedSetupFlow: true},
            });
        });
        await waitForBatchedUpdatesWithAct();
    });

    afterEach(async () => {
        // The section must be gone before its store is wiped, or clearing the NVP re-arms the guard and writes again.
        cleanup();
        jest.clearAllMocks();
        await act(async () => {
            await Onyx.clear();
        });
        await waitForBatchedUpdatesWithAct();
    });

    it('writes the has-seen flag once across mount, hide and reveal', async () => {
        setTodoCounts(1);

        const home = renderScreenWithCover(<ForYouSection {...conciergeMenuProps} />);
        await waitForBatchedUpdatesWithAct();

        expect(screen.queryByTestId('for-you-skeleton')).not.toBeOnTheScreen();
        expect(countHasSeenForYouTodoWrites()).toBe(1);

        await home.hide();
        await home.reveal();

        expect(countHasSeenForYouTodoWrites()).toBe(1);
        expect(screen.queryByTestId('for-you-skeleton')).not.toBeOnTheScreen();
    });

    it('writes the has-seen flag once when the screen mounts already covered', async () => {
        setTodoCounts(1);

        const home = renderScreenWithCover(<ForYouSection {...conciergeMenuProps} />, {startCovered: true});
        await waitForBatchedUpdatesWithAct();

        // The cover lands while the NVP read is still loading, so a covered screen holds the write back until it can
        // see the stored value. Without a cover the value arrives on the next tick and the write goes out at once.
        expect(countHasSeenForYouTodoWrites()).toBe(getCoverMode() === 'activity' ? 0 : 1);

        await home.reveal();

        expect(countHasSeenForYouTodoWrites()).toBe(1);
    });

    it('writes the has-seen flag once when the first to-do arrives while the screen is covered', async () => {
        const home = renderScreenWithCover(<ForYouSection {...conciergeMenuProps} />);
        await waitForBatchedUpdatesWithAct();

        expect(countHasSeenForYouTodoWrites()).toBe(0);

        await home.hide();
        setTodoCounts(1);
        await home.reveal();

        expect(countHasSeenForYouTodoWrites()).toBe(1);
    });

    it('never writes the has-seen flag when no to-do ever shows up', async () => {
        const home = renderScreenWithCover(<ForYouSection {...conciergeMenuProps} />);
        await waitForBatchedUpdatesWithAct();

        await home.hide();
        await home.reveal();

        expect(countHasSeenForYouTodoWrites()).toBe(0);
    });
});
