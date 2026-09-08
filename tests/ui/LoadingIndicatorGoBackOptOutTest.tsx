import {act, render, screen} from '@testing-library/react-native';

import Text from '@components/Text';

import createPlatformStackNavigator from '@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigator';
import type {AuthScreensParamList, PublicScreensParamList} from '@libs/Navigation/types';

import DelegatorConnectGuard from '@navigation/AppNavigator/DelegatorConnectGate';

import DomainNameOrNotFoundWrapper from '@pages/domain/DomainNameOrNotFoundWrapper';
import LogInWithShortLivedAuthTokenPage from '@pages/LogInWithShortLivedAuthTokenPage';
import LogOutPreviousUserPage from '@pages/LogOutPreviousUserPage';
import UnlinkLoginPage from '@pages/UnlinkLoginPage';
import ValidateLoginPage from '@pages/ValidateLoginPage';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';
import type isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';

import {NavigationContainer} from '@react-navigation/native';
import React from 'react';
// eslint-disable-next-line no-restricted-imports
import {ActivityIndicator} from 'react-native';
import Onyx from 'react-native-onyx';

import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

// Render the raw translation keys so assertions don't depend on the copy, and so the loader can be
// mounted without the locale providers each page would otherwise need.
jest.mock('@hooks/useLocalize', () =>
    jest.fn(() => ({
        translate: (key: string) => key,
    })),
);

// The loader's nested ActivityIndicator arms its own timer on the same delay; stub the log so
// advancing timers doesn't reach real AppState/network code.
jest.mock('@libs/AppState', () => ({
    __esModule: true,
    default: jest.fn(),
}));

jest.mock('@libs/Navigation/Navigation', () => ({
    goBack: jest.fn(),
    navigate: jest.fn(),
    isNavigationReady: jest.fn(() => new Promise<void>(() => {})),
    waitForProtectedRoutes: jest.fn(() => new Promise<void>(() => {})),
    resetToAppRoot: jest.fn(),
    getActiveRoute: jest.fn(() => ''),
    getActiveRouteWithoutParams: jest.fn(() => ''),
    isActiveRoute: jest.fn(() => false),
    navigationRef: {
        current: {canGoBack: () => false},
        reset: jest.fn(),
        isReady: () => true,
    },
}));

// Every page under test kicks off a real sign-in/sign-out request on mount. Stub the whole module so
// mounting only exercises what renders, not the network.
jest.mock('@userActions/Session', () => ({
    unlinkLogin: jest.fn(),
    signInWithShortLivedAuthToken: jest.fn(),
    signInWithSupportAuthToken: jest.fn(),
    signInWithValidateCodeAndNavigate: jest.fn(),
    signOutAndRedirectToSignIn: jest.fn(),
    setAccountError: jest.fn(),
    handleExitToNavigation: jest.fn(),
}));

jest.mock('@components/InitialURLContextProvider', () => ({
    useInitialURLState: () => ({initialURL: '/transition?shortLivedAuthToken=abc123'}),
    useInitialURLActions: () => ({setInitialURL: jest.fn()}),
}));

// DelegatorConnectGuard only reaches its Suspense fallback when the URL carries a delegatorEmail and
// Delegate.connect() is still in flight, so pin both.
jest.mock('@libs/Navigation/currentUrl', () => ({
    __esModule: true,
    default: () => 'https://new.expensify.com/transition?delegatorEmail=delegator%40example.com',
}));
jest.mock('@libs/actions/Delegate', () => ({
    connect: jest.fn(() => new Promise<boolean | undefined>(() => {})),
}));

const mockIsLoadingOnyxValue = jest.fn<ReturnType<typeof isLoadingOnyxValue>, Parameters<typeof isLoadingOnyxValue>>(() => false);
jest.mock('@src/types/utils/isLoadingOnyxValue', () => ({
    __esModule: true,
    default: (...args: Parameters<typeof isLoadingOnyxValue>) => mockIsLoadingOnyxValue(...args),
}));

const TIMEOUT = CONST.TIMING.ACTIVITY_INDICATOR_TIMEOUT;

const PublicStack = createPlatformStackNavigator<PublicScreensParamList>();
const AuthStack = createPlatformStackNavigator<AuthScreensParamList>();

/** Waits well past the loader's timeout, which is the only moment the recovery UI can appear. */
async function waitPastLoaderTimeout() {
    await waitForBatchedUpdatesWithAct();
    act(() => {
        jest.advanceTimersByTime(TIMEOUT * 2);
    });
    await waitForBatchedUpdatesWithAct();
}

function expectNoGoBackButton() {
    // Anchor the negative assertions on a spinner actually being on screen, so a page that rendered
    // something else entirely (or nothing) can't pass this by accident.
    expect(screen.UNSAFE_queryByType(ActivityIndicator)).not.toBeNull();
    expect(screen.queryByText('common.goBack')).toBeNull();
    expect(screen.queryByText('common.thisIsTakingLongerThanExpected')).toBeNull();
}

describe('FullScreenLoadingIndicator "Go Back" opt-outs', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        jest.clearAllMocks();
        mockIsLoadingOnyxValue.mockReturnValue(false);
        await act(async () => {
            await Onyx.clear();
        });
        await waitForBatchedUpdatesWithAct();
        // setupAfterEnv installs real timers globally; the loader timeout is only reachable on fake ones.
        // Installed after Onyx is reset so the reset itself still runs on real timers.
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    describe('deep-link auth entry points', () => {
        it('ValidateLoginPage (magic link) never offers a way back', async () => {
            // Given a cold magic-link deep link, where the loader is the whole screen
            render(
                <NavigationContainer>
                    <PublicStack.Navigator>
                        <PublicStack.Screen
                            name={SCREENS.VALIDATE_LOGIN}
                            component={ValidateLoginPage}
                            initialParams={{accountID: '1', validateCode: '123456'}}
                        />
                    </PublicStack.Navigator>
                </NavigationContainer>,
            );

            // When the sign-in takes longer than the loader timeout
            await waitPastLoaderTimeout();

            // Then no "Go Back" is drawn — there is no history to pop on a cold deep link
            expectNoGoBackButton();
        });

        it('UnlinkLoginPage never offers a way back', async () => {
            // Given the unlink-login email link opened in a fresh tab
            render(
                <NavigationContainer>
                    <PublicStack.Navigator>
                        <PublicStack.Screen
                            name={SCREENS.UNLINK_LOGIN}
                            component={UnlinkLoginPage}
                            initialParams={{accountID: '1', validateCode: 'ABCDEF'}}
                        />
                    </PublicStack.Navigator>
                </NavigationContainer>,
            );

            // When the unlink request outlives the loader timeout
            await waitPastLoaderTimeout();

            // Then no "Go Back" is drawn
            expectNoGoBackButton();
        });
    });

    describe('OldDot <-> NewDot transition screens', () => {
        it('LogInWithShortLivedAuthTokenPage (public transition) never offers a way back', async () => {
            // Given a transition from OldDot that is still authenticating
            await act(async () => {
                await Onyx.merge(ONYXKEYS.ACCOUNT, {isLoading: true});
            });

            render(
                <NavigationContainer>
                    <PublicStack.Navigator>
                        <PublicStack.Screen
                            name={SCREENS.TRANSITION_BETWEEN_APPS}
                            component={LogInWithShortLivedAuthTokenPage}
                            initialParams={{shortLivedAuthToken: 'abc123'}}
                        />
                    </PublicStack.Navigator>
                </NavigationContainer>,
            );

            // When the hand-off takes longer than the loader timeout
            await waitPastLoaderTimeout();

            // Then no "Go Back" is drawn — /transition is a deep-link entry point with nothing behind it
            expectNoGoBackButton();
        });

        it('LogOutPreviousUserPage (authenticated transition) never offers a way back', async () => {
            // Given an OldDot transition that is signing the previous user out
            render(
                <NavigationContainer>
                    <AuthStack.Navigator>
                        <AuthStack.Screen
                            name={SCREENS.TRANSITION_BETWEEN_APPS}
                            component={LogOutPreviousUserPage}
                            initialParams={{shortLivedAuthToken: 'abc123'}}
                        />
                    </AuthStack.Navigator>
                </NavigationContainer>,
            );

            // When the sign-out takes longer than the loader timeout
            await waitPastLoaderTimeout();

            // Then no "Go Back" is drawn — popping /transition mid sign-out would land in the outgoing session
            expectNoGoBackButton();
        });

        it('DelegatorConnectGuard (delegate connect) never offers a way back', async () => {
            // Given a cold delegate connect whose Delegate.connect() is still in flight, so the guard
            // is showing its Suspense fallback. Mounting a tree that suspends synchronously logs React's
            // "suspended inside an act scope" notice, which is expected here and not a failure.
            const suspendWarningSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
            render(
                <DelegatorConnectGuard>
                    <Text>connected</Text>
                </DelegatorConnectGuard>,
            );

            // When the connect takes longer than the loader timeout
            await waitPastLoaderTimeout();
            suspendWarningSpy.mockRestore();

            // Then the fallback shows no "Go Back", and the children are still suspended
            expectNoGoBackButton();
            expect(screen.queryByText('connected')).toBeNull();
        });
    });

    describe('ordinary loaders (the new default)', () => {
        it('DomainNameOrNotFoundWrapper does offer a way back once the loader is slow', async () => {
            // Given an ordinary page-level loader that does not opt out
            mockIsLoadingOnyxValue.mockReturnValue(true);

            render(<DomainNameOrNotFoundWrapper domainAccountID={123456}>{(domainName) => <Text>{domainName}</Text>}</DomainNameOrNotFoundWrapper>);

            // When it stays loading past the loader timeout
            await waitPastLoaderTimeout();

            // Then the trapped user is offered a way out, which is what flipping the default delivers
            expect(screen.getByText('common.goBack')).toBeOnTheScreen();
            expect(screen.getByText('common.thisIsTakingLongerThanExpected')).toBeOnTheScreen();
        });
    });
});
