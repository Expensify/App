import {useRoute} from '@react-navigation/native';
import React, {useCallback, useEffect, useMemo} from 'react';
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
import type {OptionData} from '@libs/ReportUtils';
import {getGroupChatName, getParticipantsAccountIDsForDisplay} from '@libs/ReportUtils';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {InvitedEmailsToAccountIDs} from '@src/types/onyx';
import type {WithReportOrNotFoundProps} from './home/report/withReportOrNotFound';
import withReportOrNotFound from './home/report/withReportOrNotFound';

type InviteReportParticipantsPageProps = WithReportOrNotFoundProps & WithNavigationTransitionEndProps;

type Sections = Array<SectionListData<OptionData, Section<OptionData>>>;

function InviteReportParticipantsPage({report, didScreenTransitionEnd}: InviteReportParticipantsPageProps) {
    const route = useRoute<PlatformStackRouteProp<ParticipantsNavigatorParamList, typeof SCREENS.REPORT_PARTICIPANTS.INVITE>>();
    const styles = useThemeStyles();
    const {translate, formatPhoneNumber} = useLocalize();

    // Any existing participants and Expensify emails should not be eligible for invitation
    const excludedUsers = useMemo(() => {
        const res = {
            ...CONST.EXPENSIFY_EMAILS_OBJECT,
        };
        const participantsAccountIDs = getParticipantsAccountIDsForDisplay(report, false, true);
        const loginsByAccountIDs = getLoginsByAccountIDs(participantsAccountIDs);
        for (const login of loginsByAccountIDs) {
            res[login] = true;
        }
        return res;
    }, [report]);

    const {searchTerm, setSearchTerm, availableOptions, selectedOptions, selectedOptionsForDisplay, toggleSelection, areOptionsInitialized, onListEndReached} = useSearchSelector({
        selectionMode: CONST.SEARCH_SELECTOR.SELECTION_MODE_MULTI,
        searchContext: CONST.SEARCH_SELECTOR.SEARCH_CONTEXT_MEMBER_INVITE,
        includeUserToInvite: true,
        excludeLogins: excludedUsers,
        includeRecentReports: true,
        shouldInitialize: didScreenTransitionEnd,
    });

    useEffect(() => {
        updateUserSearchPhrase(searchTerm);
        searchInServer(searchTerm);
    }, [searchTerm]);

    const sections = useMemo(() => {
        const sectionsArray: Sections = [];

        if (!areOptionsInitialized) {
            return [];
        }

        // Selected options section
        if (selectedOptionsForDisplay.length > 0) {
            sectionsArray.push({
                title: undefined,
                data: selectedOptionsForDisplay,
            });
        }

        // Recent reports section
        if (availableOptions.recentReports.length > 0) {
            sectionsArray.push({
                title: translate('common.recents'),
                data: availableOptions.recentReports,
            });
        }

        // Contacts section
        if (availableOptions.personalDetails.length > 0) {
            sectionsArray.push({
                title: translate('common.contacts'),
                data: availableOptions.personalDetails,
            });
        }

        // User to invite section
        if (availableOptions.userToInvite) {
            sectionsArray.push({
                title: undefined,
                data: [availableOptions.userToInvite],
            });
        }

        return sectionsArray;
    }, [areOptionsInitialized, selectedOptionsForDisplay, availableOptions, translate]);

    const handleToggleSelection = useCallback(
        (option: OptionData) => {
            toggleSelection(option);
        },
        [toggleSelection],
    );

    const validate = useCallback(() => selectedOptions.length > 0, [selectedOptions]);

    const reportID = report.reportID;
    const reportName = useMemo(() => getGroupChatName(undefined, true, report), [report]);

    const goBack = useCallback(() => {
        Navigation.goBack(ROUTES.REPORT_PARTICIPANTS.getRoute(reportID, route.params.backTo));
    }, [reportID, route.params.backTo]);

    const inviteUsers = useCallback(() => {
        if (!validate()) {
            return;
        }
        const invitedEmailsToAccountIDs: InvitedEmailsToAccountIDs = {};
        selectedOptions.forEach((option) => {
            const login = option.login ?? '';
            const accountID = option.accountID;
            if (!login.toLowerCase().trim() || !accountID) {
                return;
            }
            invitedEmailsToAccountIDs[login] = accountID;
        });
        inviteToGroupChat(reportID, invitedEmailsToAccountIDs, formatPhoneNumber);
        goBack();
    }, [selectedOptions, goBack, reportID, validate, formatPhoneNumber]);

    const headerMessage = useMemo(() => {
        const processedLogin = searchTerm.trim().toLowerCase();
        const expensifyEmails = CONST.EXPENSIFY_EMAILS;
        if (!availableOptions.userToInvite && expensifyEmails.includes(processedLogin)) {
            return translate('messages.errorMessageInvalidEmail');
        }
        if (
            !availableOptions.userToInvite &&
            excludedUsers[parsePhoneNumber(appendCountryCode(processedLogin)).possible ? addSMSDomainIfPhoneNumber(appendCountryCode(processedLogin)) : processedLogin]
        ) {
            return translate('messages.userIsAlreadyMember', {login: processedLogin, name: reportName ?? ''});
        }
        return getHeaderMessage(
            selectedOptionsForDisplay.length + availableOptions.recentReports.length + availableOptions.personalDetails.length !== 0,
            !!availableOptions.userToInvite,
            processedLogin,
        );
    }, [searchTerm, availableOptions, selectedOptionsForDisplay, excludedUsers, translate, reportName]);

    const footerContent = useMemo(
        () => (
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
        ),
        [selectedOptions.length, inviteUsers, translate, styles],
    );

    return (
        <ScreenWrapper
            shouldEnableMaxHeight
            testID={InviteReportParticipantsPage.displayName}
        >
            <HeaderWithBackButton
                title={translate('workspace.invite.members')}
                subtitle={reportName}
                onBackButtonPress={goBack}
            />

            <SelectionList
                canSelectMultiple
                sections={sections}
                ListItem={InviteMemberListItem}
                textInputLabel={translate('selectionList.nameEmailOrPhoneNumber')}
                textInputValue={searchTerm}
                onChangeText={setSearchTerm}
                headerMessage={headerMessage}
                onSelectRow={handleToggleSelection}
                onConfirm={inviteUsers}
                showScrollIndicator
                shouldPreventDefaultFocusOnSelectRow={!canUseTouchScreen()}
                showLoadingPlaceholder={!areOptionsInitialized || !didScreenTransitionEnd}
                footerContent={footerContent}
                onEndReached={onListEndReached}
            />
        </ScreenWrapper>
    );
}

InviteReportParticipantsPage.displayName = 'InviteReportParticipantsPage';

export default withNavigationTransitionEnd(withReportOrNotFound()(InviteReportParticipantsPage));
