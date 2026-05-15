import useOnyx from '@hooks/useOnyx';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

function useFilterBankAccountValue(value: string[]): string {
    const [bankAccountList] = useOnyx(ONYXKEYS.BANK_ACCOUNT_LIST);

    const bankAccountLabels = Object.values(bankAccountList ?? {})
        .filter((bankAccount) => value.includes(bankAccount?.accountData?.bankAccountID?.toString() ?? ''))
        .map((bankAccount) => {
            const bankName = bankAccount?.accountData?.additionalData?.bankName;
            const accountNumber = bankAccount?.accountData?.accountNumber ?? '';
            const formattedBankName = (bankName && CONST.BANK_NAMES_USER_FRIENDLY[bankName]) || CONST.BANK_NAMES_USER_FRIENDLY[CONST.BANK_NAMES.GENERIC_BANK];
            const maskedNumber = accountNumber ? `xx${accountNumber.slice(-4)}` : '';
            return maskedNumber ? `${formattedBankName} ${maskedNumber}` : formattedBankName;
        });

    return bankAccountLabels.join(', ');
}

export default useFilterBankAccountValue;
