import React, {useCallback, useEffect, useMemo, useState} from 'react';
import type {SectionListData} from 'react-native';
import FormAlertWithSubmitButton from '@components/FormAlertWithSubmitButton';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionListWithSections';
import InviteMemberListItem from '@components/SelectionListWithSections/InviteMemberListItem';
import type {Section} from '@components/SelectionListWithSections/types';
import withNavigationTransitionEnd from '@components/withNavigationTransitionEnd';
import type {WithNavigationTransitionEndProps} from '@components/withNavigationTransitionEnd';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import useSearchSelector from '@hooks/useSearchSelector';
import useThemeStyles from '@hooks/useThemeStyles';
import {setWorkspaceInviteMembersDraft} from '@libs/actions/Policy/Member';
import {clearErrors, openWorkspaceInvitePage as policyOpenWorkspaceInvitePage, setWorkspaceErrors} from '@libs/actions/Policy/Policy';
import {searchInServer} from '@libs/actions/Report';
import {READ_COMMANDS} from '@libs/API/types';
import {canUseTouchScreen} from '@libs/DeviceCapabilities';
import HttpUtils from '@libs/HttpUtils';
import {appendCountryCode} from '@libs/LoginUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import {getHeaderMessage} from '@libs/OptionsListUtils';
import {addSMSDomainIfPhoneNumber, parsePhoneNumber} from '@libs/PhoneNumber';
import {getIneligibleInvitees, getMemberAccountIDsForWorkspace, goBackFromInvalidPolicy} from '@libs/PolicyUtils';
import type {OptionData} from '@libs/ReportUtils';
import type {SettingsNavigatorParamList} from '@navigation/types';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {InvitedEmailsToAccountIDs} from '@src/types/onyx';
import type {Errors} from '@src/types/onyx/OnyxCommon';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import AccessOrNotFoundWrapper from './AccessOrNotFoundWrapper';
import withPolicyAndFullscreenLoading from './withPolicyAndFullscreenLoading';
import type {WithPolicyAndFullscreenLoadingProps} from './withPolicyAndFullscreenLoading';

type Sections = SectionListData<OptionData, Section<OptionData>>;

type WorkspaceInvitePageProps = WithPolicyAndFullscreenLoadingProps &
    WithNavigationTransitionEndProps &
    PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.INVITE>;

function WorkspaceInvitePage({route, policy}: WorkspaceInvitePageProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [didScreenTransitionEnd, setDidScreenTransitionEnd] = useState(false);
    const [isSearchingForReports] = useOnyx(ONYXKEYS.IS_SEARCHING_FOR_REPORTS, {initWithStoredValues: false, canBeMissing: true});
    const [countryCode = CONST.DEFAULT_COUNTRY_CODE] = useOnyx(ONYXKEYS.COUNTRY_CODE, {canBeMissing: false});
    const openWorkspaceInvitePage = () => {
        const policyMemberEmailsToAccountIDs = getMemberAccountIDsForWorkspace(policy?.employeeList);
        policyOpenWorkspaceInvitePage(route.params.policyID, Object.keys(policyMemberEmailsToAccountIDs));
    };

    useEffect(() => {
        clearErrors(route.params.policyID);
        openWorkspaceInvitePage();
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps -- policyID changes remount the component
    }, []);

    useNetwork({onReconnect: openWorkspaceInvitePage});

    const excludedUsers = useMemo(() => {
        const ineligibleInvites = getIneligibleInvitees(policy?.employeeList);
        return ineligibleInvites.reduce(
            (acc, login) => {
                acc[login] = true;
                return acc;
            },
            {} as Record<string, boolean>,
        );
    }, [policy?.employeeList]);

    const {searchTerm, setSearchTerm, availableOptions, selectedOptions, selectedOptionsForDisplay, toggleSelection, areOptionsInitialized, onListEndReached, searchOptions} =
        useSearchSelector({
            selectionMode: CONST.SEARCH_SELECTOR.SELECTION_MODE_MULTI,
            searchContext: CONST.SEARCH_SELECTOR.SEARCH_CONTEXT_MEMBER_INVITE,
            includeUserToInvite: true,
            excludeLogins: excludedUsers,
            includeRecentReports: false,
            shouldInitialize: didScreenTransitionEnd,
        });

    const sections: Sections[] = useMemo(() => {
        const sectionsArr: Sections[] = [];

        if (!areOptionsInitialized) {
            return [];
        }

        // Selected options section
        if (selectedOptionsForDisplay.length > 0) {
            sectionsArr.push({
                title: undefined,
                data: selectedOptionsForDisplay,
            });
        }

        // Contacts section
        if (availableOptions.personalDetails.length > 0) {
            sectionsArr.push({
                title: translate('common.contacts'),
                data: availableOptions.personalDetails,
            });
        }

        // User to invite section
        if (availableOptions.userToInvite) {
            sectionsArr.push({
                title: undefined,
                data: [availableOptions.userToInvite],
            });
        }

        return sectionsArr;
    }, [areOptionsInitialized, selectedOptionsForDisplay, availableOptions.personalDetails.length, availableOptions.userToInvite, translate]);

    const handleToggleSelection = useCallback(
        (option: OptionData) => {
            toggleSelection(option);
        },
        [toggleSelection],
    );

    const inviteUser = useCallback(() => {
        const errors: Errors = {};
        if (selectedOptions.length <= 0) {
            errors.noUserSelected = 'true';
        }

        setWorkspaceErrors(route.params.policyID, errors);
        const isValid = isEmptyObject(errors);

        if (!isValid) {
            return;
        }
        HttpUtils.cancelPendingRequests(READ_COMMANDS.SEARCH_FOR_REPORTS);

        const invitedEmailsToAccountIDs: InvitedEmailsToAccountIDs = {};
        for (const option of selectedOptions) {
            const login = option.login ?? '';
            const accountID = option.accountID ?? CONST.DEFAULT_NUMBER_ID;
            if (!login.toLowerCase().trim() || !accountID) {
                continue;
            }
            invitedEmailsToAccountIDs[login] = Number(accountID);
        }
        setWorkspaceInviteMembersDraft(route.params.policyID, invitedEmailsToAccountIDs);
        Navigation.navigate(ROUTES.WORKSPACE_INVITE_MESSAGE.getRoute(route.params.policyID, Navigation.getActiveRoute()));
    }, [route.params.policyID, selectedOptions]);

    const [policyName, shouldShowAlertPrompt] = useMemo(
        () => [policy?.name ?? '', !isEmptyObject(policy?.errors) || !!policy?.alertMessage],
        [policy?.name, policy?.errors, policy?.alertMessage],
    );

    const headerMessage = useMemo(() => {
        const searchValue = searchTerm.trim().toLowerCase();
        if (!availableOptions.userToInvite && CONST.EXPENSIFY_EMAILS_OBJECT[searchValue]) {
            return translate('messages.errorMessageInvalidEmail');
        }
        if (
            !availableOptions.userToInvite &&
            excludedUsers[parsePhoneNumber(appendCountryCode(searchValue, countryCode)).possible ? addSMSDomainIfPhoneNumber(appendCountryCode(searchValue, countryCode)) : searchValue]
        ) {
            return translate('messages.userIsAlreadyMember', {login: searchValue, name: policyName});
        }
        return getHeaderMessage(searchOptions.personalDetails.length + selectedOptions.length !== 0, !!searchOptions.userToInvite, searchValue, countryCode, false);
    }, [
        searchTerm,
        availableOptions.userToInvite,
        excludedUsers,
        countryCode,
        searchOptions.personalDetails.length,
        searchOptions.userToInvite,
        selectedOptions.length,
        translate,
        policyName,
    ]);

    const footerContent = useMemo(
        () => (
            <FormAlertWithSubmitButton
                isDisabled={!selectedOptions.length}
                isAlertVisible={shouldShowAlertPrompt}
                buttonText={translate('common.next')}
                onSubmit={inviteUser}
                message={policy?.alertMessage ?? ''}
                containerStyles={[styles.flexReset, styles.flexGrow0, styles.flexShrink0, styles.flexBasisAuto]}
                enabledWhenOffline
            />
        ),
        [inviteUser, policy?.alertMessage, selectedOptions.length, shouldShowAlertPrompt, styles.flexBasisAuto, styles.flexGrow0, styles.flexReset, styles.flexShrink0, translate],
    );

    useEffect(() => {
        searchInServer(searchTerm);
    }, [searchTerm]);

    return (
        <AccessOrNotFoundWrapper
            policyID={route.params.policyID}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN]}
            fullPageNotFoundViewProps={{subtitleKey: isEmptyObject(policy) ? undefined : 'workspace.common.notAuthorized', onLinkPress: goBackFromInvalidPolicy}}
        >
            <ScreenWrapper
                shouldEnableMaxHeight
                shouldUseCachedViewportHeight
                testID={WorkspaceInvitePage.displayName}
                enableEdgeToEdgeBottomSafeAreaPadding
                onEntryTransitionEnd={() => setDidScreenTransitionEnd(true)}
            >
                <HeaderWithBackButton
                    title={translate('workspace.invite.invitePeople')}
                    subtitle={policyName}
                    onBackButtonPress={() => {
                        clearErrors(route.params.policyID);
                        Navigation.goBack(route.params.backTo);
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
                    headerMessage={headerMessage}
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
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

WorkspaceInvitePage.displayName = 'WorkspaceInvitePage';

export default withNavigationTransitionEnd(withPolicyAndFullscreenLoading(WorkspaceInvitePage));
