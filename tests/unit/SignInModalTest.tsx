import {render} from '@testing-library/react-native';
import React from 'react';
import type {View as RNView} from 'react-native';
import Onyx from 'react-native-onyx';
import {openApp} from '@libs/actions/App';
import SignInModal from '@pages/signin/SignInModal';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

const mockWaitForIdle = jest.fn(() => Promise.resolve());
const mockDismissModal = jest.fn();
const mockIsNavigationReady = jest.fn(() => Promise.resolve());
const mockGoBack = jest.fn();
let mockSessionData: {authToken?: string; authTokenType?: string} | undefined;

jest.mock('@libs/actions/App', () => ({
    openApp: jest.fn(() => Promise.resolve()),
}));

const mockOpenApp = openApp as jest.Mock;

jest.mock('@libs/Network/SequentialQueue', () => ({
    flush: jest.fn(),
    waitForIdle: () => mockWaitForIdle(),
}));

jest.mock('@libs/Navigation/Navigation', () => ({
    dismissModal: (...args: unknown[]) => {
        mockDismissModal(...args);
    },
    isNavigationReady: () => mockIsNavigationReady(),
    goBack: (...args: unknown[]) => {
        mockGoBack(...args);
    },
}));

jest.mock('@libs/Browser', () => ({
    getBrowser: jest.fn(() => ''),
    isMobile: jest.fn(() => false),
    isMobileIOS: jest.fn(() => false),
    isMobileSafari: jest.fn(() => false),
    isMobileWebKit: jest.fn(() => false),
    isSafari: jest.fn(() => false),
    isModernSafari: jest.fn(() => false),
    isMobileChrome: jest.fn(() => false),
    isChromeIOS: jest.fn(() => false),
    isMobileSafariOnIos26: jest.fn(() => false),
}));

jest.mock('@hooks/useAndroidBackButtonHandler', () => jest.fn());

jest.mock('@components/OnyxListItemProvider', () => ({
    useSession: () => mockSessionData,
}));

jest.mock('@pages/signin/SignInPage', () => {
    const MockReact = require('react') as typeof React;
    const {View} = require('react-native') as {View: typeof RNView};
    const MockSignInPage = MockReact.forwardRef(() => MockReact.createElement(View, {testID: 'MockSignInPage'}));
    MockSignInPage.displayName = 'MockSignInPage';
    return {
        // eslint-disable-next-line @typescript-eslint/naming-convention -- __esModule is required by Jest to properly mock ES modules with default exports
        __esModule: true,
        default: MockSignInPage,
        SignInPage: MockSignInPage,
    };
});

jest.mock('@components/HeaderWithBackButton', () => {
    const MockReact = require('react') as typeof React;
    const {View} = require('react-native') as {View: typeof RNView};
    return () => MockReact.createElement(View, {testID: 'MockHeaderWithBackButton'});
});

jest.mock('@components/ScreenWrapper', () => {
    const MockReact = require('react') as typeof React;
    const {View} = require('react-native') as {View: typeof RNView};
    return ({children}: {children: React.ReactNode}) => MockReact.createElement(View, {testID: 'MockScreenWrapper'}, children);
});

describe('SignInModal', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        jest.clearAllMocks();
        mockSessionData = undefined;
        await Onyx.clear();
        await waitForBatchedUpdates();
    });

    afterEach(async () => {
        await Onyx.clear();
    });

    it('should not call openApp or dismissModal when user is anonymous', async () => {
        mockSessionData = {
            authToken: 'anonymousToken',
            authTokenType: CONST.AUTH_TOKEN_TYPES.ANONYMOUS,
        };

        render(<SignInModal />);
        await waitForBatchedUpdatesWithAct();

        expect(mockOpenApp).not.toHaveBeenCalled();
        expect(mockDismissModal).not.toHaveBeenCalled();
    });

    it('should call openApp and dismissModal when user is not anonymous', async () => {
        mockSessionData = {
            authToken: 'realToken',
            authTokenType: undefined,
        };

        render(<SignInModal />);
        await waitForBatchedUpdatesWithAct();

        expect(mockWaitForIdle).toHaveBeenCalled();
        expect(mockOpenApp).toHaveBeenCalledWith(true);
        expect(mockDismissModal).toHaveBeenCalledTimes(1);
    });

    it('should wait for both openApp chain and isNavigationReady before dismissing modal', async () => {
        const callOrder: string[] = [];

        // Make openApp chain take time to resolve
        let resolveOpenApp = () => {};
        const openAppPromise = new Promise<void>((resolve) => {
            resolveOpenApp = resolve;
        });
        mockOpenApp.mockImplementation(() => {
            callOrder.push('openApp');
            return openAppPromise;
        });

        // Make isNavigationReady take time to resolve
        let resolveNavReady = () => {};
        const navReadyPromise = new Promise<void>((resolve) => {
            resolveNavReady = resolve;
        });
        mockIsNavigationReady.mockImplementation(() => {
            callOrder.push('isNavigationReady');
            return navReadyPromise;
        });

        mockDismissModal.mockImplementation(() => {
            callOrder.push('dismissModal');
        });

        mockSessionData = {
            authToken: 'realToken',
            authTokenType: undefined,
        };

        render(<SignInModal />);
        await waitForBatchedUpdatesWithAct();

        // At this point, openApp and isNavigationReady are pending - dismissModal should NOT have been called
        expect(mockDismissModal).not.toHaveBeenCalled();

        // Resolve isNavigationReady first - dismissModal should still wait for openApp
        resolveNavReady();
        await waitForBatchedUpdatesWithAct();
        expect(mockDismissModal).not.toHaveBeenCalled();

        // Now resolve openApp - dismissModal should be called after both are done
        resolveOpenApp();
        await waitForBatchedUpdatesWithAct();
        expect(mockDismissModal).toHaveBeenCalledTimes(1);

        // Verify dismissModal was called after both openApp and isNavigationReady
        expect(callOrder.indexOf('dismissModal')).toBeGreaterThan(callOrder.indexOf('openApp'));
        expect(callOrder.indexOf('dismissModal')).toBeGreaterThan(callOrder.indexOf('isNavigationReady'));
    });

    it('should call openApp and dismissModal when session transitions from anonymous to authenticated', async () => {
        // Start as anonymous
        mockSessionData = {
            authToken: 'anonymousToken',
            authTokenType: CONST.AUTH_TOKEN_TYPES.ANONYMOUS,
        };

        const {rerender} = render(<SignInModal />);
        await waitForBatchedUpdatesWithAct();

        expect(mockOpenApp).not.toHaveBeenCalled();
        expect(mockDismissModal).not.toHaveBeenCalled();

        // Transition to authenticated user
        mockSessionData = {
            authToken: 'realToken',
            authTokenType: undefined,
        };

        rerender(<SignInModal />);
        await waitForBatchedUpdatesWithAct();

        expect(mockOpenApp).toHaveBeenCalledWith(true);
        expect(mockDismissModal).toHaveBeenCalledTimes(1);
    });
});
