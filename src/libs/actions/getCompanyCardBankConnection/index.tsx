import {getApiRoot} from '@libs/ApiUtils';
import {splitCardFeedWithDomainID} from '@libs/CardUtils';
import * as NetworkStore from '@libs/Network/NetworkStore';
import {getObjectKeys, hasKey} from '@libs/ObjectUtils';
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
    const bankConnection = getObjectKeys(CONST.COMPANY_CARDS.BANKS).find((key) => CONST.COMPANY_CARDS.BANKS[key] === bankName);

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
    const selectedFeed = splitCardFeedWithDomainID(feed);
    const domainID = selectedFeed?.domainID;
    const queryParams: Record<string, string> = domainID ? {...params, domainAccountID: String(domainID)} : params;
    if (selectedFeed) {
        queryParams.feed = selectedFeed.feedName;
    }

    const bank = hasKey(CONST.COMPANY_CARDS.BANK_CONNECTIONS, bankConnection) ? CONST.COMPANY_CARDS.BANK_CONNECTIONS[bankConnection] : undefined;

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
    const bankConnection = getObjectKeys(CONST.PERSONAL_CARDS.BANKS).find((key) => CONST.PERSONAL_CARDS.BANKS[key] === bankName);

    if (!bankName || !bankConnection) {
        return null;
    }
    const authToken = NetworkStore.getAuthToken();
    const params: PersonalCardBankConnection = {
        authToken: authToken ?? '',
        isNewDot: 'true',
        scrapeMinDate: '',
    };
    const bank = hasKey(CONST.PERSONAL_CARDS.BANK_CONNECTIONS, bankConnection) ? CONST.PERSONAL_CARDS.BANK_CONNECTIONS[bankConnection] : undefined;

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
