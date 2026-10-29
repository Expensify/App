import * as PersistedRequests from '@libs/actions/PersistedRequests';
import updateWiseOnboardingAdditionalData from '@libs/actions/WiseOnboarding';
import {SIDE_EFFECT_REQUEST_COMMANDS, WRITE_COMMANDS} from '@libs/API/types';
import {getMicroSecondOnyxErrorWithTranslationKey} from '@libs/ErrorUtils';
import {setHasRadio} from '@libs/NetworkState';

import getWiseOnboardingPageParams from '@pages/settings/Wallet/EnableGlobalReimbursements/Wise/getWiseOnboardingPageParams';

import ONYXKEYS from '@src/ONYXKEYS';
import type {DynamicFormPage} from '@src/types/onyx';

import type {OnyxKey} from 'react-native-onyx';

import Onyx from 'react-native-onyx';

import type {MockFetch} from '../utils/TestHelper';

import * as TestHelper from '../utils/TestHelper';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

const PARAMS = {bankAccountID: 1, step: 'representative', inputs: '{}'};
const SSN = '123456789';

const REPRESENTATIVE_PAGE: DynamicFormPage = {
    key: 'representative',
    content: [
        {key: 'firstName', type: 'text', required: true},
        {key: 'ssn', type: 'text', required: true, sensitive: true},
    ],
};

const BUSINESS_PAGE: DynamicFormPage = {
    key: 'business',
    content: [{key: 'description', type: 'text', required: true}],
};

function readOnyxValue(key: OnyxKey) {
    return new Promise<unknown>((resolve) => {
        const connection = Onyx.connectWithoutView({
            key,
            callback: (value) => {
                Onyx.disconnect(connection);
                resolve(value);
            },
        });
    });
}

describe('actions/WiseOnboarding updateWiseOnboardingAdditionalData', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    let mockFetch: MockFetch;
    beforeEach(async () => {
        mockFetch = TestHelper.getGlobalFetchMock();
        global.fetch = mockFetch;
        setHasRadio(true);
        PersistedRequests.clear();
        await Onyx.clear();
        await waitForBatchedUpdates();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('queues a page without an SSN', () => {
        // Given a page save with no SSN, which may wait in the request queue
        const writeSpy = jest.spyOn(require('@libs/API'), 'write').mockImplementation(() => Promise.resolve());

        // When it is sent
        updateWiseOnboardingAdditionalData(PARAMS, false);

        // Then it goes through the queue, so it is sent once the device is back online
        expect(writeSpy).toHaveBeenCalledWith(WRITE_COMMANDS.UPDATE_WISE_ONBOARDING_ADDITIONAL_DATA, PARAMS, expect.anything());
    });

    it('sends a page with an SSN outside the queue and shows an error when the request cannot be sent', async () => {
        // Given a page save carrying an SSN, whose request cannot be sent, as when the network drops
        const writeSpy = jest.spyOn(require('@libs/API'), 'write').mockImplementation(() => Promise.resolve());
        const sideEffectSpy = jest.spyOn(require('@libs/API'), 'makeRequestWithSideEffects').mockImplementation(() => Promise.reject(new Error('Network request failed')));

        // When it is sent
        const params = {...PARAMS, inputs: JSON.stringify({ssn: SSN})};
        updateWiseOnboardingAdditionalData(params, true);
        await waitForBatchedUpdates();

        // Then the SSN never enters the request queue, which is written to disk, and the user is told the save failed, with the page kept as failed
        // so a later page's save does not let Confirm through
        expect(writeSpy).not.toHaveBeenCalled();
        expect(sideEffectSpy).toHaveBeenCalledWith(SIDE_EFFECT_REQUEST_COMMANDS.UPDATE_WISE_ONBOARDING_ADDITIONAL_DATA, params, expect.anything());
        const reimbursementAccount = await readOnyxValue(ONYXKEYS.REIMBURSEMENT_ACCOUNT);
        expect(reimbursementAccount).toMatchObject({isSavingWiseOnboardingPage: false, wiseOnboardingFailedPages: {representative: true}});
        expect(reimbursementAccount).toHaveProperty('errors');
    });

    it('keeps a failed page failed when another page saves', async () => {
        // Given a representative page whose save failed, so its error is shown
        await Onyx.set(ONYXKEYS.REIMBURSEMENT_ACCOUNT, {wiseOnboardingFailedPages: {representative: true}, errors: getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage')});

        // When the user edits the business page and it saves
        const {params, hasSensitiveAnswers} = getWiseOnboardingPageParams(1, BUSINESS_PAGE, {description: 'We sell bikes'}, {});
        updateWiseOnboardingAdditionalData(params, hasSensitiveAnswers);
        await waitForBatchedUpdates();

        // Then the shared error is gone, but the representative page is still failed, since Wise still lacks it
        expect(await readOnyxValue(ONYXKEYS.REIMBURSEMENT_ACCOUNT)).toMatchObject({
            isSavingWiseOnboardingPage: false,
            wiseOnboardingFailedPages: {representative: true},
        });
    });

    it('marks a page failed when the server rejects it and clears it once it saves', async () => {
        // Given the server rejects the business page
        mockFetch.fail();
        const {params, hasSensitiveAnswers} = getWiseOnboardingPageParams(1, BUSINESS_PAGE, {description: 'We sell bikes'}, {});

        // When the page is saved
        updateWiseOnboardingAdditionalData(params, hasSensitiveAnswers);
        await waitForBatchedUpdates();

        // Then the page is failed
        expect(await readOnyxValue(ONYXKEYS.REIMBURSEMENT_ACCOUNT)).toMatchObject({wiseOnboardingFailedPages: {business: true}});

        // When the user saves the page again and the server accepts it
        mockFetch.succeed();
        updateWiseOnboardingAdditionalData(params, hasSensitiveAnswers);
        await waitForBatchedUpdates();

        // Then no page is failed, so Confirm is open again
        const reimbursementAccount = await readOnyxValue(ONYXKEYS.REIMBURSEMENT_ACCOUNT);
        expect(reimbursementAccount).not.toHaveProperty('wiseOnboardingFailedPages.business');
    });

    it('never writes a typed SSN to the request queue on disk', async () => {
        // Given the device is offline, so every queued request waits on disk, and a representative page with a typed SSN next to a business page
        setHasRadio(false);
        const representative = getWiseOnboardingPageParams(1, REPRESENTATIVE_PAGE, {firstName: 'Alice'}, {ssn: SSN});
        const business = getWiseOnboardingPageParams(1, BUSINESS_PAGE, {description: 'We sell bikes'}, {});

        // When both pages are saved through the real request path
        updateWiseOnboardingAdditionalData(representative.params, representative.hasSensitiveAnswers);
        updateWiseOnboardingAdditionalData(business.params, business.hasSensitiveAnswers);
        await waitForBatchedUpdates();

        // Then the business page waits in the queue, which shows the queue is read, while the SSN is in neither the queue nor its copy in storage
        const persistedRequests = PersistedRequests.getAll();
        expect(persistedRequests).toEqual([expect.objectContaining({command: WRITE_COMMANDS.UPDATE_WISE_ONBOARDING_ADDITIONAL_DATA, data: expect.objectContaining({step: 'business'})})]);
        expect(JSON.stringify(persistedRequests)).not.toContain(SSN);
        expect(JSON.stringify(await readOnyxValue(ONYXKEYS.PERSISTED_REQUESTS))).not.toContain(SSN);
    });
});
