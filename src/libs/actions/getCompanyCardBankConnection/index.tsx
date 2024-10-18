import {getApiRoot} from '@libs/ApiUtils';
import * as NetworkStore from '@libs/Network/NetworkStore';
import CONST from '@src/CONST';

type CompanyCardBankConnection = {
    authToken: string;
    domainName: string;
    scrapeMinDate: string;
    isCorporate: string;
};

const bankUrl = 'https://secure.chase.com/web/auth/#/logon/logon/chaseOnline?redirect_url=';

export default function getCompanyCardBankConnection(bankName?: string, domainName?: string, scrapeMinDate?: string) {
    const bankConnection = Object.keys(CONST.COMPANY_CARDS.BANKS).find((key) => CONST.COMPANY_CARDS.BANKS[key as keyof typeof CONST.COMPANY_CARDS.BANKS] === bankName);

    // TODO remove this when BE will support bank UI callbacks
    if (!domainName) {
        return bankUrl;
    }

    if (!bankName || !bankConnection) {
        return null;
    }
    const authToken = NetworkStore.getAuthToken();
    const params: CompanyCardBankConnection = {authToken: authToken ?? '', domainName: domainName ?? '', isCorporate: 'true', scrapeMinDate: scrapeMinDate ?? ''};
    const commandURL = getApiRoot({
        shouldSkipWebProxy: true,
        command: '',
    });
    const bank = CONST.COMPANY_CARDS.BANK_CONNECTIONS[bankConnection as keyof typeof CONST.COMPANY_CARDS.BANK_CONNECTIONS];
    return `${commandURL}partners/banks/${bank}/oauth_callback.php?${new URLSearchParams(params).toString()}`;
}
