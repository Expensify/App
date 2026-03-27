import React from 'react';
import {View} from 'react-native';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import type {BankName} from '@src/types/onyx/Bank';
import Icon from './Icon';
import getBankIcon from './Icon/BankIcons';
import MenuItem from './MenuItem';
import SelectionList from './SelectionList';
import RadioListItem from './SelectionList/ListItem/RadioListItem';
import type {ListItem} from './SelectionList/types';

type BankAccountListItem = ListItem & {value: number | undefined};

type SettlementAccountSelectorProps = {
    /** Bank account list items to display */
    listOptions: BankAccountListItem[];

    /** Callback when an account is selected */
    onSelectAccount: (value: number) => void;

    /** Optional callback for "Add new bank account" - if provided, the option will be shown */
    onAddNewBankAccount?: () => void;

    /** Whether to show the "Add new bank account" option */
    showAddNewAccountOption?: boolean;

    /** Optional custom header content */
    customHeaderContent?: React.ReactElement;

    /** Initial key to focus */
    initiallyFocusedItemKey?: string;
};

function BankAccountListItemLeftElement({bankName}: {bankName: BankName}) {
    const styles = useThemeStyles();
    const {icon, iconSize, iconStyles} = getBankIcon({bankName, styles});

    return (
        <View style={[styles.flexRow, styles.alignItemsCenter, styles.mr3]}>
            <Icon
                src={icon}
                width={iconSize}
                height={iconSize}
                additionalStyles={iconStyles}
            />
        </View>
    );
}

/**
 * Abstract component for selecting a settlement bank account.
 * Used by both Expensify Card and Travel Invoicing settlement account pages.
 * Follows composition over configuration pattern - different pages compose this
 * with their specific callbacks and content.
 */
function SettlementAccountSelector({
    listOptions,
    onSelectAccount,
    onAddNewBankAccount,
    showAddNewAccountOption = false,
    customHeaderContent,
    initiallyFocusedItemKey,
}: SettlementAccountSelectorProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['Plus']);

    const handleSelectRow = ({value}: BankAccountListItem) => {
        onSelectAccount(value ?? 0);
    };

    // Render "Add new bank account" as list footer when enabled
    const listFooterContent =
        showAddNewAccountOption && onAddNewBankAccount ? (
            <MenuItem
                icon={icons.Plus}
                title={translate('workspace.expensifyCard.addNewBankAccount')}
                onPress={onAddNewBankAccount}
            />
        ) : undefined;

    // If no list options and we should show add new account, just show the menu item
    if (listOptions.length === 0 && showAddNewAccountOption && onAddNewBankAccount) {
        return (
            <View style={styles.flex1}>
                {customHeaderContent}
                <MenuItem
                    icon={icons.Plus}
                    title={translate('workspace.expensifyCard.addNewBankAccount')}
                    onPress={onAddNewBankAccount}
                />
            </View>
        );
    }

    return (
        <SelectionList
            addBottomSafeAreaPadding
            data={listOptions}
            ListItem={RadioListItem}
            onSelectRow={handleSelectRow}
            shouldSingleExecuteRowSelect
            initiallyFocusedItemKey={initiallyFocusedItemKey}
            customListHeaderContent={customHeaderContent}
            listFooterContent={listFooterContent}
        />
    );
}

export default SettlementAccountSelector;
export {BankAccountListItemLeftElement};
export type {BankAccountListItem, SettlementAccountSelectorProps};
