import {getApiRoot} from '@libs/ApiUtils';
import {splitCardFeedWithDomainID} from '@libs/CardUtils';
import * as NetworkStore from '@libs/Network/NetworkStore';
import * as PolicyUtils from '@libs/PolicyUtils';

import CONST from '@src/CONST';
import type {CompanyCardFeedWithDomainID} from '@src/types/onyx';

type CompanyCardBankConnection = {
    authToken: string;
    domainName: string;
    scrapeMinDate: string;
    isCorporate: string;
    isNewDot: string;
};

type PersonalCardBankConnection = {
    authToken: string;
    isNewDot: string;
    scrapeMinDate: string;
};

function getCompanyCardBankConnection(policyID?: string, bankName?: string | null, feed?: CompanyCardFeedWithDomainID) {
    const bankConnection = Object.keys(CONST.COMPANY_CARDS.BANKS).find((key) => CONST.COMPANY_CARDS.BANKS[key as keyof typeof CONST.COMPANY_CARDS.BANKS] === bankName);

    if (!bankName || !bankConnection || !policyID) {
        return null;
    }
    const authToken = NetworkStore.getAuthToken();
    const params: CompanyCardBankConnection = {
        authToken: authToken ?? '',
        isNewDot: 'true',
        domainName: PolicyUtils.getDomainNameForPolicy(policyID),
        isCorporate: 'true',
        scrapeMinDate: '',
    };

    // When repairing an existing feed (a feed is provided) pass the originating domain's account ID, which is
    // embedded in the CompanyCardFeedWithDomainID. This lets the server refresh credentials on the feed the cards
    // actually belong to (e.g. a Classic domain-level feed surfaced into a workspace via "preferred workspace")
    // instead of always targeting the synthetic workspace-policy domain.
    const domainID = feed ? splitCardFeedWithDomainID(feed)?.domainID : undefined;
    const queryParams: Record<string, string> = domainID ? {...params, domainAccountID: String(domainID)} : params;

    const bank = CONST.COMPANY_CARDS.BANK_CONNECTIONS[bankConnection as keyof typeof CONST.COMPANY_CARDS.BANK_CONNECTIONS];

    // The Amex connection whitelists only our production servers, so we need to always use the production API for American Express
    const forceProductionAPI = bank === CONST.COMPANY_CARDS.BANK_CONNECTIONS.AMEX;
    const commandURL = getApiRoot(
        {
            shouldSkipWebProxy: true,
        },
        forceProductionAPI,
    );
    return `${commandURL}partners/banks/${bank}/oauth_callback.php?${new URLSearchParams(queryParams).toString()}`;
}

function getPersonalCardBankConnection(bankName?: string | null) {
    const bankConnection = Object.keys(CONST.PERSONAL_CARDS.BANKS).find((key) => CONST.PERSONAL_CARDS.BANKS[key as keyof typeof CONST.PERSONAL_CARDS.BANKS] === bankName);

    if (!bankName || !bankConnection) {
        return null;
    }
    const authToken = NetworkStore.getAuthToken();
    const params: PersonalCardBankConnection = {
        authToken: authToken ?? '',
        isNewDot: 'true',
        scrapeMinDate: '',
    };
    const bank = CONST.PERSONAL_CARDS.BANK_CONNECTIONS[bankConnection as keyof typeof CONST.PERSONAL_CARDS.BANK_CONNECTIONS];

    // The Amex connection whitelists only our production servers, so we need to always use the production API for American Express
    const forceProductionAPI = bank === CONST.PERSONAL_CARDS.BANK_CONNECTIONS.AMEX;
    const commandURL = getApiRoot(
        {
            shouldSkipWebProxy: true,
            command: '',
        },
        forceProductionAPI,
    );
    return `${commandURL}partners/banks/${bank}/oauth_callback.php?${new URLSearchParams(params).toString()}`;
}

export {getCompanyCardBankConnection, getPersonalCardBankConnection};
