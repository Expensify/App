import getAddressInputKeys from '@components/DynamicForm/utils/getAddressInputKeys';

import getRefreshAnswers from '@pages/settings/Wallet/InternationalDepositAccount/getRefreshAnswers';

const ADDRESS_KEYS = getAddressInputKeys('address');

describe('getRefreshAnswers', () => {
    it('replaces the old address with the picked one when an address search pick changes the country', () => {
        // Given the answers from before a US address was picked over a British one
        const currentAnswers = {accountHolderName: 'Todd Clyde', address: '1 High Street', [ADDRESS_KEYS.city]: 'London', [ADDRESS_KEYS.zipCode]: 'SW1W 9SR', [ADDRESS_KEYS.country]: 'GB'};

        // When the refresh for the new country is built with the parts the pick filled in
        const answers = getRefreshAnswers(currentAnswers, ADDRESS_KEYS.country, 'US', {
            address: '350 5th Avenue',
            [ADDRESS_KEYS.city]: 'New York',
            [ADDRESS_KEYS.state]: 'NY',
            [ADDRESS_KEYS.zipCode]: '10118',
        });

        // Then the request holds the US address only, since the draft has not been written yet
        expect(answers).toEqual({
            accountHolderName: 'Todd Clyde',
            address: '350 5th Avenue',
            [ADDRESS_KEYS.city]: 'New York',
            [ADDRESS_KEYS.state]: 'NY',
            [ADDRESS_KEYS.zipCode]: '10118',
            [ADDRESS_KEYS.country]: 'US',
        });
    });

    it('leaves out an answer the change cleared', () => {
        // Given the answers of an Ontario address
        const currentAnswers = {address: '1 Main Street', [ADDRESS_KEYS.city]: 'Toronto', [ADDRESS_KEYS.state]: 'ON', [ADDRESS_KEYS.country]: 'CA'};

        // When Japan is picked from the country list, which clears the state
        const answers = getRefreshAnswers(currentAnswers, ADDRESS_KEYS.country, 'JP', {[ADDRESS_KEYS.state]: ''});

        // Then the old province is not sent with the new country
        expect(answers).toEqual({address: '1 Main Street', [ADDRESS_KEYS.city]: 'Toronto', [ADDRESS_KEYS.country]: 'JP'});
    });

    it('sends only the changed answer when the change touches nothing else', () => {
        // Given the answers of a form
        const currentAnswers = {payoutType: 'iban', accountHolderName: 'Todd Clyde'};

        // When the payment method changes
        const answers = getRefreshAnswers(currentAnswers, 'payoutType', 'sort_code');

        // Then the other answers are kept as they are
        expect(answers).toEqual({payoutType: 'sort_code', accountHolderName: 'Todd Clyde'});
    });
});
