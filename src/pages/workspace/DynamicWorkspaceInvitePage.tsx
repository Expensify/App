import FormAlertWithSubmitButton from '@components/FormAlertWithSubmitButton';
import FullscreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import InviteMemberListItem from '@components/SelectionList/ListItem/InviteMemberListItem';
import SelectionListWithSections from '@components/SelectionList/SelectionListWithSections';
import type {Section} from '@components/SelectionList/SelectionListWithSections/types';
import withNavigationTransitionEnd from '@components/withNavigationTransitionEnd';

import useDynamicBackPath from '@hooks/useDynamicBackPath';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import {usePersonalDetailsByLogins} from '@hooks/usePersonalDetailByLogin';
import {useAllPersonalDetails} from '@hooks/usePersonalDetails';
import usePersonalDetailSearchSelector from '@hooks/usePersonalDetailSearchSelector';
import useThemeStyles from '@hooks/useThemeStyles';

import {openAgentsPage} from '@libs/actions/Agent';
import {setWorkspaceInviteMembersDraft} from '@libs/actions/Policy/Member';
import {clearErrors, openWorkspaceInvitePage as policyOpenWorkspaceInvitePage} from '@libs/actions/Policy/Policy';
import {searchUserInServer} from '@libs/actions/Report';
import {agentAccountIDsSelector} from '@libs/AgentUtils';
import {READ_COMMANDS} from '@libs/API/types';
import {canUseTouchScreen} from '@libs/DeviceCapabilities';
import getPlatform from '@libs/getPlatform';
import HttpUtils from '@libs/HttpUtils';
import {appendCountryCode} from '@libs/LoginUtils';
import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import {getHeaderMessage, getUserToInviteOption} from '@libs/PersonalDetailOptionsListUtils';
import type {OptionData} from '@libs/PersonalDetailOptionsListUtils';
import {addSMSDomainIfPhoneNumber, parsePhoneNumber} from '@libs/PhoneNumber';
import {getIneligibleInvitees, getMemberAccountIDsForWorkspace, getSoftExclusionsForGuideAndAccountManager, goBackFromInvalidPolicy} from '@libs/PolicyUtils';

import type {SettingsNavigatorParamList} from '@navigation/types';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {DYNAMIC_ROUTES} from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {InvitedEmailsToAccountIDs, Policy} from '@src/types/onyx';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';

import type {OnyxEntry} from 'react-native-onyx';

import React, {useEffect, useState} from 'react';
import {Keyboard} from 'react-native';

import AccessOrNotFoundWrapper from './AccessOrNotFoundWrapper';

type WorkspaceInvitePageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.DYNAMIC_WORKSPACE_INVITE>;

type WorkspaceInvitePageContentProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.DYNAMIC_WORKSPACE_INVITE> & {
    policy: OnyxEntry<Policy>;
    invitedEmailsToAccountIDsDraft: OnyxEntry<InvitedEmailsToAccountIDs>;
};

function DynamicWorkspaceInvitePageContent({route, policy, invitedEmailsToAccountIDsDraft}: WorkspaceInvitePageContentProps) {
    const styles = useThemeStyles();
    const {translate, formatPhoneNumber} = useLocalize();
    const dynamicBackPath = useDynamicBackPath(DYNAMIC_ROUTES.WORKSPACE_INVITE.path);
    const [didScreenTransitionEnd, setDidScreenTransitionEnd] = useState(false);
    const [isSearchingForUsers] = useOnyx(ONYXKEYS.RAM_ONLY_IS_SEARCHING_FOR_USERS);
    const [countryCode = CONST.DEFAULT_COUNTRY_CODE] = useOnyx(ONYXKEYS.COUNTRY_CODE);
    const [personalDetails] = useAllPersonalDetails();
    const [account] = useOnyx(ONYXKEYS.ACCOUNT);
    const employeePersonalDetails = usePersonalDetailsByLogins(Object.keys(policy?.employeeList ?? {}));
    const [agentsAccountIDs] = useOnyx(ONYXKEYS.COLLECTION.AGENT, {selector: agentAccountIDsSelector});

    const openWorkspaceInvitePage = () => {
        const policyMemberEmailsToAccountIDs = getMemberAccountIDsForWorkspace(policy?.employeeList, employeePersonalDetails);
        policyOpenWorkspaceInvitePage(route.params.policyID, Object.keys(policyMemberEmailsToAccountIDs));

        // The OpenWorkspaceInvitePage is only returning the policy members
        // and on deep link the agent_ collection is empty resulting in `agentsWhitelist: []`
        // making the user unable to invite their agents unless they visit the Agents page first
        // Will be removed in https://github.com/Expensify/Expensify/issues/694677
        openAgentsPage();
    };

    useEffect(() => {
        clearErrors(route.params.policyID);
        openWorkspaceInvitePage();
        // eslint-disable-next-line react-hooks/exhaustive-deps -- policyID changes remount the component
    }, []);

    useNetwork({onReconnect: openWorkspaceInvitePage});

    const ineligibleInvites = getIneligibleInvitees(policy?.employeeList);
    const excludedUsers = ineligibleInvites.reduce(
        (acc, login) => {
            acc[login] = true;
            return acc;
        },
        {} as Record<string, boolean>,
    );

    const softExclusions = getSoftExclusionsForGuideAndAccountManager(policy, account?.accountManagerAccountID, personalDetails);

    const initialSelected = new Set(Object.values(invitedEmailsToAccountIDsDraft ?? {}).map(String));

    let initialExtraOptions: OptionData[];
    if (!invitedEmailsToAccountIDsDraft) {
        initialExtraOptions = [];
    } else {
        const filteredNewEmails = [];
        for (const [email, accountID] of Object.entries(invitedEmailsToAccountIDsDraft)) {
            if (!email.toLowerCase().trim() || !accountID) {
                continue;
            }
            const personalDetail = personalDetails?.[accountID];
            if (personalDetail) {
                continue;
            }
            filteredNewEmails.push(email);
        }
        const newOptions: OptionData[] = [];
        for (const email of filteredNewEmails) {
            const option = getUserToInviteOption({
                searchValue: email,
                countryCode,
                formatPhoneNumber,
                loginList: {},
                loginsToExclude: excludedUsers,
            });
            if (option) {
                newOptions.push({
                    ...option,
                    isSelected: true,
                });
            }
        }
        initialExtraOptions = newOptions;
    }

    const {searchTerm, debouncedSearchTerm, setSearchTerm, availableOptions, selectedOptions, selectedNonExistingOptions, toggleSelection, areOptionsInitialized} =
        usePersonalDetailSearchSelector({
            selectionMode: CONST.SEARCH_SELECTOR.SELECTION_MODE_MULTI,
            includeUserToInvite: true,
            excludeLogins: excludedUsers,
            excludeFromSuggestionsOnly: softExclusions,
            includeRecentReports: false,
            shouldInitialize: didScreenTransitionEnd,
            initialSelected,
            initialExtraOptions,
            shouldKeepSelectedInAvailableOptions: true,
            agentsWhitelist: new Set(agentsAccountIDs),
        });

    let sections: Array<Section<OptionData>>;
    const sectionsArr = [];
    if (!areOptionsInitialized) {
        sections = [];
    } else {
        // Selected non-existing users section (top)
        if (selectedNonExistingOptions.length > 0) {
            sectionsArr.push({
                title: undefined,
                data: selectedNonExistingOptions,
                sectionIndex: 0,
            });
        }

        // Contacts section (includes both selected and unselected items)
        if (availableOptions.personalDetails.length > 0) {
            sectionsArr.push({
                title: translate('common.contacts'),
                data: availableOptions.personalDetails,
                sectionIndex: 1,
            });
        }

        // User to invite section (hide if already selected and shown in the top section)
        if (availableOptions.userToInvite && !availableOptions.userToInvite.isSelected) {
            sectionsArr.push({
                title: undefined,
                data: [availableOptions.userToInvite],
                sectionIndex: 2,
            });
        }
        sections = sectionsArr;
    }

    const handleToggleSelection = (option: OptionData) => {
        toggleSelection(option);
    };

    const inviteUser = () => {
        Keyboard.dismiss();
        HttpUtils.cancelPendingRequests(READ_COMMANDS.SEARCH_FOR_USERS);

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
        Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.WORKSPACE_INVITE_MESSAGE.path));
    };

    const [policyName, shouldShowAlertPrompt] = [policy?.name ?? '', !isEmptyObject(policy?.errors)];

    let headerMessage;
    if (sections.length > 0) {
        headerMessage = '';
    } else {
        const searchValue = debouncedSearchTerm.trim().toLowerCase();
        if (CONST.EXPENSIFY_EMAILS_OBJECT[searchValue]) {
            headerMessage = translate('messages.errorMessageInvalidEmail');
        } else if (
            excludedUsers[parsePhoneNumber(appendCountryCode(searchValue, countryCode)).possible ? addSMSDomainIfPhoneNumber(appendCountryCode(searchValue, countryCode)) : searchValue]
        ) {
            headerMessage = translate('messages.userIsAlreadyMember', searchValue, policyName);
        } else {
            headerMessage = getHeaderMessage(translate, searchValue, countryCode);
        }
    }

    const footerContent = (
        <FormAlertWithSubmitButton
            isDisabled={!selectedOptions.length}
            isAlertVisible={shouldShowAlertPrompt}
            buttonText={translate('common.next')}
            onSubmit={inviteUser}
            containerStyles={[styles.flexReset, styles.flexGrow0, styles.flexShrink0, styles.flexBasisAuto]}
            enabledWhenOffline
        />
    );

    useEffect(() => {
        searchUserInServer(debouncedSearchTerm);
    }, [debouncedSearchTerm]);

    const textInputOptions = {
        label: translate('selectionList.nameEmailOrPhoneNumber'),
        value: searchTerm,
        onChangeText: setSearchTerm,
        headerMessage,
    };

    return (
        <AccessOrNotFoundWrapper
            policyID={route.params.policyID}
            policyFeature={CONST.POLICY.POLICY_FEATURE.MEMBERS}
            policyFeatureAccess={CONST.POLICY.POLICY_FEATURE_ACCESS.WRITE}
            fullPageNotFoundViewProps={{subtitleKey: isEmptyObject(policy) ? undefined : 'workspace.common.notAuthorized', onLinkPress: goBackFromInvalidPolicy}}
        >
            <ScreenWrapper
                shouldEnableMaxHeight
                shouldUseCachedViewportHeight
                testID="WorkspaceInvitePage"
                enableEdgeToEdgeBottomSafeAreaPadding
                onEntryTransitionEnd={() => setDidScreenTransitionEnd(true)}
            >
                <HeaderWithBackButton
                    title={translate('workspace.invite.invitePeople')}
                    subtitle={policyName}
                    onBackButtonPress={() => {
                        clearErrors(route.params.policyID);
                        Navigation.goBack(dynamicBackPath);
                    }}
                />
                <SelectionListWithSections
                    canSelectMultiple
                    sections={sections}
                    ListItem={InviteMemberListItem}
                    onSelectRow={handleToggleSelection}
                    shouldShowTextInput
                    shouldClearInputOnSelect={false}
                    textInputOptions={textInputOptions}
                    shouldUpdateFocusedIndex
                    shouldPreventAutoScrollOnSelect
                    shouldAllowArrowUpToSearchInput
                    confirmButtonOptions={{
                        onConfirm: inviteUser,
                        isDisabled: !selectedOptions.length,
                        isFooterConfirmEnabled: selectedOptions.length > 0,
                        isFooterConfirmEnterKeyEnabled: getPlatform() !== CONST.PLATFORM.ANDROID,
                    }}
                    shouldShowLoadingPlaceholder={!areOptionsInitialized || !didScreenTransitionEnd}
                    shouldPreventDefaultFocusOnSelectRow={!canUseTouchScreen()}
                    footerContent={footerContent}
                    isLoadingNewOptions={!!isSearchingForUsers}
                    addBottomSafeAreaPadding
                />
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

function DynamicWorkspaceInvitePage(props: WorkspaceInvitePageProps) {
    const [policy, policyMetadata] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${props.route.params.policyID}`);
    const [invitedEmailsToAccountIDsDraft, invitedEmailsToAccountIDsDraftMetadata] = useOnyx(`${ONYXKEYS.COLLECTION.WORKSPACE_INVITE_MEMBERS_DRAFT}${props.route.params.policyID}`);
    const dynamicBackPath = useDynamicBackPath(DYNAMIC_ROUTES.WORKSPACE_INVITE.path);
    if (isLoadingOnyxValue(policyMetadata, invitedEmailsToAccountIDsDraftMetadata)) {
        return <FullscreenLoadingIndicator onGoBack={() => Navigation.goBack(dynamicBackPath)} />;
    }
    return (
        <DynamicWorkspaceInvitePageContent
            {...props}
            policy={policy}
            invitedEmailsToAccountIDsDraft={invitedEmailsToAccountIDsDraft}
        />
    );
}

export default withNavigationTransitionEnd(DynamicWorkspaceInvitePage);
