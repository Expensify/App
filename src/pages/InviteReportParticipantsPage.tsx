import {useRoute} from '@react-navigation/native';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import type {SectionListData} from 'react-native';
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
import {inviteToGroupChat, searchInServer} from '@libs/actions/Report';
import {clearUserSearchPhrase, updateUserSearchPhrase} from '@libs/actions/RoomMembersUserSearchPhrase';
import {READ_COMMANDS} from '@libs/API/types';
import {canUseTouchScreen} from '@libs/DeviceCapabilities';
import HttpUtils from '@libs/HttpUtils';
import {appendCountryCode} from '@libs/LoginUtils';
import memoize from '@libs/memoize';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackRouteProp} from '@libs/Navigation/PlatformStackNavigation/types';
import type {ParticipantsNavigatorParamList} from '@libs/Navigation/types';
import type {OptionData} from '@libs/PersonalDetailsOptionsListUtils';
import {getHeaderMessage, getValidOptions} from '@libs/PersonalDetailsOptionsListUtils';
import {getLoginsByAccountIDs} from '@libs/PersonalDetailsUtils';
import {addSMSDomainIfPhoneNumber, parsePhoneNumber} from '@libs/PhoneNumber';
import {getGroupChatName, getParticipantsAccountIDsForDisplay} from '@libs/ReportUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {InvitedEmailsToAccountIDs} from '@src/types/onyx';
import type {WithReportOrNotFoundProps} from './home/report/withReportOrNotFound';
import withReportOrNotFound from './home/report/withReportOrNotFound';

type InviteReportParticipantsPageProps = WithReportOrNotFoundProps & WithNavigationTransitionEndProps;

type MembersSection = SectionListData<OptionData, Section<OptionData>>;

const memoizedGetValidOptions = memoize(getValidOptions, {maxSize: 5, monitoringName: 'InviteReportParticipantsPage.getValidOptions'});

const defaultListOptions = {
    userToInvite: null,
    recentOptions: [],
    personalDetails: [],
    selectedOptions: [],
};

function InviteReportParticipantsPage({report, didScreenTransitionEnd}: InviteReportParticipantsPageProps) {
    const route = useRoute<PlatformStackRouteProp<ParticipantsNavigatorParamList, typeof SCREENS.REPORT_PARTICIPANTS.INVITE>>();
    const {options, areOptionsInitialized} = usePersonalDetailsOptionsList({
        shouldInitialize: didScreenTransitionEnd,
    });

    const styles = useThemeStyles();
    const {translate, formatPhoneNumber} = useLocalize();
    const {login: currentLogin} = useCurrentUserPersonalDetails();
    const [userSearchPhrase] = useOnyx(ONYXKEYS.ROOM_MEMBERS_USER_SEARCH_PHRASE, {canBeMissing: true});
    const [isSearchingForReports] = useOnyx(ONYXKEYS.IS_SEARCHING_FOR_REPORTS, {initWithStoredValues: false, canBeMissing: true});
    const [searchValue, debouncedSearchTerm, setSearchValue] = useDebouncedState(userSearchPhrase ?? '');
    const [selectedLogins, setSelectedLogins] = useState<Set<string>>(new Set());
    const [extraOptions, setExtraOptions] = useState<OptionData[]>([]);

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

    useEffect(() => {
        updateUserSearchPhrase(debouncedSearchTerm);
        searchInServer(debouncedSearchTerm);
    }, [debouncedSearchTerm]);

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
            includeRecentReports: true,
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
            if (optionsList.recentOptions.length > 0) {
                sectionsArr.push({
                    title: translate('common.recents'),
                    data: optionsList.recentOptions,
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
    }, [areOptionsInitialized, optionsList.userToInvite, optionsList.selectedOptions, optionsList.recentOptions, optionsList.personalDetails, translate]);

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

    const validSelectedLogins = useMemo(() => Array.from(selectedLogins).filter((login) => !excludedUsers[login]), [excludedUsers, selectedLogins]);

    const reportID = report.reportID;
    const reportName = useMemo(() => getGroupChatName(undefined, true, report), [report]);

    const headerMessage = useMemo(() => {
        if (sections.length > 0) {
            return '';
        }
        const searchVal = debouncedSearchTerm.trim().toLowerCase();
        if (CONST.EXPENSIFY_EMAILS_OBJECT[searchVal]) {
            return translate('messages.errorMessageInvalidEmail');
        }
        if (excludedUsers[parsePhoneNumber(appendCountryCode(searchVal)).possible ? addSMSDomainIfPhoneNumber(appendCountryCode(searchVal)) : searchVal]) {
            return translate('messages.userIsAlreadyMember', {login: searchVal, name: reportName ?? ''});
        }
        return getHeaderMessage(translate, searchVal);
    }, [sections.length, debouncedSearchTerm, excludedUsers, translate, reportName]);

    const goBack = useCallback(() => {
        Navigation.goBack(ROUTES.REPORT_PARTICIPANTS.getRoute(reportID, route.params.backTo));
    }, [reportID, route.params.backTo]);

    const inviteUsers = useCallback(() => {
        if (validSelectedLogins.length === 0) {
            return;
        }
        HttpUtils.cancelPendingRequests(READ_COMMANDS.SEARCH_FOR_REPORTS);
        const invitedEmailsToAccountIDs: InvitedEmailsToAccountIDs = {};
        for (const login of validSelectedLogins) {
            const accountID = loginToAccountIDMap[login] ?? CONST.DEFAULT_NUMBER_ID;
            invitedEmailsToAccountIDs[login] = accountID;
        }
        inviteToGroupChat(reportID, invitedEmailsToAccountIDs, formatPhoneNumber);
        goBack();
    }, [validSelectedLogins, reportID, formatPhoneNumber, goBack, loginToAccountIDMap]);

    const footerContent = useMemo(
        () => (
            <FormAlertWithSubmitButton
                isDisabled={!validSelectedLogins.length}
                buttonText={translate('common.invite')}
                onSubmit={() => {
                    clearUserSearchPhrase();
                    inviteUsers();
                }}
                containerStyles={[styles.flexReset, styles.flexGrow0, styles.flexShrink0, styles.flexBasisAuto]}
                enabledWhenOffline
            />
        ),
        [validSelectedLogins.length, translate, styles.flexReset, styles.flexGrow0, styles.flexShrink0, styles.flexBasisAuto, inviteUsers],
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
                textInputValue={searchValue}
                onChangeText={(value) => {
                    setSearchValue(value);
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
        </ScreenWrapper>
    );
}

InviteReportParticipantsPage.displayName = 'InviteReportParticipantsPage';

export default withNavigationTransitionEnd(withReportOrNotFound()(InviteReportParticipantsPage));
