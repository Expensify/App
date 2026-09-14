import {render} from '@testing-library/react-native';

import SignInModal from '@pages/signin/SignInModal';
import type {SignInPageRef} from '@pages/signin/SignInPage';
import {SignInPage} from '@pages/signin/SignInPage';

import CONST from '@src/CONST';

import React, {createRef} from 'react';

const mockGoBack = jest.fn();
let mockCanGoBack = true;
const mockAnonymousAuthTokenType = CONST.AUTH_TOKEN_TYPES.ANONYMOUS;

jest.mock('@libs/Navigation/Navigation', () => ({
    __esModule: true,
    // Referenced lazily: jest hoists this factory above the mock declarations below.
    default: {
        goBack: () => {
            mockGoBack();
        },
        // SignInModal dismisses itself once IS_LOADING_APP settles to false. That is unrelated to back
        // handling, but Onyx carries the flag in from whatever ran earlier, so both must be stubbed or the
        // dismiss effect throws before the assertions run.
        dismissModal: jest.fn(),
        navigate: jest.fn(),
    },
    navigationRef: {
        get current() {
            return {canGoBack: () => mockCanGoBack};
        },
    },
}));

// Record the callbacks handed to the hook so the test can replay them. Jest resolves the platform-neutral
// no-op variant, so the callbacks are never invoked for real here.
const mockUseAndroidBackButtonHandler = jest.fn((callback: () => boolean) => callback);
jest.mock('@hooks/useAndroidBackButtonHandler', () => ({
    __esModule: true,
    default: (callback: () => boolean) => {
        mockUseAndroidBackButtonHandler(callback);
    },
}));

// SignInPage renders a full themed layout with form children. None of it participates in navigateBack.
jest.mock('@pages/signin/SignInPageLayout', () => 'SignInPageLayout');
jest.mock('@pages/signin/LoginForm', () => 'LoginForm');
jest.mock('@pages/signin/ValidateCodeForm', () => 'ValidateCodeForm');
jest.mock('@pages/signin/UnlinkLoginForm', () => 'UnlinkLoginForm');
jest.mock('@pages/signin/ChooseSSOOrValidateCode', () => 'ChooseSSOOrValidateCode');
jest.mock('@pages/signin/EmailDeliveryFailurePage', () => 'EmailDeliveryFailurePage');
jest.mock('@pages/signin/SMSDeliveryFailurePage', () => 'SMSDeliveryFailurePage');
jest.mock('@pages/signin/SignUpWelcomeForm', () => 'SignUpWelcomeForm');
jest.mock('@components/ColorSchemeWrapper', () => 'ColorSchemeWrapper');
jest.mock('@components/CustomStatusBarAndBackground', () => 'CustomStatusBarAndBackground');

// SignInModal reads the session to decide when to dismiss itself, and treats any non anonymous session as signed
// in. Report the anonymous session that a rendered sign-in modal actually has, so the dismiss effect stays idle
// and does not call openApp. openApp writes IS_LOADING_APP asynchronously, which would otherwise dismiss the
// modal partway through the test. The back listener does not depend on the session.
// Read lazily: jest hoists this factory above the constant below.
jest.mock('@components/OnyxListItemProvider', () => ({useSession: () => ({authTokenType: mockAnonymousAuthTokenType})}));
jest.mock('@components/ScreenWrapper', () => 'ScreenWrapper');
jest.mock('@components/HeaderWithBackButton', () => 'HeaderWithBackButton');

describe('sign-in Android hardware back handling', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockCanGoBack = true;
    });

    describe('SignInPage.navigateBack on the login form', () => {
        const renderSignInPage = () => {
            const ref = createRef<SignInPageRef>();
            render(<SignInPage ref={ref} />);
            return ref;
        };

        it('reports the press as handled when there is something to pop', () => {
            const ref = renderSignInPage();

            expect(ref.current?.navigateBack()).toBe(true);
            expect(mockGoBack).toHaveBeenCalledTimes(1);
        });

        it('reports the press as unhandled at the public sign-in root so Android can background the app', () => {
            mockCanGoBack = false;
            const ref = renderSignInPage();

            expect(ref.current?.navigateBack()).toBe(false);
        });

        it('still calls goBack when it reports the press as unhandled', () => {
            // goBack() also runs clearSelectedText() and the shouldPopToSidebar branch, which navigate even when
            // canGoBack() is false. Only the returned boolean may depend on canGoBack().
            mockCanGoBack = false;
            const ref = renderSignInPage();

            ref.current?.navigateBack();

            expect(mockGoBack).toHaveBeenCalledTimes(1);
        });
    });

    describe('SignInModal', () => {
        it('registers no back listener that consumes the press without navigating', () => {
            // SignInModal used to register a second listener that unconditionally returned true. Because React
            // Native dispatches subscriptions in reverse order and stops at the first true, that no-op could swallow
            // the press before SignInPage.navigateBack ran, leaving the device back button dead
            // (https://github.com/Expensify/App/issues/96869).
            render(<SignInModal />);

            const handlers = mockUseAndroidBackButtonHandler.mock.calls.map(([callback]) => callback);
            expect(handlers.length).toBeGreaterThan(0);

            for (const handler of handlers) {
                mockGoBack.mockClear();
                const consumed = handler();

                // On the login form every registered handler must actually navigate before claiming the press.
                expect({consumed, navigated: mockGoBack.mock.calls.length > 0}).toEqual({consumed: true, navigated: true});
            }
        });
    });
});
