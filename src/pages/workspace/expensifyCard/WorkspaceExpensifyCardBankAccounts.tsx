import React from 'react';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import * as Expensicons from '@components/Icon/Expensicons';
import MenuItem from '@components/MenuItem';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@navigation/Navigation';

function WorkspaceExpensifyCardBankAccounts() {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    return (
        <ScreenWrapper
            testID={WorkspaceExpensifyCardBankAccounts.displayName}
            includeSafeAreaPaddingBottom={false}
            shouldEnablePickerAvoiding={false}
        >
            <HeaderWithBackButton
                shouldShowBackButton
                onBackButtonPress={() => Navigation.goBack()}
                title={translate('cardPage.chooseBankAccount')}
            />
            <Text style={[styles.mh5, styles.mb3]}>{`${translate('cardPage.chooseExistingBank')}:`}</Text>
            <MenuItemWithTopDescription
                title="Bank of America"
                description="•••• 1234"
                onPress={() => {}}
                icon={Expensicons.Bank}
            />
            <MenuItemWithTopDescription
                title="Bank of America"
                description="•••• 1234"
                onPress={() => {}}
                icon={Expensicons.Bank}
            />
            <MenuItem
                icon={Expensicons.Plus}
                title={translate('cardPage.addNewBankAccount')}
                onPress={() => {}}
            />
        </ScreenWrapper>
    );
}

WorkspaceExpensifyCardBankAccounts.displayName = 'WorkspaceExpensifyCardBankAccounts';

export default WorkspaceExpensifyCardBankAccounts;
