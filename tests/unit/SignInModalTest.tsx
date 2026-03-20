import {render} from '@testing-library/react-native';
import Onyx from 'react-native-onyx';
// eslint-disable-next-line rulesdir/no-inline-named-export
import SignInModal from '@pages/signin/SignInModal';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

const mockOpenApp = jest.fn(() => Promise.resolve());
const mockWaitForIdle = jest.fn(() => Promise.resolve());
const mockDismissModal = jest.fn();
const mockIsNavigationReady = jest.fn(() => Promise.resolve());
const mockGoBack = jest.fn();

jest.mock('@libs/actions/App', () => ({
    openApp: (...args: unknown[]) => mockOpenApp(...args),
}));

jest.mock('@libs/Network/SequentialQueue', () => ({
    waitForIdle: () => mockWaitForIdle(),
}));

jest.mock('@libs/Navigation/Navigation', () => ({
    __esModule: true,
    default: {
        dismissModal: (...args: unknown[]) => mockDismissModal(...args),
        isNavigationReady: () => mockIsNavigationReady(),
        goBack: (...args: unknown[]) => mockGoBack(...args),
    },
}));

jest.mock('@libs/Browser', () => ({
    isMobileSafari: jest.fn(() => false),
}));

jest.mock('@hooks/useAndroidBackButtonHandler', () => jest.fn());

jest.mock('@pages/signin/SignInPage', () => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires, rulesdir/no-inline-named-export
    const React = require('react');
    const {View} = require('react-native');
    const MockSignInPage = React.forwardRef((_props: object, _ref: React.Ref<unknown>) => <View testID="MockSignInPage" />);
    MockSignInPage.displayName = 'MockSignInPage';
    return {
        __esModule: true,
        default: MockSignInPage,
        SignInPage: MockSignInPage,
    };
});

jest.mock('@components/HeaderWithBackButton', () => {
    const {View} = require('react-native');
    return () => <View testID="MockHeaderWithBackButton" />;
});

jest.mock('@components/ScreenWrapper', () => {
    const {View} = require('react-native');
    return ({children}: {children: React.ReactNode}) => <View testID="MockScreenWrapper">{children}</View>;
});

describe('SignInModal', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        jest.clearAllMocks();
        await Onyx.clear();
        await waitForBatchedUpdates();
    });

    afterEach(async () => {
        await Onyx.clear();
    });

    it('should not call openApp or dismissModal when user is anonymous', async () => {
        await Onyx.merge(ONYXKEYS.SESSION, {
            authToken: 'anonymousToken',
            authTokenType: CONST.AUTH_TOKEN_TYPES.ANONYMOUS,
        });
        await waitForBatchedUpdates();

        render(<SignInModal />);
        await waitForBatchedUpdatesWithAct();

        expect(mockOpenApp).not.toHaveBeenCalled();
        expect(mockDismissModal).not.toHaveBeenCalled();
    });

    it('should call openApp and dismissModal when user is not anonymous', async () => {
        await Onyx.merge(ONYXKEYS.SESSION, {
            authToken: 'realToken',
            authTokenType: undefined,
        });
        await waitForBatchedUpdates();

        render(<SignInModal />);
        await waitForBatchedUpdatesWithAct();

        expect(mockWaitForIdle).toHaveBeenCalled();
        expect(mockOpenApp).toHaveBeenCalledWith(true);
        expect(mockDismissModal).toHaveBeenCalledTimes(1);
    });

    it('should wait for both openApp chain and isNavigationReady before dismissing modal', async () => {
        const callOrder: string[] = [];

        // Make openApp chain take time to resolve
        let resolveOpenApp: () => void;
        const openAppPromise = new Promise<void>((resolve) => {
            resolveOpenApp = resolve;
        });
        mockOpenApp.mockImplementation(() => {
            callOrder.push('openApp');
            return openAppPromise;
        });

        // Make isNavigationReady take time to resolve
        let resolveNavReady: () => void;
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

        await Onyx.merge(ONYXKEYS.SESSION, {
            authToken: 'realToken',
            authTokenType: undefined,
        });
        await waitForBatchedUpdates();

        render(<SignInModal />);
        await waitForBatchedUpdatesWithAct();

        // At this point, openApp and isNavigationReady are pending - dismissModal should NOT have been called
        expect(mockDismissModal).not.toHaveBeenCalled();

        // Resolve isNavigationReady first - dismissModal should still wait for openApp
        resolveNavReady!();
        await waitForBatchedUpdatesWithAct();
        expect(mockDismissModal).not.toHaveBeenCalled();

        // Now resolve openApp - dismissModal should be called after both are done
        resolveOpenApp!();
        await waitForBatchedUpdatesWithAct();
        expect(mockDismissModal).toHaveBeenCalledTimes(1);

        // Verify dismissModal was called after both openApp and isNavigationReady
        expect(callOrder.indexOf('dismissModal')).toBeGreaterThan(callOrder.indexOf('openApp'));
        expect(callOrder.indexOf('dismissModal')).toBeGreaterThan(callOrder.indexOf('isNavigationReady'));
    });

    it('should call openApp and dismissModal when session transitions from anonymous to authenticated', async () => {
        // Start as anonymous
        await Onyx.merge(ONYXKEYS.SESSION, {
            authToken: 'anonymousToken',
            authTokenType: CONST.AUTH_TOKEN_TYPES.ANONYMOUS,
        });
        await waitForBatchedUpdates();

        const {rerender} = render(<SignInModal />);
        await waitForBatchedUpdatesWithAct();

        expect(mockOpenApp).not.toHaveBeenCalled();
        expect(mockDismissModal).not.toHaveBeenCalled();

        // Transition to authenticated user
        await Onyx.merge(ONYXKEYS.SESSION, {
            authToken: 'realToken',
            authTokenType: undefined,
        });
        await waitForBatchedUpdates();

        rerender(<SignInModal />);
        await waitForBatchedUpdatesWithAct();

        expect(mockOpenApp).toHaveBeenCalledWith(true);
        expect(mockDismissModal).toHaveBeenCalledTimes(1);
    });
});
