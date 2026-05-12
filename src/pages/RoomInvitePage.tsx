import {pendingChatMembersSelector} from '@selectors/ReportMetaData';
import React, {useEffect, useState} from 'react';
import type {SectionListData} from 'react-native';
import {View} from 'react-native';
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
import useDebouncedState from '@hooks/useDebouncedState';
import useDelegateAccountID from '@hooks/useDelegateAccountID';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePersonalDetailOptions from '@hooks/usePersonalDetailOptions';
import useReportAttributes from '@hooks/useReportAttributes';
import useReportIsArchived from '@hooks/useReportIsArchived';
import useThemeStyles from '@hooks/useThemeStyles';
import {inviteToRoom, inviteToRoomAction, searchUserInServer} from '@libs/actions/Report';
import {clearUserSearchPhrase, updateUserSearchPhrase} from '@libs/actions/RoomMembersUserSearchPhrase';
import {READ_COMMANDS} from '@libs/API/types';
import {canUseTouchScreen} from '@libs/DeviceCapabilities';
import HttpUtils from '@libs/HttpUtils';
import {appendCountryCode} from '@libs/LoginUtils';
import memoize from '@libs/memoize';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {RoomMembersNavigatorParamList} from '@libs/Navigation/types';
import type {OptionData} from '@libs/PersonalDetailOptionsListUtils';
import {getHeaderMessage, getValidOptions} from '@libs/PersonalDetailOptionsListUtils';
import {getLoginsByAccountIDs} from '@libs/PersonalDetailsUtils';
import {addSMSDomainIfPhoneNumber, parsePhoneNumber} from '@libs/PhoneNumber';
import type {MemberEmailsToAccountIDs} from '@libs/PolicyUtils';
import {isPolicyEmployee as isPolicyEmployeeUtil} from '@libs/PolicyUtils';
import {getReportName} from '@libs/ReportNameUtils';
import {getParticipantsAccountIDsForDisplay, isPolicyExpenseChat} from '@libs/ReportUtils';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import type {WithReportOrNotFoundProps} from './inbox/report/withReportOrNotFound';
import withReportOrNotFound from './inbox/report/withReportOrNotFound';

const defaultListOptions = {
    userToInvite: null,
    recentOptions: [],
    personalDetails: [],
    selectedOptions: [],
};

const memoizedGetValidOptions = memoize(getValidOptions, {maxSize: 5, monitoringName: 'RoomInvitePage.getValidOptions'});

type RoomInvitePageProps = WithReportOrNotFoundProps & WithNavigationTransitionEndProps & PlatformStackScreenProps<RoomMembersNavigatorParamList, typeof SCREENS.ROOM_MEMBERS.INVITE>;

type MembersSection = SectionListData<OptionData, Section<OptionData>>;
function RoomInvitePage({
    report,
    policy,
    didScreenTransitionEnd,
    route: {
        params: {backTo},
    },
}: RoomInvitePageProps) {
    const styles = useThemeStyles();
    const reportAttributes = useReportAttributes();
    const {translate, formatPhoneNumber} = useLocalize();
    const {options} = usePersonalDetailOptions({enabled: didScreenTransitionEnd});
    const areOptionsInitialized = (options?.length ?? 0) > 0;
    const [userSearchPhrase] = useOnyx(ONYXKEYS.ROOM_MEMBERS_USER_SEARCH_PHRASE);
    const [countryCode = CONST.DEFAULT_COUNTRY_CODE] = useOnyx(ONYXKEYS.COUNTRY_CODE);
    const [reportMetadata] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_METADATA}${report?.reportID}`, {selector: pendingChatMembersSelector});
    const [loginList] = useOnyx(ONYXKEYS.LOGIN_LIST);
    const delegateAccountID = useDelegateAccountID();
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const currentUserEmail = currentUserPersonalDetails.email ?? '';
    const [searchTerm, debouncedSearchTerm, setSearchTerm] = useDebouncedState(userSearchPhrase ?? '');
    const [selectedLogins, setSelectedLogins] = useState<Set<string>>(new Set());
    const [extraOptions, setExtraOptions] = useState<OptionData[]>([]);
    const [isSearchingForReports] = useOnyx(ONYXKEYS.RAM_ONLY_IS_SEARCHING_FOR_REPORTS);
    const isReportArchived = useReportIsArchived(report.reportID);

    const loginToAccountIDMap = (() => {
        const map: Record<string, number> = {};
        for (const option of extraOptions) {
            const login = option.login;
            if (login) {
                map[login] = option.accountID;
            }
        }
        for (const option of options ?? []) {
            const login = option.login;
            if (login) {
                map[login] = option.accountID;
            }
        }
        return map;
    })();

    const transformedOptions =
        options?.map((option) => ({
            ...option,
            isSelected: selectedLogins.has(option.login ?? ''),
        })) ?? [];

    // Any existing participants and Expensify emails should not be eligible for invitation
    const excludedUsers: Record<string, boolean> = {
        ...CONST.EXPENSIFY_EMAILS_OBJECT,
    };
    const participantsAccountIDs = getParticipantsAccountIDsForDisplay(report, false, true, undefined, reportMetadata);
    const loginsByAccountIDs = getLoginsByAccountIDs(participantsAccountIDs);
    for (const login of loginsByAccountIDs) {
        const smsDomain = addSMSDomainIfPhoneNumber(login);
        excludedUsers[smsDomain] = true;
    }

    const optionsList = !areOptionsInitialized
        ? defaultListOptions
        : memoizedGetValidOptions(transformedOptions, currentUserEmail, formatPhoneNumber, countryCode, loginList, {
              excludeLogins: excludedUsers,
              extraOptions,
              includeRecentReports: false,
              searchString: debouncedSearchTerm,
              includeCurrentUser: false,
              includeUserToInvite: true,
          });

    const sections: MembersSection[] = [];
    if (areOptionsInitialized) {
        if (optionsList.userToInvite) {
            sections.push({
                title: undefined,
                data: [optionsList.userToInvite],
                sectionIndex: 0,
            });
        } else {
            if (optionsList.selectedOptions.length > 0) {
                sections.push({
                    title: undefined,
                    data: optionsList.selectedOptions,
                    sectionIndex: 0,
                });
            }
            if (optionsList.personalDetails.length > 0) {
                sections.push({
                    title: translate('common.contacts'),
                    data: optionsList.personalDetails,
                    sectionIndex: optionsList.selectedOptions.length > 0 ? 1 : 0,
                });
            }
        }
    }

    const existingLogins = new Set(options?.map((option) => option.login ?? ''));

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

    // Non policy members should not be able to view the participants of a room
    const reportID = report?.reportID;
    const isPolicyEmployee = isPolicyEmployeeUtil(report?.policyID, policy);
    const backRoute = reportID && (!isPolicyEmployee || isReportArchived ? ROUTES.REPORT_WITH_ID_DETAILS.getRoute(reportID, backTo) : ROUTES.ROOM_MEMBERS.getRoute(reportID, backTo));

    const reportName = getReportName(report, reportAttributes);

    const ancestors = useAncestors(report);

    const validSelectedLogins = Array.from(selectedLogins).filter((login) => !excludedUsers[login]);

    const inviteUsers = () => {
        HttpUtils.cancelPendingRequests(READ_COMMANDS.SEARCH_FOR_USERS);

        if (validSelectedLogins.length === 0) {
            return;
        }
        const invitedEmailsToAccountIDs: MemberEmailsToAccountIDs = {};
        for (const login of validSelectedLogins) {
            const accountID = loginToAccountIDMap[login] ?? CONST.DEFAULT_NUMBER_ID;
            invitedEmailsToAccountIDs[login] = accountID;
        }
        if (report?.reportID) {
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
                inviteToRoom(report, invitedEmailsToAccountIDs, formatPhoneNumber);
            }
            clearUserSearchPhrase();
            if (backTo) {
                Navigation.goBack(backTo);
            } else {
                Navigation.goBack(ROUTES.REPORT_WITH_ID.getRoute(report.reportID));
            }
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

    return (
        <ScreenWrapper
            shouldEnableMaxHeight
            testID="RoomInvitePage"
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
                    onSelectRow={toggleOption}
                    confirmButtonOptions={{
                        onConfirm: inviteUsers,
                    }}
                    shouldPreventDefaultFocusOnSelectRow={!canUseTouchScreen()}
                    shouldShowLoadingPlaceholder={!areOptionsInitialized}
                    isLoadingNewOptions={!!isSearchingForReports}
                    shouldShowTextInput
                    canSelectMultiple
                />
                <View style={[styles.flexShrink0]}>
                    <FormAlertWithSubmitButton
                        isDisabled={!validSelectedLogins.length}
                        buttonText={translate('common.invite')}
                        onSubmit={inviteUsers}
                        containerStyles={[styles.flexReset, styles.flexGrow0, styles.flexShrink0, styles.flexBasisAuto, styles.mb5, styles.ph5]}
                        enabledWhenOffline
                        isAlertVisible={false}
                    />
                </View>
            </FullPageNotFoundView>
        </ScreenWrapper>
    );
}

export default withNavigationTransitionEnd(withReportOrNotFound()(RoomInvitePage));
