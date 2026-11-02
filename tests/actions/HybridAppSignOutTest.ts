/**
 * On HybridApp, ending the NewDot session must also sign OldDot out and restart the HybridApp sign-in flow. `src/libs/HybridApp.ts` does both when a clear removes the
 * `hybridApp` key. A user can end the session by signing out, or by closing their account, where the server's response does the clear.
 */
import {KEYS_TO_PRESERVE} from '@libs/actions/App';
import {KEYS_TO_PRESERVE_DELEGATE_ACCESS} from '@libs/actions/Delegate';
import {KEYS_TO_PRESERVE_SUPPORTAL} from '@libs/actions/Session';
import {getMicroSecondOnyxErrorWithMessage} from '@libs/ErrorUtils';
import HttpUtils from '@libs/HttpUtils';
import registerMiddlewares from '@libs/Middleware/register';
import * as SequentialQueue from '@libs/Network/SequentialQueue';

import redirectToSignIn from '@userActions/SignInRedirect';
import {closeAccount} from '@userActions/User';

import CONFIG from '@src/CONFIG';
import CONST from '@src/CONST';
// This lib needs to be imported, but it has nothing to export since all it contains is Onyx connections
import '@libs/HybridApp';

import ONYXKEYS from '@src/ONYXKEYS';
import type Response from '@src/types/onyx/Response';

import type {OnyxKey} from 'react-native-onyx';

import HybridAppModule from '@expensify/react-native-hybrid-app';
import Onyx from 'react-native-onyx';

import getOnyxValue from '../utils/getOnyxValue';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

const SIGNED_IN_HYBRID_APP_STATE = {useNewDotSignInPage: false, readyToShowAuthScreens: true};
const RESET_HYBRID_APP_STATE = {readyToShowAuthScreens: false, useNewDotSignInPage: true};
const ACCOUNT_CLOSED_MESSAGE = 'Account closed successfully';
const LAST_UPDATE_ID = 100;

/** CloseAccount answers a closed account with a clear in the middle of its Onyx data, followed by the message the sign-in page shows */
function getAccountClosedResponse(): Response<OnyxKey> {
    return {
        jsonCode: CONST.JSON_CODE.SUCCESS,
        lastUpdateID: LAST_UPDATE_ID + 1,
        previousUpdateID: LAST_UPDATE_ID,
        onyxData: [
            {onyxMethod: Onyx.METHOD.MERGE, key: ONYXKEYS.ACCOUNT, value: {validated: true}},
            // The server sends the clear without a key, and Onyx ignores it, but the update type requires one
            {onyxMethod: Onyx.METHOD.CLEAR, key: ONYXKEYS.SESSION},
            {onyxMethod: Onyx.METHOD.MERGE, key: ONYXKEYS.FORMS.CLOSE_ACCOUNT_FORM, value: {success: ACCOUNT_CLOSED_MESSAGE}},
        ],
    };
}

/** CloseAccount is a queued write, so its response is only applied once the queue has drained */
async function waitForQueueToDrain() {
    await waitForBatchedUpdates();
    await SequentialQueue.waitForIdle();
    await waitForBatchedUpdates();
}

registerMiddlewares();

describe('HybridApp sign-out after the NewDot session ends', () => {
    let signOutFromOldDotSpy: jest.SpiedFunction<typeof HybridAppModule.signOutFromOldDot>;

    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        // This clear runs before HybridApp is switched on, so it can't count as the session ending
        await Onyx.clear();
        await waitForBatchedUpdates();

        jest.replaceProperty(CONFIG, 'IS_HYBRID_APP', true);
        signOutFromOldDotSpy = jest.spyOn(HybridAppModule, 'signOutFromOldDot').mockImplementation(() => {});
        await Onyx.multiSet({
            [ONYXKEYS.SESSION]: {authToken: 'authToken', accountID: 1, email: 'user@test.com'},
            [ONYXKEYS.HYBRID_APP]: SIGNED_IN_HYBRID_APP_STATE,
            [ONYXKEYS.ONYX_UPDATES_LAST_UPDATE_ID_APPLIED_TO_CLIENT]: LAST_UPDATE_ID,
        });
        await waitForBatchedUpdates();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe('closing an account', () => {
        it('signs OldDot out and restarts the sign-in flow when the response clears Onyx', async () => {
            // Given a signed-in HybridApp user, and a server that closes the account and clears Onyx in its response
            jest.spyOn(HttpUtils, 'xhr').mockResolvedValue(getAccountClosedResponse());

            // When the user closes their account, because that request is what makes the server send the clear
            closeAccount('Testing', '123456');
            await waitForQueueToDrain();

            // Then the session is gone and the sign-in page keeps the message from the response
            expect((await getOnyxValue(ONYXKEYS.SESSION))?.authToken).toBeUndefined();
            expect((await getOnyxValue(ONYXKEYS.FORMS.CLOSE_ACCOUNT_FORM))?.success).toBe(ACCOUNT_CLOSED_MESSAGE);

            // And the reset outlived the clear, which is what lets the next sign-in show the signed-in screens
            expect(await getOnyxValue(ONYXKEYS.HYBRID_APP)).toEqual(RESET_HYBRID_APP_STATE);

            // And OldDot is signed out once, so it does not keep the closed account
            expect(signOutFromOldDotSpy).toHaveBeenCalledTimes(1);
        });

        it('shows the signed-in screens after signing back in to the closed account', async () => {
            // Given a user who closed their account on HybridApp
            jest.spyOn(HttpUtils, 'xhr').mockResolvedValue(getAccountClosedResponse());
            closeAccount('Testing', '123456');
            await waitForQueueToDrain();
            const signInToOldDotSpy = jest.spyOn(HybridAppModule, 'signInToOldDot').mockImplementation(() => {});

            // When a valid magic code signs them back in, and SigninUser applies its data in the order the server sends it
            await Onyx.update([
                {onyxMethod: Onyx.METHOD.MERGE, key: ONYXKEYS.ACCOUNT, value: {requiresTwoFactorAuth: false, needsTwoFactorAuthSetup: false}},
                {onyxMethod: Onyx.METHOD.MERGE, key: ONYXKEYS.SESSION, value: {authToken: 'newAuthToken', accountID: 1, email: 'user@test.com'}},
                {onyxMethod: Onyx.METHOD.MERGE, key: ONYXKEYS.CREDENTIALS, value: {autoGeneratedLogin: 'autoGeneratedLogin', autoGeneratedPassword: 'autoGeneratedPassword'}},
                {onyxMethod: Onyx.METHOD.MERGE, key: ONYXKEYS.NVP_TRY_NEW_DOT, value: {classicRedirect: {completedHybridAppOnboarding: true, dismissed: false}}},
            ]);
            await waitForBatchedUpdates();

            // Then OldDot is signed in with the new session and the signed-in screens can render, instead of the app staying on the magic code form
            expect(signInToOldDotSpy).toHaveBeenCalledWith(expect.objectContaining({authToken: 'newAuthToken'}));
            expect(await getOnyxValue(ONYXKEYS.HYBRID_APP)).toEqual(SIGNED_IN_HYBRID_APP_STATE);
        });

        it('keeps OldDot signed in until the response arrives', async () => {
            // Given a signed-in HybridApp user whose request is still waiting for the server
            let respond: (response: Response<OnyxKey>) => void = () => {};
            const requestSent = new Promise<void>((resolveRequestSent) => {
                jest.spyOn(HttpUtils, 'xhr').mockImplementation(() => {
                    resolveRequestSent();
                    return new Promise((resolve) => {
                        respond = resolve;
                    });
                });
            });

            // When the user closes their account, and the request has reached the server
            closeAccount('Testing', '123456');
            await requestSent;
            await waitForBatchedUpdates();

            // Then nothing is signed out yet, because the server hasn't closed the account
            expect(signOutFromOldDotSpy).not.toHaveBeenCalled();
            expect(await getOnyxValue(ONYXKEYS.HYBRID_APP)).toEqual(SIGNED_IN_HYBRID_APP_STATE);

            // And when the response arrives
            respond(getAccountClosedResponse());
            await waitForQueueToDrain();

            // Then OldDot is signed out, because the response is what closes the account
            expect(signOutFromOldDotSpy).toHaveBeenCalledTimes(1);
        });

        it('keeps both apps signed in when the server rejects the validate code', async () => {
            // Given a signed-in HybridApp user, and a server that rejects the validate code, so the response has no clear and the account stays open
            jest.spyOn(HttpUtils, 'xhr').mockResolvedValue({
                jsonCode: CONST.JSON_CODE.INCORRECT_VALIDATE_CODE,
                onyxData: [{onyxMethod: Onyx.METHOD.MERGE, key: ONYXKEYS.FORMS.CLOSE_ACCOUNT_FORM, value: {errors: getMicroSecondOnyxErrorWithMessage('Incorrect validate code')}}],
            });

            // When the user submits that code, which takes the path where the response has no clear
            closeAccount('Testing', '123456');
            await waitForQueueToDrain();

            // Then OldDot stays signed in and the sign-in flow is untouched, because the user is still signed in
            expect(signOutFromOldDotSpy).not.toHaveBeenCalled();
            expect(await getOnyxValue(ONYXKEYS.HYBRID_APP)).toEqual(SIGNED_IN_HYBRID_APP_STATE);

            // And the form stops loading and shows the server's error, so the user can enter another code
            const closeAccountForm = await getOnyxValue(ONYXKEYS.FORMS.CLOSE_ACCOUNT_FORM);
            expect(closeAccountForm?.isLoading).toBe(false);
            expect(Object.values(closeAccountForm?.errors ?? {})).toEqual(['Incorrect validate code']);
        });
    });

    it('signs OldDot out when the server clears Onyx outside a request from this client', async () => {
        // Given a signed-in HybridApp user

        // When a server clear reaches this client without any request from it, as when the account is closed on another device
        await Onyx.update([{onyxMethod: Onyx.METHOD.CLEAR, key: ONYXKEYS.SESSION}]);
        await waitForBatchedUpdates();

        // Then the session ending is enough to sign OldDot out and restart the sign-in flow
        expect(signOutFromOldDotSpy).toHaveBeenCalledTimes(1);
        expect(await getOnyxValue(ONYXKEYS.HYBRID_APP)).toEqual(RESET_HYBRID_APP_STATE);
    });

    it('signs OldDot out and restarts the sign-in flow when redirecting to sign-in', async () => {
        // Given a signed-in HybridApp user

        // When the session ends through the redirect that sign-out and failed reauthentication share
        await redirectToSignIn(CONST.SIGN_OUT_REASON.USER_SIGN_OUT);
        await waitForBatchedUpdates();

        // Then the redirect's clear runs the same teardown as closing an account
        expect(await getOnyxValue(ONYXKEYS.HYBRID_APP)).toEqual(RESET_HYBRID_APP_STATE);
        expect(signOutFromOldDotSpy).toHaveBeenCalledTimes(1);
    });

    it.each([
        ['KEYS_TO_PRESERVE', KEYS_TO_PRESERVE],
        ['KEYS_TO_PRESERVE_DELEGATE_ACCESS', KEYS_TO_PRESERVE_DELEGATE_ACCESS],
        ['KEYS_TO_PRESERVE_SUPPORTAL', KEYS_TO_PRESERVE_SUPPORTAL],
    ])('keeps OldDot signed in for a clear that keeps the session, using %s', async (_name, keysToPreserve) => {
        // Given a signed-in HybridApp user

        // When Onyx is cleared with a list that keeps the session, as when switching to a copilot or supportal account
        await Onyx.clear(keysToPreserve);
        await waitForBatchedUpdates();

        // Then OldDot stays signed in, because these lists preserve `hybridApp` and the session has not ended
        expect(signOutFromOldDotSpy).not.toHaveBeenCalled();
        expect(await getOnyxValue(ONYXKEYS.HYBRID_APP)).toEqual(SIGNED_IN_HYBRID_APP_STATE);
    });

    it('leaves OldDot alone when the app starts with no stored key, then signs it out when a clear removes the key', async () => {
        // Given a fresh install with nothing stored, using its own module instances because the connection in `src/libs/HybridApp.ts` only sees the initial value once
        jest.replaceProperty(CONFIG, 'IS_HYBRID_APP', false);
        await Onyx.clear();
        await waitForBatchedUpdates();
        let isolatedOnyx = Onyx;
        let isolatedSignOutSpy = signOutFromOldDotSpy;
        jest.isolateModules(() => {
            jest.replaceProperty(require<{default: typeof CONFIG}>('@src/CONFIG').default, 'IS_HYBRID_APP', true);
            isolatedSignOutSpy = jest.spyOn(require<{default: typeof HybridAppModule}>('@expensify/react-native-hybrid-app').default, 'signOutFromOldDot').mockImplementation(() => {});
            isolatedOnyx = require<{default: typeof Onyx}>('react-native-onyx').default;
            require('@libs/HybridApp');
        });

        // When the app starts, and the connection receives `undefined` because nothing is stored yet
        isolatedOnyx.init({keys: ONYXKEYS});

        // Connections get their initial value in the order they connected, so once this one has it, the connection in `src/libs/HybridApp.ts` has too
        const initialValue = await new Promise((resolve) => {
            isolatedOnyx.connectWithoutView({key: ONYXKEYS.HYBRID_APP, callback: resolve});
        });
        await waitForBatchedUpdates();
        expect(initialValue).toBeUndefined();

        // Then OldDot is left alone, because it may be signed in and no session has ended
        expect(isolatedSignOutSpy).not.toHaveBeenCalled();

        // And when the handoff from OldDot stores the key and a clear later removes it
        await isolatedOnyx.set(ONYXKEYS.HYBRID_APP, SIGNED_IN_HYBRID_APP_STATE);
        await waitForBatchedUpdates();
        await isolatedOnyx.clear();
        await waitForBatchedUpdates();

        // Then OldDot is signed out, which shows the connection was listening the whole time
        expect(isolatedSignOutSpy).toHaveBeenCalledTimes(1);
    });

    it('leaves OldDot alone when a clear runs before the key was ever set', async () => {
        // Given a HybridApp install that has never stored `hybridApp`, which OldDot only hands over to NewDot while it is signed out
        jest.replaceProperty(CONFIG, 'IS_HYBRID_APP', false);
        await Onyx.clear();
        await waitForBatchedUpdates();
        jest.replaceProperty(CONFIG, 'IS_HYBRID_APP', true);

        // When the transition from OldDot clears Onyx
        await redirectToSignIn(CONST.SIGN_OUT_REASON.HYBRID_APP_TRANSITION);
        await waitForBatchedUpdates();

        // Then OldDot isn't signed out again, because the key never went away
        expect(signOutFromOldDotSpy).not.toHaveBeenCalled();
    });

    it('leaves OldDot alone on web', async () => {
        // Given a standalone NewDot build, where there is no OldDot to sign out
        jest.replaceProperty(CONFIG, 'IS_HYBRID_APP', false);
        jest.spyOn(HttpUtils, 'xhr').mockResolvedValue(getAccountClosedResponse());

        // When the user closes their account, so the clear removes `hybridApp` on a build that must ignore it
        closeAccount('Testing', '123456');
        await waitForQueueToDrain();

        // Then the OldDot bridge is never called and no HybridApp state is written after the clear
        expect(signOutFromOldDotSpy).not.toHaveBeenCalled();
        expect(await getOnyxValue(ONYXKEYS.HYBRID_APP)).toBeUndefined();
    });
});
