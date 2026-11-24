/**
 * On HybridApp, ending the NewDot session must also sign OldDot out and restart the HybridApp sign-in flow. A client sign-out does this after its own clear in
 * `clearStorageAndRedirect`. Closing an account ends the session with a clear from the server instead, which can arrive in the response, over Pusher or in a push
 * notification, so whichever applies it restarts the flow in the same batch as the clear and signs OldDot out once that batch has settled.
 */
import {READ_COMMANDS} from '@libs/API/types';
import {getMicroSecondOnyxErrorWithMessage} from '@libs/ErrorUtils';
import HttpUtils from '@libs/HttpUtils';
import registerMiddlewares from '@libs/Middleware/register';
import * as SequentialQueue from '@libs/Network/SequentialQueue';
import PusherUtils from '@libs/PusherUtils';

import {apply as applyOnyxUpdates} from '@userActions/OnyxUpdates';
import redirectToSignIn from '@userActions/SignInRedirect';
import {closeAccount} from '@userActions/User';

import CONFIG from '@src/CONFIG';
import CONST from '@src/CONST';
// This lib needs to be imported, but it has nothing to export since all it contains is Onyx connections
import '@libs/HybridApp';

import ONYXKEYS from '@src/ONYXKEYS';
import type {OnyxUpdateEvent} from '@src/types/onyx';
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
        // This clear runs before HybridApp is switched on, so it starts every test from a clean store
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
        // A test that fails while the queue is paused would otherwise leave every later test waiting on it
        SequentialQueue.unpause();
        jest.restoreAllMocks();
    });

    describe('closing an account', () => {
        it('signs OldDot out and restarts the sign-in flow once the clear in the response has landed', async () => {
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
            // Given a signed-in HybridApp user whose request is still waiting for the server, so OldDot must not be signed out on the request alone
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

            // When the response arrives
            respond(getAccountClosedResponse());
            await waitForQueueToDrain();

            // Then OldDot is signed out, because the response is what closes the account
            expect(signOutFromOldDotSpy).toHaveBeenCalledTimes(1);
        });

        it('waits for the queued clear to land before signing OldDot out', async () => {
            // Given a CloseAccount request that has reached the server, and a queue paused before it can flush, because a write's response only lands when the queue flushes
            let respond: (response: Response<OnyxKey>) => void = () => {};
            const requestSent = new Promise<void>((resolveRequestSent) => {
                jest.spyOn(HttpUtils, 'xhr').mockImplementation(() => {
                    resolveRequestSent();
                    return new Promise((resolve) => {
                        respond = resolve;
                    });
                });
            });
            closeAccount('Testing', '123456');
            await requestSent;
            SequentialQueue.pause();

            // When the response arrives while the flush is held back
            respond(getAccountClosedResponse());
            await waitForBatchedUpdates();

            // Then OldDot stays signed in, because NewDot still has the session until the clear lands
            expect((await getOnyxValue(ONYXKEYS.SESSION))?.authToken).toBe('authToken');
            expect(signOutFromOldDotSpy).not.toHaveBeenCalled();

            // When the queue resumes and flushes the clear
            SequentialQueue.unpause();
            await waitForQueueToDrain();

            // Then both apps end the session together
            expect((await getOnyxValue(ONYXKEYS.SESSION))?.authToken).toBeUndefined();
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

    it('signs OldDot out when a response that is not queued clears Onyx', async () => {
        // Given a read response that carries a clear, which Onyx applies straight away instead of after the queue drains, so it can't rely on the queue flush
        const request = {command: READ_COMMANDS.OPEN_PAYMENTS_PAGE, data: {apiRequestType: CONST.API_REQUEST_TYPE.READ}};

        // When that response is applied
        await applyOnyxUpdates({type: CONST.ONYX_UPDATE_TYPES.HTTPS, lastUpdateID: LAST_UPDATE_ID + 1, previousUpdateID: LAST_UPDATE_ID, request, response: getAccountClosedResponse()});
        await waitForBatchedUpdates();

        // Then the same teardown runs after the clear, so the reset is kept and OldDot is signed out once
        expect(await getOnyxValue(ONYXKEYS.HYBRID_APP)).toEqual(RESET_HYBRID_APP_STATE);
        expect(signOutFromOldDotSpy).toHaveBeenCalledTimes(1);
    });

    it('signs OldDot out when a Search response clears Onyx', async () => {
        // Given a Search, whose response is applied together with its request's data
        const request = {command: READ_COMMANDS.SEARCH, data: {apiRequestType: CONST.API_REQUEST_TYPE.MAKE_REQUEST_WITH_SIDE_EFFECTS}};

        // When its response carries a clear
        await applyOnyxUpdates({type: CONST.ONYX_UPDATE_TYPES.HTTPS, lastUpdateID: LAST_UPDATE_ID + 1, previousUpdateID: LAST_UPDATE_ID, request, response: getAccountClosedResponse()});
        await waitForBatchedUpdates();

        // Then it gets the same teardown as any other response, so the session doesn't end in NewDot only
        expect(await getOnyxValue(ONYXKEYS.HYBRID_APP)).toEqual(RESET_HYBRID_APP_STATE);
        expect(signOutFromOldDotSpy).toHaveBeenCalledTimes(1);
    });

    it('signs OldDot out when a Search response clears Onyx', async () => {
        // Given a Search, whose response is applied together with its request's data
        const request = {command: READ_COMMANDS.SEARCH, data: {apiRequestType: CONST.API_REQUEST_TYPE.MAKE_REQUEST_WITH_SIDE_EFFECTS}};

        // When its response carries a clear
        await applyOnyxUpdates({type: CONST.ONYX_UPDATE_TYPES.HTTPS, lastUpdateID: LAST_UPDATE_ID + 1, previousUpdateID: LAST_UPDATE_ID, request, response: getAccountClosedResponse()});
        await waitForBatchedUpdates();

        // Then it gets the same teardown as any other response, so the session doesn't end in NewDot only
        expect(await getOnyxValue(ONYXKEYS.HYBRID_APP)).toEqual(RESET_HYBRID_APP_STATE);
        expect(signOutFromOldDotSpy).toHaveBeenCalledTimes(1);
    });

    it('still signs OldDot out and lets the user sign back in when a write after the clear fails', async () => {
        // Given a read response that carries a clear, and storage that fails a write after the clear, because Onyx runs the clear before the rest of the batch
        const request = {command: READ_COMMANDS.OPEN_PAYMENTS_PAGE, data: {apiRequestType: CONST.API_REQUEST_TYPE.READ}};
        const originalUpdate = Onyx.update;
        jest.spyOn(Onyx, 'update').mockImplementationOnce((updates) => originalUpdate(updates).then(() => Promise.reject(new Error('Storage write failed'))));
        const signInToOldDotSpy = jest.spyOn(HybridAppModule, 'signInToOldDot').mockImplementation(() => {});

        // When that response is applied and the update rejects
        await expect(
            applyOnyxUpdates({type: CONST.ONYX_UPDATE_TYPES.HTTPS, lastUpdateID: LAST_UPDATE_ID + 1, previousUpdateID: LAST_UPDATE_ID, request, response: getAccountClosedResponse()}),
        ).rejects.toThrow('Storage write failed');
        await waitForBatchedUpdates();

        // Then OldDot is still signed out and the flow restarted, because the clear already removed the session and the server has ended it
        expect((await getOnyxValue(ONYXKEYS.SESSION))?.authToken).toBeUndefined();
        expect(signOutFromOldDotSpy).toHaveBeenCalledTimes(1);
        expect(await getOnyxValue(ONYXKEYS.HYBRID_APP)).toEqual(RESET_HYBRID_APP_STATE);

        // When a valid magic code signs the user back in
        await Onyx.update([
            {onyxMethod: Onyx.METHOD.MERGE, key: ONYXKEYS.ACCOUNT, value: {requiresTwoFactorAuth: false, needsTwoFactorAuthSetup: false}},
            {onyxMethod: Onyx.METHOD.MERGE, key: ONYXKEYS.SESSION, value: {authToken: 'newAuthToken', accountID: 1, email: 'user@test.com'}},
            {onyxMethod: Onyx.METHOD.MERGE, key: ONYXKEYS.CREDENTIALS, value: {autoGeneratedLogin: 'autoGeneratedLogin', autoGeneratedPassword: 'autoGeneratedPassword'}},
            {onyxMethod: Onyx.METHOD.MERGE, key: ONYXKEYS.NVP_TRY_NEW_DOT, value: {classicRedirect: {completedHybridAppOnboarding: true, dismissed: false}}},
        ]);
        await waitForBatchedUpdates();

        // Then the sign-in finishes instead of sticking on the magic code form
        expect(signInToOldDotSpy).toHaveBeenCalledWith(expect.objectContaining({authToken: 'newAuthToken'}));
        expect(await getOnyxValue(ONYXKEYS.HYBRID_APP)).toEqual(SIGNED_IN_HYBRID_APP_STATE);
    });

    it('has the flow restarted and OldDot signed out by the time a push notification finishes applying the clear', async () => {
        // Given a push notification that carries the clear, because a push in the background lets the OS suspend the app as soon as applying it resolves

        // When the push is applied
        await applyOnyxUpdates({
            type: CONST.ONYX_UPDATE_TYPES.AIRSHIP,
            lastUpdateID: LAST_UPDATE_ID + 1,
            previousUpdateID: LAST_UPDATE_ID,
            updates: [{eventType: '', data: getAccountClosedResponse().onyxData ?? []}],
        });

        // Then the reset and the OldDot sign-out are already done, without waiting for anything after the apply
        expect(signOutFromOldDotSpy).toHaveBeenCalledTimes(1);
        expect(await Onyx.get(ONYXKEYS.HYBRID_APP)).toEqual(RESET_HYBRID_APP_STATE);
    });

    it('signs OldDot out once when a push notification applies the clear before the CloseAccount response arrives', async () => {
        // Given a push notification that carries the account closure first, moving the client from update 100 to 101, because then the response's copy counts as old
        await applyOnyxUpdates({
            type: CONST.ONYX_UPDATE_TYPES.AIRSHIP,
            lastUpdateID: LAST_UPDATE_ID + 1,
            previousUpdateID: LAST_UPDATE_ID,
            updates: [{eventType: '', data: getAccountClosedResponse().onyxData ?? []}],
        });
        await waitForBatchedUpdates();

        // When the CloseAccount response with the same update arrives, and its data is skipped as already applied
        jest.spyOn(HttpUtils, 'xhr').mockResolvedValue(getAccountClosedResponse());
        closeAccount('Testing', '123456');
        await waitForQueueToDrain();

        // Then the push that applied the clear also restarted the flow and signed OldDot out, once
        expect((await getOnyxValue(ONYXKEYS.SESSION))?.authToken).toBeUndefined();
        expect(await getOnyxValue(ONYXKEYS.HYBRID_APP)).toEqual(RESET_HYBRID_APP_STATE);
        expect(signOutFromOldDotSpy).toHaveBeenCalledTimes(1);
    });

    it('signs OldDot out when the clear arrives over Pusher with no request from this device', async () => {
        // Given the Pusher handler that applies Onyx updates, and an account closed from another device, because only Pusher brings that clear here
        jest.spyOn(PusherUtils, 'triggerMultiEventHandler').mockImplementation((_eventType, data) => Onyx.update(data));

        // When the clear arrives over Pusher
        await applyOnyxUpdates({
            type: CONST.ONYX_UPDATE_TYPES.PUSHER,
            lastUpdateID: LAST_UPDATE_ID + 1,
            previousUpdateID: LAST_UPDATE_ID,
            updates: [{eventType: 'onyxApiUpdate', data: getAccountClosedResponse().onyxData ?? []}],
        });
        await waitForBatchedUpdates();

        // Then this device restarts the flow and signs OldDot out as well, so it doesn't keep the closed account
        expect((await getOnyxValue(ONYXKEYS.SESSION))?.authToken).toBeUndefined();
        expect(await getOnyxValue(ONYXKEYS.HYBRID_APP)).toEqual(RESET_HYBRID_APP_STATE);
        expect(signOutFromOldDotSpy).toHaveBeenCalledTimes(1);
    });

    it('still applies a Pusher batch when one of its events carries data that is not a list of updates', async () => {
        // Given the Pusher handler that applies Onyx updates, and a reconnectApp event whose data isn't a list, because its handler never reads it
        jest.spyOn(PusherUtils, 'triggerMultiEventHandler').mockImplementation((eventType, data) => (eventType === 'onyxApiUpdate' ? Onyx.update(data) : Promise.resolve()));
        const reconnectAppEvent: OnyxUpdateEvent<OnyxKey> = {eventType: 'reconnectApp', data: []};
        // The update type only allows a list, so the data the server sends is set at runtime
        Reflect.set(reconnectAppEvent, 'data', {});

        // When that event arrives over Pusher in the same batch as the clear
        await applyOnyxUpdates({
            type: CONST.ONYX_UPDATE_TYPES.PUSHER,
            lastUpdateID: LAST_UPDATE_ID + 1,
            previousUpdateID: LAST_UPDATE_ID,
            updates: [reconnectAppEvent, {eventType: 'onyxApiUpdate', data: getAccountClosedResponse().onyxData ?? []}],
        });
        await waitForBatchedUpdates();

        // Then the clear in the batch is still applied, with the flow restarted and OldDot signed out
        expect((await getOnyxValue(ONYXKEYS.SESSION))?.authToken).toBeUndefined();
        expect(await getOnyxValue(ONYXKEYS.HYBRID_APP)).toEqual(RESET_HYBRID_APP_STATE);
        expect(signOutFromOldDotSpy).toHaveBeenCalledTimes(1);
    });

    it('leaves the sign-in flow alone when the clear itself fails, so OldDot is not signed back in with the old session', async () => {
        // Given a signed-in user with everything the sign-in flow needs, and storage that fails the clear, so the old session is still there afterwards
        await Onyx.multiSet({
            [ONYXKEYS.CREDENTIALS]: {autoGeneratedLogin: 'autoGeneratedLogin', autoGeneratedPassword: 'autoGeneratedPassword'},
            [ONYXKEYS.ACCOUNT]: {requiresTwoFactorAuth: false, needsTwoFactorAuthSetup: false},
            [ONYXKEYS.NVP_TRY_NEW_DOT]: {classicRedirect: {dismissed: false}},
        });
        await waitForBatchedUpdates();
        const signInToOldDotSpy = jest.spyOn(HybridAppModule, 'signInToOldDot').mockImplementation(() => {});
        jest.spyOn(Onyx, 'update').mockImplementationOnce(() => Promise.reject(new Error('Storage clear failed')));
        const request = {command: READ_COMMANDS.OPEN_PAYMENTS_PAGE, data: {apiRequestType: CONST.API_REQUEST_TYPE.READ}};

        // When a response with the clear is applied and the clear fails
        await expect(
            applyOnyxUpdates({type: CONST.ONYX_UPDATE_TYPES.HTTPS, lastUpdateID: LAST_UPDATE_ID + 1, previousUpdateID: LAST_UPDATE_ID, request, response: getAccountClosedResponse()}),
        ).rejects.toThrow('Storage clear failed');
        await waitForBatchedUpdates();

        // Then OldDot is still signed out, because the server has ended the session
        expect(signOutFromOldDotSpy).toHaveBeenCalledTimes(1);

        // And the sign-in flow is untouched, so OldDot isn't signed back in with the token of the session the server ended
        expect(await getOnyxValue(ONYXKEYS.HYBRID_APP)).toEqual(SIGNED_IN_HYBRID_APP_STATE);
        expect(signInToOldDotSpy).not.toHaveBeenCalled();
    });

    it('signs OldDot out and restarts the sign-in flow when redirecting to sign-in', async () => {
        // Given a signed-in HybridApp user, because only a session that ends needs OldDot signed out

        // When the session ends through the redirect that sign-out and failed reauthentication share
        await redirectToSignIn(CONST.SIGN_OUT_REASON.USER_SIGN_OUT);
        await waitForBatchedUpdates();

        // Then the redirect runs the teardown once after its own clear
        expect(await getOnyxValue(ONYXKEYS.HYBRID_APP)).toEqual(RESET_HYBRID_APP_STATE);
        expect(signOutFromOldDotSpy).toHaveBeenCalledTimes(1);
    });

    it('signs OldDot out on the first launch of a fresh install, before anything has stored the hybridApp key', async () => {
        // Given a fresh install that has never stored `hybridApp`
        jest.replaceProperty(CONFIG, 'IS_HYBRID_APP', false);
        await Onyx.clear();
        await waitForBatchedUpdates();
        jest.replaceProperty(CONFIG, 'IS_HYBRID_APP', true);

        // When the first handoff from OldDot clears Onyx before showing the sign-in page
        await redirectToSignIn(CONST.SIGN_OUT_REASON.HYBRID_APP_TRANSITION);
        await waitForBatchedUpdates();

        // Then OldDot is signed out even though it has no session, because that drops the placeholder user OldDot keeps until then.
        // Without it, the next sign-in skips loading the account in OldDot, and the next launch opens Classic.
        expect(signOutFromOldDotSpy).toHaveBeenCalledTimes(1);
        expect(await getOnyxValue(ONYXKEYS.HYBRID_APP)).toEqual(RESET_HYBRID_APP_STATE);
    });

    it('leaves OldDot alone on web', async () => {
        // Given a standalone NewDot build, where there is no OldDot to sign out
        jest.replaceProperty(CONFIG, 'IS_HYBRID_APP', false);
        jest.spyOn(HttpUtils, 'xhr').mockResolvedValue(getAccountClosedResponse());

        // When the user closes their account, so the response carries a clear on a build that must ignore it
        closeAccount('Testing', '123456');
        await waitForQueueToDrain();

        // Then the OldDot bridge is never called and no HybridApp state is written after the clear
        expect(signOutFromOldDotSpy).not.toHaveBeenCalled();
        expect(await getOnyxValue(ONYXKEYS.HYBRID_APP)).toBeUndefined();
    });
});
