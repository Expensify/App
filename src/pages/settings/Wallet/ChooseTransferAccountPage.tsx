import React, {useMemo} from 'react';
import {View} from 'react-native';
import FullscreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import Icon from '@components/Icon';
import getBankIcon from '@components/Icon/BankIcons';
import * as Expensicons from '@components/Icon/Expensicons';
import MenuItem from '@components/MenuItem';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import RadioListItem from '@components/SelectionList/ListItem/RadioListItem';
import type {ListItem} from '@components/SelectionList/types';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import {getLastFourDigits} from '@libs/BankAccountUtils';
import Navigation from '@libs/Navigation/Navigation';
import {openPersonalBankAccountSetupView} from '@userActions/BankAccounts';
import {saveWalletTransferAccountTypeAndID} from '@userActions/PaymentMethods';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {AccountData, BankAccount} from '@src/types/onyx';
import type {BankName} from '@src/types/onyx/Bank';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';

type BankAccountListItem = ListItem & {
    value?: number;
    bankAccount: BankAccount;
};

function ChooseTransferAccountPage() {
    const [walletTransfer, walletTransferResult] = useOnyx(ONYXKEYS.WALLET_TRANSFER, {canBeMissing: true});

    const styles = useThemeStyles();
    const {translate} = useLocalize();
    /**
     * Go back to transfer balance screen with the selected bank account set
     * @param event Click event object
     * @param accountType of the selected account type
     * @param account of the selected account data
     */
    const selectAccountAndNavigateBack = (accountType?: string, account?: AccountData) => {
        saveWalletTransferAccountTypeAndID(
            accountType ?? '',
            (accountType === CONST.PAYMENT_METHODS.PERSONAL_BANK_ACCOUNT ? account?.bankAccountID?.toString() : account?.fundID?.toString()) ?? '',
        );
        Navigation.goBack(ROUTES.SETTINGS_WALLET_TRANSFER_BALANCE);
    };

    const navigateToAddPaymentMethodPage = () => {
        if (walletTransfer?.filterPaymentMethodType === CONST.PAYMENT_METHODS.DEBIT_CARD) {
            Navigation.navigate(ROUTES.SETTINGS_ADD_DEBIT_CARD);
            return;
        }
        openPersonalBankAccountSetupView({});
    };

    const [bankAccountsList] = useOnyx(ONYXKEYS.BANK_ACCOUNT_LIST, {canBeMissing: true});
    const selectedAccountID = walletTransfer?.selectedAccountID;
    const bankAccountOptions = useMemo(() => {
        const options = Object.values(bankAccountsList ?? {}).map((bankAccount, index): BankAccountListItem => {
            const bankName = (bankAccount.accountData?.additionalData?.bankName ?? '') as BankName;
            const bankAccountNumber = bankAccount.accountData?.accountNumber ?? '';
            const bankAccountID = bankAccount.accountData?.bankAccountID ?? bankAccount.methodID;
            const {icon, iconSize, iconStyles} = getBankIcon({bankName, styles});
            return {
                value: bankAccountID,
                text: bankAccount.title,
                leftElement: icon ? (
                    <View style={[styles.flexRow, styles.alignItemsCenter, styles.mr3]}>
                        <Icon
                            src={icon}
                            width={iconSize}
                            height={iconSize}
                            additionalStyles={iconStyles}
                        />
                    </View>
                ) : null,
                alternateText: `${translate('workspace.expensifyCard.accountEndingIn')} ${getLastFourDigits(bankAccountNumber)}`,
                keyForList: `${bankAccountID}-${index}`,
                isSelected: bankAccountID?.toString() === selectedAccountID,
                bankAccount,
            };
        });
        return options;
    }, [bankAccountsList, selectedAccountID, styles, translate]);

    const initiallyFocusedItemKey = useMemo(() => {
        if (!selectedAccountID) {
            return undefined;
        }
        const selectedOption = bankAccountOptions.find((option) => option.value?.toString() === selectedAccountID.toString());
        return selectedOption?.keyForList;
    }, [bankAccountOptions, selectedAccountID]);

    if (isLoadingOnyxValue(walletTransferResult)) {
        return <FullscreenLoadingIndicator />;
    }

    return (
        <ScreenWrapper testID="ChooseTransferAccountPage">
            <HeaderWithBackButton
                title={translate('chooseTransferAccountPage.chooseAccount')}
                onBackButtonPress={() => Navigation.goBack(ROUTES.SETTINGS_WALLET_TRANSFER_BALANCE)}
            />

            <SelectionList
                data={bankAccountOptions}
                ListItem={RadioListItem}
                onSelectRow={(value) => {
                    const accountType = value?.bankAccount?.accountType;
                    const accountData = value?.bankAccount?.accountData;
                    selectAccountAndNavigateBack(accountType, accountData);
                }}
                shouldSingleExecuteRowSelect
                shouldUpdateFocusedIndex
                initiallyFocusedItemKey={initiallyFocusedItemKey}
                listFooterContent={
                    <MenuItem
                        onPress={navigateToAddPaymentMethodPage}
                        title={
                            walletTransfer?.filterPaymentMethodType === CONST.PAYMENT_METHODS.PERSONAL_BANK_ACCOUNT
                                ? translate('paymentMethodList.addNewBankAccount')
                                : translate('paymentMethodList.addNewDebitCard')
                        }
                        icon={Expensicons.Plus}
                    />
                }
            />
        </ScreenWrapper>
    );
}

export default ChooseTransferAccountPage;
