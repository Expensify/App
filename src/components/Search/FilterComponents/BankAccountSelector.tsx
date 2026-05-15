import React from 'react';
import {View} from 'react-native';
import Icon from '@components/Icon';
import getBankIcon from '@components/Icon/BankIcons';
import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {BankName} from '@src/types/onyx/Bank';
import MultiSelect from './MultiSelect';

type BankAccountSelectorProps = {
    value: string[] | undefined;
    onChange: (bankAccounts: string[]) => void;
};

function BankAccountSelector({value = [], onChange}: BankAccountSelectorProps) {
    const styles = useThemeStyles();
    const {isLargeScreenWidth} = useResponsiveLayout();
    const [bankAccountList] = useOnyx(ONYXKEYS.BANK_ACCOUNT_LIST);

    const bankAccountItems = Object.values(bankAccountList ?? {})
        .map((bankAccount) => {
            const bankAccountID = bankAccount?.accountData?.bankAccountID;
            if (!bankAccountID) {
                return null;
            }
            const bankName = (bankAccount?.accountData?.additionalData?.bankName ?? '') as BankName;
            const accountNumber = bankAccount?.accountData?.accountNumber ?? '';
            const formattedBankName = CONST.BANK_NAMES_USER_FRIENDLY[bankName] ?? CONST.BANK_NAMES_USER_FRIENDLY[CONST.BANK_NAMES.GENERIC_BANK];
            const maskedNumber = accountNumber ? `xx${accountNumber.slice(-4)}` : '';
            const label = maskedNumber ? `${formattedBankName} ${maskedNumber}` : formattedBankName;

            const {icon, iconSize, iconStyles} = getBankIcon({bankName, styles, maxIconSize: isLargeScreenWidth ? variables.w28 : undefined});
            const leftElement = (
                <View style={[styles.mr3, styles.alignItemsCenter, styles.justifyContentCenter]}>
                    <Icon
                        src={icon}
                        width={iconSize}
                        height={iconSize}
                        additionalStyles={iconStyles}
                    />
                </View>
            );

            return {
                text: label,
                value: bankAccountID.toString(),
                leftElement,
            };
        })
        .filter((item): item is {text: string; value: string; leftElement: React.ReactNode} => item !== null);

    const selectedBankAccounts = bankAccountItems.filter((item) => value.includes(item.value));

    return (
        <MultiSelect
            value={selectedBankAccounts}
            items={bankAccountItems}
            isSearchable={bankAccountItems.length >= CONST.STANDARD_LIST_ITEM_LIMIT}
            onChange={(bankAccounts) => onChange(bankAccounts.map((item) => item.value))}
        />
    );
}

export default BankAccountSelector;
