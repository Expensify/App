import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import {getBankAccountSearchLabel} from '@libs/BankAccountUtils';
import type {SearchFilter} from '@libs/SearchUIUtils';
import ONYXKEYS from '@src/ONYXKEYS';

function useFilterBankAccountValue(value: SearchFilter['value']): string {
    const {translate} = useLocalize();
    const [bankAccountList] = useOnyx(ONYXKEYS.BANK_ACCOUNT_LIST);

    const ids = Array.isArray(value) ? value : [value];

    const bankAccountLabels = Object.values(bankAccountList ?? {})
        .filter((bankAccount) => ids.includes(bankAccount?.accountData?.bankAccountID?.toString() ?? ''))
        .map((bankAccount) => getBankAccountSearchLabel(bankAccount, translate('common.bank')));

    return bankAccountLabels.join(', ');
}

export default useFilterBankAccountValue;
