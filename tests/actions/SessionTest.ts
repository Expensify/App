/*  eslint-disable rulesdir/no-multiple-api-calls */
// cspell:ignore SOMESECRETKEY
import {beforeEach, jest, test} from '@jest/globals';

import {openApp, reconnectApp} from '@libs/actions/App';
import {buildOldDotURL, openExternalLink} from '@libs/actions/Link';
import OnyxUpdateManager from '@libs/actions/OnyxUpdateManager';
import {getAll as getAllPersistedRequests} from '@libs/actions/PersistedRequests';
import {initReconnect} from '@libs/actions/Reconnect';
import * as SignInRedirect from '@libs/actions/SignInRedirect';
import {SIDE_EFFECT_REQUEST_COMMANDS, WRITE_COMMANDS} from '@libs/API/types';
import asyncOpenURL from '@libs/asyncOpenURL';
import getPlatform from '@libs/getPlatform';
import HttpUtils from '@libs/HttpUtils';
import * as NetworkStore from '@libs/Network/NetworkStore';
import {setHasRadio} from '@libs/NetworkState';
import PushNotification from '@libs/Notification/PushNotification';
import {isRecord} from '@libs/ObjectUtils';
import reauthenticate from '@libs/Reauthentication';

import CONFIG from '@src/CONFIG';
import CONST from '@src/CONST';
// This lib needs to be imported, but it has nothing to export since all it contains is an Onyx connection
import '@libs/Notification/PushNotification/subscribeToPushNotifications';

import * as SessionUtil from '@src/libs/actions/Session';
import {KEYS_TO_PRESERVE_SUPPORTAL, signOutAndRedirectToSignIn} from '@src/libs/actions/Session';
import * as API from '@src/libs/API';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Account, Credentials, Session} from '@src/types/onyx';

import type {OnyxEntry, OnyxUpdate} from 'react-native-onyx';

import {CONST as COMMON_CONST} from 'expensify-common';
import {openAuthSessionAsync} from 'expo-web-browser';
import {clearTokenRefresh, removeAllFromAutoprefetch} from 'react-native-nitro-fetch';
import Onyx from 'react-native-onyx';

import getOnyxValue from '../utils/getOnyxValue';
import * as TestHelper from '../utils/TestHelper';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

// We are mocking this method so that we can later test to see if it was called and what arguments it was called with.
// We test HttpUtils.xhr() since this means that our API command turned into a network request and isn't only queued.
HttpUtils.xhr = jest.fn<typeof HttpUtils.xhr<never>>();

// Mocked to ensure push notifications are subscribed/unsubscribed as the session changes
jest.mock('@libs/Notification/PushNotification');

// Mocked to check SignOutAndRedirectToSignIn behavior
jest.mock('@libs/asyncOpenURL');

jest.mock('expo-web-browser', () => ({
    openAuthSessionAsync: jest.fn(() => Promise.resolve({type: 'success'})),
}));

jest.mock('@libs/actions/Link', () => {
    return {
        buildOldDotURL: jest.fn(() => Promise.resolve('mockOldDotURL')),
        openExternalLink: jest.fn(),
    };
});

jest.mock('@libs/getPlatform', () => jest.fn());

const mockedGetPlatform = jest.mocked(getPlatform);

type AccountMergeUpdate = Extract<OnyxUpdate<typeof ONYXKEYS.ACCOUNT>, {onyxMethod: typeof Onyx.METHOD.MERGE}>;
type AccountMergeValue = Pick<NonNullable<AccountMergeUpdate['value']>, 'isLoading' | 'errors' | 'twoFactorAuthSecretKey'>;
type AccountMergeObjectUpdate = Omit<AccountMergeUpdate, 'value'> & {value: AccountMergeValue};

function isAccountMergeUpdate(value: unknown): value is AccountMergeObjectUpdate {
    if (!isRecord(value) || value.key !== ONYXKEYS.ACCOUNT || value.onyxMethod !== Onyx.METHOD.MERGE || !isRecord(value.value)) {
        return false;
    }

    const {isLoading, errors, twoFactorAuthSecretKey} = value.value;
    return (
        (isLoading === undefined || isLoading === null || typeof isLoading === 'boolean') &&
        (errors === undefined || errors === null || (isRecord(errors) && Object.values(errors).every((error) => error === null || typeof error === 'string'))) &&
        (twoFactorAuthSecretKey === undefined || twoFactorAuthSecretKey === null || typeof twoFactorAuthSecretKey === 'string')
    );
}

Onyx.init({
    keys: ONYXKEYS,
});

OnyxUpdateManager();
initReconnect();
beforeEach(() => {
    setHasRadio(true);
    return Onyx.clear().then(waitForBatchedUpdates);
});

describe('Session', () => {
    describe('isSupportalSession', () => {
        test('returns true when the session uses a support auth token', async () => {
            await Onyx.merge(ONYXKEYS.SESSION, {authTokenType: CONST.AUTH_TOKEN_TYPES.SUPPORT});
            await waitForBatchedUpdates();

            expect(SessionUtil.isSupportalSession()).toBe(true);
        });

        test('returns true mid-transition when isSupportAuthTokenUsed is set', async () => {
            await Onyx.merge(ONYXKEYS.SESSION, {isSupportAuthTokenUsed: true});
            await waitForBatchedUpdates();

            expect(SessionUtil.isSupportalSession()).toBe(true);
        });

        test('returns false for a non-supportal session', async () => {
            await Onyx.merge(ONYXKEYS.SESSION, {email: 'user@example.com'});
            await waitForBatchedUpdates();

            expect(SessionUtil.isSupportalSession()).toBe(false);
        });

        test('returns false when there is no session', () => {
            // beforeEach clears Onyx, so the module-level session is empty here
            expect(SessionUtil.isSupportalSession()).toBe(false);
        });
    });

    test('reauthenticate redirects to sign in with "No credentials available" when credentials are missing', async () => {
        // Given no signed-in user — beforeEach calls Onyx.clear(), so NetworkStore's credentials are null

        const redirectToSignInSpy = jest.spyOn(SignInRedirect, 'default').mockImplementation(() => Promise.resolve());

        // When reauthenticate is called with no credentials stored
        const result = await reauthenticate('TestCommand');
        await waitForBatchedUpdates();

        // Then it should redirect to sign in instead of attempting to call Authenticate with undefined credentials
        expect(result).toBe(false);
        expect(redirectToSignInSpy).toHaveBeenCalledWith('No credentials available');

        redirectToSignInSpy.mockRestore();
    });

    test('reauthenticate aborts when RAM_ONLY_IS_AUTHENTICATING_WITH_SHORT_LIVED_TOKEN is true', async () => {
        // Given a SignIn with short lived token is currently in flight
        await Onyx.set(ONYXKEYS.RAM_ONLY_IS_AUTHENTICATING_WITH_SHORT_LIVED_TOKEN, true);
        await waitForBatchedUpdates();

        const redirectToSignInSpy = jest.spyOn(SignInRedirect, 'default').mockImplementation(() => Promise.resolve());

        // When reauthenticate is called
        const result = await reauthenticate('TestCommand');
        await waitForBatchedUpdates();

        // Then it aborts cleanly without redirecting to sign in
        expect(result).toBe(false);
        expect(redirectToSignInSpy).not.toHaveBeenCalled();

        redirectToSignInSpy.mockRestore();
    });

    test('setIsAuthenticatingWithShortLivedToken(true) makes reauthenticate abort (blocks the SAML resume race)', async () => {
        let isAuthenticatingWithShortLivedToken: OnyxEntry<boolean>;
        Onyx.connect({
            key: ONYXKEYS.RAM_ONLY_IS_AUTHENTICATING_WITH_SHORT_LIVED_TOKEN,
            callback: (val) => (isAuthenticatingWithShortLivedToken = val),
        });

        // Given the SAML sign-in flow set the guard before opening the in-app browser
        SessionUtil.setIsAuthenticatingWithShortLivedToken(true);
        await waitForBatchedUpdates();
        expect(isAuthenticatingWithShortLivedToken).toBe(true);

        const redirectToSignInSpy = jest.spyOn(SignInRedirect, 'default').mockImplementation(() => Promise.resolve());

        // When the app resumes and reconnectApp's 407 triggers reauthenticate
        const result = await reauthenticate('TestCommand');
        await waitForBatchedUpdates();

        // Then reauthenticate aborts without redirecting to sign in, so the SAML callback can complete
        expect(result).toBe(false);
        expect(redirectToSignInSpy).not.toHaveBeenCalled();

        // When the browser is cancelled/fails, the guard is cleared so future reauthentication isn't blocked
        SessionUtil.setIsAuthenticatingWithShortLivedToken(false);
        await waitForBatchedUpdates();
        expect(isAuthenticatingWithShortLivedToken).toBe(false);

        redirectToSignInSpy.mockRestore();
    });

    test('reauthenticate proceeds even when a legacy session.isAuthenticatingWithShortLivedToken=true is persisted (recovers stuck users)', async () => {
        // Given a session in Onyx that still carries the legacy stuck flag from before the RAM-only migration.
        // The Session type no longer declares the field, so write the legacy shape to exercise persisted-data compatibility.
        // @ts-expect-error -- legacy persisted sessions can contain this field even though current Session does not.
        await Onyx.merge(ONYXKEYS.SESSION, {isAuthenticatingWithShortLivedToken: true});
        await waitForBatchedUpdates();

        const redirectToSignInSpy = jest.spyOn(SignInRedirect, 'default').mockImplementation(() => Promise.resolve());

        // When reauthenticate is called with no credentials stored
        const result = await reauthenticate('TestCommand');
        await waitForBatchedUpdates();

        // Then the legacy persisted flag does NOT block reauth. Reauth proceeds, finds no credentials, and redirects to sign in.
        expect(result).toBe(false);
        expect(redirectToSignInSpy).toHaveBeenCalledWith('No credentials available');

        redirectToSignInSpy.mockRestore();
    });

    describe('SAML reauthentication redirect coalescing', () => {
        beforeEach(async () => {
            // Reset the module-level coalescing guard between tests. Setting the short-lived-token flag to
            // true is what clears the guard, so toggle it on and back off to start each test from a clean state.
            await Onyx.set(ONYXKEYS.RAM_ONLY_IS_AUTHENTICATING_WITH_SHORT_LIVED_TOKEN, true);
            await Onyx.set(ONYXKEYS.RAM_ONLY_IS_AUTHENTICATING_WITH_SHORT_LIVED_TOKEN, false);
            await waitForBatchedUpdates();
        });

        test('coalesces a burst of concurrent SAML reauthentication calls into a single sign-in redirect', async () => {
            // Given a SAML-required account whose session token has expired
            await Onyx.set(ONYXKEYS.ACCOUNT, {isSAMLRequired: true, isLoading: true});
            await waitForBatchedUpdates();

            const redirectToSignInSpy = jest.spyOn(SignInRedirect, 'default').mockImplementation(() => Promise.resolve());

            // When several requests fail with 407 in the same tick and each triggers reauthenticate
            const results = await Promise.all([reauthenticate('ReconnectApp'), reauthenticate('OpenApp'), reauthenticate('AuthenticatePusher')]);
            await waitForBatchedUpdates();

            // Then only the first request redirects to the SAML sign-in page; the rest are skipped, so the page
            // is not torn down and re-mounted (and SAML re-initiated) once per concurrent 407
            expect(results).toEqual([false, false, false]);
            expect(redirectToSignInSpy).toHaveBeenCalledTimes(1);
            expect(redirectToSignInSpy).toHaveBeenCalledWith(undefined, true);

            redirectToSignInSpy.mockRestore();
        });

        test('allows a fresh SAML sign-in redirect once a new short-lived-token exchange has begun', async () => {
            // Given a SAML-required account that has already been redirected to sign in
            await Onyx.set(ONYXKEYS.ACCOUNT, {isSAMLRequired: true, isLoading: true});
            await waitForBatchedUpdates();

            const redirectToSignInSpy = jest.spyOn(SignInRedirect, 'default').mockImplementation(() => Promise.resolve());

            await reauthenticate('ReconnectApp');
            await waitForBatchedUpdates();
            expect(redirectToSignInSpy).toHaveBeenCalledTimes(1);

            // A later 407 in the same burst is still coalesced and does not redirect again
            await reauthenticate('OpenApp');
            await waitForBatchedUpdates();
            expect(redirectToSignInSpy).toHaveBeenCalledTimes(1);

            // When the user begins a new SAML sign-in, the short-lived-token exchange starts and then settles
            await Onyx.set(ONYXKEYS.RAM_ONLY_IS_AUTHENTICATING_WITH_SHORT_LIVED_TOKEN, true);
            await waitForBatchedUpdates();
            await Onyx.set(ONYXKEYS.RAM_ONLY_IS_AUTHENTICATING_WITH_SHORT_LIVED_TOKEN, false);
            await waitForBatchedUpdates();

            // Then a later token expiry is allowed to redirect to SAML again
            await reauthenticate('ReconnectApp');
            await waitForBatchedUpdates();
            expect(redirectToSignInSpy).toHaveBeenCalledTimes(2);

            redirectToSignInSpy.mockRestore();
        });
    });

    test('Authenticate is called with saved credentials when a session expires', async () => {
        // Given a test user and set of authToken with subscriptions to session and credentials
        const TEST_USER_LOGIN = 'test@testguy.com';
        const TEST_USER_ACCOUNT_ID = 1;
        const TEST_INITIAL_AUTH_TOKEN = 'initialAuthToken';
        const TEST_REFRESHED_AUTH_TOKEN = 'refreshedAuthToken';

        let credentials: OnyxEntry<Credentials>;
        Onyx.connect({
            key: ONYXKEYS.CREDENTIALS,
            callback: (val) => (credentials = val),
        });

        let session: OnyxEntry<Session>;
        Onyx.connect({
            key: ONYXKEYS.SESSION,
            callback: (val) => (session = val),
        });

        // When we sign in with the test user
        await TestHelper.signInWithTestUser(TEST_USER_ACCOUNT_ID, TEST_USER_LOGIN, 'Password1', TEST_INITIAL_AUTH_TOKEN);
        await waitForBatchedUpdates();

        // Then our re-authentication credentials should be generated and our session data
        // have the correct information + initial authToken.
        expect(credentials?.login).toBe(TEST_USER_LOGIN);
        expect(credentials?.autoGeneratedLogin).not.toBeUndefined();
        expect(credentials?.autoGeneratedPassword).not.toBeUndefined();
        expect(session?.authToken).toBe(TEST_INITIAL_AUTH_TOKEN);
        expect(session?.accountID).toBe(TEST_USER_ACCOUNT_ID);
        expect(session?.email).toBe(TEST_USER_LOGIN);

        // At this point we have an authToken. To simulate it expiring we'll just make another
        // request and mock the response so it returns 407. Once this happens we should attempt
        // to Re-Authenticate with the stored credentials. Our next call will be to Authenticate
        // so we will mock that response with a new authToken and then verify that Onyx has our
        // data.
        jest.mocked(HttpUtils.xhr)

            // This will make the call to OpenApp below return with an expired session code
            .mockImplementationOnce(() =>
                Promise.resolve({
                    jsonCode: CONST.JSON_CODE.NOT_AUTHENTICATED,
                }),
            )

            // The next call should be Authenticate since we are re-authenticating
            .mockImplementationOnce(() =>
                Promise.resolve({
                    jsonCode: CONST.JSON_CODE.SUCCESS,
                    accountID: TEST_USER_ACCOUNT_ID,
                    authToken: TEST_REFRESHED_AUTH_TOKEN,
                    email: TEST_USER_LOGIN,
                }),
            );

        // When we attempt to fetch the initial app data via the API
        openApp();
        await waitForBatchedUpdates();

        // Then it should fail and reauthenticate the user adding the new authToken to the session
        // data in Onyx
        expect(session?.authToken).toBe(TEST_REFRESHED_AUTH_TOKEN);
    });

    test('Push notifications are subscribed after signing in', async () => {
        await TestHelper.signInWithTestUser();
        await waitForBatchedUpdates();
        expect(PushNotification.register).toHaveBeenCalled();
    });

    test('Push notifications are unsubscribed after signing out', async () => {
        await TestHelper.signInWithTestUser();
        await TestHelper.signOutTestUser();
        expect(PushNotification.deregister).toHaveBeenCalled();
    });

    test('ReconnectApp should push request to the queue', async () => {
        await TestHelper.signInWithTestUser();
        await Onyx.set(ONYXKEYS.HAS_LOADED_APP, true);
        setHasRadio(false);
        await waitForBatchedUpdates();

        reconnectApp();

        await waitForBatchedUpdates();

        expect(getAllPersistedRequests().length).toBe(1);
        expect(getAllPersistedRequests().at(0)?.command).toBe(WRITE_COMMANDS.RECONNECT_APP);

        setHasRadio(true);
        await waitForBatchedUpdates();

        await waitForBatchedUpdates();

        expect(getAllPersistedRequests().length).toBe(0);
    });

    test('ReconnectApp should open if app is not loaded', async () => {
        await TestHelper.signInWithTestUser();
        await Onyx.set(ONYXKEYS.HAS_LOADED_APP, false);
        setHasRadio(false);
        await waitForBatchedUpdates();

        reconnectApp();

        await waitForBatchedUpdates();

        expect(getAllPersistedRequests().length).toBe(1);
        expect(getAllPersistedRequests().at(0)?.command).toBe(WRITE_COMMANDS.OPEN_APP);

        setHasRadio(true);
        await waitForBatchedUpdates();

        await waitForBatchedUpdates();

        expect(getAllPersistedRequests().length).toBe(0);
    });

    test('ReconnectApp should replace same requests from the queue', async () => {
        await TestHelper.signInWithTestUser();
        await Onyx.set(ONYXKEYS.HAS_LOADED_APP, true);
        setHasRadio(false);
        await waitForBatchedUpdates();

        reconnectApp();
        reconnectApp();
        reconnectApp();
        reconnectApp();

        await waitForBatchedUpdates();

        expect(getAllPersistedRequests().length).toBe(1);
        expect(getAllPersistedRequests().at(0)?.command).toBe(WRITE_COMMANDS.RECONNECT_APP);

        setHasRadio(true);
        await waitForBatchedUpdates();

        expect(getAllPersistedRequests().length).toBe(0);
    });

    test('OpenApp should push request to the queue', async () => {
        await TestHelper.signInWithTestUser();
        setHasRadio(false);
        await waitForBatchedUpdates();

        openApp();

        await waitForBatchedUpdates();

        expect(getAllPersistedRequests().length).toBe(1);
        expect(getAllPersistedRequests().at(0)?.command).toBe(WRITE_COMMANDS.OPEN_APP);

        setHasRadio(true);
        await waitForBatchedUpdates();

        await waitForBatchedUpdates();

        expect(getAllPersistedRequests().length).toBe(0);
    });

    test('OpenApp should replace same requests from the queue', async () => {
        await TestHelper.signInWithTestUser();
        setHasRadio(false);
        await waitForBatchedUpdates();

        openApp();
        openApp();
        openApp();
        openApp();

        await waitForBatchedUpdates();

        expect(getAllPersistedRequests().length).toBe(1);
        expect(getAllPersistedRequests().at(0)?.command).toBe(WRITE_COMMANDS.OPEN_APP);

        setHasRadio(true);
        await waitForBatchedUpdates();

        expect(getAllPersistedRequests().length).toBe(0);
    });

    test('SignOut should return a promise with response containing hasOldDotAuthCookies', async () => {
        await TestHelper.signInWithTestUser();
        setHasRadio(false);
        await waitForBatchedUpdates();

        jest.mocked(HttpUtils.xhr)
            // This will make the call to OpenApp below return with an expired session code
            .mockImplementationOnce(() =>
                Promise.resolve({
                    jsonCode: CONST.JSON_CODE.SUCCESS,
                    hasOldDotAuthCookies: true,
                }),
            );

        const signOutPromise = SessionUtil.signOut({authToken: 'testAuthToken'});

        expect(signOutPromise).toBeInstanceOf(Promise);

        expect(await signOutPromise).toStrictEqual({
            jsonCode: CONST.JSON_CODE.SUCCESS,
            hasOldDotAuthCookies: true,
        });

        setHasRadio(true);
        await waitForBatchedUpdates();

        expect(getAllPersistedRequests().length).toBe(0);
    });

    test('SignOut should clear native startup prefetch state', async () => {
        await TestHelper.signInWithTestUser();
        setHasRadio(false);
        await waitForBatchedUpdates();

        await SessionUtil.signOut({authToken: 'testAuthToken'});

        expect(clearTokenRefresh).toHaveBeenCalledWith('fetch');
        expect(removeAllFromAutoprefetch).toHaveBeenCalled();

        setHasRadio(true);
        await waitForBatchedUpdates();
    });

    test('SignOut should clear native startup prefetch state before LOG_OUT', async () => {
        const clearTokenRefreshMock = jest.mocked(clearTokenRefresh);
        const removeAllFromAutoprefetchMock = jest.mocked(removeAllFromAutoprefetch);
        const makeRequestSpy = jest.spyOn(API, 'makeRequestWithSideEffects').mockResolvedValue(undefined);

        await SessionUtil.signOut({authToken: 'testAuthToken'});

        expect(clearTokenRefreshMock).toHaveBeenCalledWith('fetch');
        expect(removeAllFromAutoprefetchMock).toHaveBeenCalled();
        expect(makeRequestSpy).toHaveBeenCalledWith(SIDE_EFFECT_REQUEST_COMMANDS.LOG_OUT, expect.objectContaining({authToken: 'testAuthToken'}), {});
        expect(clearTokenRefreshMock.mock.invocationCallOrder.at(0)).toBeLessThan(makeRequestSpy.mock.invocationCallOrder.at(0) ?? 0);
        expect(removeAllFromAutoprefetchMock.mock.invocationCallOrder.at(0)).toBeLessThan(makeRequestSpy.mock.invocationCallOrder.at(0) ?? 0);

        makeRequestSpy.mockRestore();
    });

    describe('SignOutAndRedirectToSignIn', () => {
        test('SignOutAndRedirectToSignIn should redirect to OldDot when LogOut returns truthy hasOldDotAuthCookies', async () => {
            await TestHelper.signInWithTestUser();
            setHasRadio(false);
            await waitForBatchedUpdates();

            jest.mocked(HttpUtils.xhr)
                // This will make the call to OpenApp below return with an expired session code
                .mockImplementationOnce(() =>
                    Promise.resolve({
                        jsonCode: CONST.JSON_CODE.SUCCESS,
                        hasOldDotAuthCookies: true,
                    }),
                );

            const redirectToSignInSpy = jest.spyOn(SignInRedirect, 'default').mockImplementation(() => Promise.resolve());

            signOutAndRedirectToSignIn();

            await waitForBatchedUpdates();

            expect(asyncOpenURL).toHaveBeenCalledWith(expect.any(Promise), `${CONFIG.EXPENSIFY.EXPENSIFY_URL}${CONST.OLDDOT_URLS.SIGN_OUT}`, true, true);
            expect(redirectToSignInSpy).toHaveBeenCalled();
            jest.clearAllMocks();
        });

        test('SignOutAndRedirectToSignIn should not redirect to OldDot when LogOut return falsy hasOldDotAuthCookies', async () => {
            await TestHelper.signInWithTestUser();
            setHasRadio(false);
            await waitForBatchedUpdates();

            jest.mocked(HttpUtils.xhr)
                // This will make the call to OpenApp below return with an expired session code
                .mockImplementationOnce(() =>
                    Promise.resolve({
                        jsonCode: CONST.JSON_CODE.SUCCESS,
                    }),
                );

            const redirectToSignInSpy = jest.spyOn(SignInRedirect, 'default').mockImplementation(() => Promise.resolve());

            signOutAndRedirectToSignIn();

            await waitForBatchedUpdates();

            expect(asyncOpenURL).not.toHaveBeenCalled();
            expect(redirectToSignInSpy).toHaveBeenCalled();
            jest.clearAllMocks();
        });

        test('SignOutAndRedirectToSignIn should restore stashed session and redirect to OldDot supportal of supportal agent', async () => {
            jest.spyOn(SessionUtil, 'isSupportAuthToken').mockReturnValue(true);
            jest.spyOn(SessionUtil, 'hasStashedSession').mockReturnValue(true);
            jest.spyOn(SessionUtil, 'signOut').mockResolvedValue(undefined);
            const onyxClearSpy = jest.spyOn(Onyx, 'clear').mockResolvedValue(undefined);
            const onyxMultiSetSpy = jest.spyOn(Onyx, 'multiSet').mockResolvedValue(undefined);

            const testStashedCredentials = {login: 'stashed@expensify.com', autoGeneratedLogin: 'stashedAutoLogin', autoGeneratedPassword: 'stashedAutoPassword'};
            const testStashedSession = {authToken: 'stashedAuthToken', email: 'stashed@expensify.com', accountID: 123, creationDate: new Date().getTime()};

            await Onyx.set(ONYXKEYS.STASHED_CREDENTIALS, testStashedCredentials);
            await Onyx.set(ONYXKEYS.STASHED_SESSION, testStashedSession);
            await Onyx.merge(ONYXKEYS.SESSION, {authTokenType: CONST.AUTH_TOKEN_TYPES.SUPPORT});

            await waitForBatchedUpdates();

            signOutAndRedirectToSignIn(false, false, true, true);

            await waitForBatchedUpdates();

            expect(SessionUtil.signOut).not.toHaveBeenCalled();

            expect(onyxClearSpy).toHaveBeenCalledWith(KEYS_TO_PRESERVE_SUPPORTAL);

            expect(onyxMultiSetSpy).toHaveBeenCalledWith({
                [ONYXKEYS.CREDENTIALS]: testStashedCredentials,
                [ONYXKEYS.SESSION]: testStashedSession,
            });

            expect(buildOldDotURL).toHaveBeenCalledWith(CONST.OLDDOT_URLS.SUPPORTAL_RESTORE_STASHED_LOGIN);
            expect(openExternalLink).toHaveBeenCalledWith('mockOldDotURL', undefined, true);
        });

        test('SignOutAndRedirectToSignIn should preserve SESSION and restore stashed session when shouldForceUseStashedSession is true', async () => {
            jest.spyOn(SessionUtil, 'isSupportAuthToken').mockReturnValue(false);
            jest.spyOn(SessionUtil, 'hasStashedSession').mockReturnValue(true);
            jest.spyOn(SessionUtil, 'signOut').mockResolvedValue(undefined);
            const onyxClearSpy = jest.spyOn(Onyx, 'clear').mockResolvedValue(undefined);
            const onyxMultiSetSpy = jest.spyOn(Onyx, 'multiSet').mockResolvedValue(undefined);

            const testStashedCredentials = {login: 'delegate@expensify.com', autoGeneratedLogin: 'delegateAutoLogin', autoGeneratedPassword: 'delegateAutoPassword'};
            const testStashedSession = {authToken: 'delegateAuthToken', email: 'delegate@expensify.com', accountID: 456, creationDate: new Date().getTime()};

            await Onyx.set(ONYXKEYS.STASHED_CREDENTIALS, testStashedCredentials);
            await Onyx.set(ONYXKEYS.STASHED_SESSION, testStashedSession);

            await waitForBatchedUpdates();

            const redirectToSignInSpy = jest.spyOn(SignInRedirect, 'default').mockImplementation(() => Promise.resolve());

            signOutAndRedirectToSignIn(true, false, true, true);

            await waitForBatchedUpdates();

            expect(SessionUtil.signOut).not.toHaveBeenCalled();

            // Should use Onyx.clear with KEYS_TO_PRESERVE_SUPPORTAL (preserving SESSION) instead of redirectToSignIn
            expect(onyxClearSpy).toHaveBeenCalledWith(KEYS_TO_PRESERVE_SUPPORTAL);
            expect(redirectToSignInSpy).not.toHaveBeenCalled();

            expect(onyxMultiSetSpy).toHaveBeenCalledWith({
                [ONYXKEYS.CREDENTIALS]: testStashedCredentials,
                [ONYXKEYS.SESSION]: testStashedSession,
            });
        });
    });

    describe('hasStashedSession', () => {
        // Clear any mocks from previous tests that might have mocked hasStashedSession
        beforeEach(() => {
            jest.restoreAllMocks();
        });

        test('returns true when both stashedSession has authToken and stashedCredentials has valid autoGeneratedLogin', () => {
            const stashedSession = {authToken: 'testAuthToken', email: 'test@expensify.com', accountID: 123, creationDate: new Date().getTime()};
            const stashedCredentials = {login: 'test@expensify.com', autoGeneratedLogin: 'autoLogin', autoGeneratedPassword: 'autoPassword'};

            const result = SessionUtil.hasStashedSession(stashedSession, stashedCredentials);

            expect(result).toBe(true);
        });

        test('returns false when stashedSession authToken is missing', () => {
            const stashedSession = {email: 'test@expensify.com', accountID: 123, creationDate: new Date().getTime()};
            const stashedCredentials = {login: 'test@expensify.com', autoGeneratedLogin: 'autoLogin', autoGeneratedPassword: 'autoPassword'};

            const result = SessionUtil.hasStashedSession(stashedSession, stashedCredentials);

            expect(result).toBe(false);
        });

        test('returns false when autoGeneratedLogin is missing', () => {
            const stashedSession = {authToken: 'testAuthToken', email: 'test@expensify.com', accountID: 123, creationDate: new Date().getTime()};
            const stashedCredentials = {login: 'test@expensify.com', autoGeneratedPassword: 'autoPassword'};

            const result = SessionUtil.hasStashedSession(stashedSession, stashedCredentials);

            expect(result).toBe(false);
        });

        test('returns false when stashedSessionParam is undefined', () => {
            const stashedCredentials = {login: 'test@expensify.com', autoGeneratedLogin: 'autoLogin', autoGeneratedPassword: 'autoPassword'};

            const result = SessionUtil.hasStashedSession(undefined, stashedCredentials);

            expect(result).toBe(false);
        });

        test('returns false when stashedCredentialsParam is undefined', () => {
            const stashedSession = {authToken: 'testAuthToken', email: 'test@expensify.com', accountID: 123, creationDate: new Date().getTime()};

            const result = SessionUtil.hasStashedSession(stashedSession, undefined);

            expect(result).toBe(false);
        });
    });

    describe('SAML sign out', () => {
        const mockedOpenAuthSessionAsync = jest.mocked(openAuthSessionAsync);

        // The supportal test above spies on SessionUtil.signOut and mocks it.
        // We need to restore it so our tests call the real implementation.
        beforeEach(() => {
            jest.restoreAllMocks();
        });

        test('SignOut should call openAuthSessionAsync without appversion when signedInWithSAML is true on web', async () => {
            await TestHelper.signInWithTestUser();
            await waitForBatchedUpdates();

            mockedOpenAuthSessionAsync.mockClear();

            mockedGetPlatform.mockReturnValue(CONST.PLATFORM.WEB);

            const makeRequestSpy = jest.spyOn(API, 'makeRequestWithSideEffects').mockResolvedValue(undefined);

            await SessionUtil.signOut({signedInWithSAML: true, authToken: 'testAuthToken', autoGeneratedLogin: 'testLogin'});
            await waitForBatchedUpdates();

            expect(mockedOpenAuthSessionAsync).toHaveBeenCalledWith(expect.stringContaining('referer=ecash&authToken=testAuthToken'), CONFIG.EXPENSIFY.NEW_EXPENSIFY_URL);
            expect(mockedOpenAuthSessionAsync).toHaveBeenCalledWith(expect.not.stringContaining('appversion='), CONFIG.EXPENSIFY.NEW_EXPENSIFY_URL);
            expect(makeRequestSpy).toHaveBeenCalledWith(SIDE_EFFECT_REQUEST_COMMANDS.LOG_OUT, expect.objectContaining({authToken: 'testAuthToken', partnerUserID: 'testLogin'}), {});

            makeRequestSpy.mockRestore();
        });

        test('SignOut should call openAuthSessionAsync with appversion when signedInWithSAML is true on mobile', async () => {
            await TestHelper.signInWithTestUser();
            await waitForBatchedUpdates();

            mockedOpenAuthSessionAsync.mockClear();

            const makeRequestSpy = jest.spyOn(API, 'makeRequestWithSideEffects').mockResolvedValue(undefined);
            mockedGetPlatform.mockReturnValue(CONST.PLATFORM.ANDROID);

            await SessionUtil.signOut({signedInWithSAML: true, authToken: 'testAuthToken', autoGeneratedLogin: 'testLogin'});
            await waitForBatchedUpdates();

            expect(mockedOpenAuthSessionAsync).toHaveBeenCalledWith(expect.stringContaining('appversion='), CONST.SAML_REDIRECT_URL);
            expect(mockedOpenAuthSessionAsync).toHaveBeenCalledWith(expect.stringContaining('authToken=testAuthToken'), CONST.SAML_REDIRECT_URL);
            expect(makeRequestSpy).toHaveBeenCalledWith(SIDE_EFFECT_REQUEST_COMMANDS.LOG_OUT, expect.objectContaining({authToken: 'testAuthToken', partnerUserID: 'testLogin'}), {});
            makeRequestSpy.mockRestore();
        });

        test('SignOut should still call LOG_OUT when SAML browser session fails', async () => {
            await TestHelper.signInWithTestUser();
            await waitForBatchedUpdates();

            mockedOpenAuthSessionAsync.mockImplementationOnce(() => Promise.reject(new Error('Browser session failed')));

            const makeRequestSpy = jest.spyOn(API, 'makeRequestWithSideEffects').mockResolvedValue(undefined);

            await SessionUtil.signOut({signedInWithSAML: true, authToken: 'testAuthToken', autoGeneratedLogin: 'testLogin'});
            await waitForBatchedUpdates();

            expect(makeRequestSpy).toHaveBeenCalledWith(SIDE_EFFECT_REQUEST_COMMANDS.LOG_OUT, expect.objectContaining({authToken: 'testAuthToken', partnerUserID: 'testLogin'}), {});
            makeRequestSpy.mockRestore();
        });

        test('SignOut should follow normal LOG_OUT path when signedInWithSAML is false', async () => {
            await TestHelper.signInWithTestUser();
            await waitForBatchedUpdates();

            mockedOpenAuthSessionAsync.mockClear();

            const makeRequestSpy = jest.spyOn(API, 'makeRequestWithSideEffects').mockResolvedValue(undefined);

            await SessionUtil.signOut({authToken: 'testAuthToken', autoGeneratedLogin: 'testLogin'});
            await waitForBatchedUpdates();

            expect(mockedOpenAuthSessionAsync).not.toHaveBeenCalled();
            expect(makeRequestSpy).toHaveBeenCalledWith(SIDE_EFFECT_REQUEST_COMMANDS.LOG_OUT, expect.objectContaining({authToken: 'testAuthToken', partnerUserID: 'testLogin'}), {});
            makeRequestSpy.mockRestore();
        });
    });

    describe('replaceTwoFactorDevice', () => {
        test('sets isLoading and clears errors optimistically for both steps', () => {
            const writeSpy = jest.spyOn(API, 'write').mockResolvedValue(undefined);

            SessionUtil.replaceTwoFactorDevice('verify_old', '123456');

            const [, , onyxData] = TestHelper.getRequiredWriteCall(writeSpy.mock.calls, 0);
            const accountOptimistic = TestHelper.getRequiredOnyxUpdate(onyxData, 'optimisticData', ONYXKEYS.ACCOUNT, Onyx.METHOD.MERGE, true);
            if (!isAccountMergeUpdate(accountOptimistic)) {
                throw new Error('Expected a typed account optimistic update');
            }
            expect(accountOptimistic.value).toStrictEqual({isLoading: true, errors: null});

            writeSpy.mockRestore();
        });

        test('verify_old success data does not clear twoFactorAuthSecretKey', () => {
            const writeSpy = jest.spyOn(API, 'write').mockResolvedValue(undefined);

            SessionUtil.replaceTwoFactorDevice('verify_old', '123456');

            const [, , onyxData] = TestHelper.getRequiredWriteCall(writeSpy.mock.calls, 0);
            const accountSuccess = TestHelper.getRequiredOnyxUpdate(onyxData, 'successData', ONYXKEYS.ACCOUNT, Onyx.METHOD.MERGE, true);
            if (!isAccountMergeUpdate(accountSuccess)) {
                throw new Error('Expected a typed account success update');
            }
            expect(accountSuccess.value).not.toHaveProperty('twoFactorAuthSecretKey');

            writeSpy.mockRestore();
        });

        test('verify_new success data clears twoFactorAuthSecretKey to signal step completion', () => {
            const writeSpy = jest.spyOn(API, 'write').mockResolvedValue(undefined);

            SessionUtil.replaceTwoFactorDevice('verify_new', '654321');

            const [, , onyxData] = TestHelper.getRequiredWriteCall(writeSpy.mock.calls, 0);
            const accountSuccess = TestHelper.getRequiredOnyxUpdate(onyxData, 'successData', ONYXKEYS.ACCOUNT, Onyx.METHOD.MERGE, true);
            if (!isAccountMergeUpdate(accountSuccess)) {
                throw new Error('Expected a typed account success update');
            }
            expect(accountSuccess.value.twoFactorAuthSecretKey).toBeNull();

            writeSpy.mockRestore();
        });
    });

    describe('validateTwoFactorAuth', () => {
        test('forced onboarding path updates auth token before clearing Onyx without openApp', async () => {
            const makeRequestSpy = jest.spyOn(API, 'makeRequestWithSideEffects').mockResolvedValue({
                authToken: 'newAuthToken',
                encryptedAuthToken: 'newEncryptedAuthToken',
            });
            const setAuthTokenSpy = jest.spyOn(NetworkStore, 'setAuthToken');
            const multiSetSpy = jest.spyOn(Onyx, 'multiSet').mockResolvedValue(undefined);
            const clearSpy = jest.spyOn(Onyx, 'clear').mockResolvedValue(undefined);
            const writeWithNoDuplicatesSpy = jest.spyOn(API, 'writeWithNoDuplicatesConflictAction').mockResolvedValue(undefined);

            SessionUtil.validateTwoFactorAuth('123456', false, {shouldKeepTwoFactorAuthFlowOpen: true});
            await waitForBatchedUpdates();

            expect(makeRequestSpy).toHaveBeenCalledWith(SIDE_EFFECT_REQUEST_COMMANDS.TWO_FACTOR_AUTH_VALIDATE, {twoFactorAuthCode: '123456'}, expect.any(Object));
            expect(setAuthTokenSpy).toHaveBeenCalledWith('newAuthToken');
            expect(setAuthTokenSpy.mock.invocationCallOrder.at(0)).toBeLessThan(multiSetSpy.mock.invocationCallOrder.at(0) ?? Number.MAX_SAFE_INTEGER);
            expect(multiSetSpy).toHaveBeenCalledWith(
                expect.objectContaining({
                    [ONYXKEYS.ACCOUNT]: {
                        requiresTwoFactorAuth: true,
                        twoFactorAuthSetupInProgress: true,
                        needsTwoFactorAuthSetup: false,
                        isLoading: false,
                    },
                    [ONYXKEYS.NVP_ONBOARDING]: {
                        hasCompletedGuidedSetupFlow: false,
                    },
                }),
            );
            expect(clearSpy).toHaveBeenCalled();
            expect(clearSpy.mock.calls.at(0)?.at(0)).toEqual(
                expect.arrayContaining([
                    ONYXKEYS.PRIVATE_PERSONAL_DETAILS,
                    ONYXKEYS.NVP_ONBOARDING,
                    ONYXKEYS.ONBOARDING_LAST_VISITED_PATH,
                    ONYXKEYS.ONBOARDING_PURPOSE_SELECTED,
                    ONYXKEYS.ONBOARDING_COMPANY_SIZE,
                    ONYXKEYS.FORMS.ONBOARDING_WORK_EMAIL_FORM,
                    ONYXKEYS.ACCOUNT,
                    ONYXKEYS.SESSION,
                ]),
            );
            // openApp must stay deferred until DynamicSuccessPage Got it
            expect(writeWithNoDuplicatesSpy).not.toHaveBeenCalled();

            makeRequestSpy.mockRestore();
            setAuthTokenSpy.mockRestore();
            multiSetSpy.mockRestore();
            clearSpy.mockRestore();
            writeWithNoDuplicatesSpy.mockRestore();
        });
    });

    describe('clearTwoFactorAuthSecretKey', () => {
        test('removes twoFactorAuthSecretKey from account state', async () => {
            await Onyx.merge(ONYXKEYS.ACCOUNT, {twoFactorAuthSecretKey: 'SOMESECRETKEY123'});
            await waitForBatchedUpdates();

            let account: OnyxEntry<Account>;
            Onyx.connect({
                key: ONYXKEYS.ACCOUNT,
                callback: (val) => (account = val),
            });
            await waitForBatchedUpdates();
            expect(account?.twoFactorAuthSecretKey).toBe('SOMESECRETKEY123');

            SessionUtil.clearTwoFactorAuthSecretKey();
            await waitForBatchedUpdates();

            expect(account).not.toHaveProperty('twoFactorAuthSecretKey');
        });
    });

    describe('SAML sign in', () => {
        test('signInWithShortLivedAuthToken with isSAML=true should set signedInWithSAML in session', async () => {
            let session: OnyxEntry<Session>;
            Onyx.connect({
                key: ONYXKEYS.SESSION,
                callback: (val) => (session = val),
            });

            SessionUtil.signInWithShortLivedAuthToken('testAuthToken', true);
            await waitForBatchedUpdates();

            expect(session?.signedInWithSAML).toBe(true);
        });

        test('signInWithShortLivedAuthToken with isSAML=false should not set signedInWithSAML', async () => {
            let session: OnyxEntry<Session>;
            Onyx.connect({
                key: ONYXKEYS.SESSION,
                callback: (val) => (session = val),
            });

            SessionUtil.signInWithShortLivedAuthToken('testAuthToken', false);
            await waitForBatchedUpdates();

            expect(session?.signedInWithSAML).toBe(false);
        });
    });

    describe('resendValidateCode', () => {
        test('sends the login argument as the email param, independent of the CREDENTIALS Onyx cache', async () => {
            const writeSpy = jest.spyOn(API, 'write').mockResolvedValue(undefined);

            // CREDENTIALS is empty (cleared in beforeEach), so a correct email here proves the value comes from the param, not the module cache.
            SessionUtil.resendValidateCode({reasonCode: null}, 'passed-in@expensify.com');
            await waitForBatchedUpdates();

            const call = writeSpy.mock.calls.at(0);
            expect(call?.at(0)).toBe(WRITE_COMMANDS.REQUEST_NEW_VALIDATE_CODE);
            expect(call?.at(1)).toEqual(expect.objectContaining({email: 'passed-in@expensify.com'}));

            writeSpy.mockRestore();
        });

        test('forwards the reasonCode from reasonParams to the API call', async () => {
            const writeSpy = jest.spyOn(API, 'write').mockResolvedValue(undefined);

            SessionUtil.resendValidateCode({reasonCode: COMMON_CONST.VALIDATE_CODE_REASONS.SIGN_IN}, 'passed-in@expensify.com');
            await waitForBatchedUpdates();

            expect(writeSpy.mock.calls.at(0)?.at(1)).toEqual(expect.objectContaining({reasonCode: COMMON_CONST.VALIDATE_CODE_REASONS.SIGN_IN}));

            writeSpy.mockRestore();
        });

        test('sends an undefined email when the login argument is undefined', async () => {
            const writeSpy = jest.spyOn(API, 'write').mockResolvedValue(undefined);

            SessionUtil.resendValidateCode({reasonCode: null}, undefined);
            await waitForBatchedUpdates();

            expect(writeSpy.mock.calls.at(0)?.at(1)).toEqual(expect.objectContaining({email: undefined}));

            writeSpy.mockRestore();
        });

        test('optimistically sets loadingForm to RESEND_VALIDATE_CODE_FORM', async () => {
            const writeSpy = jest.spyOn(API, 'write').mockResolvedValue(undefined);

            SessionUtil.resendValidateCode({reasonCode: null}, 'passed-in@expensify.com');
            await waitForBatchedUpdates();

            expect(writeSpy.mock.calls.at(0)?.at(2)).toEqual(
                expect.objectContaining({
                    optimisticData: expect.arrayContaining([
                        expect.objectContaining({key: ONYXKEYS.ACCOUNT, value: expect.objectContaining({loadingForm: CONST.FORMS.RESEND_VALIDATE_CODE_FORM})}),
                    ]),
                }),
            );

            writeSpy.mockRestore();
        });
    });

    describe('signUpUser', () => {
        test('sends the login argument as the email param, independent of the CREDENTIALS Onyx cache', async () => {
            const writeSpy = jest.spyOn(API, 'write').mockResolvedValue(undefined);

            // CREDENTIALS is empty (cleared in beforeEach), so a correct email here proves the value comes from the param, not the module cache.
            SessionUtil.signUpUser('new-user@expensify.com', undefined);
            await waitForBatchedUpdates();

            const call = writeSpy.mock.calls.at(0);
            expect(call?.at(0)).toBe(WRITE_COMMANDS.SIGN_UP_USER);
            expect(call?.at(1)).toEqual(expect.objectContaining({email: 'new-user@expensify.com'}));

            writeSpy.mockRestore();
        });

        test('forwards the preferredLocale to the API call', async () => {
            const writeSpy = jest.spyOn(API, 'write').mockResolvedValue(undefined);

            SessionUtil.signUpUser('new-user@expensify.com', CONST.LOCALES.EN);
            await waitForBatchedUpdates();

            expect(writeSpy.mock.calls.at(0)?.at(1)).toEqual(expect.objectContaining({preferredLocale: CONST.LOCALES.EN}));

            writeSpy.mockRestore();
        });

        test('includes hasSMSMarketingConsent when it is provided', async () => {
            const writeSpy = jest.spyOn(API, 'write').mockResolvedValue(undefined);

            SessionUtil.signUpUser('new-user@expensify.com', undefined, true);
            await waitForBatchedUpdates();

            expect(writeSpy.mock.calls.at(0)?.at(1)).toEqual(expect.objectContaining({hasSMSMarketingConsent: true}));

            writeSpy.mockRestore();
        });

        test('omits hasSMSMarketingConsent when it is undefined', async () => {
            const writeSpy = jest.spyOn(API, 'write').mockResolvedValue(undefined);

            SessionUtil.signUpUser('new-user@expensify.com', undefined);
            await waitForBatchedUpdates();

            expect(writeSpy.mock.calls.at(0)?.at(1)).not.toHaveProperty('hasSMSMarketingConsent');

            writeSpy.mockRestore();
        });
    });

    describe('setupNewDotAfterTransitionFromOldDot', () => {
        const buildHybridAppSettings = (isDelegateAccess: boolean) => ({
            [ONYXKEYS.HYBRID_APP]: {
                // false so `clearOnyxIfSigningIn` resolves without hitting redirectToSignIn
                useNewDotSignInPage: false,
                delegateAccessData: {
                    isDelegateAccess,
                    oldDotCurrentUserEmail: 'delegate@od.com',
                    oldDotCurrentAuthToken: 'odAuthToken',
                    oldDotCurrentEncryptedAuthToken: 'odEncryptedAuthToken',
                    oldDotCurrentAccountID: 999,
                    oldDotAutoGeneratedLogin: 'odAutoLogin',
                    oldDotAutoGeneratedPassword: 'odAutoPassword',
                },
            },
        });

        test('writes the passed credentials into CREDENTIALS and STASHED_CREDENTIALS instead of reading the module cache', async () => {
            // Take the imported-state branch to avoid clearing Onyx / redirecting.
            await Onyx.set(ONYXKEYS.IS_USING_IMPORTED_STATE, true);
            await waitForBatchedUpdates();

            const onyxMultiSetSpy = jest.spyOn(Onyx, 'multiSet').mockResolvedValue(undefined);

            const credentialsParam = {login: 'nd@user.com', autoGeneratedLogin: 'ndAutoLogin', autoGeneratedPassword: 'ndAutoPassword'};
            await SessionUtil.setupNewDotAfterTransitionFromOldDot(buildHybridAppSettings(true), undefined, credentialsParam);
            await waitForBatchedUpdates();

            expect(onyxMultiSetSpy).toHaveBeenCalledWith(
                expect.objectContaining({
                    [ONYXKEYS.STASHED_CREDENTIALS]: credentialsParam,
                    [ONYXKEYS.CREDENTIALS]: {autoGeneratedLogin: 'ndAutoLogin', autoGeneratedPassword: 'ndAutoPassword'},
                }),
            );

            onyxMultiSetSpy.mockRestore();
        });

        test('falls back to the OldDot delegate credentials when the passed credentials are undefined', async () => {
            await Onyx.set(ONYXKEYS.IS_USING_IMPORTED_STATE, true);
            await waitForBatchedUpdates();

            const onyxMultiSetSpy = jest.spyOn(Onyx, 'multiSet').mockResolvedValue(undefined);

            await SessionUtil.setupNewDotAfterTransitionFromOldDot(buildHybridAppSettings(true), undefined, undefined);
            await waitForBatchedUpdates();

            expect(onyxMultiSetSpy).toHaveBeenCalledWith(
                expect.objectContaining({
                    [ONYXKEYS.CREDENTIALS]: {autoGeneratedLogin: 'odAutoLogin', autoGeneratedPassword: 'odAutoPassword'},
                }),
            );

            onyxMultiSetSpy.mockRestore();
        });

        test('does not stash the passed credentials when the transition is not a delegate access', async () => {
            await Onyx.set(ONYXKEYS.IS_USING_IMPORTED_STATE, true);
            await waitForBatchedUpdates();

            const onyxMultiSetSpy = jest.spyOn(Onyx, 'multiSet').mockResolvedValue(undefined);

            const credentialsParam = {login: 'nd@user.com', autoGeneratedLogin: 'ndAutoLogin', autoGeneratedPassword: 'ndAutoPassword'};
            await SessionUtil.setupNewDotAfterTransitionFromOldDot(buildHybridAppSettings(false), undefined, credentialsParam);
            await waitForBatchedUpdates();

            expect(onyxMultiSetSpy).toHaveBeenCalledWith(
                expect.objectContaining({
                    [ONYXKEYS.STASHED_CREDENTIALS]: {},
                }),
            );

            onyxMultiSetSpy.mockRestore();
        });
    });
    describe('isSupportAuthToken', () => {
        beforeEach(() => {
            jest.restoreAllMocks();
        });

        test('returns true when session has support authTokenType', () => {
            const session: Session = {authTokenType: CONST.AUTH_TOKEN_TYPES.SUPPORT, authToken: 'token', accountID: 1, creationDate: Date.now()};
            expect(SessionUtil.isSupportAuthToken(session)).toBe(true);
        });

        test('returns false when session has anonymous authTokenType', () => {
            const session: Session = {authTokenType: CONST.AUTH_TOKEN_TYPES.ANONYMOUS, authToken: 'token', accountID: 1, creationDate: Date.now()};
            expect(SessionUtil.isSupportAuthToken(session)).toBe(false);
        });

        test('returns false when session has no authTokenType', () => {
            const session: Session = {authToken: 'token', accountID: 1, creationDate: Date.now()};
            expect(SessionUtil.isSupportAuthToken(session)).toBe(false);
        });

        test('returns false when session is undefined', () => {
            expect(SessionUtil.isSupportAuthToken(undefined)).toBe(false);
        });
    });

    describe('GPS trip on the sign in redirect', () => {
        const gpsTrip = {
            gpsPoints: [[{lat: 1, long: 2}]],
            distanceInMeters: 100,
            isTracking: true,
            reportID: '1',
            unit: CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES,
        };

        beforeEach(() => {
            jest.restoreAllMocks();
        });

        test('keeps the in-progress trip when a SAML re-auth forces the redirect', async () => {
            await TestHelper.signInWithTestUser();
            const accountID = (await getOnyxValue(ONYXKEYS.SESSION))?.accountID;
            await Onyx.merge(ONYXKEYS.GPS_DRAFT_DETAILS, {...gpsTrip, accountID});
            await waitForBatchedUpdates();

            await SignInRedirect.default(undefined, true);
            await waitForBatchedUpdates();

            const draft = await getOnyxValue(ONYXKEYS.GPS_DRAFT_DETAILS);
            expect(draft?.isTracking).toBe(true);
            expect(draft?.accountID).toBe(accountID);
        });

        test('discards the in-progress trip on a sign out redirect', async () => {
            await TestHelper.signInWithTestUser();
            await Onyx.merge(ONYXKEYS.GPS_DRAFT_DETAILS, gpsTrip);
            await waitForBatchedUpdates();

            await SignInRedirect.default();
            await waitForBatchedUpdates();

            expect(await getOnyxValue(ONYXKEYS.GPS_DRAFT_DETAILS)).toBeUndefined();
        });
    });

    describe('signIn', () => {
        test('sends the login and validate code arguments to the API, independent of the CREDENTIALS Onyx cache', async () => {
            const writeSpy = jest.spyOn(API, 'write').mockResolvedValue(undefined);

            // CREDENTIALS is empty (cleared in beforeEach), so correct values here prove they come from the params, not the module cache.
            SessionUtil.signIn('112233', undefined, undefined, 'user@expensify.com', undefined);
            await waitForBatchedUpdates();

            const call = writeSpy.mock.calls.at(0);
            expect(call?.at(0)).toBe(WRITE_COMMANDS.SIGN_IN_USER);
            expect(call?.at(1)).toEqual(expect.objectContaining({email: 'user@expensify.com', validateCode: '112233'}));

            writeSpy.mockRestore();
        });

        test('falls back to the stored validate code when no code is entered during the 2FA step', async () => {
            const writeSpy = jest.spyOn(API, 'write').mockResolvedValue(undefined);

            // Empty entered validateCode + a 2FA code present → should use the stored validate code passed in.
            SessionUtil.signIn('', undefined, '654321', 'user@expensify.com', 'stored-code');
            await waitForBatchedUpdates();

            expect(writeSpy.mock.calls.at(0)?.at(1)).toEqual(expect.objectContaining({validateCode: 'stored-code', twoFactorAuthCode: '654321'}));

            writeSpy.mockRestore();
        });

        test('sends the stored authToken during the 2FA step', async () => {
            const writeSpy = jest.spyOn(API, 'write').mockResolvedValue(undefined);

            SessionUtil.signIn('', undefined, '654321', 'user@expensify.com', 'stored-code', 'stored-auth-token');
            await waitForBatchedUpdates();

            expect(writeSpy.mock.calls.at(0)?.at(1)).toEqual(expect.objectContaining({authToken: 'stored-auth-token'}));

            writeSpy.mockRestore();
        });

        test('does not send an authToken on the initial validate code submission', async () => {
            const writeSpy = jest.spyOn(API, 'write').mockResolvedValue(undefined);

            // No 2FA code yet, even though a stored authToken is passed in - shouldn't be sent.
            SessionUtil.signIn('112233', undefined, undefined, 'user@expensify.com', undefined, 'stored-auth-token');
            await waitForBatchedUpdates();

            expect(writeSpy.mock.calls.at(0)?.at(1)).not.toHaveProperty('authToken');

            writeSpy.mockRestore();
        });
    });

    describe('requestUnlinkValidationLink', () => {
        test('sends the login argument as the email param, independent of the CREDENTIALS Onyx cache', async () => {
            const writeSpy = jest.spyOn(API, 'write').mockResolvedValue(undefined);

            // CREDENTIALS is empty (cleared in beforeEach), so a correct email here proves the value comes from the param, not the module cache.
            SessionUtil.requestUnlinkValidationLink('secondary@expensify.com');
            await waitForBatchedUpdates();

            const call = writeSpy.mock.calls.at(0);
            expect(call?.at(0)).toBe(WRITE_COMMANDS.REQUEST_UNLINK_VALIDATION_LINK);
            expect(call?.at(1)).toEqual(expect.objectContaining({email: 'secondary@expensify.com'}));

            writeSpy.mockRestore();
        });
    });

    describe('signInWithValidateCode', () => {
        test('sends the entered code as the validate code when it is not a 2FA step', async () => {
            const writeSpy = jest.spyOn(API, 'write').mockResolvedValue(undefined);

            SessionUtil.signInWithValidateCode(123, '112233', undefined);
            await waitForBatchedUpdates();

            const call = writeSpy.mock.calls.at(0);
            expect(call?.at(0)).toBe(WRITE_COMMANDS.SIGN_IN_USER_WITH_LINK);
            expect(call?.at(1)).toEqual(expect.objectContaining({accountID: 123, validateCode: '112233'}));

            writeSpy.mockRestore();
        });

        test('uses the stored validate code instead of the entered code during a 2FA step', async () => {
            const writeSpy = jest.spyOn(API, 'write').mockResolvedValue(undefined);

            // twoFactorAuthCode present → should use storedValidateCode, ignoring the entered `code`.
            SessionUtil.signInWithValidateCode(123, 'ignored-code', undefined, '654321', 'stored-code');
            await waitForBatchedUpdates();

            expect(writeSpy.mock.calls.at(0)?.at(1)).toEqual(expect.objectContaining({validateCode: 'stored-code', twoFactorAuthCode: '654321'}));

            writeSpy.mockRestore();
        });

        test('sends the stored authToken during the 2FA step', async () => {
            const writeSpy = jest.spyOn(API, 'write').mockResolvedValue(undefined);

            SessionUtil.signInWithValidateCode(123, 'ignored-code', undefined, '654321', 'stored-code', 'stored-auth-token');
            await waitForBatchedUpdates();

            expect(writeSpy.mock.calls.at(0)?.at(1)).toEqual(expect.objectContaining({authToken: 'stored-auth-token'}));

            writeSpy.mockRestore();
        });

        test('does not send an authToken on the initial validate code submission', async () => {
            const writeSpy = jest.spyOn(API, 'write').mockResolvedValue(undefined);

            SessionUtil.signInWithValidateCode(123, '112233', undefined, undefined, undefined, 'stored-auth-token');
            await waitForBatchedUpdates();

            expect(writeSpy.mock.calls.at(0)?.at(1)).not.toHaveProperty('authToken');

            writeSpy.mockRestore();
        });
    });
});
