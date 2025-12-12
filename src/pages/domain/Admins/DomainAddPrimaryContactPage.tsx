import React, {useMemo} from 'react';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import {FallbackAvatar} from '@components/Icon/Expensicons';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import InviteMemberListItem from '@components/SelectionList/ListItem/InviteMemberListItem';
import type {ListItem} from '@components/SelectionList/types';
import useDebouncedState from '@hooks/useDebouncedState';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import {selectAdminIDs} from '@libs/DomainUtils';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import {getSearchValueForPhoneOrEmail, sortAlphabetically} from '@libs/OptionsListUtils';
import {getDisplayNameOrDefault} from '@libs/PersonalDetailsUtils';
import tokenizedSearch from '@libs/tokenizedSearch';
import Navigation from '@navigation/Navigation';
import type {SettingsNavigatorParamList} from '@navigation/types';
import {choosePrimaryContact} from '@userActions/Domain';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';

type AdminOption = Omit<ListItem, 'accountID' | 'login'> & {
    accountID: number;
    login: string;
};
type DomainAddPrimaryContactPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.DOMAIN.ADD_PRIMARY_CONTACT>;

function DomainAddPrimaryContactPage({route}: DomainAddPrimaryContactPageProps) {
    const domainID = route.params.accountID;
    const {translate, formatPhoneNumber, localeCompare} = useLocalize();
    const [adminIDs] = useOnyx(`${ONYXKEYS.COLLECTION.DOMAIN}${domainID}`, {
        canBeMissing: true,
        selector: selectAdminIDs,
    });
    const [personalDetails] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST, {canBeMissing: true});
    const [searchTerm, debouncedSearchTerm, setSearchTerm] = useDebouncedState('');
    const [countryCode = CONST.DEFAULT_COUNTRY_CODE] = useOnyx(ONYXKEYS.COUNTRY_CODE, {canBeMissing: false});
    const [domainSettings] = useOnyx(`${ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_DOMAIN_MEMBER}${domainID}`, {
        canBeMissing: false,
    });
    const selectedUser = domainSettings?.settings?.technicalContactEmail;
    let selectedKey: string | undefined;

    const data: AdminOption[] = [];
    for (const accountID of adminIDs ?? []) {
        const details = personalDetails?.[accountID];
        if (details?.login === selectedUser) {
            selectedKey = String(accountID ?? '');
        }
        data.push({
            isSelected: details?.login === selectedUser,
            keyForList: String(accountID ?? ''),
            accountID,
            login: details?.login ?? '',
            text: formatPhoneNumber(getDisplayNameOrDefault(details)),
            alternateText: formatPhoneNumber(details?.login ?? ''),
            icons: [
                {
                    source: details?.avatar ?? FallbackAvatar,
                    name: formatPhoneNumber(details?.login ?? ''),
                    type: CONST.ICON_TYPE_AVATAR,
                    id: accountID,
                },
            ],
        });
    }

    const filteredApprovers =
        debouncedSearchTerm !== '' ? tokenizedSearch(data, getSearchValueForPhoneOrEmail(debouncedSearchTerm, countryCode), (option) => [option.text ?? '', option.login ?? '']) : data;
    const filteredData = sortAlphabetically(filteredApprovers, 'text', localeCompare);

    const textInputOptions = useMemo(
        () => ({
            label: translate('selectionList.findMember'),
            value: searchTerm,
            onChangeText: setSearchTerm,
            headerMessage: searchTerm && !data?.length ? translate('common.noResultsFound') : '',
        }),
        [translate, searchTerm, setSearchTerm, data?.length],
    );

    return (
        <ScreenWrapper
            testID={DomainAddPrimaryContactPage.displayName}
            enableEdgeToEdgeBottomSafeAreaPadding
        >
            <FullPageNotFoundView
                onBackButtonPress={Navigation.goBack}
                addBottomSafeAreaPadding
            >
                <HeaderWithBackButton
                    title={translate('domain.admins.addPrimaryContact')}
                    onBackButtonPress={Navigation.goBack}
                />
                <SelectionList
                    data={filteredData}
                    onSelectRow={(option) => {
                        choosePrimaryContact(route.params.accountID, option.login === selectedUser ? null : (option.login ?? ''), selectedUser);
                        Navigation.goBack();
                    }}
                    ListItem={InviteMemberListItem}
                    canSelectMultiple={false}
                    initiallyFocusedItemKey={selectedKey}
                    shouldScrollToFocusedIndex
                    shouldShowTextInput
                    textInputOptions={textInputOptions}
                    addBottomSafeAreaPadding
                    showScrollIndicator
                />
            </FullPageNotFoundView>
        </ScreenWrapper>
    );
}

DomainAddPrimaryContactPage.displayName = 'DomainAddPrimaryContactPage';

export default DomainAddPrimaryContactPage;
