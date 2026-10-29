import updateWiseOnboardingAdditionalData from '@libs/actions/WiseOnboarding';
import {SIDE_EFFECT_REQUEST_COMMANDS, WRITE_COMMANDS} from '@libs/API/types';

import ONYXKEYS from '@src/ONYXKEYS';

import Onyx from 'react-native-onyx';

import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

const PARAMS = {bankAccountID: 1, step: 'representative', inputs: '{}'};

describe('actions/WiseOnboarding updateWiseOnboardingAdditionalData', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        await Onyx.clear();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('queues a page without an SSN', () => {
        // Given a page save with no SSN, which may wait in the request queue
        const writeSpy = jest.spyOn(require('@libs/API'), 'write').mockImplementation(() => Promise.resolve());

        // When it is sent
        updateWiseOnboardingAdditionalData(PARAMS);

        // Then it goes through the queue, so it is sent once the device is back online
        expect(writeSpy).toHaveBeenCalledWith(WRITE_COMMANDS.UPDATE_WISE_ONBOARDING_ADDITIONAL_DATA, PARAMS, expect.anything());
    });

    it('sends a page with an SSN outside the queue and shows an error when the request cannot be sent', async () => {
        // Given a page save carrying an SSN, whose request cannot be sent, as when the network drops
        const writeSpy = jest.spyOn(require('@libs/API'), 'write').mockImplementation(() => Promise.resolve());
        const sideEffectSpy = jest.spyOn(require('@libs/API'), 'makeRequestWithSideEffects').mockImplementation(() => Promise.reject(new Error('Network request failed')));

        // When it is sent
        updateWiseOnboardingAdditionalData({...PARAMS, ssn: '123456789'});
        await waitForBatchedUpdates();

        // Then the SSN never enters the request queue, which is written to disk, and the user is told the save failed
        expect(writeSpy).not.toHaveBeenCalled();
        expect(sideEffectSpy).toHaveBeenCalledWith(SIDE_EFFECT_REQUEST_COMMANDS.UPDATE_WISE_ONBOARDING_ADDITIONAL_DATA, expect.objectContaining({ssn: '123456789'}), expect.anything());
        const reimbursementAccount = await new Promise((resolve) => {
            const connection = Onyx.connectWithoutView({
                key: ONYXKEYS.REIMBURSEMENT_ACCOUNT,
                callback: (value) => {
                    Onyx.disconnect(connection);
                    resolve(value);
                },
            });
        });
        expect(reimbursementAccount).toMatchObject({isSavingWiseOnboardingPage: false});
        expect(reimbursementAccount).toHaveProperty('errors');
    });
});
