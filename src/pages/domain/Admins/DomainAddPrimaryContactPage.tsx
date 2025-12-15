import {adminAccountIDsSelector} from '@selectors/Domain';
import React from 'react';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import InviteMemberListItem from '@components/SelectionList/ListItem/InviteMemberListItem';
import type {ListItem} from '@components/SelectionList/types';
import useDebouncedState from '@hooks/useDebouncedState';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
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
    const {domainAccountID} = route.params;
    const {translate, formatPhoneNumber, localeCompare} = useLocalize();
    const [adminAccountIDs] = useOnyx(`${ONYXKEYS.COLLECTION.DOMAIN}${domainAccountID}`, {
        canBeMissing: true,
        selector: adminAccountIDsSelector,
    });
    const [personalDetails] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST, {canBeMissing: true});
    const [searchTerm, debouncedSearchTerm, setSearchTerm] = useDebouncedState('');
    const [countryCode = CONST.DEFAULT_COUNTRY_CODE] = useOnyx(ONYXKEYS.COUNTRY_CODE, {canBeMissing: false});
    const [domainSettings] = useOnyx(`${ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_DOMAIN_MEMBER}${domainAccountID}`, {
        canBeMissing: false,
    });
    const technicalContactEmail = domainSettings?.settings?.technicalContactEmail;
    let technicalContactEmailKey: string | undefined;

    const data: AdminOption[] = [];
    for (const accountID of adminAccountIDs ?? []) {
        const details = personalDetails?.[accountID];
        if (details?.login === technicalContactEmail) {
            technicalContactEmailKey = String(accountID);
        }
        data.push({
            isSelected: details?.login === technicalContactEmail,
            keyForList: String(accountID),
            accountID,
            login: details?.login ?? '',
            text: formatPhoneNumber(getDisplayNameOrDefault(details)),
            alternateText: formatPhoneNumber(details?.login ?? ''),
            icons: [
                {
                    source: details?.avatar ?? details?.fallbackIcon ?? '',
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

    return (
        <ScreenWrapper
            testID={DomainAddPrimaryContactPage.displayName}
            enableEdgeToEdgeBottomSafeAreaPadding
        >
            <FullPageNotFoundView
                onBackButtonPress={Navigation.goBack}
                addBottomSafeAreaPadding
            >
                <HeaderWithBackButton title={translate('domain.admins.addPrimaryContact')} />
                <SelectionList
                    data={filteredData}
                    onSelectRow={(option) => {
                        if (!option.login || !option.accountID) {
                            return;
                        }
                        choosePrimaryContact(domainAccountID, option.accountID, option.login === technicalContactEmail ? null : option.login, technicalContactEmail);
                        Navigation.goBack();
                    }}
                    ListItem={InviteMemberListItem}
                    canSelectMultiple={false}
                    initiallyFocusedItemKey={technicalContactEmailKey}
                    shouldScrollToFocusedIndex
                    shouldShowTextInput
                    textInputOptions={{
                        label: translate('selectionList.findMember'),
                        value: searchTerm,
                        onChangeText: setSearchTerm,
                        headerMessage: searchTerm && !filteredData?.length ? translate('common.noResultsFound') : '',
                    }}
                    addBottomSafeAreaPadding
                    showScrollIndicator
                />
            </FullPageNotFoundView>
        </ScreenWrapper>
    );
}

DomainAddPrimaryContactPage.displayName = 'DomainAddPrimaryContactPage';

export default DomainAddPrimaryContactPage;
