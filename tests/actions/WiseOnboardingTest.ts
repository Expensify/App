import * as PersistedRequests from '@libs/actions/PersistedRequests';
import saveWiseOnboardingPage, {clearWiseOnboardingSaving} from '@libs/actions/WiseOnboarding';
import * as API from '@libs/API';
import {SIDE_EFFECT_REQUEST_COMMANDS, WRITE_COMMANDS} from '@libs/API/types';
import {getMicroSecondOnyxErrorWithTranslationKey} from '@libs/ErrorUtils';
import {setHasRadio} from '@libs/NetworkState';

import ONYXKEYS from '@src/ONYXKEYS';
import type {DynamicFormPage} from '@src/types/onyx';

import type {OnyxKey} from 'react-native-onyx';

import Onyx from 'react-native-onyx';

import type {MockFetch} from '../utils/TestHelper';

import createMock from '../utils/createMock';
import * as TestHelper from '../utils/TestHelper';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

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

/** Whether any page save is still running, the way the page reads it */
function hasPendingSave(reimbursementAccount: unknown) {
    if (typeof reimbursementAccount !== 'object' || reimbursementAccount === null || !('wiseOnboardingPendingSaves' in reimbursementAccount)) {
        return false;
    }
    return Object.values(reimbursementAccount.wiseOnboardingPendingSaves ?? {}).some(Boolean);
}

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

// The tests spy on several API methods, which this rule counts as API calls
/* eslint-disable rulesdir/no-multiple-api-calls */
describe('actions/WiseOnboarding saveWiseOnboardingPage', () => {
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
        const writeSpy = jest.spyOn(API, 'write').mockImplementation(() => Promise.resolve());

        // When it is sent
        saveWiseOnboardingPage(1, BUSINESS_PAGE, {description: 'We sell bikes'}, {});

        // Then it goes through the queue, so it is sent once the device is back online
        expect(writeSpy).toHaveBeenCalledWith(WRITE_COMMANDS.UPDATE_WISE_ONBOARDING_ADDITIONAL_DATA, expect.objectContaining({step: 'business'}), expect.anything());
    });

    it('queues a page with a blank SSN and leaves the SSN out', () => {
        // Given a representative page whose SSN was left blank, which keeps the SSN the server holds
        const writeSpy = jest.spyOn(API, 'write').mockImplementation(() => Promise.resolve());
        const sideEffectSpy = jest.spyOn(API, 'makeRequestWithSideEffects');

        // When it is sent
        saveWiseOnboardingPage(1, REPRESENTATIVE_PAGE, {firstName: 'Alice'}, {ssn: ''});

        // Then it goes through the queue with no SSN in its inputs, since there is nothing sensitive to keep off disk
        expect(sideEffectSpy).not.toHaveBeenCalled();
        expect(writeSpy).toHaveBeenCalledWith(
            WRITE_COMMANDS.UPDATE_WISE_ONBOARDING_ADDITIONAL_DATA,
            expect.objectContaining({step: 'representative', inputs: JSON.stringify({firstName: 'Alice'})}),
            expect.anything(),
        );
    });

    it('sends nothing for a page whose key is not a step the server accepts', () => {
        // Given a page keyed by something other than a step, which the server would answer with 400 Invalid step
        const writeSpy = jest.spyOn(API, 'write');
        const sideEffectSpy = jest.spyOn(API, 'makeRequestWithSideEffects');
        const page: DynamicFormPage = {key: 'ownership', content: [{key: 'description', type: 'text', required: true}]};

        // When it is sent
        saveWiseOnboardingPage(1, page, {description: 'We sell bikes'}, {});

        // Then no request is made
        expect(writeSpy).not.toHaveBeenCalled();
        expect(sideEffectSpy).not.toHaveBeenCalled();
    });

    it('sends a page with an SSN outside the queue and shows an error when the request cannot be sent', async () => {
        // Given a page save carrying an SSN, whose request cannot be sent, as when the network drops
        const writeSpy = jest.spyOn(API, 'write');
        jest.spyOn(API, 'makeRequestWithSideEffects').mockImplementation((command, apiParams, onyxData) =>
            Onyx.update(onyxData?.optimisticData ?? []).then(() => Promise.reject(new Error('Network request failed'))),
        );

        // When it is sent
        saveWiseOnboardingPage(1, REPRESENTATIVE_PAGE, {firstName: 'Alice'}, {ssn: SSN});
        await waitForBatchedUpdates();

        // Then the SSN never enters the request queue, which is written to disk, and the user is told the save failed, with the page kept unsaved
        // so a later page's save does not let Confirm through
        expect(writeSpy).not.toHaveBeenCalled();
        const reimbursementAccount = await readOnyxValue(ONYXKEYS.REIMBURSEMENT_ACCOUNT);
        expect(reimbursementAccount).toMatchObject({wiseOnboardingUnsavedPages: {representative: true}});
        expect(hasPendingSave(reimbursementAccount)).toBe(false);
        expect(reimbursementAccount).toHaveProperty('errors');
    });

    it('keeps a page with an SSN unsaved when its save never answers and the next visit ends the save', async () => {
        // Given a page save carrying an SSN, whose answer never comes, as when the app closes during the request
        mockFetch.pause();
        const sideEffectSpy = jest.spyOn(API, 'makeRequestWithSideEffects');
        saveWiseOnboardingPage(1, REPRESENTATIVE_PAGE, {firstName: 'Alice'}, {ssn: SSN});
        await waitForBatchedUpdates();
        expect(sideEffectSpy).toHaveBeenCalledWith(
            SIDE_EFFECT_REQUEST_COMMANDS.UPDATE_WISE_ONBOARDING_ADDITIONAL_DATA,
            expect.objectContaining({step: 'representative', inputs: JSON.stringify({firstName: 'Alice', ssn: SSN})}),
            expect.anything(),
        );

        // When the next visit ends the save, since the request is not queued and never retried
        clearWiseOnboardingSaving();
        await waitForBatchedUpdates();

        // Then the save no longer runs, but the page is still unsaved, since nothing says Wise has it, so Confirm stays blocked until it saves
        const reimbursementAccount = await readOnyxValue(ONYXKEYS.REIMBURSEMENT_ACCOUNT);
        expect(reimbursementAccount).toMatchObject({wiseOnboardingUnsavedPages: {representative: true}});
        expect(hasPendingSave(reimbursementAccount)).toBe(false);
    });

    it('keeps the flow saving while a page with an SSN is still saving after another page saves', async () => {
        // Given a representative page with an SSN, which skips the queue and whose answer has not come, next to a business page the server answers
        global.fetch = jest.fn((url: RequestInfo | URL, options?: RequestInit) => {
            const inputs = options?.body instanceof FormData ? options.body.get('inputs') : null;
            if (typeof inputs === 'string' && inputs.includes(SSN)) {
                return new Promise<Response>(() => {});
            }
            return Promise.resolve(createMock<Response>({ok: true, json: () => Promise.resolve({jsonCode: 200})}));
        });

        // When both pages are saved and only the business page's save answers
        saveWiseOnboardingPage(1, REPRESENTATIVE_PAGE, {firstName: 'Alice'}, {ssn: SSN});
        saveWiseOnboardingPage(1, BUSINESS_PAGE, {description: 'We sell bikes'}, {});
        await waitForBatchedUpdates();

        // Then a save is still running, so the confirmation page waits for the representative page instead of letting the user through
        const reimbursementAccount = await readOnyxValue(ONYXKEYS.REIMBURSEMENT_ACCOUNT);
        expect(hasPendingSave(reimbursementAccount)).toBe(true);
        expect(reimbursementAccount).toMatchObject({wiseOnboardingUnsavedPages: {representative: true}});
        expect(reimbursementAccount).not.toHaveProperty('wiseOnboardingUnsavedPages.business');
    });

    it('keeps an unsaved page unsaved when another page saves', async () => {
        // Given a representative page whose save failed, so its error is shown
        await Onyx.set(ONYXKEYS.REIMBURSEMENT_ACCOUNT, {wiseOnboardingUnsavedPages: {representative: true}, errors: getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage')});

        // When the user edits the business page and it saves
        saveWiseOnboardingPage(1, BUSINESS_PAGE, {description: 'We sell bikes'}, {});
        await waitForBatchedUpdates();

        // Then the shared error is gone, but the representative page is still unsaved, since Wise still lacks it
        const reimbursementAccount = await readOnyxValue(ONYXKEYS.REIMBURSEMENT_ACCOUNT);
        expect(reimbursementAccount).toMatchObject({wiseOnboardingUnsavedPages: {representative: true}});
        expect(reimbursementAccount).not.toHaveProperty('wiseOnboardingUnsavedPages.business');
        expect(hasPendingSave(reimbursementAccount)).toBe(false);
    });

    it('keeps a page unsaved when the server rejects it and clears it once it saves', async () => {
        // Given the server rejects the business page
        mockFetch.fail();

        // When the page is saved
        saveWiseOnboardingPage(1, BUSINESS_PAGE, {description: 'We sell bikes'}, {});
        await waitForBatchedUpdates();

        // Then the page is unsaved
        expect(await readOnyxValue(ONYXKEYS.REIMBURSEMENT_ACCOUNT)).toMatchObject({wiseOnboardingUnsavedPages: {business: true}});

        // When the user saves the page again and the server accepts it
        mockFetch.succeed();
        saveWiseOnboardingPage(1, BUSINESS_PAGE, {description: 'We sell bikes'}, {});
        await waitForBatchedUpdates();

        // Then no page is unsaved, so Confirm is open again
        const reimbursementAccount = await readOnyxValue(ONYXKEYS.REIMBURSEMENT_ACCOUNT);
        expect(reimbursementAccount).not.toHaveProperty('wiseOnboardingUnsavedPages.business');
    });

    it('never writes a typed SSN to the request queue on disk', async () => {
        // Given the device is offline, so every queued request waits on disk, and a representative page with a typed SSN next to a business page
        setHasRadio(false);

        // When both pages are saved through the real request path
        saveWiseOnboardingPage(1, REPRESENTATIVE_PAGE, {firstName: 'Alice'}, {ssn: SSN});
        saveWiseOnboardingPage(1, BUSINESS_PAGE, {description: 'We sell bikes'}, {});
        await waitForBatchedUpdates();

        // Then the business page waits in the queue, which shows the queue is read, while the SSN is in neither the queue nor its copy in storage
        const persistedRequests = PersistedRequests.getAll();
        expect(persistedRequests).toEqual([expect.objectContaining({command: WRITE_COMMANDS.UPDATE_WISE_ONBOARDING_ADDITIONAL_DATA, data: expect.objectContaining({step: 'business'})})]);
        expect(JSON.stringify(persistedRequests)).not.toContain(SSN);
        expect(JSON.stringify(await readOnyxValue(ONYXKEYS.PERSISTED_REQUESTS))).not.toContain(SSN);
    });
});
