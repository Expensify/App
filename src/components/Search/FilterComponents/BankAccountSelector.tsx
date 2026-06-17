import React from 'react';
import {View} from 'react-native';
import Icon from '@components/Icon';
import getBankIcon from '@components/Icon/BankIcons';
import type {SearchFilterCommonProps} from '@components/Search/types';
import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import {getBankAccountSearchLabel} from '@libs/BankAccountUtils';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import MultiSelect from './MultiSelect';

type BankAccountSelectorProps = SearchFilterCommonProps<string[] | undefined>;

type BankAccountItem = {
    /** Display label, e.g. `Chase xx1234`. */
    text: string;
    /** Bank account id stringified, used as the filter value. */
    value: string;
    /** Bank icon wrapper rendered to the left of the row. */
    leftElement: React.JSX.Element;
};

function BankAccountSelector({value = [], selectionListTextInputStyle, selectionListStyle, autoFocus, footer, onChange}: BankAccountSelectorProps) {
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
    // Pin selected items to the top so the picker matches the Card filter behavior.
    const sortedBankAccountItems = [...selectedBankAccounts, ...bankAccountItems.filter((item) => !value.includes(item.value))];

    return (
        <MultiSelect
            value={selectedBankAccounts}
            items={sortedBankAccountItems}
            isSearchable={sortedBankAccountItems.length >= CONST.STANDARD_LIST_ITEM_LIMIT}
            selectionListTextInputStyle={selectionListTextInputStyle}
            selectionListStyle={selectionListStyle}
            autoFocus={autoFocus}
            footer={footer}
            onChange={(bankAccounts) => onChange(bankAccounts.map((item) => item.value))}
        />
    );
}

export default BankAccountSelector;
