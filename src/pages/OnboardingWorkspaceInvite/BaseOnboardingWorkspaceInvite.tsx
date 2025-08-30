import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {View} from 'react-native';
import type {SectionListData} from 'react-native';
import Button from '@components/Button';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import {useSession} from '@components/OnyxListItemProvider';
import {usePersonalDetailsOptionsList} from '@components/PersonalDetailsOptionListContextProvider';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import InviteMemberListItem from '@components/SelectionList/InviteMemberListItem';
import type {Section} from '@components/SelectionList/types';
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
import memoize from '@libs/memoize';
import {navigateAfterOnboardingWithMicrotaskQueue} from '@libs/navigateAfterOnboarding';
import type {OptionData} from '@libs/PersonalDetailsOptionsListUtils';
import {getHeaderMessage, getValidOptions} from '@libs/PersonalDetailsOptionsListUtils';
import {addSMSDomainIfPhoneNumber, parsePhoneNumber} from '@libs/PhoneNumber';
import {getIneligibleInvitees, getMemberAccountIDsForWorkspace} from '@libs/PolicyUtils';
import {completeOnboarding as completeOnboardingReport} from '@userActions/Report';
import {setOnboardingAdminsChatReportID, setOnboardingPolicyID} from '@userActions/Welcome';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {InvitedEmailsToAccountIDs} from '@src/types/onyx';
import type {BaseOnboardingWorkspaceInviteProps} from './types';

type MembersSection = SectionListData<OptionData, Section<OptionData>>;

const memoizedGetValidOptions = memoize(getValidOptions, {maxSize: 5, monitoringName: 'BaseOnboardingWorkspaceInvite.getValidOptions'});

const defaultListOptions = {
    userToInvite: null,
    recentOptions: [],
    personalDetails: [],
    selectedOptions: [],
};

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
    const [selectedLogins, setSelectedLogins] = useState<Set<string>>(new Set());
    const [extraOptions, setExtraOptions] = useState<OptionData[]>([]);
    const [didScreenTransitionEnd, setDidScreenTransitionEnd] = useState(false);
    const [isSearchingForReports] = useOnyx(ONYXKEYS.IS_SEARCHING_FOR_REPORTS, {canBeMissing: true, initWithStoredValues: false});
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const session = useSession();
    const {isBetaEnabled} = usePermissions();
    const {options, areOptionsInitialized} = usePersonalDetailsOptionsList({
        shouldInitialize: didScreenTransitionEnd,
    });

    const welcomeNoteSubject = useMemo(
        () => `# ${currentUserPersonalDetails?.displayName ?? ''} invited you to ${policy?.name ?? 'a workspace'}`,
        [policy?.name, currentUserPersonalDetails?.displayName],
    );

    const welcomeNote = useMemo(() => translate('workspace.common.welcomeNote'), [translate]);

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
        return memoizedGetValidOptions(transformedOptions, currentUserPersonalDetails.login ?? '', {
            excludeLogins: excludedUsers,
            extraOptions,
            includeRecentReports: false,
            searchString: debouncedSearchTerm,
            includeCurrentUser: false,
            includeUserToInvite: true,
        });
    }, [areOptionsInitialized, currentUserPersonalDetails.login, debouncedSearchTerm, excludedUsers, extraOptions, transformedOptions]);

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

    const existingLogins = useMemo(() => new Set(options.map((option) => option.login ?? '')), [options]);

    const toggleOption = (option: OptionData) => {
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

    const completeOnboarding = useCallback(() => {
        completeOnboardingReport({
            engagementChoice: CONST.ONBOARDING_CHOICES.TRACK_WORKSPACE,
            onboardingMessage: onboardingMessages[CONST.ONBOARDING_CHOICES.TRACK_WORKSPACE],
            firstName: currentUserPersonalDetails.firstName,
            lastName: currentUserPersonalDetails.lastName,
            adminsChatReportID: onboardingAdminsChatReportID,
            onboardingPolicyID,
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
    }, [
        currentUserPersonalDetails.firstName,
        onboardingMessages,
        currentUserPersonalDetails.lastName,
        onboardingAdminsChatReportID,
        onboardingPolicyID,
        isSmallScreenWidth,
        isBetaEnabled,
        session?.email,
    ]);

    const validSelectedLogins = useMemo(() => Array.from(selectedLogins).filter((login) => !excludedUsers[login]), [excludedUsers, selectedLogins]);

    const inviteUser = useCallback(() => {
        let isValid = true;
        if (validSelectedLogins.length <= 0) {
            isValid = false;
        }

        if (!isValid || !onboardingPolicyID) {
            return;
        }
        HttpUtils.cancelPendingRequests(READ_COMMANDS.SEARCH_FOR_REPORTS);

        const invitedEmailsToAccountIDs: InvitedEmailsToAccountIDs = {};
        for (const login of validSelectedLogins) {
            const accountID = loginToAccountIDMap[login] ?? CONST.DEFAULT_NUMBER_ID;
            invitedEmailsToAccountIDs[login] = accountID;
        }
        const policyMemberAccountIDs = Object.values(getMemberAccountIDsForWorkspace(policy?.employeeList, false, false));
        addMembersToWorkspace(invitedEmailsToAccountIDs, `${welcomeNoteSubject}\n\n${welcomeNote}`, onboardingPolicyID, policyMemberAccountIDs, CONST.POLICY.ROLE.USER, formatPhoneNumber);
        completeOnboarding();
    }, [validSelectedLogins, onboardingPolicyID, policy?.employeeList, welcomeNoteSubject, welcomeNote, formatPhoneNumber, completeOnboarding, loginToAccountIDMap]);

    useEffect(() => {
        searchInServer(debouncedSearchTerm);
    }, [debouncedSearchTerm]);

    const headerMessage = useMemo(() => {
        if (sections.length > 0) {
            return '';
        }
        const searchValue = debouncedSearchTerm.trim().toLowerCase();
        if (CONST.EXPENSIFY_EMAILS_OBJECT[searchValue]) {
            return translate('messages.errorMessageInvalidEmail');
        }
        if (excludedUsers[parsePhoneNumber(appendCountryCode(searchValue)).possible ? addSMSDomainIfPhoneNumber(appendCountryCode(searchValue)) : searchValue]) {
            return translate('messages.userIsAlreadyMember', {login: searchValue, name: policy?.name ?? ''});
        }
        return getHeaderMessage(translate, searchValue);
    }, [sections.length, debouncedSearchTerm, excludedUsers, translate, policy?.name]);

    const footerContent = useMemo(
        () => (
            <View style={[onboardingIsMediumOrLargerScreenWidth ? styles.mh3 : undefined]}>
                <View style={styles.mb2}>
                    <Button
                        large
                        text={translate('common.skip')}
                        onPress={() => completeOnboarding()}
                    />
                </View>
                <View>
                    <Button
                        success
                        large
                        text={translate('common.continue')}
                        onPress={() => inviteUser()}
                        isDisabled={validSelectedLogins.length <= 0}
                    />
                </View>
            </View>
        ),
        [completeOnboarding, inviteUser, onboardingIsMediumOrLargerScreenWidth, validSelectedLogins.length, styles.mb2, styles.mh3, translate],
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
