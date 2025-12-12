import {Str} from 'expensify-common';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import type {SectionListData} from 'react-native';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import FormAlertWithSubmitButton from '@components/FormAlertWithSubmitButton';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionListWithSections';
import InviteMemberListItem from '@components/SelectionListWithSections/InviteMemberListItem';
import type {Section} from '@components/SelectionListWithSections/types';
import type {WithNavigationTransitionEndProps} from '@components/withNavigationTransitionEnd';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useSearchSelector from '@hooks/useSearchSelector';
import useThemeStyles from '@hooks/useThemeStyles';
import {searchInServer} from '@libs/actions/Report';
import {canUseTouchScreen} from '@libs/DeviceCapabilities';
import {selectAdminIDs} from '@libs/DomainUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {OptionData} from '@libs/ReportUtils';
import type {SettingsNavigatorParamList} from '@navigation/types';
import {addAdminToDomain} from '@userActions/Domain';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';

type Sections = SectionListData<OptionData, Section<OptionData>>;

type DomainAddAdminProps = WithNavigationTransitionEndProps & PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.DOMAIN.ADD_ADMIN>;

function DomainAddAdminPage({route}: DomainAddAdminProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [didScreenTransitionEnd, setDidScreenTransitionEnd] = useState(false);
    const [isSearchingForReports] = useOnyx(ONYXKEYS.IS_SEARCHING_FOR_REPORTS, {initWithStoredValues: false, canBeMissing: true});
    const [actualSelectedUser, setActualSelectedUser] = useState<OptionData | null>(null);
    const domainID = route.params.accountID;
    const [domain, domainMetaData] = useOnyx(`${ONYXKEYS.COLLECTION.DOMAIN}${domainID}`, {canBeMissing: true});
    const domainName = domain ? Str.extractEmailDomain(domain.email) : undefined;
    const [adminIDs] = useOnyx(`${ONYXKEYS.COLLECTION.DOMAIN}${domainID}`, {
        canBeMissing: true,
        selector: selectAdminIDs,
    });
    const {searchTerm, setSearchTerm, availableOptions, toggleSelection, areOptionsInitialized, onListEndReached} = useSearchSelector({
        selectionMode: CONST.SEARCH_SELECTOR.SELECTION_MODE_SINGLE,
        searchContext: CONST.SEARCH_SELECTOR.SEARCH_CONTEXT_MEMBER_INVITE,
        includeUserToInvite: true,
        includeRecentReports: false,
        shouldInitialize: didScreenTransitionEnd,
        onSingleSelect: (option) => {
            const result = {...option, isSelected: true};
            setActualSelectedUser(result);
        },
    });

    const handleToggleSelection = useCallback(
        (option: OptionData) => {
            toggleSelection(option);
        },
        [toggleSelection],
    );

    const sections: Sections[] = useMemo(() => {
        const sectionsArr: Sections[] = [];

        if (!areOptionsInitialized) {
            return [];
        }

        if (actualSelectedUser) {
            sectionsArr.push({
                title: undefined,
                data: [actualSelectedUser],
            });
        }

        const filteredPersonalDetails = availableOptions.personalDetails
            .filter((option) => option.accountID !== actualSelectedUser?.accountID)
            .filter((option) => option.accountID && !adminIDs?.includes(option.accountID));

        if (filteredPersonalDetails.length > 0) {
            sectionsArr.push({
                title: translate('common.contacts'),
                data: filteredPersonalDetails,
            });
        }

        if (availableOptions.userToInvite) {
            const isSelected = actualSelectedUser?.login === availableOptions.userToInvite.login;

            if (!isSelected) {
                sectionsArr.push({
                    title: undefined,
                    data: [availableOptions.userToInvite],
                });
            }
        }

        return sectionsArr;
    }, [areOptionsInitialized, actualSelectedUser, availableOptions.personalDetails, availableOptions.userToInvite, translate]);

    const inviteUser = useCallback(() => {
        if (!actualSelectedUser || !actualSelectedUser.accountID || !actualSelectedUser.login || !domainName) {
            return;
        }

        addAdminToDomain(domainID, actualSelectedUser.accountID, actualSelectedUser.login, domainName);
        Navigation.dismissModal();
    }, [actualSelectedUser, domainID, domainName]);

    const footerContent = useMemo(
        () => (
            <FormAlertWithSubmitButton
                isDisabled={!actualSelectedUser}
                isAlertVisible={false}
                buttonText={translate('domain.admins.invite')}
                onSubmit={inviteUser}
                containerStyles={[styles.flexReset, styles.flexGrow0, styles.flexShrink0, styles.flexBasisAuto]}
                enabledWhenOffline
            />
        ),
        [actualSelectedUser, inviteUser, styles.flexBasisAuto, styles.flexGrow0, styles.flexReset, styles.flexShrink0, translate],
    );

    useEffect(() => {
        searchInServer(searchTerm);
    }, [searchTerm]);

    return (
        <ScreenWrapper
            shouldEnableMaxHeight
            shouldUseCachedViewportHeight
            testID={DomainAddAdminPage.displayName}
            enableEdgeToEdgeBottomSafeAreaPadding
            onEntryTransitionEnd={() => setDidScreenTransitionEnd(true)}
        >
            <FullPageNotFoundView
                onBackButtonPress={() => Navigation.goBack(ROUTES.WORKSPACES_LIST.route)}
                shouldShow={!isLoadingOnyxValue(domainMetaData) && !domain}
                shouldForceFullScreen
            >
                <HeaderWithBackButton
                    title={translate('domain.admins.addAdmin')}
                    onBackButtonPress={() => {
                        Navigation.goBack(ROUTES.DOMAIN_ADMINS.getRoute(domainID));
                    }}
                />
                <SelectionList
                    canSelectMultiple
                    sections={sections}
                    ListItem={InviteMemberListItem}
                    textInputLabel={translate('selectionList.nameEmailOrPhoneNumber')}
                    textInputValue={searchTerm}
                    onChangeText={(value) => {
                        setSearchTerm(value);
                    }}
                    onSelectRow={handleToggleSelection}
                    onConfirm={inviteUser}
                    showScrollIndicator
                    showLoadingPlaceholder={!areOptionsInitialized || !didScreenTransitionEnd}
                    shouldPreventDefaultFocusOnSelectRow={!canUseTouchScreen()}
                    footerContent={footerContent}
                    isLoadingNewOptions={!!isSearchingForReports}
                    addBottomSafeAreaPadding
                    onEndReached={onListEndReached}
                />
            </FullPageNotFoundView>
        </ScreenWrapper>
    );
}

DomainAddAdminPage.displayName = 'WorkspaceInvitePage';

export default DomainAddAdminPage;
