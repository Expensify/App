import {getCompanyCardBankConnection, getPersonalCardBankConnection} from '@libs/actions/getCompanyCardBankConnection';
import type * as ApiUtilsModule from '@libs/ApiUtils';
import {getApiRoot} from '@libs/ApiUtils';
import * as NetworkStore from '@libs/Network/NetworkStore';

import CONST from '@src/CONST';

jest.mock('@libs/ApiUtils', () => ({
    ...jest.requireActual<typeof ApiUtilsModule>('@libs/ApiUtils'),
    getApiRoot: jest.fn(() => 'https://www.expensify.com/'),
}));
jest.mock('@libs/Network/NetworkStore', () => ({getAuthToken: jest.fn(() => 'test-token')}));

describe('getCompanyCardBankConnection', () => {
    it('preserves the selected Amex feed suffix and its originating domain', () => {
        // Given a domain-level Amex feed displayed in a workspace
        const feed = 'oauth.americanexpressfdx.com 4001#4055089';

        // When its reconnect URL is generated
        const url = getCompanyCardBankConnection('ABC123', CONST.COMPANY_CARDS.BANKS.AMEX, feed);

        // Then the callback receives the exact feed key without the client-side domain suffix
        expect(url).not.toBeNull();
        const parsedURL = new URL(url ?? '');
        expect(parsedURL.searchParams.get('feed')).toBe('oauth.americanexpressfdx.com 4001');
        expect(parsedURL.searchParams.get('domainAccountID')).toBe('4055089');
        expect(parsedURL.searchParams.get('isCorporate')).toBe('true');
        expect(parsedURL.pathname).toBe('/partners/banks/americanexpressfdx/oauth_callback.php');
        expect(getApiRoot).toHaveBeenCalledWith({shouldSkipWebProxy: true}, true);
    });

    it('omits reconnect identifiers for a new company connection', () => {
        // Given an admin adding a new Amex connection without a selected feed
        jest.mocked(NetworkStore.getAuthToken).mockReturnValue('test-token');

        // When the add-connection URL is generated
        const url = getCompanyCardBankConnection('ABC123', CONST.COMPANY_CARDS.BANKS.AMEX);

        // Then the backend can derive a new feed key from the returned accounts
        const parsedURL = new URL(url ?? '');
        expect(parsedURL.searchParams.has('feed')).toBe(false);
        expect(parsedURL.searchParams.has('domainAccountID')).toBe(false);
    });

    it('does not attach company-feed identifiers to personal connections', () => {
        // Given a cardholder connecting their own Amex card
        const bankName = CONST.PERSONAL_CARDS.BANKS.AMEX;

        // When the personal connection URL is generated
        const url = getPersonalCardBankConnection(bankName);

        // Then no company-feed selection reaches the personal callback
        const parsedURL = new URL(url ?? '');
        expect(parsedURL.searchParams.has('feed')).toBe(false);
        expect(parsedURL.searchParams.has('domainAccountID')).toBe(false);
        expect(parsedURL.searchParams.has('isCorporate')).toBe(false);
    });
});
