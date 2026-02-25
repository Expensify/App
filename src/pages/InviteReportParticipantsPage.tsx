import {useRoute} from '@react-navigation/native';
import React, {useEffect, useState} from 'react';
import FormAlertWithSubmitButton from '@components/FormAlertWithSubmitButton';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import InviteMemberListItem from '@components/SelectionList/ListItem/InviteMemberListItem';
import SelectionListWithSections from '@components/SelectionList/SelectionListWithSections';
import type {Section} from '@components/SelectionList/SelectionListWithSections/types';
import type {WithNavigationTransitionEndProps} from '@components/withNavigationTransitionEnd';
import withNavigationTransitionEnd from '@components/withNavigationTransitionEnd';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useSearchSelector from '@hooks/useSearchSelector';
import useThemeStyles from '@hooks/useThemeStyles';
import {inviteToGroupChat, searchInServer} from '@libs/actions/Report';
import {clearUserSearchPhrase, updateUserSearchPhrase} from '@libs/actions/RoomMembersUserSearchPhrase';
import {canUseTouchScreen} from '@libs/DeviceCapabilities';
import {appendCountryCode} from '@libs/LoginUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackRouteProp} from '@libs/Navigation/PlatformStackNavigation/types';
import type {ParticipantsNavigatorParamList} from '@libs/Navigation/types';
import {getHeaderMessage} from '@libs/OptionsListUtils';
import {getLoginsByAccountIDs} from '@libs/PersonalDetailsUtils';
import {addSMSDomainIfPhoneNumber, parsePhoneNumber} from '@libs/PhoneNumber';
import {getGroupChatName} from '@libs/ReportNameUtils';
import type {OptionData} from '@libs/ReportUtils';
import {getParticipantsAccountIDsForDisplay} from '@libs/ReportUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {InvitedEmailsToAccountIDs} from '@src/types/onyx';
import type {WithReportOrNotFoundProps} from './inbox/report/withReportOrNotFound';
import withReportOrNotFound from './inbox/report/withReportOrNotFound';

type InviteReportParticipantsPageProps = WithReportOrNotFoundProps & WithNavigationTransitionEndProps;

type Sections = Array<Section<OptionData>>;

function InviteReportParticipantsPage({report}: InviteReportParticipantsPageProps) {
    const route = useRoute<PlatformStackRouteProp<ParticipantsNavigatorParamList, typeof SCREENS.REPORT_PARTICIPANTS.INVITE>>();
    const styles = useThemeStyles();
    const {translate, formatPhoneNumber} = useLocalize();
    const [countryCode = CONST.DEFAULT_COUNTRY_CODE] = useOnyx(ONYXKEYS.COUNTRY_CODE);
    const [didScreenTransitionEnd, setDidScreenTransitionEnd] = useState(false);

    // Any existing participants and Expensify emails should not be eligible for invitation
    const excludedUsers: Record<string, boolean> = {
        ...CONST.EXPENSIFY_EMAILS_OBJECT,
    };
    const participantsAccountIDs = getParticipantsAccountIDsForDisplay(report, false, true);
    const loginsByAccountIDs = getLoginsByAccountIDs(participantsAccountIDs);
    for (const login of loginsByAccountIDs) {
        excludedUsers[login] = true;
    }

    const {searchTerm, debouncedSearchTerm, setSearchTerm, availableOptions, selectedOptions, selectedOptionsForDisplay, toggleSelection, areOptionsInitialized, onListEndReached} =
        useSearchSelector({
            selectionMode: CONST.SEARCH_SELECTOR.SELECTION_MODE_MULTI,
            searchContext: CONST.SEARCH_SELECTOR.SEARCH_CONTEXT_MEMBER_INVITE,
            includeUserToInvite: true,
            excludeLogins: excludedUsers,
            includeRecentReports: true,
            shouldInitialize: didScreenTransitionEnd,
        });

    useEffect(() => {
        updateUserSearchPhrase(debouncedSearchTerm);
        searchInServer(debouncedSearchTerm);
    }, [debouncedSearchTerm]);

    const sections: Sections = [];
    if (areOptionsInitialized) {
        // Selected options section
        if (selectedOptionsForDisplay.length > 0) {
            sections.push({
                title: undefined,
                data: selectedOptionsForDisplay,
                sectionIndex: 0,
            });
        }

        // Recent reports section
        if (availableOptions.recentReports.length > 0) {
            sections.push({
                title: translate('common.recents'),
                data: availableOptions.recentReports,
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

    const reportID = report.reportID;
    const reportName = getGroupChatName(formatPhoneNumber, undefined, true, report);

    const goBack = () => {
        Navigation.goBack(ROUTES.REPORT_PARTICIPANTS.getRoute(reportID, route.params.backTo));
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
        inviteToGroupChat(report, invitedEmailsToAccountIDs, formatPhoneNumber);
        goBack();
    };

    const getHeaderMessageText = () => {
        const processedLogin = debouncedSearchTerm.trim().toLowerCase();
        const expensifyEmails = CONST.EXPENSIFY_EMAILS;
        if (!availableOptions.userToInvite && expensifyEmails.includes(processedLogin)) {
            return translate('messages.errorMessageInvalidEmail');
        }
        if (
            !availableOptions.userToInvite &&
            excludedUsers[
                parsePhoneNumber(appendCountryCode(processedLogin, countryCode)).possible ? addSMSDomainIfPhoneNumber(appendCountryCode(processedLogin, countryCode)) : processedLogin
            ]
        ) {
            return translate('messages.userIsAlreadyMember', {login: processedLogin, name: reportName ?? ''});
        }
        return getHeaderMessage(
            selectedOptionsForDisplay.length + availableOptions.recentReports.length + availableOptions.personalDetails.length !== 0,
            !!availableOptions.userToInvite,
            processedLogin,
            countryCode,
            false,
        );
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
            testID="InviteReportParticipantsPage"
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
                showLoadingPlaceholder={!areOptionsInitialized || !didScreenTransitionEnd}
                footerContent={footerContent}
                onEndReached={onListEndReached}
            />
        </ScreenWrapper>
    );
}

export default withNavigationTransitionEnd(withReportOrNotFound()(InviteReportParticipantsPage));
