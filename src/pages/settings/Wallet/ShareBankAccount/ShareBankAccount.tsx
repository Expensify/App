import React, {useCallback, useMemo, useState} from 'react';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionListWithSections';
import UserListItem from '@components/SelectionListWithSections/UserListItem';
import Text from '@components/Text';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useDebouncedState from '@hooks/useDebouncedState';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import {getHeaderMessage, getSearchValueForPhoneOrEmail} from '@libs/OptionsListUtils';
import type {MemberForList} from '@libs/OptionsListUtils';
import {getActiveAllAdminsFromWorkspaces} from '@libs/PolicyUtils';
import tokenizedSearch from '@libs/tokenizedSearch';
import Navigation from '@navigation/Navigation';
import type {PlatformStackScreenProps} from '@navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@navigation/types';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

type ShareBankAccountProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.SETTINGS.WALLET.SHARE_BANK_ACCOUNT>;

function ShareBankAccount({route}: ShareBankAccountProps) {
    const bankAccountID = route.params?.bankAccountID;
    const styles = useThemeStyles();
    const [countryCode] = useOnyx(ONYXKEYS.COUNTRY_CODE, {canBeMissing: false});

    const [allPolicies] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {canBeMissing: true});
    const {accountID} = useCurrentUserPersonalDetails();
    const [selectedOptions, setSelectedOptions] = useState<MemberForList[]>([]);

    const [searchTerm, debouncedSearchTerm, setSearchTerm] = useDebouncedState('');
    const {translate} = useLocalize();
    const admins = getActiveAllAdminsFromWorkspaces(allPolicies, accountID.toString());
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

    const handleConfirm = useCallback(() => {
        if (selectedOptions.length === 0) {
            return;
        }

        const emails = selectedOptions.map((member) => member.login).filter(Boolean);

        // TODO add api call to share bank account

        Navigation.navigate(ROUTES.SETTINGS_WALLET_SHARE_BANK_ACCOUNT_SUCCESS.getRoute(Number(bankAccountID)));
    }, [bankAccountID, selectedOptions]);

    const sections = useMemo(() => {
        if (admins.length === 0) {
            return [];
        }

        let membersToDisplay = admins;

        // Apply search filter if there's a search term
        if (debouncedSearchTerm) {
            const searchValue = getSearchValueForPhoneOrEmail(debouncedSearchTerm, countryCode).toLowerCase();
            membersToDisplay = tokenizedSearch(admins, searchValue, (option) => [option.text ?? '', option.alternateText ?? '']);
        }

        // Filter to show selected members first, then apply search filter to selected members
        let filterSelectedOptions = selectedOptions;
        if (debouncedSearchTerm !== '') {
            const searchValue = getSearchValueForPhoneOrEmail(debouncedSearchTerm, countryCode).toLowerCase();
            filterSelectedOptions = selectedOptions.filter((option) => {
                const isPartOfSearchTerm = !!option.text?.toLowerCase().includes(searchValue) || !!option.login?.toLowerCase().includes(searchValue);
                return isPartOfSearchTerm;
            });
        }

        // Combine selected members with unselected members
        const selectedLogins = selectedOptions.map(({login}) => login);
        const unselectedMembers = membersToDisplay.filter(({login}) => !selectedLogins.includes(login));

        const allMembersWithState: MemberForList[] = [];
        filterSelectedOptions.forEach((member) => {
            allMembersWithState.push({...member, isSelected: true});
        });
        unselectedMembers.forEach((member) => {
            allMembersWithState.push({...member, isSelected: false});
        });

        return [
            {
                title: undefined,
                data: allMembersWithState,
                shouldShow: true,
            },
        ];
    }, [admins, countryCode, debouncedSearchTerm, selectedOptions]);

    const headerMessage = useMemo(() => {
        const searchValue = debouncedSearchTerm.trim().toLowerCase();

        return getHeaderMessage(sections?.at(0)?.data.length !== 0, false, searchValue, false, countryCode);
    }, [debouncedSearchTerm, sections, countryCode]);

    return (
        <ScreenWrapper testID={ShareBankAccount.displayName}>
            <HeaderWithBackButton
                title={translate('walletPage.shareBankAccount')}
                onBackButtonPress={() => Navigation.goBack(ROUTES.SETTINGS_WALLET)}
            />
            <SelectionList
                canSelectMultiple
                textInputLabel={textInputLabel}
                textInputValue={searchTerm}
                onChangeText={setSearchTerm}
                sections={sections}
                headerContent={<Text style={[styles.ph5, styles.pb3]}>{translate('walletPage.shareBankAccountTitle')}</Text>}
                shouldShowTextInputAfterHeader
                shouldShowListEmptyContent={false}
                shouldUpdateFocusedIndex
                shouldShowHeaderMessageAfterHeader
                headerMessage={headerMessage}
                ListItem={UserListItem}
                shouldUseDefaultRightHandSideCheckmark
                onSelectRow={toggleOption}
                showConfirmButton
                confirmButtonText={translate('common.share')}
                onConfirm={handleConfirm}
                isConfirmButtonDisabled={selectedOptions.length === 0}
                addBottomSafeAreaPadding
            />
        </ScreenWrapper>
    );
}

ShareBankAccount.displayName = 'ShareBankAccount';

export default ShareBankAccount;
