import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import type {SectionListData} from 'react-native';
import FormAlertWithSubmitButton from '@components/FormAlertWithSubmitButton';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import InviteMemberListItem from '@components/SelectionList/InviteMemberListItem';
import type {Section} from '@components/SelectionList/types';
import type {WithNavigationTransitionEndProps} from '@components/withNavigationTransitionEnd';
import withNavigationTransitionEnd from '@components/withNavigationTransitionEnd';
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
import type {WithPolicyAndFullscreenLoadingProps} from './withPolicyAndFullscreenLoading';
import withPolicyAndFullscreenLoading from './withPolicyAndFullscreenLoading';

type MembersSection = SectionListData<OptionData, Section<OptionData>>;

type WorkspaceInvitePageProps = WithPolicyAndFullscreenLoadingProps &
    WithNavigationTransitionEndProps &
    PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.INVITE>;

function WorkspaceInvitePage({route, policy}: WorkspaceInvitePageProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [didScreenTransitionEnd, setDidScreenTransitionEnd] = useState(false);
    const [isSearchingForReports] = useOnyx(ONYXKEYS.IS_SEARCHING_FOR_REPORTS, {initWithStoredValues: false, canBeMissing: true});
    const firstRenderRef = useRef(true);
    const [invitedEmailsToAccountIDsDraft] = useOnyx(`${ONYXKEYS.COLLECTION.WORKSPACE_INVITE_MEMBERS_DRAFT}${route.params.policyID.toString()}`, {canBeMissing: true});

    const openWorkspaceInvitePage = () => {
        const policyMemberEmailsToAccountIDs = getMemberAccountIDsForWorkspace(policy?.employeeList);
        policyOpenWorkspaceInvitePage(route.params.policyID, Object.keys(policyMemberEmailsToAccountIDs));
    };

    const excludeLogins = useMemo(() => {
        const ineligibleInvites = getIneligibleInvitees(policy?.employeeList);
        return ineligibleInvites.reduce(
            (acc, login) => {
                acc[login] = true;
                return acc;
            },
            {} as Record<string, boolean>,
        );
    }, [policy?.employeeList]);

    const {searchTerm, setSearchTerm, availableOptions, selectedOptions, setSelectedOptions, toggleOption, areOptionsInitialized} = useSearchSelector({
        selectionMode: 'multi',
        maxResults: 50,
        getOptionsFunction: 'getMemberInviteOptions',
        includeUserToInvite: true,
        excludeLogins,
        onSelectionChange: () => {
            clearErrors(route.params.policyID);
        },
    });

    useEffect(() => {
        clearErrors(route.params.policyID);
        openWorkspaceInvitePage();
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps -- policyID changes remount the component
    }, []);

    useNetwork({onReconnect: openWorkspaceInvitePage});

    useEffect(() => {
        if (!(firstRenderRef.current && invitedEmailsToAccountIDsDraft)) {
            return;
        }
        firstRenderRef.current = false;
        const savedOptions = Object.keys(invitedEmailsToAccountIDsDraft).map((login) => {
            const accountID = invitedEmailsToAccountIDsDraft[login];
            return {
                login,
                accountID,
                text: login,
                selected: true,
            } as OptionData;
        });
        setSelectedOptions(savedOptions);
    }, [invitedEmailsToAccountIDsDraft, setSelectedOptions]);

    const sections: MembersSection[] = useMemo(() => {
        const sectionsArr: MembersSection[] = [];

        if (!areOptionsInitialized) {
            return [];
        }

        // Selected options section
        if (selectedOptions.length > 0) {
            sectionsArr.push({
                title: undefined,
                data: selectedOptions,
                shouldShow: true,
            });
        }

        // Contacts section (excluding selected users)
        if (availableOptions.personalDetails.length > 0) {
            sectionsArr.push({
                title: translate('common.contacts'),
                data: availableOptions.personalDetails,
                shouldShow: true,
            });
        }

        // User to invite section
        if (availableOptions.userToInvite) {
            sectionsArr.push({
                title: undefined,
                data: [availableOptions.userToInvite],
                shouldShow: true,
            });
        }

        return sectionsArr;
    }, [areOptionsInitialized, selectedOptions, availableOptions, translate]);

    const handleToggleOption = useCallback(
        (option: OptionData) => {
            clearErrors(route.params.policyID);
            toggleOption(option);
        },
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps -- policyID changes remount the component
        [toggleOption],
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
        selectedOptions.forEach((option) => {
            const login = option.login ?? '';
            const accountID = option.accountID ?? CONST.DEFAULT_NUMBER_ID;
            if (!login.toLowerCase().trim() || !accountID) {
                return;
            }
            invitedEmailsToAccountIDs[login] = Number(accountID);
        });
        setWorkspaceInviteMembersDraft(route.params.policyID, invitedEmailsToAccountIDs);
        Navigation.navigate(ROUTES.WORKSPACE_INVITE_MESSAGE.getRoute(route.params.policyID, Navigation.getActiveRoute()));
    }, [route.params.policyID, selectedOptions]);

    const [policyName, shouldShowAlertPrompt] = useMemo(() => [policy?.name ?? '', !isEmptyObject(policy?.errors) || !!policy?.alertMessage], [policy]);

    const headerMessage = useMemo(() => {
        const searchValue = searchTerm.trim().toLowerCase();
        if (!availableOptions.userToInvite && CONST.EXPENSIFY_EMAILS_OBJECT[searchValue]) {
            return translate('messages.errorMessageInvalidEmail');
        }
        if (
            !availableOptions.userToInvite &&
            excludeLogins[parsePhoneNumber(appendCountryCode(searchValue)).possible ? addSMSDomainIfPhoneNumber(appendCountryCode(searchValue)) : searchValue]
        ) {
            return translate('messages.userIsAlreadyMember', {login: searchValue, name: policyName});
        }
        return getHeaderMessage(availableOptions.personalDetails.length !== 0, !!availableOptions.userToInvite, searchValue);
    }, [excludeLogins, translate, searchTerm, policyName, availableOptions]);

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
                    onSelectRow={handleToggleOption}
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
