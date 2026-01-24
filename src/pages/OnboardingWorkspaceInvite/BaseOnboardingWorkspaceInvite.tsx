import React, {useEffect, useState} from 'react';
import {View} from 'react-native';
import type {SectionListData} from 'react-native';
import Button from '@components/Button';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import {useSession} from '@components/OnyxListItemProvider';
import ScreenWrapper from '@components/ScreenWrapper';
// eslint-disable-next-line no-restricted-imports
import SelectionList from '@components/SelectionListWithSections';
import InviteMemberListItem from '@components/SelectionListWithSections/InviteMemberListItem';
import type {Section} from '@components/SelectionListWithSections/types';
import Text from '@components/Text';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useArchivedReportsIdSet from '@hooks/useArchivedReportsIdSet';
import useLocalize from '@hooks/useLocalize';
import useOnboardingMessages from '@hooks/useOnboardingMessages';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import usePolicy from '@hooks/usePolicy';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useSearchSelector from '@hooks/useSearchSelector';
import useThemeStyles from '@hooks/useThemeStyles';
import {addMembersToWorkspace} from '@libs/actions/Policy/Member';
import {searchInServer} from '@libs/actions/Report';
import {READ_COMMANDS} from '@libs/API/types';
import {canUseTouchScreen} from '@libs/DeviceCapabilities';
import HttpUtils from '@libs/HttpUtils';
import {appendCountryCode} from '@libs/LoginUtils';
import {navigateAfterOnboardingWithMicrotaskQueue} from '@libs/navigateAfterOnboarding';
import {getHeaderMessage} from '@libs/OptionsListUtils';
import {addSMSDomainIfPhoneNumber, parsePhoneNumber} from '@libs/PhoneNumber';
import {getIneligibleInvitees, getMemberAccountIDsForWorkspace} from '@libs/PolicyUtils';
import type {OptionData} from '@libs/ReportUtils';
import {completeOnboarding as completeOnboardingReport} from '@userActions/Report';
import {setOnboardingAdminsChatReportID, setOnboardingPolicyID} from '@userActions/Welcome';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {InvitedEmailsToAccountIDs} from '@src/types/onyx';
import type {BaseOnboardingWorkspaceInviteProps} from './types';

type Sections = SectionListData<OptionData, Section<OptionData>>;

function BaseOnboardingWorkspaceInvite({shouldUseNativeStyles}: BaseOnboardingWorkspaceInviteProps) {
    const styles = useThemeStyles();
    const {translate, formatPhoneNumber} = useLocalize();
    const [onboardingPolicyID] = useOnyx(ONYXKEYS.ONBOARDING_POLICY_ID, {canBeMissing: true});
    const [onboardingAdminsChatReportID] = useOnyx(ONYXKEYS.ONBOARDING_ADMINS_CHAT_REPORT_ID, {canBeMissing: true});
    const [onboardingPurposeSelected] = useOnyx(ONYXKEYS.ONBOARDING_PURPOSE_SELECTED, {canBeMissing: true});
    const policy = usePolicy(onboardingPolicyID);
    const {onboardingMessages} = useOnboardingMessages();
    // We need to use isSmallScreenWidth, see navigateAfterOnboarding function comment
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {onboardingIsMediumOrLargerScreenWidth, isSmallScreenWidth} = useResponsiveLayout();
    const [didScreenTransitionEnd, setDidScreenTransitionEnd] = useState(false);
    const [isSearchingForReports] = useOnyx(ONYXKEYS.IS_SEARCHING_FOR_REPORTS, {canBeMissing: true, initWithStoredValues: false});
    const [countryCode = CONST.DEFAULT_COUNTRY_CODE] = useOnyx(ONYXKEYS.COUNTRY_CODE, {canBeMissing: false});
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const session = useSession();
    const {isBetaEnabled} = usePermissions();
    const archivedReportsIdSet = useArchivedReportsIdSet();

    const ineligibleInvitees = getIneligibleInvitees(policy?.employeeList);
    const excludedUsers: Record<string, boolean> = {};
    for (const login of ineligibleInvitees) {
        excludedUsers[login] = true;
    }

    const {searchTerm, debouncedSearchTerm, setSearchTerm, availableOptions, selectedOptions, selectedOptionsForDisplay, toggleSelection, areOptionsInitialized, searchOptions} =
        useSearchSelector({
            selectionMode: CONST.SEARCH_SELECTOR.SELECTION_MODE_MULTI,
            searchContext: CONST.SEARCH_SELECTOR.SEARCH_CONTEXT_MEMBER_INVITE,
            includeUserToInvite: true,
            excludeLogins: excludedUsers,
            includeRecentReports: false,
            shouldInitialize: didScreenTransitionEnd,
        });

    const welcomeNoteSubject = `# ${currentUserPersonalDetails?.displayName ?? ''} invited you to ${policy?.name ?? 'a workspace'}`;

    const welcomeNote = translate('workspace.common.welcomeNote');

    useEffect(() => {
        searchInServer(debouncedSearchTerm);
    }, [debouncedSearchTerm]);

    const sections: Sections[] = [];
    if (areOptionsInitialized) {
        // Selected options section
        if (selectedOptionsForDisplay.length > 0) {
            sections.push({
                title: undefined,
                data: selectedOptionsForDisplay,
            });
        }

        // Contacts section
        if (availableOptions.personalDetails.length > 0) {
            sections.push({
                title: translate('common.contacts'),
                data: availableOptions.personalDetails,
            });
        }

        // User to invite section
        if (availableOptions.userToInvite) {
            sections.push({
                title: undefined,
                data: [availableOptions.userToInvite],
            });
        }
    }

    const completeOnboarding = (isInvitedAccountant: boolean) => {
        completeOnboardingReport({
            engagementChoice: CONST.ONBOARDING_CHOICES.TRACK_WORKSPACE,
            onboardingMessage: onboardingMessages[CONST.ONBOARDING_CHOICES.TRACK_WORKSPACE],
            firstName: currentUserPersonalDetails.firstName,
            lastName: currentUserPersonalDetails.lastName,
            adminsChatReportID: onboardingAdminsChatReportID,
            onboardingPolicyID,
            shouldSkipTestDriveModal: !!onboardingPolicyID && !onboardingAdminsChatReportID,
            isInvitedAccountant,
            onboardingPurposeSelected,
        });

        setOnboardingAdminsChatReportID();
        setOnboardingPolicyID();

        navigateAfterOnboardingWithMicrotaskQueue(
            isSmallScreenWidth,
            isBetaEnabled(CONST.BETAS.DEFAULT_ROOMS),
            onboardingPolicyID,
            onboardingAdminsChatReportID,
            // Onboarding tasks would show in Concierge instead of admins room for testing accounts, we should open where onboarding tasks are located
            // See https://github.com/Expensify/App/issues/57167 for more details
            (session?.email ?? '').includes('+'),
            archivedReportsIdSet,
        );
    };

    const inviteUser = () => {
        let isValid = true;
        if (selectedOptions.length <= 0) {
            isValid = false;
        }

        if (!isValid || !onboardingPolicyID) {
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
        const policyMemberAccountIDs = Object.values(getMemberAccountIDsForWorkspace(policy?.employeeList, false, false));
        addMembersToWorkspace(invitedEmailsToAccountIDs, `${welcomeNoteSubject}\n\n${welcomeNote}`, onboardingPolicyID, policyMemberAccountIDs, CONST.POLICY.ROLE.USER, formatPhoneNumber);
        completeOnboarding(true);
    };

    const searchValue = debouncedSearchTerm.trim().toLowerCase();
    let headerMessage = getHeaderMessage(searchOptions.personalDetails.length + selectedOptions.length !== 0, !!searchOptions.userToInvite, searchValue, countryCode, false);
    if (!availableOptions.userToInvite && CONST.EXPENSIFY_EMAILS_OBJECT[searchValue]) {
        headerMessage = translate('messages.errorMessageInvalidEmail');
    } else if (
        !availableOptions.userToInvite &&
        excludedUsers[parsePhoneNumber(appendCountryCode(searchValue, countryCode)).possible ? addSMSDomainIfPhoneNumber(appendCountryCode(searchValue, countryCode)) : searchValue]
    ) {
        headerMessage = translate('messages.userIsAlreadyMember', {login: searchValue, name: policy?.name ?? ''});
    }

    const footerContent = (
        <View style={[onboardingIsMediumOrLargerScreenWidth ? styles.mh3 : undefined]}>
            <View style={styles.mb2}>
                <Button
                    large
                    text={translate('common.skip')}
                    onPress={() => completeOnboarding(false)}
                />
            </View>
            <View>
                <Button
                    success
                    large
                    text={translate('common.continue')}
                    onPress={() => inviteUser()}
                    isDisabled={selectedOptions.length <= 0}
                />
            </View>
        </View>
    );

    return (
        <ScreenWrapper
            enableEdgeToEdgeBottomSafeAreaPadding
            shouldEnableMaxHeight
            testID="BaseOnboardingWorkspaceInvite"
            style={[styles.defaultModalContainer, shouldUseNativeStyles && styles.pt8]}
            shouldShowOfflineIndicator={isSmallScreenWidth}
            onEntryTransitionEnd={() => setDidScreenTransitionEnd(true)}
        >
            <HeaderWithBackButton
                progressBarPercentage={100}
                shouldShowBackButton={false}
                shouldDisplayHelpButton={false}
            />
            <View style={[onboardingIsMediumOrLargerScreenWidth ? styles.mh8 : styles.mh5, onboardingIsMediumOrLargerScreenWidth ? styles.flexRow : styles.flexColumn, styles.mb3]}>
                <Text style={styles.textHeadlineH1}>{translate('onboarding.inviteMembers.title')}</Text>
            </View>
            <View style={[onboardingIsMediumOrLargerScreenWidth ? styles.mh8 : styles.mh5, onboardingIsMediumOrLargerScreenWidth ? styles.flexRow : styles.flexColumn, styles.mb5]}>
                <Text style={[styles.textNormal, styles.colorMuted]}>{translate('onboarding.inviteMembers.subtitle')}</Text>
            </View>
            <SelectionList
                listItemWrapperStyle={onboardingIsMediumOrLargerScreenWidth ? [styles.pl8, styles.pr8] : []}
                textInputStyle={onboardingIsMediumOrLargerScreenWidth ? styles.ph8 : styles.ph5}
                sectionTitleStyles={onboardingIsMediumOrLargerScreenWidth ? styles.ph3 : undefined}
                headerMessageStyle={[onboardingIsMediumOrLargerScreenWidth ? styles.ph8 : styles.ph5, styles.pb5]}
                canSelectMultiple
                sections={sections}
                ListItem={InviteMemberListItem}
                textInputLabel={translate('selectionList.nameEmailOrPhoneNumber')}
                textInputValue={searchTerm}
                onChangeText={(value) => {
                    setSearchTerm(value);
                }}
                headerMessage={headerMessage}
                onSelectRow={toggleSelection}
                onConfirm={inviteUser}
                showScrollIndicator
                showLoadingPlaceholder={!areOptionsInitialized || !didScreenTransitionEnd}
                shouldPreventDefaultFocusOnSelectRow={!canUseTouchScreen()}
                footerContent={footerContent}
                isLoadingNewOptions={!!isSearchingForReports}
                addBottomSafeAreaPadding={isSmallScreenWidth}
            />
        </ScreenWrapper>
    );
}

export default BaseOnboardingWorkspaceInvite;
