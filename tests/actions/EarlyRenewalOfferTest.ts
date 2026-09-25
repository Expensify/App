import {acceptEarlyRenewalOffer, draftEarlyRenewalMessage} from '@libs/actions/EarlyRenewalOffer';
import {saveReportDraftComment} from '@libs/actions/Report';
import {makeRequestWithSideEffects} from '@libs/API';
import {SIDE_EFFECT_REQUEST_COMMANDS} from '@libs/API/types';

jest.mock('@libs/API', () => ({
    makeRequestWithSideEffects: jest.fn(),
}));

jest.mock('@libs/actions/Report', () => ({
    saveReportDraftComment: jest.fn((_reportID: string, _message: string, callback: () => void) => callback()),
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

    it('saves an editable draft and opens the admins room without sending a message', () => {
        // Given the selected workspace has an admins room
        const openAdminsRoom = jest.fn();
        const message = 'Hey @owner@example.com! Could you review the renewal offer?';

        // When the admin clicks Nudge
        draftEarlyRenewalMessage('123', message, openAdminsRoom);

        // Then only a local draft is saved before navigation, with no API request
        expect(saveReportDraftComment).toHaveBeenCalledWith('123', message, openAdminsRoom);
        expect(openAdminsRoom).toHaveBeenCalledTimes(1);
        expect(makeRequestWithSideEffects).not.toHaveBeenCalled();
    });
});
