import React, {useCallback, useEffect, useMemo, useState} from 'react';
import type {SectionListData} from 'react-native';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import FormAlertWithSubmitButton from '@components/FormAlertWithSubmitButton';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import {usePersonalDetailsOptionsList} from '@components/PersonalDetailsOptionListContextProvider';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import InviteMemberListItem from '@components/SelectionList/InviteMemberListItem';
import type {Section} from '@components/SelectionList/types';
import withNavigationTransitionEnd from '@components/withNavigationTransitionEnd';
import type {WithNavigationTransitionEndProps} from '@components/withNavigationTransitionEnd';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useDebouncedState from '@hooks/useDebouncedState';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import {inviteToRoom, searchInServer} from '@libs/actions/Report';
import {clearUserSearchPhrase, updateUserSearchPhrase} from '@libs/actions/RoomMembersUserSearchPhrase';
import {READ_COMMANDS} from '@libs/API/types';
import {canUseTouchScreen} from '@libs/DeviceCapabilities';
import HttpUtils from '@libs/HttpUtils';
import {appendCountryCode} from '@libs/LoginUtils';
import memoize from '@libs/memoize';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {RoomMembersNavigatorParamList} from '@libs/Navigation/types';
import type {OptionData} from '@libs/PersonalDetailsOptionsListUtils';
import {getHeaderMessage, getValidOptions} from '@libs/PersonalDetailsOptionsListUtils';
import {getLoginsByAccountIDs} from '@libs/PersonalDetailsUtils';
import {addSMSDomainIfPhoneNumber, parsePhoneNumber} from '@libs/PhoneNumber';
import type {MemberEmailsToAccountIDs} from '@libs/PolicyUtils';
import {isPolicyEmployee as isPolicyEmployeeUtil} from '@libs/PolicyUtils';
import {getParticipantsAccountIDsForDisplay, getReportName} from '@libs/ReportUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import type {WithReportOrNotFoundProps} from './home/report/withReportOrNotFound';
import withReportOrNotFound from './home/report/withReportOrNotFound';

type RoomInvitePageProps = WithReportOrNotFoundProps & WithNavigationTransitionEndProps & PlatformStackScreenProps<RoomMembersNavigatorParamList, typeof SCREENS.ROOM_MEMBERS.INVITE>;

type MembersSection = SectionListData<OptionData, Section<OptionData>>;

const memoizedGetValidOptions = memoize(getValidOptions, {maxSize: 5, monitoringName: 'RoomInvitePage.getValidOptions'});

const defaultListOptions = {
    userToInvite: null,
    recentOptions: [],
    personalDetails: [],
    selectedOptions: [],
};
function RoomInvitePage({
    report,
    policy,
    didScreenTransitionEnd,
    route: {
        params: {backTo},
    },
}: RoomInvitePageProps) {
    const styles = useThemeStyles();
    const {translate, formatPhoneNumber} = useLocalize();
    const {login: currentLogin} = useCurrentUserPersonalDetails();
    const [userSearchPhrase] = useOnyx(ONYXKEYS.ROOM_MEMBERS_USER_SEARCH_PHRASE, {canBeMissing: true});
    const [searchTerm, debouncedSearchTerm, setSearchTerm] = useDebouncedState(userSearchPhrase ?? '');
    const [isSearchingForReports] = useOnyx(ONYXKEYS.IS_SEARCHING_FOR_REPORTS, {initWithStoredValues: false, canBeMissing: true});
    const [selectedLogins, setSelectedLogins] = useState<Set<string>>(new Set());
    const [extraOptions, setExtraOptions] = useState<OptionData[]>([]);

    const {options, areOptionsInitialized} = usePersonalDetailsOptionsList({
        shouldInitialize: didScreenTransitionEnd,
    });

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

    const optionsList = useMemo(() => {
        if (!areOptionsInitialized) {
            return defaultListOptions;
        }
        return memoizedGetValidOptions(transformedOptions, currentLogin ?? '', {
            excludeLogins: excludedUsers,
            extraOptions,
            includeRecentReports: false,
            searchString: debouncedSearchTerm,
            includeCurrentUser: false,
            includeUserToInvite: true,
        });
    }, [areOptionsInitialized, currentLogin, debouncedSearchTerm, excludedUsers, extraOptions, transformedOptions]);

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

    const toggleOption = useCallback(
        (option: OptionData) => {
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
        },
        [existingLogins, extraOptions, selectedLogins],
    );

    const validSelectedLogins = useMemo(() => Array.from(selectedLogins).filter((login) => !excludedUsers[login]), [excludedUsers, selectedLogins]);

    // Non policy members should not be able to view the participants of a room
    const reportID = report?.reportID;
    const isPolicyEmployee = useMemo(() => isPolicyEmployeeUtil(report?.policyID, policy), [report?.policyID, policy]);
    const backRoute = useMemo(() => {
        return reportID && (isPolicyEmployee ? ROUTES.ROOM_MEMBERS.getRoute(reportID, backTo) : ROUTES.REPORT_WITH_ID_DETAILS.getRoute(reportID, backTo));
    }, [isPolicyEmployee, reportID, backTo]);
    const reportName = useMemo(() => getReportName(report), [report]);
    const inviteUsers = useCallback(() => {
        if (validSelectedLogins.length === 0) {
            return;
        }
        HttpUtils.cancelPendingRequests(READ_COMMANDS.SEARCH_FOR_REPORTS);
        const invitedEmailsToAccountIDs: MemberEmailsToAccountIDs = {};
        for (const login of validSelectedLogins) {
            const accountID = loginToAccountIDMap[login] ?? CONST.DEFAULT_NUMBER_ID;
            invitedEmailsToAccountIDs[login] = accountID;
        }
        if (reportID) {
            inviteToRoom(reportID, invitedEmailsToAccountIDs, formatPhoneNumber);
        }
        clearUserSearchPhrase();
        Navigation.goBack(backRoute);
    }, [validSelectedLogins, reportID, backRoute, loginToAccountIDMap, formatPhoneNumber]);

    const goBack = useCallback(() => {
        Navigation.goBack(backRoute);
    }, [backRoute]);

    const headerMessage = useMemo(() => {
        if (sections.length > 0) {
            return '';
        }
        const searchVal = debouncedSearchTerm.trim().toLowerCase();
        if (CONST.EXPENSIFY_EMAILS_OBJECT[searchVal]) {
            return translate('messages.errorMessageInvalidEmail');
        }
        if (excludedUsers[parsePhoneNumber(appendCountryCode(searchVal)).possible ? addSMSDomainIfPhoneNumber(appendCountryCode(searchVal)) : searchVal]) {
            return translate('messages.userIsAlreadyMember', {login: searchVal, name: reportName});
        }
        return getHeaderMessage(translate, searchVal);
    }, [sections.length, debouncedSearchTerm, excludedUsers, translate, reportName]);

    useEffect(() => {
        updateUserSearchPhrase(debouncedSearchTerm);
        searchInServer(debouncedSearchTerm);
    }, [debouncedSearchTerm]);

    const footerContent = useMemo(
        () => (
            <FormAlertWithSubmitButton
                isDisabled={!validSelectedLogins.length}
                buttonText={translate('common.invite')}
                onSubmit={inviteUsers}
                containerStyles={[styles.flexReset, styles.flexGrow0, styles.flexShrink0, styles.flexBasisAuto]}
                enabledWhenOffline
                isAlertVisible={false}
            />
        ),
        [validSelectedLogins.length, translate, styles.flexReset, styles.flexGrow0, styles.flexShrink0, styles.flexBasisAuto, inviteUsers],
    );

    return (
        <ScreenWrapper
            shouldEnableMaxHeight
            testID={RoomInvitePage.displayName}
            includeSafeAreaPaddingBottom
        >
            <FullPageNotFoundView
                shouldShow={isEmptyObject(report)}
                subtitleKey={isEmptyObject(report) ? undefined : 'roomMembersPage.notAuthorized'}
                onBackButtonPress={goBack}
            >
                <HeaderWithBackButton
                    title={translate('workspace.invite.invitePeople')}
                    subtitle={reportName}
                    onBackButtonPress={goBack}
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
                    onSelectRow={toggleOption}
                    onConfirm={inviteUsers}
                    showScrollIndicator
                    shouldPreventDefaultFocusOnSelectRow={!canUseTouchScreen()}
                    showLoadingPlaceholder={!areOptionsInitialized || !didScreenTransitionEnd}
                    isLoadingNewOptions={!!isSearchingForReports}
                    footerContent={footerContent}
                />
            </FullPageNotFoundView>
        </ScreenWrapper>
    );
}

RoomInvitePage.displayName = 'RoomInvitePage';

export default withNavigationTransitionEnd(withReportOrNotFound()(RoomInvitePage));
