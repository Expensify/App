import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {View} from 'react-native';
import type {SectionListData} from 'react-native';
import Button from '@components/Button';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import {useSession} from '@components/OnyxListItemProvider';
import {useOptionsList} from '@components/OptionListContextProvider';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionListWithSections';
import InviteMemberListItem from '@components/SelectionListWithSections/InviteMemberListItem';
import type {Section} from '@components/SelectionListWithSections/types';
import Text from '@components/Text';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useDebouncedState from '@hooks/useDebouncedState';
import useLocalize from '@hooks/useLocalize';
import useOnboardingMessages from '@hooks/useOnboardingMessages';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import usePolicy from '@hooks/usePolicy';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import {addMembersToWorkspace} from '@libs/actions/Policy/Member';
import {searchInServer} from '@libs/actions/Report';
import {READ_COMMANDS} from '@libs/API/types';
import {canUseTouchScreen} from '@libs/DeviceCapabilities';
import HttpUtils from '@libs/HttpUtils';
import {appendCountryCode} from '@libs/LoginUtils';
import {navigateAfterOnboardingWithMicrotaskQueue} from '@libs/navigateAfterOnboarding';
import type {MemberForList} from '@libs/OptionsListUtils';
import {filterAndOrderOptions, formatMemberForList, getHeaderMessage, getMemberInviteOptions, getSearchValueForPhoneOrEmail} from '@libs/OptionsListUtils';
import {addSMSDomainIfPhoneNumber, parsePhoneNumber} from '@libs/PhoneNumber';
import {getIneligibleInvitees, getMemberAccountIDsForWorkspace} from '@libs/PolicyUtils';
import type {OptionData} from '@libs/ReportUtils';
import {completeOnboarding as completeOnboardingReport} from '@userActions/Report';
import {setOnboardingAdminsChatReportID, setOnboardingPolicyID} from '@userActions/Welcome';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {InvitedEmailsToAccountIDs} from '@src/types/onyx';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import type {BaseOnboardingWorkspaceInviteProps} from './types';

type MembersSection = SectionListData<MemberForList, Section<MemberForList>>;

function BaseOnboardingWorkspaceInvite({shouldUseNativeStyles}: BaseOnboardingWorkspaceInviteProps) {
    const styles = useThemeStyles();
    const {translate, formatPhoneNumber} = useLocalize();
    const [onboardingPolicyID] = useOnyx(ONYXKEYS.ONBOARDING_POLICY_ID, {canBeMissing: true});
    const [onboardingAdminsChatReportID] = useOnyx(ONYXKEYS.ONBOARDING_ADMINS_CHAT_REPORT_ID, {canBeMissing: true});
    const policy = usePolicy(onboardingPolicyID);
    const {onboardingMessages} = useOnboardingMessages();
    // We need to use isSmallScreenWidth, see navigateAfterOnboarding function comment
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {onboardingIsMediumOrLargerScreenWidth, isSmallScreenWidth} = useResponsiveLayout();
    const [searchTerm, debouncedSearchTerm, setSearchTerm] = useDebouncedState('');
    const [selectedOptions, setSelectedOptions] = useState<MemberForList[]>([]);
    const [personalDetails, setPersonalDetails] = useState<OptionData[]>([]);
    const [usersToInvite, setUsersToInvite] = useState<OptionData[]>([]);
    const [didScreenTransitionEnd, setDidScreenTransitionEnd] = useState(false);
    const [isSearchingForReports] = useOnyx(ONYXKEYS.IS_SEARCHING_FOR_REPORTS, {canBeMissing: true, initWithStoredValues: false});
    const [betas] = useOnyx(ONYXKEYS.BETAS, {canBeMissing: false});
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const session = useSession();
    const {isBetaEnabled} = usePermissions();
    const {options, areOptionsInitialized} = useOptionsList({
        shouldInitialize: didScreenTransitionEnd,
    });
    const [countryCode = CONST.DEFAULT_COUNTRY_CODE] = useOnyx(ONYXKEYS.COUNTRY_CODE, {canBeMissing: false});

    const welcomeNoteSubject = useMemo(
        () => `# ${currentUserPersonalDetails?.displayName ?? ''} invited you to ${policy?.name ?? 'a workspace'}`,
        [policy?.name, currentUserPersonalDetails?.displayName],
    );

    const welcomeNote = useMemo(() => translate('workspace.common.welcomeNote'), [translate]);

    const excludedUsers = useMemo(() => {
        const ineligibleInvitees = getIneligibleInvitees(policy?.employeeList);
        return ineligibleInvitees.reduce(
            (acc, login) => {
                acc[login] = true;
                return acc;
            },
            {} as Record<string, boolean>,
        );
    }, [policy?.employeeList]);

    const defaultOptions = useMemo(() => {
        if (!areOptionsInitialized) {
            return {recentReports: [], personalDetails: [], userToInvite: null, currentUserOption: null};
        }

        const inviteOptions = getMemberInviteOptions(options.personalDetails, betas ?? [], excludedUsers, true);

        return {...inviteOptions, recentReports: [], currentUserOption: null};
    }, [areOptionsInitialized, betas, excludedUsers, options.personalDetails]);

    const inviteOptions = useMemo(
        () => filterAndOrderOptions(defaultOptions, debouncedSearchTerm, countryCode, {excludeLogins: excludedUsers}),
        [debouncedSearchTerm, defaultOptions, excludedUsers, countryCode],
    );

    useEffect(() => {
        if (!areOptionsInitialized) {
            return;
        }

        const newUsersToInviteDict: Record<number, OptionData> = {};
        const newPersonalDetailsDict: Record<number, OptionData> = {};
        const newSelectedOptionsDict: Record<number, MemberForList> = {};

        // Update selectedOptions with the latest personalDetails and policyEmployeeList information
        const detailsMap: Record<string, MemberForList> = {};
        inviteOptions.personalDetails.forEach((detail) => {
            if (!detail.login) {
                return;
            }

            detailsMap[detail.login] = formatMemberForList(detail);
        });

        const newSelectedOptions: MemberForList[] = [];
        selectedOptions.forEach((option) => {
            newSelectedOptions.push(option.login && option.login in detailsMap ? {...detailsMap[option.login], isSelected: true} : option);
        });

        const userToInvite = inviteOptions.userToInvite;

        // Only add the user to the invitees list if it is valid
        if (typeof userToInvite?.accountID === 'number') {
            newUsersToInviteDict[userToInvite.accountID] = userToInvite;
        }

        // Add all personal details to the new dict
        inviteOptions.personalDetails.forEach((details) => {
            if (typeof details.accountID !== 'number') {
                return;
            }
            newPersonalDetailsDict[details.accountID] = details;
        });

        // Add all selected options to the new dict
        newSelectedOptions.forEach((option) => {
            if (typeof option.accountID !== 'number') {
                return;
            }
            newSelectedOptionsDict[option.accountID] = option;
        });

        // Strip out dictionary keys and update arrays
        setUsersToInvite(Object.values(newUsersToInviteDict));
        setPersonalDetails(Object.values(newPersonalDetailsDict));
        setSelectedOptions(Object.values(newSelectedOptionsDict));

        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps -- we don't want to recalculate when selectedOptions change
    }, [options.personalDetails, policy?.employeeList, betas, debouncedSearchTerm, excludedUsers, areOptionsInitialized, inviteOptions.personalDetails, inviteOptions.userToInvite]);

    const sections: MembersSection[] = useMemo(() => {
        const sectionsArr: MembersSection[] = [];

        if (!areOptionsInitialized) {
            return [];
        }

        // Filter all options that is a part of the search term or in the personal details
        let filterSelectedOptions = selectedOptions;
        if (debouncedSearchTerm !== '') {
            filterSelectedOptions = selectedOptions.filter((option) => {
                const accountID = option.accountID;
                const isOptionInPersonalDetails = Object.values(personalDetails).some((personalDetail) => personalDetail.accountID === accountID);

                const searchValue = getSearchValueForPhoneOrEmail(debouncedSearchTerm, countryCode);

                const isPartOfSearchTerm = !!option.text?.toLowerCase().includes(searchValue) || !!option.login?.toLowerCase().includes(searchValue);
                return isPartOfSearchTerm || isOptionInPersonalDetails;
            });
        }

        sectionsArr.push({
            title: undefined,
            data: filterSelectedOptions,
            shouldShow: true,
        });

        // Filtering out selected users from the search results
        const selectedLoginsSet = new Set(selectedOptions.map(({login}) => login));
        const personalDetailsFormatted = Object.values(personalDetails)
            .filter(({login}) => !selectedLoginsSet.has(login ?? ''))
            .map(formatMemberForList);

        sectionsArr.push({
            title: translate('common.contacts'),
            data: personalDetailsFormatted,
            shouldShow: !isEmptyObject(personalDetailsFormatted),
        });

        Object.values(usersToInvite).forEach((userToInvite) => {
            const hasUnselectedUserToInvite = !selectedLoginsSet.has(userToInvite.login ?? '');

            if (hasUnselectedUserToInvite) {
                sectionsArr.push({
                    title: undefined,
                    data: [formatMemberForList(userToInvite)],
                    shouldShow: true,
                });
            }
        });

        return sectionsArr;
    }, [areOptionsInitialized, selectedOptions, debouncedSearchTerm, personalDetails, translate, usersToInvite, countryCode]);

    const toggleOption = (option: MemberForList) => {
        const isOptionInList = selectedOptions.some((selectedOption) => selectedOption.login === option.login);

        let newSelectedOptions: MemberForList[];
        if (isOptionInList) {
            newSelectedOptions = selectedOptions.filter((selectedOption) => selectedOption.login !== option.login);
        } else {
            newSelectedOptions = [...selectedOptions, {...option, isSelected: true}];
        }

        setSelectedOptions(newSelectedOptions);
    };

    const completeOnboarding = useCallback(
        (isInvitedAccountant: boolean) => {
            completeOnboardingReport({
                engagementChoice: CONST.ONBOARDING_CHOICES.TRACK_WORKSPACE,
                onboardingMessage: onboardingMessages[CONST.ONBOARDING_CHOICES.TRACK_WORKSPACE],
                firstName: currentUserPersonalDetails.firstName,
                lastName: currentUserPersonalDetails.lastName,
                adminsChatReportID: onboardingAdminsChatReportID,
                onboardingPolicyID,
                shouldSkipTestDriveModal: !!onboardingPolicyID && !onboardingAdminsChatReportID,
                isInvitedAccountant,
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
            );
        },
        [
            currentUserPersonalDetails.firstName,
            onboardingMessages,
            currentUserPersonalDetails.lastName,
            onboardingAdminsChatReportID,
            onboardingPolicyID,
            isSmallScreenWidth,
            isBetaEnabled,
            session?.email,
        ],
    );

    const inviteUser = useCallback(() => {
        let isValid = true;
        if (selectedOptions.length <= 0) {
            isValid = false;
        }

        if (!isValid || !onboardingPolicyID) {
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
        const policyMemberAccountIDs = Object.values(getMemberAccountIDsForWorkspace(policy?.employeeList, false, false));
        addMembersToWorkspace(invitedEmailsToAccountIDs, `${welcomeNoteSubject}\n\n${welcomeNote}`, onboardingPolicyID, policyMemberAccountIDs, CONST.POLICY.ROLE.USER, formatPhoneNumber);
        completeOnboarding(true);
    }, [completeOnboarding, onboardingPolicyID, policy?.employeeList, selectedOptions, welcomeNote, welcomeNoteSubject, formatPhoneNumber]);

    useEffect(() => {
        searchInServer(debouncedSearchTerm);
    }, [debouncedSearchTerm]);

    const headerMessage = useMemo(() => {
        const searchValue = debouncedSearchTerm.trim().toLowerCase();
        if (usersToInvite.length === 0 && CONST.EXPENSIFY_EMAILS_OBJECT[searchValue]) {
            return translate('messages.errorMessageInvalidEmail');
        }
        if (
            usersToInvite.length === 0 &&
            excludedUsers[parsePhoneNumber(appendCountryCode(searchValue, countryCode)).possible ? addSMSDomainIfPhoneNumber(appendCountryCode(searchValue, countryCode)) : searchValue]
        ) {
            return translate('messages.userIsAlreadyMember', {login: searchValue, name: policy?.name ?? ''});
        }
        return getHeaderMessage(personalDetails.length !== 0, usersToInvite.length > 0, searchValue, countryCode, false);
    }, [excludedUsers, translate, debouncedSearchTerm, policy?.name, usersToInvite, personalDetails.length, countryCode]);

    const footerContent = useMemo(
        () => (
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
        ),
        [completeOnboarding, inviteUser, onboardingIsMediumOrLargerScreenWidth, selectedOptions.length, styles.mb2, styles.mh3, translate],
    );

    return (
        <ScreenWrapper
            enableEdgeToEdgeBottomSafeAreaPadding
            shouldEnableMaxHeight
            testID={BaseOnboardingWorkspaceInvite.displayName}
            style={[styles.defaultModalContainer, shouldUseNativeStyles && styles.pt8]}
            shouldShowOfflineIndicator={isSmallScreenWidth}
            onEntryTransitionEnd={() => setDidScreenTransitionEnd(true)}
        >
            <HeaderWithBackButton
                progressBarPercentage={100}
                shouldShowBackButton={false}
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
                onSelectRow={toggleOption}
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

BaseOnboardingWorkspaceInvite.displayName = 'BaseOnboardingWorkspaceInvite';

export default BaseOnboardingWorkspaceInvite;
