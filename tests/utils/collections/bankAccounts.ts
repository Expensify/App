import type {BankAccountList} from '@src/types/onyx';

import {randNumber} from '@ngneat/falso';

export default function createRandomBankAccountList(count = 10): BankAccountList {
    const bankAccountList: BankAccountList = {};
    for (let index = 1; index <= count; index++) {
        bankAccountList[index] = {
            methodID: index,
            bankCurrency: 'USD',
            bankCountry: 'US',
            accountData: {
                bankAccountID: index,
                accountNumber: `${randNumber({min: 100000000, max: 999999999})}`,
            },
        };
    }
    return bankAccountList;
}
