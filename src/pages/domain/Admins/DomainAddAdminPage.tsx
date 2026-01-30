import {adminAccountIDsSelector, domainEmailSelector} from '@selectors/Domain';
import {Str} from 'expensify-common';
import React, {useEffect, useRef, useState} from 'react';
import type {SectionListData} from 'react-native';
import FormAlertWithSubmitButton from '@components/FormAlertWithSubmitButton';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
// eslint-disable-next-line no-restricted-imports
import SelectionList from '@components/SelectionListWithSections';
import InviteMemberListItem from '@components/SelectionListWithSections/InviteMemberListItem';
import type {Section} from '@components/SelectionListWithSections/types';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useSearchSelector from '@hooks/useSearchSelector';
import useThemeStyles from '@hooks/useThemeStyles';
import {searchInServer} from '@libs/actions/Report';
import {canUseTouchScreen} from '@libs/DeviceCapabilities';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import {getHeaderMessage} from '@libs/OptionsListUtils';
import type {OptionData} from '@libs/ReportUtils';
import type {SettingsNavigatorParamList} from '@navigation/types';
import DomainNotFoundPageWrapper from '@pages/domain/DomainNotFoundPageWrapper';
import {addAdminToDomain} from '@userActions/Domain';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

type Sections = SectionListData<OptionData, Section<OptionData>>;

type DomainAddAdminProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.DOMAIN.ADD_ADMIN>;

function DomainAddAdminPage({route}: DomainAddAdminProps) {
    const {domainAccountID} = route.params;

    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const [countryCode = CONST.DEFAULT_COUNTRY_CODE] = useOnyx(ONYXKEYS.COUNTRY_CODE, {canBeMissing: false});
    const [isSearchingForReports] = useOnyx(ONYXKEYS.IS_SEARCHING_FOR_REPORTS, {initWithStoredValues: false, canBeMissing: true});
    const [domainEmail] = useOnyx(`${ONYXKEYS.COLLECTION.DOMAIN}${domainAccountID}`, {
        canBeMissing: true,
        selector: domainEmailSelector,
    });
    const [adminIDs] = useOnyx(`${ONYXKEYS.COLLECTION.DOMAIN}${domainAccountID}`, {
        canBeMissing: true,
        selector: adminAccountIDsSelector,
    });

    const [didScreenTransitionEnd, setDidScreenTransitionEnd] = useState(false);
    const [currentlySelectedUser, setCurrentlySelectedUser] = useState<OptionData | null>(null);
    const didInvite = useRef<boolean>(false);

    const domainName = domainEmail ? Str.extractEmailDomain(domainEmail) : undefined;
    const {searchTerm, debouncedSearchTerm, setSearchTerm, availableOptions, toggleSelection, areOptionsInitialized, onListEndReached} = useSearchSelector({
        selectionMode: CONST.SEARCH_SELECTOR.SELECTION_MODE_SINGLE,
        searchContext: CONST.SEARCH_SELECTOR.SEARCH_CONTEXT_MEMBER_INVITE,
        includeRecentReports: false,
        includeUserToInvite: true,
        excludeLogins: Object.fromEntries(CONST.EXPENSIFY_EMAILS.map((email) => [email, true])),
        shouldInitialize: didScreenTransitionEnd,
        onSingleSelect: (option) => setCurrentlySelectedUser({...option, isSelected: true}),
    });

    useEffect(() => {
        searchInServer(debouncedSearchTerm);
    }, [debouncedSearchTerm]);

    const inviteUser = () => {
        if (didInvite.current || !currentlySelectedUser || !currentlySelectedUser.accountID || !currentlySelectedUser.login || !domainName) {
            return;
        }
        didInvite.current = true;

        addAdminToDomain(domainAccountID, currentlySelectedUser.accountID, currentlySelectedUser.login, domainName);
        Navigation.dismissModal();
    };

    const filteredOptions = areOptionsInitialized
        ? availableOptions.personalDetails.filter(({accountID}) => accountID && accountID !== currentlySelectedUser?.accountID && !adminIDs?.includes(accountID))
        : [];

    const sections: Sections[] = [];
    if (areOptionsInitialized) {
        if (currentlySelectedUser) {
            sections.push({
                title: undefined,
                data: [currentlySelectedUser],
            });
        }

        if (filteredOptions.length > 0) {
            sections.push({
                title: translate('common.contacts'),
                data: filteredOptions,
            });
        }

        if (availableOptions.userToInvite && currentlySelectedUser?.login !== availableOptions.userToInvite.login) {
            sections.push({
                title: undefined,
                data: [availableOptions.userToInvite],
            });
        }
    }

    const footerContent = (
        <FormAlertWithSubmitButton
            isDisabled={!currentlySelectedUser}
            isAlertVisible={false}
            buttonText={translate('common.invite')}
            onSubmit={inviteUser}
            containerStyles={[styles.flexReset, styles.flexGrow0, styles.flexShrink0, styles.flexBasisAuto]}
            enabledWhenOffline
        />
    );

    const headerMessage = () => {
        const searchValue = debouncedSearchTerm.trim().toLowerCase();
        if (!availableOptions.userToInvite && CONST.EXPENSIFY_EMAILS_OBJECT[searchValue]) {
            return translate('messages.errorMessageInvalidEmail');
        }

        const searchedUserPersonalDetails = availableOptions.personalDetails.find(({login}) => login?.toLowerCase() === searchValue);
        if (!availableOptions.userToInvite && searchedUserPersonalDetails?.accountID && adminIDs?.includes(searchedUserPersonalDetails.accountID)) {
            return translate('messages.userIsAlreadyAnAdmin', {login: searchValue, name: domainName ?? ''});
        }
        return getHeaderMessage(filteredOptions.length > 0 || !!currentlySelectedUser, !!availableOptions.userToInvite, searchValue, countryCode, false);
    };

    return (
        <DomainNotFoundPageWrapper domainAccountID={domainAccountID}>
            <ScreenWrapper
                shouldEnableMaxHeight
                shouldUseCachedViewportHeight
                testID={DomainAddAdminPage.displayName}
                enableEdgeToEdgeBottomSafeAreaPadding
                onEntryTransitionEnd={() => setDidScreenTransitionEnd(true)}
            >
                <HeaderWithBackButton
                    title={translate('domain.admins.addAdmin')}
                    onBackButtonPress={() => Navigation.goBack(ROUTES.DOMAIN_ADMINS.getRoute(domainAccountID))}
                />
                <SelectionList
                    sections={sections}
                    headerMessage={headerMessage()}
                    ListItem={InviteMemberListItem}
                    textInputLabel={translate('selectionList.nameEmailOrPhoneNumber')}
                    textInputValue={searchTerm}
                    onChangeText={(value) => setSearchTerm(value)}
                    onSelectRow={(option: OptionData) => toggleSelection(option)}
                    onConfirm={inviteUser}
                    showScrollIndicator
                    showLoadingPlaceholder={!areOptionsInitialized || !didScreenTransitionEnd}
                    shouldPreventDefaultFocusOnSelectRow={!canUseTouchScreen()}
                    footerContent={footerContent}
                    isLoadingNewOptions={!!isSearchingForReports}
                    addBottomSafeAreaPadding
                    onEndReached={onListEndReached}
                />
            </ScreenWrapper>
        </DomainNotFoundPageWrapper>
    );
}

DomainAddAdminPage.displayName = 'DomainAddAdminPage';

export default DomainAddAdminPage;
