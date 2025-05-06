import {getApiRoot} from '@libs/ApiUtils';
import * as NetworkStore from '@libs/Network/NetworkStore';
import * as PolicyUtils from '@libs/PolicyUtils';
import CONST from '@src/CONST';

type CompanyCardBankConnection = {
    authToken: string;
    domainName: string;
    scrapeMinDate: string;
    isCorporate: string;
    isNewDot: string;
};

export default function getCompanyCardBankConnection(policyID?: string, bankName?: string) {
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
    const bank = CONST.COMPANY_CARDS.BANK_CONNECTIONS[bankConnection as keyof typeof CONST.COMPANY_CARDS.BANK_CONNECTIONS];

    // The Amex connection whitelists only our production servers, so we need to always use the production API for American Express
    const forceProductionAPI = bank === CONST.COMPANY_CARDS.BANK_CONNECTIONS.AMEX;
    const commandURL = getApiRoot(
        {
            shouldSkipWebProxy: true,
            command: '',
        },
        forceProductionAPI,
    );
    return `${commandURL}partners/banks/${bank}/oauth_callback.php?${new URLSearchParams(params).toString()}`;
}
