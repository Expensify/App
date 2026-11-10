import * as PersistedRequests from '@libs/actions/PersistedRequests';
import sendOrDeleteRequestsKeptOnSAMLSignOut from '@libs/actions/sendOrDeleteRequestsKeptOnSAMLSignOut';
import redirectToSignIn from '@libs/actions/SignInRedirect';
import {flush} from '@libs/Network/SequentialQueue';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {AnyRequest} from '@src/types/onyx';

import Onyx from 'react-native-onyx';

import getOnyxValue from '../utils/getOnyxValue';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

jest.mock('@libs/Network/SequentialQueue', () => ({flush: jest.fn()}));

const ACCOUNT_ID = 1;
const OTHER_ACCOUNT_ID = 2;
const DRAFT_KEY = `${ONYXKEYS.COLLECTION.REPORT_DRAFT_COMMENT}123` as const;

const uploadingReceipt: AnyRequest = {command: 'RequestMoney', data: {transactionID: '1'}, requestIndex: 1};
const queuedComment: AnyRequest = {command: 'AddComment', data: {reportID: '123'}, requestIndex: 2};

beforeAll(() => Onyx.init({keys: ONYXKEYS}));

beforeEach(async () => {
    jest.clearAllMocks();
    PersistedRequests.clear();
    await Onyx.clear();
    await Onyx.set(ONYXKEYS.SESSION, {accountID: ACCOUNT_ID, email: 'member@saml.com', authToken: 'token'});
    await Onyx.set(DRAFT_KEY, 'Lunch with the team');
    await waitForBatchedUpdates();
});

async function queueRequestsWithOneUploading() {
    PersistedRequests.save(uploadingReceipt);
    PersistedRequests.save(queuedComment);
    PersistedRequests.processNextRequest();
    await waitForBatchedUpdates();
}

describe('requests kept on a SAML sign-out', () => {
    it('sets aside the queued requests, including the one being sent, and keeps typed comments', async () => {
        // Given a receipt that is uploading and a comment still waiting in the queue
        await queueRequestsWithOneUploading();

        // When SAML signs the person out
        await redirectToSignIn(CONST.SIGN_OUT_REASON.SAML_REQUIRED, undefined, true);
        await waitForBatchedUpdates();

        // Then both requests are kept under their account in queue order, and the typed comment survives the clear
        expect(await getOnyxValue(ONYXKEYS.REQUESTS_KEPT_ON_SAML_SIGN_OUT)).toEqual({accountID: ACCOUNT_ID, requests: [uploadingReceipt, queuedComment]});
        expect(await getOnyxValue(DRAFT_KEY)).toBe('Lunch with the team');
    });

    it('keeps what another tab set aside when this tab has no session left', async () => {
        // Given another tab already set the requests aside and cleared the session
        const requestsKeptOnSAMLSignOut = {accountID: ACCOUNT_ID, requests: [uploadingReceipt, queuedComment]};
        await Onyx.set(ONYXKEYS.REQUESTS_KEPT_ON_SAML_SIGN_OUT, requestsKeptOnSAMLSignOut);
        await Onyx.set(ONYXKEYS.SESSION, null);
        await waitForBatchedUpdates();

        // When SAML signs this tab out too
        await redirectToSignIn(CONST.SIGN_OUT_REASON.SAML_REQUIRED, undefined, true);
        await waitForBatchedUpdates();

        // Then its clear doesn't delete what the first tab set aside
        expect(await getOnyxValue(ONYXKEYS.REQUESTS_KEPT_ON_SAML_SIGN_OUT)).toEqual(requestsKeptOnSAMLSignOut);
        expect(await getOnyxValue(DRAFT_KEY)).toBe('Lunch with the team');
    });

    it('leaves out a request holding a file so the rest are still kept', async () => {
        // Given a receipt that holds the file itself, as on web, and a comment waiting in the queue
        const receiptWithFile: AnyRequest = {command: 'RequestMoney', data: {transactionID: '3', receipt: new File(['receipt'], 'receipt.jpg')}, requestIndex: 3};
        PersistedRequests.save(receiptWithFile);
        PersistedRequests.save(queuedComment);
        await waitForBatchedUpdates();

        // When SAML signs the person out
        await redirectToSignIn(CONST.SIGN_OUT_REASON.SAML_REQUIRED, undefined, true);
        await waitForBatchedUpdates();

        // Then only the comment is kept, since a file can't be stored on web
        expect(await getOnyxValue(ONYXKEYS.REQUESTS_KEPT_ON_SAML_SIGN_OUT)).toEqual({accountID: ACCOUNT_ID, requests: [queuedComment]});
    });

    it('keeps nothing when the person signs out themselves', async () => {
        // Given queued requests and a typed comment
        await queueRequestsWithOneUploading();

        // When the person signs out themselves
        await redirectToSignIn(CONST.SIGN_OUT_REASON.USER_SIGN_OUT);
        await waitForBatchedUpdates();

        // Then nothing is kept, so the next person on this device never sees their work
        expect(await getOnyxValue(ONYXKEYS.REQUESTS_KEPT_ON_SAML_SIGN_OUT)).toBeUndefined();
        expect(await getOnyxValue(DRAFT_KEY)).toBeUndefined();
    });

    it('queues the kept requests again when the same account signs back in', async () => {
        // Given requests kept from a SAML sign-out
        const requestsKeptOnSAMLSignOut = {accountID: ACCOUNT_ID, requests: [uploadingReceipt, queuedComment]};

        // When the same account signs back in
        sendOrDeleteRequestsKeptOnSAMLSignOut(requestsKeptOnSAMLSignOut, ACCOUNT_ID);
        await waitForBatchedUpdates();

        // Then the requests are sent through the normal queue and the typed comment stays
        expect(PersistedRequests.getAll()).toEqual([uploadingReceipt, queuedComment]);
        expect(flush).toHaveBeenCalled();
        expect(await getOnyxValue(ONYXKEYS.REQUESTS_KEPT_ON_SAML_SIGN_OUT)).toBeUndefined();
        expect(await getOnyxValue(DRAFT_KEY)).toBe('Lunch with the team');
    });

    it('does not queue a kept request twice', async () => {
        // Given another tab already put the receipt back in the queue
        PersistedRequests.save(uploadingReceipt);
        await waitForBatchedUpdates();

        // When this tab handles the same kept requests
        sendOrDeleteRequestsKeptOnSAMLSignOut({accountID: ACCOUNT_ID, requests: [uploadingReceipt, queuedComment]}, ACCOUNT_ID);
        await waitForBatchedUpdates();

        // Then the receipt is queued once, so it can't be created twice
        expect(PersistedRequests.getAll()).toEqual([uploadingReceipt, queuedComment]);
    });

    it('deletes the kept requests and typed comments when a different account signs in', async () => {
        // Given requests kept from a SAML sign-out
        const requestsKeptOnSAMLSignOut = {accountID: ACCOUNT_ID, requests: [uploadingReceipt, queuedComment]};

        // When a different account signs in on the same device
        sendOrDeleteRequestsKeptOnSAMLSignOut(requestsKeptOnSAMLSignOut, OTHER_ACCOUNT_ID);
        await waitForBatchedUpdates();

        // Then nothing of the previous account is sent or shown
        expect(PersistedRequests.getAll()).toEqual([]);
        expect(flush).not.toHaveBeenCalled();
        expect(await getOnyxValue(ONYXKEYS.REQUESTS_KEPT_ON_SAML_SIGN_OUT)).toBeUndefined();
        expect(await getOnyxValue(DRAFT_KEY)).toBeUndefined();
    });
});
