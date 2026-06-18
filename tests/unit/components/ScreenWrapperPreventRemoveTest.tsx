// These rules are disabled because `require()` is used inside jest.mock factories for module resolution,
// and react-test-renderer is needed because @testing-library/react-native fails to render ScreenWrapper with these mocks.
/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-deprecated */
import React, {act} from 'react';
import Onyx from 'react-native-onyx';
import type ReactTestRendererType from 'react-test-renderer';
import ScreenWrapper from '@components/ScreenWrapper';
import ONYXKEYS from '@src/ONYXKEYS';
import waitForBatchedUpdates from '../../utils/waitForBatchedUpdates';

// eslint-disable-next-line
const ReactTestRenderer: typeof ReactTestRendererType = require('react-test-renderer');

Onyx.init({keys: ONYXKEYS});

let mockResolveNavigationReady: () => void;

jest.mock('@libs/Navigation/Navigation', () => ({
    getActiveRouteWithoutParams: jest.fn(() => ''),
    isNavigationReady: jest.fn(
        () =>
            new Promise<void>((resolve) => {
                mockResolveNavigationReady = resolve;
            }),
    ),
}));

let mockInitialURL: string | null = null;
jest.mock('@components/InitialURLContextProvider', () => ({
    useInitialURLState: () => ({initialURL: mockInitialURL, isAuthenticatedAtStartup: false}),
    useInitialURLActions: () => ({setInitialURL: jest.fn(), setIsAuthenticatedAtStartup: jest.fn()}),
}));

jest.mock('@react-navigation/native', () => ({
    createNavigationContainerRef: jest.fn(() => ({
        getCurrentRoute: jest.fn(() => ({name: 'TestScreen', params: {}})),
        getState: jest.fn(() => ({})),
    })),
    useIsFocused: () => true,
    useNavigation: () => ({
        navigate: jest.fn(),
        addListener: jest.fn(),
    }),
    useFocusEffect: jest.fn(),
    usePreventRemove: jest.fn(),
    NavigationContext: require('react').createContext(null),
}));

jest.mock('@react-navigation/core', () => ({
    NavigationContext: require('react').createContext(null),
    useNavigation: jest.fn(() => ({getState: jest.fn(() => undefined)})),
}));

jest.mock('@hooks/useRootNavigationState', () => jest.fn((selector: (state: undefined) => unknown) => selector(undefined)));
jest.mock('@hooks/useResponsiveLayout', () =>
    jest.fn(() => ({
        shouldUseNarrowLayout: false,
        isSmallScreenWidth: false,
    })),
);
jest.mock('@hooks/useSafeAreaPaddings', () =>
    jest.fn(() => ({
        insets: {top: 0, bottom: 0, left: 0, right: 0},
        safeAreaPaddingBottomStyle: {},
    })),
);
jest.mock('@hooks/useThemeStyles', () => jest.fn(() => ({flex1: {}, appContentHeader: {}, screenCenteredContainer: {}})));
jest.mock('@hooks/useEnvironment', () => jest.fn(() => ({isDevelopment: false})));
jest.mock('@hooks/useNetwork', () => jest.fn(() => ({isOffline: false})));
jest.mock('@hooks/useAccessibilityFocus', () => jest.fn());

jest.mock('@components/FocusTrap/FocusTrapForScreen', () => {
    const ReactModule = require('react');
    return ({children}: {children: React.ReactNode}) => ReactModule.createElement(ReactModule.Fragment, null, children);
});

jest.mock('@components/withNavigationFallback', () => {
    return <T extends Record<string, unknown>>(Component: React.ComponentType<T>) => Component;
});

jest.mock('@components/ScreenWrapper/ScreenWrapperContainer', () => {
    const ReactModule = require('react');
    const {View} = require('react-native');
    return {
        __esModule: true,
        default: ReactModule.forwardRef(({children, testID}: {children: React.ReactNode; testID?: string}, ref: React.Ref<unknown>) =>
            ReactModule.createElement(View, {testID, ref}, children),
        ),
    };
});

jest.mock('@components/ScreenWrapper/ScreenWrapperOfflineIndicators', () => () => null);
jest.mock('@components/CustomDevMenu', () => () => null);

jest.mock('@libs/TryNewDotUtils', () => ({
    shouldHideOldAppRedirect: jest.fn(() => false),
}));

jest.mock('@userActions/HybridApp', () => ({
    closeReactNativeApp: jest.fn(),
}));

jest.mock('@src/CONFIG', () => ({
    __esModule: true,
    default: {
        IS_HYBRID_APP: true,
        IS_USING_LOCAL_WEB: false,
        EXPENSIFY: {
            DEFAULT_API_ROOT: 'https://www.expensify.com.dev/',
        },
    },
}));

function getNavigationMock() {
    return jest.requireMock<{getActiveRouteWithoutParams: jest.Mock; isNavigationReady: jest.Mock}>('@libs/Navigation/Navigation');
}

function getUsePreventRemove() {
    return jest.requireMock<{usePreventRemove: jest.Mock}>('@react-navigation/native').usePreventRemove;
}

function lastPreventRemoveCondition(): boolean {
    const mock = getUsePreventRemove();
    return mock.mock.calls.at(-1)?.[0] as boolean;
}

async function renderScreenWrapper(): Promise<ReactTestRendererType.ReactTestRenderer> {
    let renderer!: ReactTestRendererType.ReactTestRenderer;
    await act(async () => {
        renderer = ReactTestRenderer.create(<ScreenWrapper testID="test-screen">{null}</ScreenWrapper>);
        await waitForBatchedUpdates();
    });
    return renderer;
}

describe('ScreenWrapper – usePreventRemove condition', () => {
    let renderer: ReactTestRendererType.ReactTestRenderer | undefined;

    afterEach(async () => {
        if (renderer) {
            act(() => renderer?.unmount());
            renderer = undefined;
        }
        await act(async () => {
            await Onyx.clear();
            await waitForBatchedUpdates();
        });
        jest.clearAllMocks();
        mockInitialURL = null;
    });

    beforeEach(() => {
        const Navigation = getNavigationMock();
        Navigation.getActiveRouteWithoutParams.mockReturnValue('');
        Navigation.isNavigationReady.mockImplementation(
            () =>
                new Promise<void>((resolve) => {
                    mockResolveNavigationReady = resolve;
                }),
        );
    });

    it('is false when isSingleNewDotEntry is false (default)', async () => {
        mockInitialURL = '/r/123';
        const Navigation = getNavigationMock();
        Navigation.getActiveRouteWithoutParams.mockReturnValue('/r/123');
        Navigation.isNavigationReady.mockResolvedValue(undefined);

        renderer = await renderScreenWrapper();

        expect(lastPreventRemoveCondition()).toBe(false);
    });

    it('is true when all conditions are met: isSingleNewDotEntry, initialURL matches active route, not blocked', async () => {
        mockInitialURL = '/r/123';

        const Navigation = getNavigationMock();
        Navigation.getActiveRouteWithoutParams.mockReturnValue('/r/123');
        Navigation.isNavigationReady.mockResolvedValue(undefined);

        await act(async () => {
            await Onyx.set(ONYXKEYS.HYBRID_APP, {isSingleNewDotEntry: true});
            await waitForBatchedUpdates();
        });

        renderer = await renderScreenWrapper();

        expect(lastPreventRemoveCondition()).toBe(true);
    });

    it('updates condition after navigation becomes ready', async () => {
        mockInitialURL = '/r/123';

        const Navigation = getNavigationMock();
        Navigation.getActiveRouteWithoutParams.mockReturnValue('');

        await act(async () => {
            await Onyx.set(ONYXKEYS.HYBRID_APP, {isSingleNewDotEntry: true});
            await waitForBatchedUpdates();
        });

        renderer = await renderScreenWrapper();

        Navigation.getActiveRouteWithoutParams.mockReturnValue('/r/123');

        await act(async () => {
            mockResolveNavigationReady();
            await waitForBatchedUpdates();
        });

        expect(lastPreventRemoveCondition()).toBe(true);
    });

    it('strips query params from initialURL before matching', async () => {
        mockInitialURL = '/r/123?param=value&other=1';

        const Navigation = getNavigationMock();
        Navigation.getActiveRouteWithoutParams.mockReturnValue('/r/123');
        Navigation.isNavigationReady.mockResolvedValue(undefined);

        await act(async () => {
            await Onyx.set(ONYXKEYS.HYBRID_APP, {isSingleNewDotEntry: true});
            await waitForBatchedUpdates();
        });

        renderer = await renderScreenWrapper();

        expect(lastPreventRemoveCondition()).toBe(true);
    });

    it('is false when initialURL does not match the active route', async () => {
        mockInitialURL = '/settings/profile';

        const Navigation = getNavigationMock();
        Navigation.getActiveRouteWithoutParams.mockReturnValue('/r/456');
        Navigation.isNavigationReady.mockResolvedValue(undefined);

        await act(async () => {
            await Onyx.set(ONYXKEYS.HYBRID_APP, {isSingleNewDotEntry: true});
            await waitForBatchedUpdates();
        });

        renderer = await renderScreenWrapper();

        expect(lastPreventRemoveCondition()).toBe(false);
    });

    it('is false when shouldBlockSingleEntryOldAppExit is true', async () => {
        mockInitialURL = '/r/123';

        const Navigation = getNavigationMock();
        Navigation.getActiveRouteWithoutParams.mockReturnValue('/r/123');
        Navigation.isNavigationReady.mockResolvedValue(undefined);

        const {shouldHideOldAppRedirect} = jest.requireMock<{shouldHideOldAppRedirect: jest.Mock}>('@libs/TryNewDotUtils');
        shouldHideOldAppRedirect.mockReturnValue(true);

        await act(async () => {
            await Onyx.set(ONYXKEYS.HYBRID_APP, {isSingleNewDotEntry: true});
            await waitForBatchedUpdates();
        });

        renderer = await renderScreenWrapper();

        expect(lastPreventRemoveCondition()).toBe(false);
    });

    it('is false when initialURL is null', async () => {
        mockInitialURL = null;

        const Navigation = getNavigationMock();
        Navigation.getActiveRouteWithoutParams.mockReturnValue('/r/123');
        Navigation.isNavigationReady.mockResolvedValue(undefined);

        await act(async () => {
            await Onyx.set(ONYXKEYS.HYBRID_APP, {isSingleNewDotEntry: true});
            await waitForBatchedUpdates();
        });

        renderer = await renderScreenWrapper();

        expect(lastPreventRemoveCondition()).toBe(false);
    });
});
