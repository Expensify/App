import {adminAccountIDsSelector, domainEmailSelector} from '@selectors/Domain';
import {Str} from 'expensify-common';
import React, {useEffect, useRef, useState} from 'react';
import FormAlertWithSubmitButton from '@components/FormAlertWithSubmitButton';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import SingleSelectWithAvatarListItem from '@components/SelectionList/ListItem/SingleSelectWithAvatarListItem';
import SelectionListWithSections from '@components/SelectionList/SelectionListWithSections';
import type {Section} from '@components/SelectionList/SelectionListWithSections/types';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePersonalDetailSearchSelector from '@hooks/usePersonalDetailSearchSelector';
import useThemeStyles from '@hooks/useThemeStyles';
import {searchUserInServer} from '@libs/actions/Report';
import {canUseTouchScreen} from '@libs/DeviceCapabilities';
import {appendCountryCode} from '@libs/LoginUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import {getHeaderMessage} from '@libs/PersonalDetailOptionsListUtils';
import type {OptionData} from '@libs/PersonalDetailOptionsListUtils';
import {addSMSDomainIfPhoneNumber, parsePhoneNumber} from '@libs/PhoneNumber';
import type {SettingsNavigatorParamList} from '@navigation/types';
import DomainNotFoundPageWrapper from '@pages/domain/DomainNotFoundPageWrapper';
import {addAdminToDomain} from '@userActions/Domain';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import {personalDetailsLoginsSelector} from '@src/selectors/PersonalDetails';
import getEmptyArray from '@src/types/utils/getEmptyArray';

type Sections = Section<OptionData>;

type DomainAddAdminProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.DOMAIN.ADD_ADMIN>;

function DomainAddAdminPage({route}: DomainAddAdminProps) {
    const {domainAccountID} = route.params;

    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const [countryCode = CONST.DEFAULT_COUNTRY_CODE] = useOnyx(ONYXKEYS.COUNTRY_CODE);
    const [isSearchingForReports] = useOnyx(ONYXKEYS.RAM_ONLY_IS_SEARCHING_FOR_REPORTS);
    const [domainEmail] = useOnyx(`${ONYXKEYS.COLLECTION.DOMAIN}${domainAccountID}`, {
        selector: domainEmailSelector,
    });
    const [adminIDs] = useOnyx(`${ONYXKEYS.COLLECTION.DOMAIN}${domainAccountID}`, {
        selector: adminAccountIDsSelector,
    });
    const [adminLoginsByAccountIDs = getEmptyArray<string>()] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST, {selector: personalDetailsLoginsSelector(adminIDs)});

    const [didScreenTransitionEnd, setDidScreenTransitionEnd] = useState(false);
    const didInvite = useRef<boolean>(false);

    const domainName = domainEmail ? Str.extractEmailDomain(domainEmail) : undefined;

    // Any existing participants and Expensify emails should not be eligible for invitation
    const excludedUsers: Record<string, boolean> = {
        ...CONST.EXPENSIFY_EMAILS_OBJECT,
    };
    for (const login of adminLoginsByAccountIDs) {
        const smsDomain = addSMSDomainIfPhoneNumber(login);
        excludedUsers[smsDomain] = true;
    }
    const {searchTerm, debouncedSearchTerm, setSearchTerm, selectedOptions, availableOptions, toggleSelection, areOptionsInitialized} = usePersonalDetailSearchSelector({
        selectionMode: CONST.SEARCH_SELECTOR.SELECTION_MODE_SINGLE,
        includeUserToInvite: true,
        includeRecentReports: false,
        shouldUpdateSelectedOptionsOnSingleSelect: true,
        excludeLogins: excludedUsers,
        shouldInitialize: didScreenTransitionEnd,
    });

    useEffect(() => {
        searchUserInServer(debouncedSearchTerm);
    }, [debouncedSearchTerm]);

    const inviteUser = () => {
        const selectedOption = selectedOptions.at(0);
        if (didInvite.current || !selectedOption?.accountID || !selectedOption.login || !domainName) {
            return;
        }
        didInvite.current = true;

        addAdminToDomain(domainAccountID, selectedOption.accountID, selectedOption.login, domainName, !!selectedOption.isOptimisticPersonalDetail);
        Navigation.dismissModal();
    };

    const sections: Sections[] = [];
    if (areOptionsInitialized) {
        if (availableOptions.selectedOptions.length > 0) {
            sections.push({
                title: undefined,
                data: availableOptions.selectedOptions,
                sectionIndex: 0,
            });
        }

        if (availableOptions.personalDetails.length > 0) {
            sections.push({
                title: translate('common.contacts'),
                data: availableOptions.personalDetails,
                sectionIndex: 1,
            });
        }

        if (availableOptions.userToInvite) {
            sections.push({
                title: undefined,
                data: [availableOptions.userToInvite],
                sectionIndex: 2,
            });
        }
    }

    const footerContent = (
        <FormAlertWithSubmitButton
            isDisabled={selectedOptions.length === 0}
            isAlertVisible={false}
            buttonText={translate('common.invite')}
            onSubmit={inviteUser}
            containerStyles={[styles.flexReset, styles.flexGrow0, styles.flexShrink0, styles.flexBasisAuto]}
            enabledWhenOffline
        />
    );

    const headerMessage = () => {
        if (sections.length > 0) {
            return '';
        }
        const searchValue = debouncedSearchTerm.trim().toLowerCase();
        if (CONST.EXPENSIFY_EMAILS_OBJECT[searchValue]) {
            return translate('messages.errorMessageInvalidEmail');
        }
        if (excludedUsers[parsePhoneNumber(appendCountryCode(searchValue, countryCode)).possible ? addSMSDomainIfPhoneNumber(appendCountryCode(searchValue, countryCode)) : searchValue]) {
            return translate('messages.userIsAlreadyAnAdmin', searchValue, domainName ?? '');
        }
        return getHeaderMessage(translate, searchValue, countryCode);
    };

    const textInputOptions = {
        label: translate('selectionList.nameEmailOrPhoneNumber'),
        value: searchTerm,
        onChangeText: setSearchTerm,
        headerMessage: headerMessage(),
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
                <SelectionListWithSections
                    sections={sections}
                    ListItem={SingleSelectWithAvatarListItem}
                    shouldSingleExecuteRowSelect
                    onSelectRow={toggleSelection}
                    textInputOptions={textInputOptions}
                    confirmButtonOptions={{
                        onConfirm: inviteUser,
                    }}
                    shouldShowLoadingPlaceholder={!areOptionsInitialized || !didScreenTransitionEnd}
                    shouldPreventDefaultFocusOnSelectRow={!canUseTouchScreen()}
                    footerContent={footerContent}
                    isLoadingNewOptions={!!isSearchingForReports}
                    addBottomSafeAreaPadding
                    shouldShowTextInput
                    disableMaintainingScrollPosition
                />
            </ScreenWrapper>
        </DomainNotFoundPageWrapper>
    );
}

DomainAddAdminPage.displayName = 'DomainAddAdminPage';

export default DomainAddAdminPage;
