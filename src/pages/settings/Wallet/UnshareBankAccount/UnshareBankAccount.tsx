import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {View} from 'react-native';
import Button from '@components/Button';
import ConfirmModal from '@components/ConfirmModal';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import RenderHTML from '@components/RenderHTML';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionListWithSections';
import type {ListItem} from '@components/SelectionListWithSections/types';
import UserListItem from '@components/SelectionListWithSections/UserListItem';
import Text from '@components/Text';
import useDebouncedState from '@hooks/useDebouncedState';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import {getLatestErrorMessage} from '@libs/ErrorUtils';
import {formatMemberForList, getHeaderMessage, getSearchValueForPhoneOrEmail} from '@libs/OptionsListUtils';
import type {MemberForList} from '@libs/OptionsListUtils';
import {getPersonalDetailByEmail} from '@libs/PersonalDetailsUtils';
import tokenizedSearch from '@libs/tokenizedSearch';
import Navigation from '@navigation/Navigation';
import type {PlatformStackScreenProps} from '@navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@navigation/types';
import {clearUnshareBankAccount, clearUnshareBankAccountErrors, unshareBankAccount} from '@userActions/BankAccounts';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

type ShareBankAccountProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.SETTINGS.WALLET.UNSHARE_BANK_ACCOUNT>;

const DEFAULT_OBJECT = {};
function UnshareBankAccount({route}: ShareBankAccountProps) {
    const bankAccountID = route.params?.bankAccountID;
    const styles = useThemeStyles();
    const [bankAccountList] = useOnyx(ONYXKEYS.BANK_ACCOUNT_LIST, {canBeMissing: true});

    const {isOffline} = useNetwork();
    const [countryCode = CONST.DEFAULT_COUNTRY_CODE] = useOnyx(ONYXKEYS.COUNTRY_CODE, {canBeMissing: false});

    const [unsharedBankAccountData] = useOnyx(ONYXKEYS.UNSHARE_BANK_ACCOUNT, {canBeMissing: true});
    const isLoading = unsharedBankAccountData?.isLoading ?? false;

    const [unshareUser, setUnshareUser] = useState<{login?: string | null; text?: string | null} | undefined>(undefined);
    const error = getLatestErrorMessage(unsharedBankAccountData ?? DEFAULT_OBJECT);

    const [searchTerm, debouncedSearchTerm, setSearchTerm] = useDebouncedState('');
    const {translate} = useLocalize();
    const admins = ['n.arefyev91@gmail.com', '5552@gmail.com', '5553@gmail.com'] ?? bankAccountList?.[bankAccountID]?.accountData?.sharees;
    // const shouldShowTextInput = admins && admins?.length >= CONST.STANDARD_LIST_ITEM_LIMIT;
    const shouldShowTextInput = admins && admins?.length >= 2;
    const textInputLabel = shouldShowTextInput ? translate('common.search') : undefined;

    useEffect(() => {
        return () => {
            if (isLoading) {
                return;
            }
            clearUnshareBankAccount();
        };
    }, [isLoading]);

    useEffect(() => {
        if (isOffline) {
            return;
        }
        // openBankAccountSharePage();
    }, [isOffline]);

    const handleUnshare = useCallback(() => {
        if (!bankAccountID || !unshareUser?.login) {
            return;
        }
        unshareBankAccount(Number(bankAccountID), unshareUser.login);
        setUnshareUser(undefined);
    }, [bankAccountID, unshareUser?.login]);

    const adminsList = useMemo(() => {
        if (admins?.length === 0) {
            return [];
        }

        const adminsWithInfo =
            admins?.map((admin) => {
                const personalDetails = getPersonalDetailByEmail(admin);
                return formatMemberForList({
                    text: personalDetails?.displayName,
                    alternateText: personalDetails?.login,
                    keyForList: personalDetails?.login,
                    accountID: personalDetails?.accountID,
                    login: personalDetails?.login,
                    pendingAction: personalDetails?.pendingAction,
                    reportID: '',
                });
            }) ?? [];

        let adminsToDisplay = [...adminsWithInfo];

        // Apply search filter if there's a search term
        if (debouncedSearchTerm) {
            const searchValue = getSearchValueForPhoneOrEmail(debouncedSearchTerm, countryCode).toLowerCase();
            adminsToDisplay = tokenizedSearch(adminsWithInfo, searchValue, (option) => [option.text ?? '', option.alternateText ?? '']);
        }

        return adminsToDisplay;
    }, [admins, countryCode, debouncedSearchTerm]);

    const hideUnshareErrorModal = useCallback(() => {
        clearUnshareBankAccountErrors();
    }, []);

    const onSelectRow = useCallback((item: MemberForList) => {
        setUnshareUser({login: item?.login, text: item?.text});
    }, []);

    const itemRightSideComponent = useCallback(
        (item: ListItem) => {
            return (
                <Button
                    small
                    isDisabled={isOffline}
                    danger
                    text={translate('common.unshare')}
                    onPress={() => setUnshareUser({login: item?.login, text: item?.text})}
                    pressOnEnter
                />
            );
        },
        [isOffline, translate],
    );

    const sections = useMemo(
        () => [
            {
                title: undefined,
                data: adminsList,
                shouldShow: true,
            },
        ],
        [adminsList],
    );

    const headerMessage = useMemo(() => {
        const searchValue = debouncedSearchTerm.trim().toLowerCase();

        return getHeaderMessage(sections?.at(0)?.data.length !== 0, false, searchValue, countryCode, false);
    }, [debouncedSearchTerm, sections, countryCode]);

    const onButtonPress = () => Navigation.goBack(ROUTES.SETTINGS_WALLET);

    return (
        <ScreenWrapper testID={UnshareBankAccount.displayName}>
            <HeaderWithBackButton
                title={translate('walletPage.unshareBankAccount')}
                onBackButtonPress={onButtonPress}
            />
            <SelectionList
                textInputLabel={textInputLabel}
                textInputValue={searchTerm}
                onChangeText={setSearchTerm}
                sections={sections}
                headerContent={<Text style={[styles.ph5, styles.pb3]}>{translate('walletPage.unshareBankAccountDescription')}</Text>}
                shouldShowTextInputAfterHeader
                shouldShowListEmptyContent={false}
                rightHandSideComponent={itemRightSideComponent}
                shouldShowHeaderMessageAfterHeader
                onSelectRow={onSelectRow}
                headerMessage={headerMessage}
                ListItem={UserListItem}
            />
            <ConfirmModal
                title={translate('walletPage.unshareErrorModalTitle')}
                isVisible={!!error}
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
