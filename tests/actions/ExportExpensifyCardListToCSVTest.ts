import type {LocalizedTranslate} from '@components/LocaleContextProvider';

import {exportExpensifyCardListToCSV} from '@libs/actions/Card';
import localFileDownload from '@libs/localFileDownload';
import {translate as translatePhrase} from '@libs/Localize';

import CONST from '@src/CONST';
import IntlStore from '@src/languages/IntlStore';

import {createRandomExpensifyCard} from '../utils/collections/card';

jest.mock('@libs/localFileDownload', () => jest.fn());

const translate: LocalizedTranslate = (key, ...parameters) => translatePhrase(CONST.LOCALES.EN, key, ...parameters);

describe('exportExpensifyCardListToCSV', () => {
    beforeAll(() => IntlStore.load(CONST.LOCALES.EN));

    it('escapes cardholder names with the shared formula protection', () => {
        // Given a cardholder name that could otherwise become a spreadsheet formula
        const accountID = 1;
        const card = {...createRandomExpensifyCard(1, {accountID}), lastFourPAN: '1234'};

        // When the selected card is downloaded as CSV
        exportExpensifyCardListToCSV({
            policyID: 'policy123',
            cards: [card],
            personalDetailsList: {[accountID]: {accountID, login: 'alex@example.com', displayName: '=SUM(1,2)'}},
            settlementCurrency: CONST.CURRENCY.USD,
            defaultLimitType: CONST.EXPENSIFY_CARD.LIMIT_TYPES.MONTHLY,
            translate,
            formatPhoneNumber: (login) => login,
        });

        // Then the name stays in one text cell instead of executing as a formula
        expect(localFileDownload).toHaveBeenCalledWith('ExpensifyCards_policy123.csv', expect.stringContaining('\r\nalex@example.com,"\'=SUM(1,2)",1234,'), translate);
    });
});
