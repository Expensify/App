import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import type {SectionListData} from 'react-native';
import FormAlertWithSubmitButton from '@components/FormAlertWithSubmitButton';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import {usePersonalDetailsOptionsList} from '@components/PersonalDetailsOptionListContextProvider';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import InviteMemberListItem from '@components/SelectionList/InviteMemberListItem';
import type {Section} from '@components/SelectionList/types';
import withNavigationTransitionEnd from '@components/withNavigationTransitionEnd';
import type {WithNavigationTransitionEndProps} from '@components/withNavigationTransitionEnd';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useDebouncedState from '@hooks/useDebouncedState';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import {setWorkspaceInviteMembersDraft} from '@libs/actions/Policy/Member';
import {clearErrors, openWorkspaceInvitePage as policyOpenWorkspaceInvitePage, setWorkspaceErrors} from '@libs/actions/Policy/Policy';
import {searchInServer} from '@libs/actions/Report';
import {READ_COMMANDS} from '@libs/API/types';
import {canUseTouchScreen} from '@libs/DeviceCapabilities';
import HttpUtils from '@libs/HttpUtils';
import {appendCountryCode} from '@libs/LoginUtils';
import memoize from '@libs/memoize';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {OptionData} from '@libs/PersonalDetailsOptionsListUtils';
import {getHeaderMessage, getUserToInviteOption, getValidOptions} from '@libs/PersonalDetailsOptionsListUtils';
import {addSMSDomainIfPhoneNumber, parsePhoneNumber} from '@libs/PhoneNumber';
import {getIneligibleInvitees, getMemberAccountIDsForWorkspace, goBackFromInvalidPolicy} from '@libs/PolicyUtils';
import type {SettingsNavigatorParamList} from '@navigation/types';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {InvitedEmailsToAccountIDs} from '@src/types/onyx';
import type {Errors} from '@src/types/onyx/OnyxCommon';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';
import AccessOrNotFoundWrapper from './AccessOrNotFoundWrapper';
import withPolicyAndFullscreenLoading from './withPolicyAndFullscreenLoading';
import type {WithPolicyAndFullscreenLoadingProps} from './withPolicyAndFullscreenLoading';

type MembersSection = SectionListData<OptionData, Section<OptionData>>;

type WorkspaceInvitePageProps = WithPolicyAndFullscreenLoadingProps &
    WithNavigationTransitionEndProps &
    PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.INVITE>;

const memoizedGetValidOptions = memoize(getValidOptions, {maxSize: 5, monitoringName: 'WorkspaceInvitePage.getValidOptions'});

const defaultListOptions = {
    userToInvite: null,
    recentOptions: [],
    personalDetails: [],
    selectedOptions: [],
};
function WorkspaceInvitePage({route, policy}: WorkspaceInvitePageProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {login: currentLogin} = useCurrentUserPersonalDetails();
    const [searchTerm, debouncedSearchTerm, setSearchTerm] = useDebouncedState('');
    const [selectedLogins, setSelectedLogins] = useState<Set<string>>(new Set());
    const [extraOptions, setExtraOptions] = useState<OptionData[]>([]);
    const [didScreenTransitionEnd, setDidScreenTransitionEnd] = useState(false);
    const [isSearchingForReports] = useOnyx(ONYXKEYS.IS_SEARCHING_FOR_REPORTS, {initWithStoredValues: false});
    const firstRenderRef = useRef(true);
    const [invitedEmailsToAccountIDsDraft, invitedEmailsToAccountIDsDraftMetadata] = useOnyx(`${ONYXKEYS.COLLECTION.WORKSPACE_INVITE_MEMBERS_DRAFT}${route.params.policyID}`);
    const isLoading = isLoadingOnyxValue(invitedEmailsToAccountIDsDraftMetadata);

    const openWorkspaceInvitePage = () => {
        const policyMemberEmailsToAccountIDs = getMemberAccountIDsForWorkspace(policy?.employeeList);
        policyOpenWorkspaceInvitePage(route.params.policyID, Object.keys(policyMemberEmailsToAccountIDs));
    };
    const {options, areOptionsInitialized} = usePersonalDetailsOptionsList({
        shouldInitialize: didScreenTransitionEnd,
    });

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

    const loginToAccountIDMap = useMemo(() => {
        const map: Record<string, number> = {};
        for (const option of extraOptions) {
            const login = option.login;
            if (login) {
                map[login] = option.accountID;
            }
        }
        for (const option of options) {
            const login = option.login;
            if (login) {
                map[login] = option.accountID;
            }
        }
        return map;
    }, [extraOptions, options]);

    const transformedOptions = useMemo(
        () =>
            options.map((option) => ({
                ...option,
                isSelected: selectedLogins.has(option.login ?? ''),
            })),
        [options, selectedLogins],
    );

    const optionsList = useMemo(() => {
        if (!areOptionsInitialized) {
            return defaultListOptions;
        }
        return memoizedGetValidOptions(transformedOptions, currentLogin ?? '', {
            excludeLogins: excludedUsers,
            extraOptions,
            includeRecentReports: false,
            searchString: debouncedSearchTerm,
            includeCurrentUser: false,
            includeUserToInvite: true,
        });
    }, [areOptionsInitialized, currentLogin, debouncedSearchTerm, excludedUsers, extraOptions, transformedOptions]);

    useEffect(() => {
        if (isLoading || !areOptionsInitialized || !firstRenderRef.current) {
            return;
        }
        firstRenderRef.current = false;
        const existingSelectedLoginsSet = new Set(Object.keys(invitedEmailsToAccountIDsDraft ?? {}).filter((login) => !excludedUsers[login]));
        if (existingSelectedLoginsSet.size === 0) {
            return;
        }
        const existingLogins = new Set(options.map((option) => option.login ?? ''));
        const newUserLogins = existingSelectedLoginsSet.difference(existingLogins);
        if (newUserLogins.size === 0) {
            setSelectedLogins(existingSelectedLoginsSet);
            return;
        }
        const extraLogins: OptionData[] = [];
        for (const newLogin of newUserLogins) {
            const userToInvite = getUserToInviteOption({searchValue: newLogin});
            if (userToInvite) {
                extraLogins.push({
                    ...userToInvite,
                    isSelected: true,
                });
            }
        }
        setExtraOptions(extraLogins);
        setSelectedLogins(existingSelectedLoginsSet);
    }, [areOptionsInitialized, excludedUsers, invitedEmailsToAccountIDsDraft, isLoading, options]);

    const sections: MembersSection[] = useMemo(() => {
        const sectionsArr: MembersSection[] = [];

        if (!areOptionsInitialized) {
            return [];
        }

        if (optionsList.userToInvite) {
            sectionsArr.push({
                title: undefined,
                data: [optionsList.userToInvite],
                shouldShow: true,
            });
        } else {
            if (optionsList.selectedOptions.length > 0) {
                sectionsArr.push({
                    title: undefined,
                    data: optionsList.selectedOptions,
                    shouldShow: true,
                });
            }
            if (optionsList.personalDetails.length > 0) {
                sectionsArr.push({
                    title: translate('common.contacts'),
                    data: optionsList.personalDetails,
                    shouldShow: true,
                });
            }
        }
        return sectionsArr;
    }, [areOptionsInitialized, optionsList.userToInvite, optionsList.selectedOptions, optionsList.personalDetails, translate]);

    const [policyName, shouldShowAlertPrompt] = useMemo(() => [policy?.name ?? '', !isEmptyObject(policy?.errors) || !!policy?.alertMessage], [policy]);

    const headerMessage = useMemo(() => {
        if (sections.length > 0) {
            return '';
        }
        const searchValue = debouncedSearchTerm.trim().toLowerCase();
        if (CONST.EXPENSIFY_EMAILS_OBJECT[searchValue]) {
            return translate('messages.errorMessageInvalidEmail');
        }
        if (excludedUsers[parsePhoneNumber(appendCountryCode(searchValue)).possible ? addSMSDomainIfPhoneNumber(appendCountryCode(searchValue)) : searchValue]) {
            return translate('messages.userIsAlreadyMember', {login: searchValue, name: policyName});
        }
        return getHeaderMessage(translate, searchValue);
    }, [sections.length, debouncedSearchTerm, excludedUsers, translate, policyName]);

    const existingLogins = useMemo(() => new Set(options.map((option) => option.login ?? '')), [options]);

    const toggleOption = (option: OptionData) => {
        clearErrors(route.params.policyID);
        const isSelected = selectedLogins.has(option.login ?? '');

        if (isSelected) {
            // If the option is selected, remove it from the selected logins
            const isInExtraOption = extraOptions.some((extraOption) => extraOption.login === option.login);
            if (isInExtraOption) {
                setExtraOptions((prev) => prev.filter((extraOption) => extraOption.login !== option.login));
            }
            setSelectedLogins((prev) => new Set([...prev].filter((login) => login !== option.login)));
        } else {
            setSelectedLogins((prev) => new Set([...prev, option.login ?? '']));
            if (!existingLogins.has(option.login ?? '')) {
                setExtraOptions((prev) => [...prev, {...option, isSelected: true}]);
            }
        }
    };

    const validSelectedLogins = useMemo(() => Array.from(selectedLogins).filter((login) => !excludedUsers[login]), [excludedUsers, selectedLogins]);

    const inviteUser = useCallback(() => {
        const errors: Errors = {};
        if (validSelectedLogins.length <= 0) {
            errors.noUserSelected = 'true';
        }

        setWorkspaceErrors(route.params.policyID, errors);
        const isValid = isEmptyObject(errors);

        if (!isValid) {
            return;
        }
        HttpUtils.cancelPendingRequests(READ_COMMANDS.SEARCH_FOR_REPORTS);

        const invitedEmailsToAccountIDs: InvitedEmailsToAccountIDs = {};
        for (const login of validSelectedLogins) {
            const accountID = loginToAccountIDMap[login] ?? CONST.DEFAULT_NUMBER_ID;
            invitedEmailsToAccountIDs[login] = accountID;
        }
        setWorkspaceInviteMembersDraft(route.params.policyID, invitedEmailsToAccountIDs);
        Navigation.navigate(ROUTES.WORKSPACE_INVITE_MESSAGE.getRoute(route.params.policyID, Navigation.getActiveRoute()));
    }, [validSelectedLogins, loginToAccountIDMap, route.params.policyID]);

    const footerContent = useMemo(
        () => (
            <FormAlertWithSubmitButton
                isDisabled={!validSelectedLogins.length}
                isAlertVisible={shouldShowAlertPrompt}
                buttonText={translate('common.next')}
                onSubmit={inviteUser}
                message={policy?.alertMessage ?? ''}
                containerStyles={[styles.flexReset, styles.flexGrow0, styles.flexShrink0, styles.flexBasisAuto]}
                enabledWhenOffline
            />
        ),
        [inviteUser, policy?.alertMessage, shouldShowAlertPrompt, styles.flexBasisAuto, styles.flexGrow0, styles.flexReset, styles.flexShrink0, translate, validSelectedLogins.length],
    );

    useEffect(() => {
        searchInServer(debouncedSearchTerm);
    }, [debouncedSearchTerm]);

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
                        Navigation.goBack();
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
                    onSelectRow={toggleOption}
                    onConfirm={inviteUser}
                    showScrollIndicator
                    showLoadingPlaceholder={!areOptionsInitialized || !didScreenTransitionEnd}
                    shouldPreventDefaultFocusOnSelectRow={!canUseTouchScreen()}
                    footerContent={footerContent}
                    isLoadingNewOptions={!!isSearchingForReports}
                    addBottomSafeAreaPadding
                />
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

WorkspaceInvitePage.displayName = 'WorkspaceInvitePage';

export default withNavigationTransitionEnd(withPolicyAndFullscreenLoading(WorkspaceInvitePage));
