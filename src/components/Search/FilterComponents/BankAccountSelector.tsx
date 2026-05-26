import React from 'react';
import {View} from 'react-native';
import Icon from '@components/Icon';
import getBankIcon from '@components/Icon/BankIcons';
import type {SearchFilterSelectionListProps} from '@components/Search/types';
import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import {getBankAccountSearchLabel} from '@libs/BankAccountUtils';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import MultiSelect from './MultiSelect';

type BankAccountSelectorProps = SearchFilterSelectionListProps & {
    value: string[] | undefined;
    onChange: (bankAccounts: string[]) => void;
    searchPlaceholder?: string;
};

type BankAccountItem = {
    text: string;
    value: string;
    leftElement: React.JSX.Element;
};

function BankAccountSelector({value = [], onChange, footer, autoFocus, selectionListTextInputStyle, selectionListStyle, searchPlaceholder}: BankAccountSelectorProps) {
    const styles = useThemeStyles();
    const {isLargeScreenWidth} = useResponsiveLayout();
    const [bankAccountList] = useOnyx(ONYXKEYS.BANK_ACCOUNT_LIST);

    const bankAccountItems: BankAccountItem[] = [];
    for (const bankAccount of Object.values(bankAccountList ?? {})) {
        const bankAccountID = bankAccount?.accountData?.bankAccountID;
        if (!bankAccountID) {
            continue;
        }
        const bankName = bankAccount?.accountData?.additionalData?.bankName;
        const label = getBankAccountSearchLabel(bankAccount);
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

        bankAccountItems.push({
            text: label,
            value: bankAccountID.toString(),
            leftElement,
        });
    }

    const selectedBankAccounts = bankAccountItems.filter((item) => value.includes(item.value));

    return (
        <MultiSelect
            value={selectedBankAccounts}
            items={bankAccountItems}
            isSearchable={bankAccountItems.length >= CONST.STANDARD_LIST_ITEM_LIMIT}
            onChange={(bankAccounts) => onChange(bankAccounts.map((item) => item.value))}
            footer={footer}
            autoFocus={autoFocus}
            selectionListTextInputStyle={selectionListTextInputStyle}
            selectionListStyle={selectionListStyle}
            searchPlaceholder={searchPlaceholder}
        />
    );
}

export default BankAccountSelector;
