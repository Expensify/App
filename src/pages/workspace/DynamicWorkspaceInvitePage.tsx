import {NavigationContext} from '@react-navigation/native';
import React, {useCallback, useContext, useEffect, useMemo, useState} from 'react';
import {Keyboard} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
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
import usePersonalDetailSearchSelector from '@hooks/usePersonalDetailSearchSelector';
import useThemeStyles from '@hooks/useThemeStyles';
import {setWorkspaceInviteMembersDraft} from '@libs/actions/Policy/Member';
import {clearErrors, openWorkspaceInvitePage as policyOpenWorkspaceInvitePage} from '@libs/actions/Policy/Policy';
import {searchUserInServer} from '@libs/actions/Report';
import {READ_COMMANDS} from '@libs/API/types';
import {canUseTouchScreen} from '@libs/DeviceCapabilities';
import HttpUtils from '@libs/HttpUtils';
import {appendCountryCode} from '@libs/LoginUtils';
import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import {getHeaderMessage, getUserToInviteOption} from '@libs/PersonalDetailOptionsListUtils';
import type {OptionData} from '@libs/PersonalDetailOptionsListUtils';
import {addSMSDomainIfPhoneNumber, parsePhoneNumber} from '@libs/PhoneNumber';
import {getIneligibleInvitees, getMemberAccountIDsForWorkspace, getSoftExclusionsForGuideAndAccountManager, goBackFromInvalidPolicy} from '@libs/PolicyUtils';
import type {SkeletonSpanReasonAttributes} from '@libs/telemetry/useSkeletonSpan';
import type {SettingsNavigatorParamList} from '@navigation/types';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {DYNAMIC_ROUTES} from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {InvitedEmailsToAccountIDs, Policy} from '@src/types/onyx';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';
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
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigation = useContext(NavigationContext);
    const [isSearchingForReports] = useOnyx(ONYXKEYS.RAM_ONLY_IS_SEARCHING_FOR_REPORTS);
    const [countryCode = CONST.DEFAULT_COUNTRY_CODE] = useOnyx(ONYXKEYS.COUNTRY_CODE);
    const [personalDetails] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST);
    const [account] = useOnyx(ONYXKEYS.ACCOUNT);
    const openWorkspaceInvitePage = () => {
        const policyMemberEmailsToAccountIDs = getMemberAccountIDsForWorkspace(policy?.employeeList);
        policyOpenWorkspaceInvitePage(route.params.policyID, Object.keys(policyMemberEmailsToAccountIDs));
    };

    useEffect(() => {
        clearErrors(route.params.policyID);
        openWorkspaceInvitePage();
        // eslint-disable-next-line react-hooks/exhaustive-deps -- policyID changes remount the component
    }, []);

    useNetwork({onReconnect: openWorkspaceInvitePage});

    useEffect(() => {
        if (!navigation) {
            return;
        }
        const unsubscribe = navigation.addListener('focus', () => setIsSubmitting(false));
        return unsubscribe;
    }, [navigation]);

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

    const softExclusions = useMemo(
        () => getSoftExclusionsForGuideAndAccountManager(policy, account?.accountManagerAccountID, personalDetails),
        [policy, account?.accountManagerAccountID, personalDetails],
    );

    const initialSelected = useMemo(() => new Set(Object.values(invitedEmailsToAccountIDsDraft ?? {}).map(String)), [invitedEmailsToAccountIDsDraft]);

    const initialExtraOptions = useMemo(() => {
        if (!invitedEmailsToAccountIDsDraft) {
            return [];
        }
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
                newOptions.push({...option, isSelected: true});
            }
        }
        return newOptions;
    }, [countryCode, excludedUsers, formatPhoneNumber, invitedEmailsToAccountIDsDraft, personalDetails]);

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
        });

    const sections: Array<Section<OptionData>> = useMemo(() => {
        const sectionsArr = [];

        if (!areOptionsInitialized) {
            return [];
        }

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

        return sectionsArr;
    }, [areOptionsInitialized, selectedNonExistingOptions, availableOptions.personalDetails, availableOptions.userToInvite, translate]);

    const handleToggleSelection = useCallback(
        (option: OptionData) => {
            toggleSelection(option);
        },
        [toggleSelection],
    );

    const inviteUser = useCallback(() => {
        setIsSubmitting(true);
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
    }, [route.params.policyID, selectedOptions]);

    const [policyName, shouldShowAlertPrompt] = useMemo(() => [policy?.name ?? '', !isEmptyObject(policy?.errors)], [policy?.name, policy?.errors]);

    const headerMessage = useMemo(() => {
        if (sections.length > 0) {
            return '';
        }
        const searchValue = debouncedSearchTerm.trim().toLowerCase();
        if (CONST.EXPENSIFY_EMAILS_OBJECT[searchValue]) {
            return translate('messages.errorMessageInvalidEmail');
        }
        if (excludedUsers[parsePhoneNumber(appendCountryCode(searchValue, countryCode)).possible ? addSMSDomainIfPhoneNumber(appendCountryCode(searchValue, countryCode)) : searchValue]) {
            return translate('messages.userIsAlreadyMember', searchValue, policyName);
        }
        return getHeaderMessage(translate, searchValue, countryCode);
    }, [sections.length, debouncedSearchTerm, excludedUsers, countryCode, translate, policyName]);

    const footerContent = useMemo(
        () => (
            <FormAlertWithSubmitButton
                isDisabled={!selectedOptions.length}
                isAlertVisible={shouldShowAlertPrompt}
                buttonText={translate('common.next')}
                onSubmit={inviteUser}
                containerStyles={[styles.flexReset, styles.flexGrow0, styles.flexShrink0, styles.flexBasisAuto]}
                enabledWhenOffline
                isLoading={isSubmitting}
            />
        ),
        [inviteUser, isSubmitting, selectedOptions.length, shouldShowAlertPrompt, styles.flexBasisAuto, styles.flexGrow0, styles.flexReset, styles.flexShrink0, translate],
    );

    useEffect(() => {
        searchUserInServer(debouncedSearchTerm);
    }, [debouncedSearchTerm]);

    const textInputOptions = useMemo(
        () => ({
            label: translate('selectionList.nameEmailOrPhoneNumber'),
            value: searchTerm,
            onChangeText: setSearchTerm,
            headerMessage,
        }),
        [searchTerm, setSearchTerm, headerMessage, translate],
    );

    return (
        <AccessOrNotFoundWrapper
            policyID={route.params.policyID}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN]}
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
                    textInputOptions={textInputOptions}
                    shouldUpdateFocusedIndex
                    shouldPreventAutoScrollOnSelect
                    confirmButtonOptions={{
                        onConfirm: inviteUser,
                        isDisabled: !selectedOptions.length,
                    }}
                    shouldShowLoadingPlaceholder={!areOptionsInitialized || !didScreenTransitionEnd}
                    shouldPreventDefaultFocusOnSelectRow={!canUseTouchScreen()}
                    footerContent={footerContent}
                    isLoadingNewOptions={!!isSearchingForReports}
                    addBottomSafeAreaPadding
                />
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

function DynamicWorkspaceInvitePage(props: WorkspaceInvitePageProps) {
    const [policy, policyMetadata] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${props.route.params.policyID}`);
    const [invitedEmailsToAccountIDsDraft, invitedEmailsToAccountIDsDraftMetadata] = useOnyx(`${ONYXKEYS.COLLECTION.WORKSPACE_INVITE_MEMBERS_DRAFT}${props.route.params.policyID}`);
    if (isLoadingOnyxValue(policyMetadata, invitedEmailsToAccountIDsDraftMetadata)) {
        const reasonAttributes: SkeletonSpanReasonAttributes = {
            context: 'DynamicWorkspaceInvitePage',
            isLoadingPolicy: !!isLoadingOnyxValue(policyMetadata),
            isLoadingInvitedEmailsToAccountIDsDraft: !!isLoadingOnyxValue(invitedEmailsToAccountIDsDraftMetadata),
        };
        return <FullscreenLoadingIndicator reasonAttributes={reasonAttributes} />;
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
