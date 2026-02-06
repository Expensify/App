import React, {useEffect, useState} from 'react';
import BlockingView from '@components/BlockingViews/BlockingView';
import ConfirmationPage from '@components/ConfirmationPage';
import ErrorMessageRow from '@components/ErrorMessageRow';
import FormAlertWithSubmitButton from '@components/FormAlertWithSubmitButton';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import SelectionList from '@components/SelectionList';
import UserListItem from '@components/SelectionList/ListItem/UserListItem';
import Text from '@components/Text';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useDebouncedState from '@hooks/useDebouncedState';
import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import {getHeaderMessage, getSearchValueForPhoneOrEmail} from '@libs/OptionsListUtils';
import type {MemberForList} from '@libs/OptionsListUtils';
import {getEligibleBankAccountShareRecipients} from '@libs/PolicyUtils';
import tokenizedSearch from '@libs/tokenizedSearch';
import Navigation from '@navigation/Navigation';
import type {PlatformStackScreenProps} from '@navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@navigation/types';
import variables from '@styles/variables';
import {clearShareBankAccount, clearShareBankAccountErrors, openBankAccountSharePage, setShareBankAccountAdmins, shareBankAccount} from '@userActions/BankAccounts';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

type ShareBankAccountProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.SETTINGS.WALLET.SHARE_BANK_ACCOUNT>;

function ShareBankAccount({route}: ShareBankAccountProps) {
    const bankAccountID = route.params?.bankAccountID;
    const styles = useThemeStyles();
    const illustrations = useMemoizedLazyIllustrations(['ShareBank', 'Telescope'] as const);

    const {isOffline} = useNetwork();
    const [countryCode = CONST.DEFAULT_COUNTRY_CODE] = useOnyx(ONYXKEYS.COUNTRY_CODE, {canBeMissing: false});

    const [sharedBankAccountData] = useOnyx(ONYXKEYS.SHARE_BANK_ACCOUNT, {canBeMissing: true});
    const shouldShowSuccess = sharedBankAccountData?.shouldShowSuccess ?? false;
    const isLoading = sharedBankAccountData?.isLoading ?? false;

    const [allPolicies] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {canBeMissing: true});
    const {login: currentUserLogin} = useCurrentUserPersonalDetails();
    const [selectedOptions, setSelectedOptions] = useState<MemberForList[]>([]);
    const [isAlertVisible, setIsAlertVisible] = useState<boolean>(false);

    const [searchTerm, debouncedSearchTerm, setSearchTerm] = useDebouncedState('');
    const {translate} = useLocalize();
    const admins = getEligibleBankAccountShareRecipients(allPolicies, currentUserLogin, bankAccountID);
    const shouldShowTextInput = admins && admins?.length >= CONST.STANDARD_LIST_ITEM_LIMIT;
    const textInputLabel = shouldShowTextInput ? translate('common.search') : undefined;
    const debouncedSearchValue = debouncedSearchTerm.trim().toLowerCase();

    const toggleOption = (option: MemberForList) => {
        const isOptionInList = selectedOptions.some((selectedOption) => selectedOption.login === option.login);

        let newSelectedOptions: MemberForList[];
        if (isOptionInList) {
            newSelectedOptions = selectedOptions.filter((selectedOption) => selectedOption.login !== option.login);
        } else {
            newSelectedOptions = [...selectedOptions, {...option, isSelected: true}];
        }
        setIsAlertVisible(false);
        setSelectedOptions(newSelectedOptions);
    };
    useEffect(() => {
        return () => {
            if (!shouldShowSuccess) {
                return;
            }
            clearShareBankAccount();
        };
    }, [shouldShowSuccess]);

    useEffect(() => {
        if (isOffline) {
            return;
        }
        openBankAccountSharePage();
    }, [isOffline]);

    useEffect(() => {
        if (!sharedBankAccountData?.admins) {
            return;
        }
        setSelectedOptions(sharedBankAccountData.admins);
    }, [sharedBankAccountData?.admins]);

    const handleConfirm = () => {
        if (!bankAccountID) {
            return;
        }

        if (selectedOptions.length === 0) {
            setIsAlertVisible(true);
            return;
        }

        const emails = selectedOptions.map((member) => member.login).filter(Boolean);
        setShareBankAccountAdmins(selectedOptions);
        shareBankAccount(Number(bankAccountID), emails);
    };
    const getAdminList = () => {
        if (admins.length === 0) {
            return [];
        }

        let adminsToDisplay = admins.map((admin) => ({
            ...admin,
            isSelected: selectedOptions.some((selectedOption) => selectedOption.login === admin.login),
        }));

        // Apply search filter if there's a search term
        if (debouncedSearchTerm) {
            const searchValue = getSearchValueForPhoneOrEmail(debouncedSearchTerm, countryCode).toLowerCase();
            adminsToDisplay = tokenizedSearch(adminsToDisplay, searchValue, (option) => [option.text ?? '', option.alternateText ?? '']);
        }

        return adminsToDisplay;
    };

    const adminsList = getAdminList();

    const toggleSelectAll = () => {
        setIsAlertVisible(false);

        const areAllFilteredOptionsSelected = adminsList.length > 0 && adminsList.every((admin) => selectedOptions.some((selected) => selected.login === admin.login));

        if (areAllFilteredOptionsSelected) {
            const filteredLogins = new Set(adminsList.map((admin) => admin.login));
            setSelectedOptions(selectedOptions.filter((option) => !filteredLogins.has(option.login)));
        } else {
            const existingLogins = new Set(selectedOptions.map((option) => option.login));
            const newSelections = adminsList.filter((admin) => !existingLogins.has(admin.login)).map((admin) => ({...admin, isSelected: true}));
            setSelectedOptions([...selectedOptions, ...newSelections]);
        }
    };

    const sections = [
        {
            title: undefined,
            data: adminsList ?? [],
            shouldShow: true,
        },
    ];

    const headerMessage = getHeaderMessage(sections?.at(0)?.data.length !== 0, false, debouncedSearchValue, countryCode, false);

    const onButtonPress = () => Navigation.goBack(ROUTES.SETTINGS_WALLET);

    return (
        <ScreenWrapper testID={ShareBankAccount.displayName}>
            <HeaderWithBackButton
                title={translate(shouldShowSuccess ? 'walletPage.bankAccountShared' : 'walletPage.shareBankAccount')}
                onBackButtonPress={onButtonPress}
            />
            {shouldShowSuccess ? (
                <ScrollView contentContainerStyle={styles.flexGrow1}>
                    <ConfirmationPage
                        heading={translate('walletPage.shareBankAccountSuccess')}
                        description={translate('walletPage.shareBankAccountSuccessDescription')}
                        illustration={illustrations.ShareBank}
                        shouldShowButton
                        descriptionStyle={[styles.ph4, styles.textSupporting]}
                        illustrationStyle={styles.successBankSharedCardIllustration}
                        onButtonPress={onButtonPress}
                        buttonText={translate('common.buttonConfirm')}
                        containerStyle={styles.h100}
                    />
                </ScrollView>
            ) : (
                <>
                    <Text style={[styles.ph5, styles.pb3]}>{translate('walletPage.shareBankAccountTitle')}</Text>
                    <SelectionList
                        canSelectMultiple
                        textInputOptions={{
                            headerMessage,
                            value: searchTerm,
                            label: textInputLabel,
                            onChangeText: setSearchTerm,
                        }}
                        data={adminsList}
                        onSelectAll={toggleSelectAll}
                        shouldUpdateFocusedIndex
                        listEmptyContent={
                            <BlockingView
                                icon={illustrations.Telescope}
                                iconWidth={variables.emptyListIconWidth}
                                iconHeight={variables.emptyListIconHeight}
                                title={translate('walletPage.shareBankAccountEmptyTitle')}
                                subtitle={translate('walletPage.shareBankAccountEmptyDescription')}
                            />
                        }
                        ListItem={UserListItem}
                        shouldUseDefaultRightHandSideCheckmark
                        onCheckboxPress={toggleOption}
                        onSelectRow={toggleOption}
                        footerContent={
                            <FormAlertWithSubmitButton
                                isLoading={isLoading}
                                message={translate('walletPage.shareBankAccountNoAdminsSelected')}
                                isAlertVisible={isAlertVisible}
                                shouldRenderFooterAboveSubmit
                                isDisabled={!admins?.length || selectedOptions.length === 0}
                                buttonText={translate('common.share')}
                                onSubmit={handleConfirm}
                                footerContent={
                                    <ErrorMessageRow
                                        errors={sharedBankAccountData?.errors}
                                        errorRowStyles={[styles.mv3]}
                                        onDismiss={clearShareBankAccountErrors}
                                    />
                                }
                                containerStyles={[styles.flexReset, styles.flexGrow0, styles.flexShrink0, styles.flexBasisAuto]}
                            />
                        }
                    />
                </>
            )}
        </ScreenWrapper>
    );
}

ShareBankAccount.displayName = 'ShareBankAccount';

export default ShareBankAccount;
