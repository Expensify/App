import acceptEarlyRenewalOffer from '@libs/actions/EarlyRenewalOffer';
import {makeRequestWithSideEffects} from '@libs/API';
import {SIDE_EFFECT_REQUEST_COMMANDS} from '@libs/API/types';

jest.mock('@libs/API', () => ({
    makeRequestWithSideEffects: jest.fn(),
}));

describe('actions/EarlyRenewalOffer', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('accepts the non-incentivized offer', () => {
        // Given the non-incentivized offer is available to the billing owner
        // When they claim the offer
        acceptEarlyRenewalOffer('nonIncentivizedOneYear');

        // Then App sends only the offer ID required by Auth
        expect(makeRequestWithSideEffects).toHaveBeenCalledWith(SIDE_EFFECT_REQUEST_COMMANDS.ACCEPT_EARLY_RENEWAL_OFFER, {offerID: 'nonIncentivizedOneYear'});
    });
});
