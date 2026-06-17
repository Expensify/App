import useOnyx from '@hooks/useOnyx';
import {getBankAccountSearchLabel} from '@libs/BankAccountUtils';
import type {SearchFilter} from '@libs/SearchUIUtils';
import ONYXKEYS from '@src/ONYXKEYS';

function useFilterBankAccountValue(value: SearchFilter['value']): string {
    const [bankAccountList] = useOnyx(ONYXKEYS.BANK_ACCOUNT_LIST);

    if (!Array.isArray(value)) {
        return '';
    }

    const bankAccountLabels = Object.values(bankAccountList ?? {})
        .filter((bankAccount) => value.includes(bankAccount?.accountData?.bankAccountID?.toString() ?? ''))
        .map((bankAccount) => getBankAccountSearchLabel(bankAccount));

    return bankAccountLabels.join(', ');
}

export default useFilterBankAccountValue;
