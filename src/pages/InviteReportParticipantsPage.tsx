import {useRoute} from '@react-navigation/native';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import type {SectionListData} from 'react-native';
import FormAlertWithSubmitButton from '@components/FormAlertWithSubmitButton';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
// eslint-disable-next-line no-restricted-imports
import SelectionList from '@components/SelectionListWithSections';
import InviteMemberListItem from '@components/SelectionListWithSections/InviteMemberListItem';
import type {Section} from '@components/SelectionListWithSections/types';
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
import type {WithReportOrNotFoundProps} from './home/report/withReportOrNotFound';
import withReportOrNotFound from './home/report/withReportOrNotFound';

type InviteReportParticipantsPageProps = WithReportOrNotFoundProps & WithNavigationTransitionEndProps;

type Sections = Array<SectionListData<OptionData, Section<OptionData>>>;

function InviteReportParticipantsPage({report}: InviteReportParticipantsPageProps) {
    const route = useRoute<PlatformStackRouteProp<ParticipantsNavigatorParamList, typeof SCREENS.REPORT_PARTICIPANTS.INVITE>>();
    const styles = useThemeStyles();
    const {translate, formatPhoneNumber} = useLocalize();
    const [countryCode = CONST.DEFAULT_COUNTRY_CODE] = useOnyx(ONYXKEYS.COUNTRY_CODE, {canBeMissing: false});
    const [didScreenTransitionEnd, setDidScreenTransitionEnd] = useState(false);

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
    }, [areOptionsInitialized, selectedOptionsForDisplay, availableOptions.recentReports, availableOptions.personalDetails, availableOptions.userToInvite, translate]);

    const handleToggleSelection = useCallback(
        (option: OptionData) => {
            toggleSelection(option);
        },
        [toggleSelection],
    );

    const validate = useCallback(() => selectedOptions.length > 0, [selectedOptions.length]);

    const reportID = report.reportID;
    const reportName = useMemo(() => getGroupChatName(formatPhoneNumber, undefined, true, report), [formatPhoneNumber, report]);

    const goBack = useCallback(() => {
        Navigation.goBack(ROUTES.REPORT_PARTICIPANTS.getRoute(reportID, route.params.backTo));
    }, [reportID, route.params.backTo]);

    const inviteUsers = useCallback(() => {
        if (!validate()) {
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
    }, [selectedOptions, goBack, report, validate, formatPhoneNumber]);

    const headerMessage = useMemo(() => {
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
    }, [
        debouncedSearchTerm,
        availableOptions.userToInvite,
        availableOptions.recentReports.length,
        availableOptions.personalDetails.length,
        selectedOptionsForDisplay.length,
        excludedUsers,
        translate,
        reportName,
        countryCode,
    ]);

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
            testID="InviteReportParticipantsPage"
            onEntryTransitionEnd={() => setDidScreenTransitionEnd(true)}
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

export default withNavigationTransitionEnd(withReportOrNotFound()(InviteReportParticipantsPage));
