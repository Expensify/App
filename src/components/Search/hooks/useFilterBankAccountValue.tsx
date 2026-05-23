import useOnyx from '@hooks/useOnyx';
import {getBankAccountSearchLabel} from '@libs/BankAccountUtils';
import ONYXKEYS from '@src/ONYXKEYS';

function useFilterBankAccountValue(value: string[]): string {
    const [bankAccountList] = useOnyx(ONYXKEYS.BANK_ACCOUNT_LIST);

    const bankAccountLabels = Object.values(bankAccountList ?? {})
        .filter((bankAccount) => value.includes(bankAccount?.accountData?.bankAccountID?.toString() ?? ''))
        .map((bankAccount) => getBankAccountSearchLabel(bankAccount));

    return bankAccountLabels.join(', ');
}

export default useFilterBankAccountValue;
