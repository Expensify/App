import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import FormAlertWithSubmitButton from '@components/FormAlertWithSubmitButton';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import InviteMemberListItem from '@components/SelectionList/ListItem/InviteMemberListItem';
import SelectionListWithSections from '@components/SelectionList/SelectionListWithSections';
import type {Section} from '@components/SelectionList/SelectionListWithSections/types';
import withNavigationTransitionEnd from '@components/withNavigationTransitionEnd';
import type {WithNavigationTransitionEndProps} from '@components/withNavigationTransitionEnd';

import useAncestors from '@hooks/useAncestors';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useDelegateAccountID from '@hooks/useDelegateAccountID';
import useDynamicBackPath from '@hooks/useDynamicBackPath';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePersonalDetailSearchSelector from '@hooks/usePersonalDetailSearchSelector';
import useReportAttributes from '@hooks/useReportAttributes';
import useReportIsArchived from '@hooks/useReportIsArchived';
import useThemeStyles from '@hooks/useThemeStyles';

import {inviteToRoom, inviteToRoomAction, searchUserInServer} from '@libs/actions/Report';
import {clearUserSearchPhrase, updateUserSearchPhrase} from '@libs/actions/RoomMembersUserSearchPhrase';
import {READ_COMMANDS} from '@libs/API/types';
import {canUseTouchScreen} from '@libs/DeviceCapabilities';
import HttpUtils from '@libs/HttpUtils';
import {appendCountryCode} from '@libs/LoginUtils';
import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {RoomMembersNavigatorParamList} from '@libs/Navigation/types';
import type {OptionData} from '@libs/PersonalDetailOptionsListUtils';
import {getHeaderMessage} from '@libs/PersonalDetailOptionsListUtils';
import {getLoginsByAccountIDs} from '@libs/PersonalDetailsUtils';
import {addSMSDomainIfPhoneNumber, parsePhoneNumber} from '@libs/PhoneNumber';
import type {MemberEmailsToAccountIDs} from '@libs/PolicyUtils';
import {isPolicyEmployee as isPolicyEmployeeUtil} from '@libs/PolicyUtils';
import {getReportName} from '@libs/ReportNameUtils';
import {getParticipantsAccountIDsForDisplay, isPolicyExpenseChat} from '@libs/ReportUtils';

import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES, {DYNAMIC_ROUTES} from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

import type {SectionListData} from 'react-native';

import {pendingChatMembersSelector} from '@selectors/ReportMetaData';
import React, {useEffect} from 'react';

import type {WithReportOrNotFoundProps} from './inbox/report/withReportOrNotFound';

import withReportOrNotFound from './inbox/report/withReportOrNotFound';

type DynamicRoomInvitePageProps = WithReportOrNotFoundProps &
    WithNavigationTransitionEndProps &
    PlatformStackScreenProps<RoomMembersNavigatorParamList, typeof SCREENS.ROOM_MEMBERS.DYNAMIC_INVITE>;

type MembersSection = SectionListData<OptionData, Section<OptionData>>;
function DynamicRoomInvitePage({report, policy, didScreenTransitionEnd}: DynamicRoomInvitePageProps) {
    const styles = useThemeStyles();
    const reportAttributes = useReportAttributes();
    const {translate, formatPhoneNumber} = useLocalize();
    const backPath = useDynamicBackPath(DYNAMIC_ROUTES.ROOM_INVITE.path);
    const [userSearchPhrase] = useOnyx(ONYXKEYS.ROOM_MEMBERS_USER_SEARCH_PHRASE);
    const [countryCode = CONST.DEFAULT_COUNTRY_CODE] = useOnyx(ONYXKEYS.COUNTRY_CODE);
    const [reportMetadata] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_METADATA}${report?.reportID}`, {selector: pendingChatMembersSelector});
    const [personalDetailsList] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST);
    const delegateAccountID = useDelegateAccountID();
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const [isSearchingForReports] = useOnyx(ONYXKEYS.RAM_ONLY_IS_SEARCHING_FOR_REPORTS);
    const isReportArchived = useReportIsArchived(report.reportID);

    // Any existing participants and Expensify emails should not be eligible for invitation
    const excludedUsers: Record<string, boolean> = {
        ...CONST.EXPENSIFY_EMAILS_OBJECT,
    };
    const participantsAccountIDs = getParticipantsAccountIDsForDisplay(report, false, true, undefined, reportMetadata);
    const loginsByAccountIDs = getLoginsByAccountIDs(participantsAccountIDs, personalDetailsList);
    for (const login of loginsByAccountIDs) {
        const smsDomain = addSMSDomainIfPhoneNumber(login);
        excludedUsers[smsDomain] = true;
    }

    const {searchTerm, debouncedSearchTerm, setSearchTerm, selectedOptions, availableOptions, selectedNonExistingOptions, toggleSelection, areOptionsInitialized} =
        usePersonalDetailSearchSelector({
            shouldInitialize: didScreenTransitionEnd,
            selectionMode: CONST.SEARCH_SELECTOR.SELECTION_MODE_MULTI,
            excludeLogins: excludedUsers,
            includeCurrentUser: false,
            includeRecentReports: false,
            includeUserToInvite: true,
            initialSearchPhrase: userSearchPhrase,
            shouldKeepSelectedInAvailableOptions: true,
        });

    const sections: MembersSection[] = [];
    if (areOptionsInitialized) {
        // Selected non-existing users section (e.g., typed email addresses)
        if (selectedNonExistingOptions.length > 0) {
            sections.push({
                title: undefined,
                data: selectedNonExistingOptions,
                sectionIndex: 0,
            });
        }

        // Contacts section (selected items stay in-place with isSelected flag)
        if (availableOptions.personalDetails.length > 0) {
            sections.push({
                title: translate('common.contacts'),
                data: availableOptions.personalDetails,
                sectionIndex: 1,
            });
        }

        // User to invite section (hide if already selected)
        if (availableOptions.userToInvite && !availableOptions.userToInvite.isSelected) {
            sections.push({
                title: undefined,
                data: [availableOptions.userToInvite],
                sectionIndex: 2,
            });
        }
    }

    // Non policy members should not be able to view the participants of a room
    const reportID = report?.reportID;
    const isPolicyEmployee = isPolicyEmployeeUtil(report?.policyID, policy);
    const reportDetailsRoute = reportID ? createDynamicRoute(DYNAMIC_ROUTES.REPORT_DETAILS.path, ROUTES.REPORT_WITH_ID.getRoute(reportID)) : undefined;
    const backRoute = reportID && (!isPolicyEmployee || isReportArchived) ? reportDetailsRoute : backPath;
    const reportName = getReportName(report, reportAttributes);

    const ancestors = useAncestors(report);

    const validSelectedOptions = selectedOptions.filter((option) => !excludedUsers[option.login ?? '']);

    const inviteUsers = () => {
        HttpUtils.cancelPendingRequests(READ_COMMANDS.SEARCH_FOR_USERS);

        if (validSelectedOptions.length === 0) {
            return;
        }
        const invitedEmailsToAccountIDs: MemberEmailsToAccountIDs = {};
        for (const option of validSelectedOptions) {
            const login = option.login ?? '';
            const accountID = option.accountID;
            invitedEmailsToAccountIDs[login] = accountID;
        }
        if (report?.reportID) {
            clearUserSearchPhrase();
            // Defer the invite action until after the navigation transition completes to prevent
            // a race condition on iOS where optimistic Onyx updates trigger a re-render of the
            // underlying RoomMembersPage during the native screen transition animation, causing a crash.
            const afterTransition = () => {
                if (isPolicyExpenseChat(report)) {
                    inviteToRoomAction(
                        report,
                        ancestors,
                        invitedEmailsToAccountIDs,
                        currentUserPersonalDetails.timezone ?? CONST.DEFAULT_TIME_ZONE,
                        currentUserPersonalDetails.accountID,
                        delegateAccountID,
                    );
                } else {
                    inviteToRoom(report, invitedEmailsToAccountIDs, personalDetailsList, formatPhoneNumber);
                }
            };
            Navigation.goBack(backRoute, {afterTransition});
        }
    };

    const getHeaderMessageText = () => {
        if (sections.length > 0) {
            return '';
        }
        const searchValue = debouncedSearchTerm.trim().toLowerCase();
        if (CONST.EXPENSIFY_EMAILS_OBJECT[searchValue]) {
            return translate('messages.errorMessageInvalidEmail');
        }
        if (excludedUsers[parsePhoneNumber(appendCountryCode(searchValue, countryCode)).possible ? addSMSDomainIfPhoneNumber(appendCountryCode(searchValue, countryCode)) : searchValue]) {
            return translate('messages.userIsAlreadyMember', searchValue, reportName);
        }
        return getHeaderMessage(translate, debouncedSearchTerm, countryCode);
    };

    useEffect(() => {
        updateUserSearchPhrase(debouncedSearchTerm);
        searchUserInServer(debouncedSearchTerm);
    }, [debouncedSearchTerm]);

    let subtitleKey: '' | TranslationPaths | undefined;
    if (!isEmptyObject(report)) {
        subtitleKey = isReportArchived ? 'roomMembersPage.roomArchived' : 'roomMembersPage.notAuthorized';
    }

    const textInputOptions = {
        value: searchTerm,
        label: translate('selectionList.nameEmailOrPhoneNumber'),
        onChangeText: setSearchTerm,
        headerMessage: getHeaderMessageText(),
    };

    const footerContent = (
        <FormAlertWithSubmitButton
            isDisabled={!validSelectedOptions.length}
            buttonText={translate('common.invite')}
            onSubmit={inviteUsers}
            containerStyles={[styles.flexReset, styles.flexGrow0, styles.flexShrink0, styles.flexBasisAuto]}
            enabledWhenOffline
            isAlertVisible={false}
        />
    );

    return (
        <ScreenWrapper
            shouldEnableMaxHeight
            testID="DynamicRoomInvitePage"
            includeSafeAreaPaddingBottom
        >
            <FullPageNotFoundView
                shouldShow={isEmptyObject(report) || isReportArchived}
                subtitleKey={subtitleKey}
                onBackButtonPress={() => Navigation.goBack(backRoute)}
            >
                <HeaderWithBackButton
                    title={translate('workspace.invite.invitePeople')}
                    subtitle={reportName}
                    onBackButtonPress={() => Navigation.goBack(backRoute)}
                />
                <SelectionListWithSections
                    sections={sections}
                    ListItem={InviteMemberListItem}
                    textInputOptions={textInputOptions}
                    onSelectRow={toggleSelection}
                    confirmButtonOptions={{
                        isDisabled: !validSelectedOptions.length,
                        onConfirm: inviteUsers,
                    }}
                    shouldPreventDefaultFocusOnSelectRow={!canUseTouchScreen()}
                    shouldUpdateFocusedIndex
                    shouldPreventAutoScrollOnSelect
                    shouldShowLoadingPlaceholder={!areOptionsInitialized}
                    isLoadingNewOptions={!!isSearchingForReports}
                    shouldShowTextInput
                    canSelectMultiple
                    footerContent={footerContent}
                />
            </FullPageNotFoundView>
        </ScreenWrapper>
    );
}

export default withNavigationTransitionEnd(withReportOrNotFound()(DynamicRoomInvitePage));
