import React, {useCallback, useEffect, useMemo, useState} from 'react';
import ConfirmationPage from '@components/ConfirmationPage';
import FormAlertWithSubmitButton from '@components/FormAlertWithSubmitButton';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import SelectionList from '@components/SelectionListWithSections';
import UserListItem from '@components/SelectionListWithSections/UserListItem';
import Text from '@components/Text';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useDebouncedState from '@hooks/useDebouncedState';
import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import {getLatestErrorMessage} from '@libs/ErrorUtils';
import {getHeaderMessage, getSearchValueForPhoneOrEmail} from '@libs/OptionsListUtils';
import type {MemberForList} from '@libs/OptionsListUtils';
import {getActiveAllAdminsFromWorkspaces} from '@libs/PolicyUtils';
import tokenizedSearch from '@libs/tokenizedSearch';
import Navigation from '@navigation/Navigation';
import type {PlatformStackScreenProps} from '@navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@navigation/types';
import {clearShareBankAccount, openBankAccountSharePage, setShareBankAccountAdmins, shareBankAccount} from '@userActions/BankAccounts';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

type ShareBankAccountProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.SETTINGS.WALLET.SHARE_BANK_ACCOUNT>;

function ShareBankAccount({route}: ShareBankAccountProps) {
    const bankAccountID = route.params?.bankAccountID;
    const styles = useThemeStyles();
    const illustrations = useMemoizedLazyIllustrations(['ShareBank'] as const);

    const {isOffline} = useNetwork();
    const [countryCode = CONST.DEFAULT_COUNTRY_CODE] = useOnyx(ONYXKEYS.COUNTRY_CODE, {canBeMissing: false});
    const [bankAccountShareDetails] = useOnyx(ONYXKEYS.COLLECTION.BANK_ACCOUNT_SHARE_DETAILS, {canBeMissing: false});

    const [sharedBankAccountData] = useOnyx(ONYXKEYS.SHARE_BANK_ACCOUNT, {canBeMissing: true});
    const shouldShowSuccess = sharedBankAccountData?.shouldShowSuccess ?? false;
    const isLoading = sharedBankAccountData?.isLoading ?? false;

    const [allPolicies] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {canBeMissing: true});
    const {login: currentUserLogin} = useCurrentUserPersonalDetails();
    const [selectedOptions, setSelectedOptions] = useState<MemberForList[]>([]);
    const shareBankAccountError = getLatestErrorMessage(sharedBankAccountData);

    const [searchTerm, debouncedSearchTerm, setSearchTerm] = useDebouncedState('');
    const {translate} = useLocalize();
    const admins = getActiveAllAdminsFromWorkspaces(allPolicies, currentUserLogin, bankAccountID, bankAccountShareDetails);
    const shouldShowTextInput = admins && admins?.length >= CONST.STANDARD_LIST_ITEM_LIMIT;
    const textInputLabel = shouldShowTextInput ? translate('common.search') : undefined;

    const toggleOption = useCallback(
        (option: MemberForList) => {
            const isOptionInList = selectedOptions.some((selectedOption) => selectedOption.login === option.login);

            let newSelectedOptions: MemberForList[];
            if (isOptionInList) {
                newSelectedOptions = selectedOptions.filter((selectedOption) => selectedOption.login !== option.login);
            } else {
                newSelectedOptions = [...selectedOptions, {...option, isSelected: true}];
            }

            setSelectedOptions(newSelectedOptions);
        },
        [selectedOptions],
    );

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

    const handleConfirm = useCallback(() => {
        if (selectedOptions.length === 0 || !bankAccountID) {
            return;
        }

        const emails = selectedOptions.map((member) => member.login).filter(Boolean);
        setShareBankAccountAdmins(selectedOptions);
        shareBankAccount(Number(bankAccountID), emails);
    }, [bankAccountID, selectedOptions]);

    const adminsList = useMemo(() => {
        if (admins.length === 0) {
            return [];
        }

        let adminsToDisplay = admins.map((admin) => ({...admin, isSelected: selectedOptions.some((selectedOption) => selectedOption.login === admin.login)}));

        // Apply search filter if there's a search term
        if (debouncedSearchTerm) {
            const searchValue = getSearchValueForPhoneOrEmail(debouncedSearchTerm, countryCode).toLowerCase();
            adminsToDisplay = tokenizedSearch(admins, searchValue, (option) => [option.text ?? '', option.alternateText ?? '']);
        }

        return adminsToDisplay;
    }, [admins, countryCode, debouncedSearchTerm, selectedOptions]);

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

    const toggleSelectAll = useCallback(() => {
        const someSelected = selectedOptions.length > 0;

        if (someSelected) {
            setSelectedOptions([]);
        } else {
            const everyLogin = adminsList?.map((member) => ({
                ...member,
                isSelected: true,
            }));
            setSelectedOptions(everyLogin);
        }
    }, [adminsList, selectedOptions.length]);

    const headerMessage = useMemo(() => {
        const searchValue = debouncedSearchTerm.trim().toLowerCase();

        return getHeaderMessage(sections?.at(0)?.data.length !== 0, false, searchValue, countryCode, false);
    }, [debouncedSearchTerm, sections, countryCode]);

    const footerContent = useMemo(
        () => (
            <FormAlertWithSubmitButton
                isLoading={isLoading}
                isAlertVisible={!!shareBankAccountError}
                message={shareBankAccountError}
                isDisabled={!selectedOptions.length}
                buttonText={translate('common.share')}
                onSubmit={handleConfirm}
                containerStyles={[styles.flexReset, styles.flexGrow0, styles.flexShrink0, styles.flexBasisAuto]}
            />
        ),
        [handleConfirm, isLoading, selectedOptions.length, styles.flexBasisAuto, styles.flexGrow0, styles.flexReset, styles.flexShrink0, translate, shareBankAccountError],
    );

    const goBack = () => Navigation.goBack(ROUTES.SETTINGS_WALLET);

    const onButtonPress = () => {
        if (!isLoading) {
            clearShareBankAccount();
        }
        goBack();
    };

    return (
        <ScreenWrapper testID={ShareBankAccount.displayName}>
            <HeaderWithBackButton
                title={translate(shouldShowSuccess ? 'walletPage.bankAccountShared' : 'walletPage.shareBankAccount')}
                onBackButtonPress={shouldShowSuccess ? onButtonPress : goBack}
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
                <SelectionList
                    canSelectMultiple
                    textInputLabel={textInputLabel}
                    textInputValue={searchTerm}
                    onChangeText={setSearchTerm}
                    sections={sections}
                    onSelectAll={toggleSelectAll}
                    selectAllStyle={styles.mutedNormalTextLabel}
                    headerContent={<Text style={[styles.ph5, styles.pb3]}>{translate('walletPage.shareBankAccountTitle')}</Text>}
                    shouldShowTextInputAfterHeader
                    shouldShowListEmptyContent={false}
                    shouldUpdateFocusedIndex
                    shouldShowHeaderMessageAfterHeader
                    headerMessage={headerMessage}
                    ListItem={UserListItem}
                    shouldUseDefaultRightHandSideCheckmark
                    onSelectRow={toggleOption}
                    onConfirm={handleConfirm}
                    footerContent={footerContent}
                    isConfirmButtonDisabled={selectedOptions.length === 0}
                />
            )}
        </ScreenWrapper>
    );
}

ShareBankAccount.displayName = 'ShareBankAccount';

export default ShareBankAccount;
