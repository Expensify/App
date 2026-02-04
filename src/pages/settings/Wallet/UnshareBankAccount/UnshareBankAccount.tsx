import React, {useEffect, useState} from 'react';
import {View} from 'react-native';
import Button from '@components/Button';
import ConfirmModal from '@components/ConfirmModal';
import ErrorMessageRow from '@components/ErrorMessageRow';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import RenderHTML from '@components/RenderHTML';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import UserListItem from '@components/SelectionList/ListItem/UserListItem';
import type {ListItem} from '@components/SelectionList/types';
import Text from '@components/Text';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useDebouncedState from '@hooks/useDebouncedState';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import {formatMemberForList, getHeaderMessage, getSearchValueForPhoneOrEmail} from '@libs/OptionsListUtils';
import {getPersonalDetailByEmail} from '@libs/PersonalDetailsUtils';
import tokenizedSearch from '@libs/tokenizedSearch';
import Navigation from '@navigation/Navigation';
import type {PlatformStackScreenProps} from '@navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@navigation/types';
import {clearUnshareBankAccountErrors, unshareBankAccount} from '@userActions/BankAccounts';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

type ShareBankAccountProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.SETTINGS.WALLET.UNSHARE_BANK_ACCOUNT>;

function UnshareBankAccount({route}: ShareBankAccountProps) {
    const bankAccountID = route.params?.bankAccountID;
    const styles = useThemeStyles();
    const [bankAccountList] = useOnyx(ONYXKEYS.BANK_ACCOUNT_LIST, {canBeMissing: true});
    const [showExpensifyCardErrorModal, setShowExpensifyCardErrorModal] = useState(false);
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const [countryCode = CONST.DEFAULT_COUNTRY_CODE] = useOnyx(ONYXKEYS.COUNTRY_CODE, {canBeMissing: false});
    const [unsharedBankAccountData] = useOnyx(ONYXKEYS.UNSHARE_BANK_ACCOUNT, {canBeMissing: true});
    const [unshareUser, setUnshareUser] = useState<{login?: string | null; text?: string | null} | undefined>(undefined);
    const [searchTerm, debouncedSearchTerm, setSearchTerm] = useDebouncedState('');
    const {translate} = useLocalize();
    const admins = bankAccountList?.[bankAccountID]?.accountData?.sharees;
    const totalAdmins = bankAccountList?.[bankAccountID]?.accountData?.sharees?.length;
    const isExpensifyCardSettlementAccount = bankAccountList?.[bankAccountID]?.isExpensifyCardSettlementAccount ?? false;
    const shouldShowTextInput = Number(totalAdmins) >= CONST.STANDARD_LIST_ITEM_LIMIT;
    const textInputLabel = shouldShowTextInput ? translate('common.search') : undefined;
    const isLoading = unsharedBankAccountData?.isLoading ?? false;
    const shouldShowSuccess = unsharedBankAccountData?.shouldShowSuccess ?? false;

    useEffect(() => {
        if (!shouldShowSuccess) {
            return;
        }
        if (!totalAdmins) {
            Navigation.goBack();
        }
    }, [totalAdmins, shouldShowSuccess]);

    const handleUnshare = () => {
        if (!bankAccountID || !unshareUser?.login) {
            return;
        }

        // Unsharing a bank account isn’t possible if the selected user’s copy of the bank account is set as an Expensify Card settlement account.
        if (isExpensifyCardSettlementAccount) {
            setUnshareUser(undefined);
            setShowExpensifyCardErrorModal(true);
            return;
        }
        unshareBankAccount(Number(bankAccountID), unshareUser.login);
        setUnshareUser(undefined);
    };

    const getAdminsList = () => {
        if (admins?.length === 0) {
            return [];
        }
        const adminsWithInfo =
            admins
                ?.filter((admin) => admin !== currentUserPersonalDetails?.email)
                .map((admin) => {
                    const personalDetails = getPersonalDetailByEmail(admin);
                    const formattedAdmin = formatMemberForList({
                        text: personalDetails?.displayName,
                        alternateText: personalDetails?.login,
                        keyForList: personalDetails?.login,
                        accountID: personalDetails?.accountID,
                        login: personalDetails?.login,
                        pendingAction: personalDetails?.pendingAction,
                        reportID: '',
                    });
                    return {...formattedAdmin, isInteractive: false};
                }) ?? [];

        let adminsToDisplay = [...adminsWithInfo];
        if (debouncedSearchTerm) {
            const searchValue = getSearchValueForPhoneOrEmail(debouncedSearchTerm, countryCode).toLowerCase();
            adminsToDisplay = tokenizedSearch(adminsWithInfo, searchValue, (option) => [option.text ?? '', option.alternateText ?? '']);
        }
        return adminsToDisplay;
    };

    const hideUnshareErrorModal = () => setShowExpensifyCardErrorModal(false);

    const itemRightSideComponent = (item: ListItem) => {
        return (
            <Button
                isLoading={isLoading && unsharedBankAccountData?.email === item?.login}
                small
                isDisabled={isLoading}
                danger
                text={translate('common.unshare')}
                onPress={() => setUnshareUser({login: item?.login, text: item?.text})}
                pressOnEnter
            />
        );
    };

    const onButtonPress = () => Navigation.goBack(ROUTES.SETTINGS_WALLET);

    const adminsList = getAdminsList();

    const getHeaderSearchMessage = () => {
        const searchValue = debouncedSearchTerm.trim().toLowerCase();
        return getHeaderMessage(adminsList.length !== 0, false, searchValue, countryCode, false);
    };

    const headerMessage = getHeaderSearchMessage();

    return (
        <ScreenWrapper testID={UnshareBankAccount.displayName}>
            <HeaderWithBackButton
                title={translate('walletPage.unshareBankAccount')}
                onBackButtonPress={onButtonPress}
            />
            <>
                <Text style={[styles.ph5, styles.pb3]}>{translate('walletPage.unshareBankAccountDescription')}</Text>
                <SelectionList
                    textInputOptions={{
                        headerMessage,
                        value: searchTerm,
                        label: textInputLabel,
                        onChangeText: setSearchTerm,
                    }}
                    data={adminsList}
                    showListEmptyContent={false}
                    rightHandSideComponent={itemRightSideComponent}
                    footerContent={
                        <ErrorMessageRow
                            errors={unsharedBankAccountData?.errors}
                            errorRowStyles={[styles.mv3]}
                            onDismiss={() => clearUnshareBankAccountErrors(Number(bankAccountID))}
                        />
                    }
                    onSelectRow={() => {}}
                    ListItem={UserListItem}
                />
            </>
            <ConfirmModal
                title={translate('walletPage.unshareErrorModalTitle')}
                isVisible={showExpensifyCardErrorModal}
                onConfirm={hideUnshareErrorModal}
                success
                prompt={
                    <View style={[styles.renderHTML, styles.flexRow]}>
                        <RenderHTML html={translate('walletPage.reachOutForHelp')} />
                    </View>
                }
                confirmText={translate('common.buttonConfirm')}
                shouldShowCancelButton={false}
            />
            <ConfirmModal
                title={translate('common.areYouSure')}
                onConfirm={handleUnshare}
                onCancel={() => setUnshareUser(undefined)}
                isVisible={!!unshareUser}
                prompt={translate('walletPage.unshareBankAccountWarning', {admin: unshareUser?.text})}
                confirmText={translate('common.unshare')}
                cancelText={translate('common.cancel')}
                danger
            />
        </ScreenWrapper>
    );
}

UnshareBankAccount.displayName = 'UnshareBankAccount';

export default UnshareBankAccount;
