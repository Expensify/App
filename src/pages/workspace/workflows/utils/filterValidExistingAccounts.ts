import CONST from '@src/CONST';
import type {BankAccountList} from '@src/types/onyx';

function filterValidExistingAccounts(bankAccountList: BankAccountList | undefined, policyCurrency: string | undefined) {
    if (!bankAccountList || policyCurrency === undefined) {
        return [];
    }

    return Object.values(bankAccountList).filter((account) => {
        return account.bankCurrency === policyCurrency && account.accountData?.state === CONST.BANK_ACCOUNT.STATE.OPEN && account.accountData?.allowDebit === true;
    });
}

export default filterValidExistingAccounts;
