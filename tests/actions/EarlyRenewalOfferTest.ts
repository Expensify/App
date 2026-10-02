import {acceptEarlyRenewalOffer, clearEarlyRenewalOfferErrors, draftEarlyRenewalMessage} from '@libs/actions/EarlyRenewalOffer';
import {saveReportDraftComment} from '@libs/actions/Report';
import {write} from '@libs/API';
import {WRITE_COMMANDS} from '@libs/API/types';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import Onyx from 'react-native-onyx';

import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

jest.mock('@libs/API', () => ({
    write: jest.fn(),
}));

jest.mock('@libs/actions/Report', () => ({
    saveReportDraftComment: jest.fn((_reportID: string, _message: string, callback: () => void) => callback()),
}));

describe('actions/EarlyRenewalOffer', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(() => {
        jest.clearAllMocks();
        return Onyx.clear();
    });

    it('accepts the non-incentivized offer as a queued write', () => {
        // Given the non-incentivized offer is available to the billing owner
        // When they claim the offer
        acceptEarlyRenewalOffer(CONST.SUBSCRIPTION.EARLY_RENEWAL.OFFER_ID.NON_INCENTIVIZED_ONE_YEAR);

        // Then App sends only the offer ID Auth needs, marks the offer pending, and records a generic error if Auth rejects it
        expect(write).toHaveBeenCalledWith(
            WRITE_COMMANDS.ACCEPT_EARLY_RENEWAL_OFFER,
            {offerID: CONST.SUBSCRIPTION.EARLY_RENEWAL.OFFER_ID.NON_INCENTIVIZED_ONE_YEAR},
            expect.objectContaining({
                optimisticData: [expect.objectContaining({key: ONYXKEYS.EARLY_RENEWAL_OFFER_ELIGIBILITY, value: {pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE, errors: null}})],
                failureData: [expect.objectContaining({key: ONYXKEYS.EARLY_RENEWAL_OFFER_ELIGIBILITY, value: expect.objectContaining({pendingAction: null})})],
            }),
        );
    });

    it('dismisses a failed renewal error without touching eligibility', async () => {
        // Given a renewal attempt failed and left an error on the offer
        await Onyx.set(ONYXKEYS.EARLY_RENEWAL_OFFER_ELIGIBILITY, {canClaim: true, errors: {renewFailed: 'Something went wrong'}});

        // When the billing owner dismisses the error
        clearEarlyRenewalOfferErrors();
        await waitForBatchedUpdates();

        // Then the error is gone and the offer is still claimable
        let eligibility: unknown;
        const connection = Onyx.connectWithoutView({key: ONYXKEYS.EARLY_RENEWAL_OFFER_ELIGIBILITY, callback: (value) => (eligibility = value)});
        await waitForBatchedUpdates();
        Onyx.disconnect(connection);
        expect(eligibility).toEqual({canClaim: true});
    });

    it('saves an editable draft and opens the admins room without sending a message', () => {
        // Given the selected workspace has an admins room
        const openAdminsRoom = jest.fn();
        const message = 'Hey @owner@example.com! Could you review the renewal offer?';

        // When the admin clicks Nudge
        draftEarlyRenewalMessage('123', message, openAdminsRoom);

        // Then only a local draft is saved before navigation, with no API request
        expect(saveReportDraftComment).toHaveBeenCalledWith('123', message, openAdminsRoom);
        expect(openAdminsRoom).toHaveBeenCalledTimes(1);
        expect(write).not.toHaveBeenCalled();
    });
});
