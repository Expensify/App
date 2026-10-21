import {getCompanyCardBankConnection, getPersonalCardBankConnection} from '@libs/actions/getCompanyCardBankConnection';
import type * as ApiUtilsModule from '@libs/ApiUtils';
import {getApiRoot} from '@libs/ApiUtils';
import {getCardFeedWithDomainID} from '@libs/CardUtils';
import * as NetworkStore from '@libs/Network/NetworkStore';
import {getObjectKeys, hasKey} from '@libs/ObjectUtils';

import CONST from '@src/CONST';

jest.mock('@libs/ApiUtils', () => ({
    ...jest.requireActual<typeof ApiUtilsModule>('@libs/ApiUtils'),
    getApiRoot: jest.fn(() => 'https://www.expensify.com/'),
}));
jest.mock('@libs/Network/NetworkStore', () => ({getAuthToken: jest.fn(() => 'test-token')}));

describe('getCompanyCardBankConnection', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.mocked(NetworkStore.getAuthToken).mockReturnValue('test-token');
    });
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

describe('bank callback contracts', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.mocked(NetworkStore.getAuthToken).mockReturnValue('test-token');
    });

    it.each(getObjectKeys(CONST.COMPANY_CARDS.BANKS))('keeps the company callback mapping for %s', (key) => {
        // Given the closed display-bank table used by workspace card setup
        const bankName = CONST.COMPANY_CARDS.BANKS[key];
        const bank = hasKey(CONST.COMPANY_CARDS.BANK_CONNECTIONS, key) ? CONST.COMPANY_CARDS.BANK_CONNECTIONS[key] : undefined;

        // When a recognized bank starts a company connection
        const url = getCompanyCardBankConnection('ABC123', bankName);

        // Then even recognized unmapped banks retain their historical callback and company fields
        expect(url).not.toBeNull();
        const parsed = new URL(url ?? '');
        expect(parsed.pathname).toBe(`/partners/banks/${bank}/oauth_callback.php`);
        expect(Object.fromEntries(parsed.searchParams)).toEqual({
            authToken: 'test-token',
            isNewDot: 'true',
            domainName: `${CONST.EXPENSIFY_POLICY_DOMAIN}abc123${CONST.EXPENSIFY_POLICY_DOMAIN_EXTENSION}`,
            isCorporate: 'true',
            scrapeMinDate: '',
        });
        expect(getApiRoot).toHaveBeenCalledWith({shouldSkipWebProxy: true}, key === 'AMEX');
    });

    it.each(getObjectKeys(CONST.PERSONAL_CARDS.BANKS))('keeps the personal callback mapping for %s', (key) => {
        // Given the display-bank table used by personal card setup
        const bankName = CONST.PERSONAL_CARDS.BANKS[key];
        const bank = hasKey(CONST.PERSONAL_CARDS.BANK_CONNECTIONS, key) ? CONST.PERSONAL_CARDS.BANK_CONNECTIONS[key] : undefined;

        // When the cardholder starts a personal connection
        const url = getPersonalCardBankConnection(bankName);

        // Then the personal query stays distinct from the workspace query, including unmapped OTHER
        expect(url).not.toBeNull();
        const parsed = new URL(url ?? '');
        expect(parsed.pathname).toBe(`/partners/banks/${bank}/oauth_callback.php`);
        expect(Object.fromEntries(parsed.searchParams)).toEqual({authToken: 'test-token', isNewDot: 'true', scrapeMinDate: ''});
        expect(getApiRoot).toHaveBeenCalledWith({shouldSkipWebProxy: true, command: ''}, key === 'AMEX');
    });

    it.each([undefined, null, '', 'unrecognized bank'])('rejects absent or unknown bank %s', (bankName) => {
        // Given a missing display selection or a name outside both tables
        // When either real connection builder receives it
        const company = getCompanyCardBankConnection('ABC123', bankName);
        const personal = getPersonalCardBankConnection(bankName);

        // Then no callback URL or API-root lookup is produced
        expect(company).toBeNull();
        expect(personal).toBeNull();
        expect(getApiRoot).not.toHaveBeenCalled();
    });

    it('rejects a missing policy and keeps the empty authentication fallback', () => {
        // Given no auth token, as can occur before the network store is initialized
        jest.mocked(NetworkStore.getAuthToken).mockReturnValue(undefined);

        // When a company selection lacks a policy or valid selections have no auth token
        expect(getCompanyCardBankConnection(undefined, CONST.COMPANY_CARDS.BANKS.AMEX)).toBeNull();
        const company = getCompanyCardBankConnection('ABC123', CONST.COMPANY_CARDS.BANKS.AMEX);
        const personal = getPersonalCardBankConnection(CONST.PERSONAL_CARDS.BANKS.AMEX);

        // Then both valid callbacks explicitly send the empty token
        expect(company).not.toBeNull();
        expect(personal).not.toBeNull();
        expect(new URL(company ?? '').searchParams.get('authToken')).toBe('');
        expect(new URL(personal ?? '').searchParams.get('authToken')).toBe('');
    });

    it.each([4055089, 0, 'invalid', '4055089#extra'])('uses the encoded originating domain %s', (domainID) => {
        // Given a feed encoded by the real producer, including rejected domain encodings
        const feed = getCardFeedWithDomainID('oauth.americanexpressfdx.com 4001', domainID);

        // When reconnecting a feed displayed in a different workspace
        const url = getCompanyCardBankConnection('ABC123', CONST.COMPANY_CARDS.BANKS.AMEX, feed);

        // Then the suffix survives, numeric zero stays falsy, and rejected feeds add neither identifier
        expect(url).not.toBeNull();
        const parsed = new URL(url ?? '');
        expect(parsed.searchParams.get('domainName')).toBe(`${CONST.EXPENSIFY_POLICY_DOMAIN}abc123${CONST.EXPENSIFY_POLICY_DOMAIN_EXTENSION}`);
        expect(parsed.searchParams.get('feed')).toBe(typeof domainID === 'number' ? 'oauth.americanexpressfdx.com 4001' : null);
        expect(parsed.searchParams.get('domainAccountID')).toBe(domainID === 4055089 ? '4055089' : null);
    });
});
