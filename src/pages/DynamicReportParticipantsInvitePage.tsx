import React, {useEffect, useState} from 'react';
import FormAlertWithSubmitButton from '@components/FormAlertWithSubmitButton';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import InviteMemberListItem from '@components/SelectionList/ListItem/InviteMemberListItem';
import SelectionListWithSections from '@components/SelectionList/SelectionListWithSections';
import type {Section} from '@components/SelectionList/SelectionListWithSections/types';
import type {WithNavigationTransitionEndProps} from '@components/withNavigationTransitionEnd';
import withNavigationTransitionEnd from '@components/withNavigationTransitionEnd';
import useDynamicBackPath from '@hooks/useDynamicBackPath';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePersonalDetailSearchSelector from '@hooks/usePersonalDetailSearchSelector';
import useThemeStyles from '@hooks/useThemeStyles';
import {inviteToGroupChat, searchUserInServer} from '@libs/actions/Report';
import {clearUserSearchPhrase, updateUserSearchPhrase} from '@libs/actions/RoomMembersUserSearchPhrase';
import {canUseTouchScreen} from '@libs/DeviceCapabilities';
import {appendCountryCode} from '@libs/LoginUtils';
import Navigation from '@libs/Navigation/Navigation';
import {getHeaderMessage} from '@libs/PersonalDetailOptionsListUtils';
import type {OptionData} from '@libs/PersonalDetailOptionsListUtils';
import {getLoginsByAccountIDs} from '@libs/PersonalDetailsUtils';
import {addSMSDomainIfPhoneNumber, parsePhoneNumber} from '@libs/PhoneNumber';
import {getGroupChatName} from '@libs/ReportNameUtils';
import {getParticipantsAccountIDsForDisplay} from '@libs/ReportUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {DYNAMIC_ROUTES} from '@src/ROUTES';
import type {InvitedEmailsToAccountIDs} from '@src/types/onyx';
import type {WithReportOrNotFoundProps} from './inbox/report/withReportOrNotFound';
import withReportOrNotFound from './inbox/report/withReportOrNotFound';

type DynamicReportParticipantsInvitePageProps = WithReportOrNotFoundProps & WithNavigationTransitionEndProps;

type Sections = Array<Section<OptionData>>;

function DynamicReportParticipantsInvitePage({report}: DynamicReportParticipantsInvitePageProps) {
    const styles = useThemeStyles();
    const {translate, formatPhoneNumber} = useLocalize();
    const [countryCode = CONST.DEFAULT_COUNTRY_CODE] = useOnyx(ONYXKEYS.COUNTRY_CODE);
    const [personalDetailsList] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST);
    const [didScreenTransitionEnd, setDidScreenTransitionEnd] = useState(false);
    const backPath = useDynamicBackPath(DYNAMIC_ROUTES.REPORT_PARTICIPANTS_INVITE.path);

    // Any existing participants and Expensify emails should not be eligible for invitation
    const excludedUsers: Record<string, boolean> = {
        ...CONST.EXPENSIFY_EMAILS_OBJECT,
    };
    const participantsAccountIDs = getParticipantsAccountIDsForDisplay(report, false, true);
    const loginsByAccountIDs = getLoginsByAccountIDs(participantsAccountIDs);
    for (const login of loginsByAccountIDs) {
        excludedUsers[login] = true;
    }

    const {searchTerm, debouncedSearchTerm, setSearchTerm, availableOptions, selectedOptions, toggleSelection, areOptionsInitialized} = usePersonalDetailSearchSelector({
        selectionMode: CONST.SEARCH_SELECTOR.SELECTION_MODE_MULTI,
        includeUserToInvite: true,
        excludeLogins: excludedUsers,
        includeRecentReports: true,
        shouldInitialize: didScreenTransitionEnd,
    });

    useEffect(() => {
        updateUserSearchPhrase(debouncedSearchTerm);
        searchUserInServer(debouncedSearchTerm);
    }, [debouncedSearchTerm]);

    const sections: Sections = [];
    if (areOptionsInitialized) {
        // Selected options section
        if (availableOptions.selectedOptions.length > 0) {
            sections.push({
                title: undefined,
                data: availableOptions.selectedOptions,
                sectionIndex: 0,
            });
        }

        // Recent reports section
        if (availableOptions.recentOptions.length > 0) {
            sections.push({
                title: translate('common.recents'),
                data: availableOptions.recentOptions,
                sectionIndex: 1,
            });
        }

        // Contacts section
        if (availableOptions.personalDetails.length > 0) {
            sections.push({
                title: translate('common.contacts'),
                data: availableOptions.personalDetails,
                sectionIndex: 2,
            });
        }

        // User to invite section
        if (availableOptions.userToInvite) {
            sections.push({
                title: undefined,
                data: [availableOptions.userToInvite],
                sectionIndex: 3,
            });
        }
    }

    const handleToggleSelection = (option: OptionData) => {
        toggleSelection(option);
    };

    const reportName = getGroupChatName(formatPhoneNumber, undefined, true, report);

    const goBack = () => {
        Navigation.goBack(backPath);
    };

    const inviteUsers = () => {
        if (selectedOptions.length === 0) {
            return;
        }
        const invitedEmailsToAccountIDs: InvitedEmailsToAccountIDs = {};
        for (const option of selectedOptions) {
            const login = option.login ?? '';
            const accountID = option.accountID;
            if (!login.toLowerCase().trim() || !accountID) {
                continue;
            }
            invitedEmailsToAccountIDs[login] = accountID;
        }
        inviteToGroupChat(report, invitedEmailsToAccountIDs, personalDetailsList, formatPhoneNumber);
        goBack();
    };

    const getHeaderMessageText = () => {
        if (sections.length > 0) {
            return '';
        }
        const processedLogin = debouncedSearchTerm.trim().toLowerCase();
        if (CONST.EXPENSIFY_EMAILS_OBJECT[processedLogin]) {
            return translate('messages.errorMessageInvalidEmail');
        }
        if (
            excludedUsers[
                parsePhoneNumber(appendCountryCode(processedLogin, countryCode)).possible ? addSMSDomainIfPhoneNumber(appendCountryCode(processedLogin, countryCode)) : processedLogin
            ]
        ) {
            return translate('messages.userIsAlreadyMember', processedLogin, reportName ?? '');
        }
        return getHeaderMessage(translate, processedLogin, countryCode);
    };

    const footerContent = (
        <FormAlertWithSubmitButton
            isDisabled={!selectedOptions.length}
            buttonText={translate('common.invite')}
            onSubmit={() => {
                clearUserSearchPhrase();
                inviteUsers();
            }}
            containerStyles={[styles.flexReset, styles.flexGrow0, styles.flexShrink0, styles.flexBasisAuto]}
            enabledWhenOffline
        />
    );

    const textInputOptions = {
        label: translate('selectionList.nameEmailOrPhoneNumber'),
        value: searchTerm,
        onChangeText: setSearchTerm,
        headerMessage: getHeaderMessageText(),
    };

    return (
        <ScreenWrapper
            shouldEnableMaxHeight
            testID="DynamicReportParticipantsInvitePage"
            onEntryTransitionEnd={() => setDidScreenTransitionEnd(true)}
        >
            <HeaderWithBackButton
                title={translate('workspace.invite.members')}
                subtitle={reportName}
                onBackButtonPress={goBack}
            />

            <SelectionListWithSections
                canSelectMultiple
                sections={sections}
                onSelectRow={handleToggleSelection}
                ListItem={InviteMemberListItem}
                confirmButtonOptions={{
                    onConfirm: inviteUsers,
                }}
                shouldShowTextInput
                textInputOptions={textInputOptions}
                shouldPreventDefaultFocusOnSelectRow={!canUseTouchScreen()}
                shouldShowLoadingPlaceholder={!areOptionsInitialized || !didScreenTransitionEnd}
                footerContent={footerContent}
            />
        </ScreenWrapper>
    );
}

export default withNavigationTransitionEnd(withReportOrNotFound()(DynamicReportParticipantsInvitePage));
