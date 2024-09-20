import type {StackScreenProps} from '@react-navigation/stack';
import {Str} from 'expensify-common';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import type {SectionListData} from 'react-native';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import FormAlertWithSubmitButton from '@components/FormAlertWithSubmitButton';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import {useOptionsList} from '@components/OptionListContextProvider';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import InviteMemberListItem from '@components/SelectionList/InviteMemberListItem';
import type {Section} from '@components/SelectionList/types';
import withNavigationTransitionEnd from '@components/withNavigationTransitionEnd';
import type {WithNavigationTransitionEndProps} from '@components/withNavigationTransitionEnd';
import useDebouncedState from '@hooks/useDebouncedState';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import * as ReportActions from '@libs/actions/Report';
import * as UserSearchPhraseActions from '@libs/actions/RoomMembersUserSearchPhrase';
import {READ_COMMANDS} from '@libs/API/types';
import * as DeviceCapabilities from '@libs/DeviceCapabilities';
import HttpUtils from '@libs/HttpUtils';
import * as LoginUtils from '@libs/LoginUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {RoomMembersNavigatorParamList} from '@libs/Navigation/types';
import * as OptionsListUtils from '@libs/OptionsListUtils';
import * as PersonalDetailsUtils from '@libs/PersonalDetailsUtils';
import * as PhoneNumber from '@libs/PhoneNumber';
import * as PolicyUtils from '@libs/PolicyUtils';
import * as ReportUtils from '@libs/ReportUtils';
import * as Report from '@userActions/Report';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {Policy} from '@src/types/onyx';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import type {WithReportOrNotFoundProps} from './home/report/withReportOrNotFound';
import withReportOrNotFound from './home/report/withReportOrNotFound';

type RoomInvitePageProps = WithReportOrNotFoundProps & WithNavigationTransitionEndProps & StackScreenProps<RoomMembersNavigatorParamList, typeof SCREENS.ROOM_MEMBERS.INVITE>;

type Sections = Array<SectionListData<OptionsListUtils.MemberForList, Section<OptionsListUtils.MemberForList>>>;
function RoomInvitePage({
    betas,
    report,
    policies,
    route: {
        params: {role},
    },
}: RoomInvitePageProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [userSearchPhrase] = useOnyx(ONYXKEYS.ROOM_MEMBERS_USER_SEARCH_PHRASE);
    const [searchTerm, debouncedSearchTerm, setSearchTerm] = useDebouncedState(userSearchPhrase ?? '');
    const [selectedOptions, setSelectedOptions] = useState<ReportUtils.OptionData[]>([]);
    const [isSearchingForReports] = useOnyx(ONYXKEYS.IS_SEARCHING_FOR_REPORTS, {initWithStoredValues: false});

    const {options, areOptionsInitialized} = useOptionsList();

    // Any existing participants and Expensify emails should not be eligible for invitation
    const excludedUsers = useMemo(() => {
        const visibleParticipantAccountIDs = Object.entries(report.participants ?? {})
            .filter(([, participant]) => participant && participant.notificationPreference !== CONST.REPORT.NOTIFICATION_PREFERENCE.HIDDEN)
            .map(([accountID]) => Number(accountID));
        return [...PersonalDetailsUtils.getLoginsByAccountIDs(visibleParticipantAccountIDs), ...CONST.EXPENSIFY_EMAILS].map((participant) =>
            PhoneNumber.addSMSDomainIfPhoneNumber(participant),
        );
    }, [report.participants]);

    const defaultOptions = useMemo(() => {
        if (!areOptionsInitialized) {
            return {recentReports: [], personalDetails: [], userToInvite: null, currentUserOption: null, categoryOptions: [], tagOptions: [], taxRatesOptions: []};
        }

        const inviteOptions = OptionsListUtils.getMemberInviteOptions(options.personalDetails, betas ?? [], '', excludedUsers);
        // Update selectedOptions with the latest personalDetails information
        const detailsMap: Record<string, OptionsListUtils.MemberForList> = {};
        inviteOptions.personalDetails.forEach((detail) => {
            if (!detail.login) {
                return;
            }
            detailsMap[detail.login] = OptionsListUtils.formatMemberForList(detail);
        });
        const newSelectedOptions: ReportUtils.OptionData[] = [];
        selectedOptions.forEach((option) => {
            newSelectedOptions.push(option.login && option.login in detailsMap ? {...detailsMap[option.login], isSelected: true} : option);
        });

        return {
            userToInvite: inviteOptions.userToInvite,
            personalDetails: inviteOptions.personalDetails,
            selectedOptions: newSelectedOptions,
            recentReports: [],
            currentUserOption: null,
            categoryOptions: [],
            tagOptions: [],
            taxRatesOptions: [],
        };
    }, [areOptionsInitialized, betas, excludedUsers, options.personalDetails, selectedOptions]);

    const inviteOptions = useMemo(() => {
        if (debouncedSearchTerm.trim() === '') {
            return defaultOptions;
        }
        const filteredOptions = OptionsListUtils.filterOptions(defaultOptions, debouncedSearchTerm, {excludeLogins: excludedUsers});

        return filteredOptions;
    }, [debouncedSearchTerm, defaultOptions, excludedUsers]);

    const sections = useMemo(() => {
        const sectionsArr: Sections = [];

        const {personalDetails, userToInvite} = inviteOptions;
        if (!areOptionsInitialized) {
            return [];
        }

        // Filter all options that is a part of the search term or in the personal details
        let filterSelectedOptions = selectedOptions;
        if (debouncedSearchTerm !== '') {
            filterSelectedOptions = selectedOptions.filter((option) => {
                const accountID = option?.accountID;
                const isOptionInPersonalDetails = personalDetails ? personalDetails.some((personalDetail) => accountID && personalDetail?.accountID === accountID) : false;
                const parsedPhoneNumber = PhoneNumber.parsePhoneNumber(LoginUtils.appendCountryCode(Str.removeSMSDomain(debouncedSearchTerm)));
                const searchValue = parsedPhoneNumber.possible && parsedPhoneNumber.number ? parsedPhoneNumber.number.e164 : debouncedSearchTerm.toLowerCase();
                const isPartOfSearchTerm = (option.text?.toLowerCase() ?? '').includes(searchValue) || (option.login?.toLowerCase() ?? '').includes(searchValue);
                return isPartOfSearchTerm || isOptionInPersonalDetails;
            });
        }
        const filterSelectedOptionsFormatted = filterSelectedOptions.map((selectedOption) => OptionsListUtils.formatMemberForList(selectedOption));

        sectionsArr.push({
            title: undefined,
            data: filterSelectedOptionsFormatted,
        });

        // Filtering out selected users from the search results
        const selectedLogins = selectedOptions.map(({login}) => login);
        const personalDetailsWithoutSelected = personalDetails ? personalDetails.filter(({login}) => !selectedLogins.includes(login)) : [];
        const personalDetailsFormatted = personalDetailsWithoutSelected.map((personalDetail) => OptionsListUtils.formatMemberForList(personalDetail));
        const hasUnselectedUserToInvite = userToInvite && !selectedLogins.includes(userToInvite.login);

        sectionsArr.push({
            title: translate('common.contacts'),
            data: personalDetailsFormatted,
        });

        if (hasUnselectedUserToInvite) {
            sectionsArr.push({
                title: undefined,
                data: [OptionsListUtils.formatMemberForList(userToInvite)],
            });
        }

        return sectionsArr;
    }, [inviteOptions, areOptionsInitialized, selectedOptions, debouncedSearchTerm, translate]);

    const toggleOption = useCallback(
        (option: OptionsListUtils.MemberForList) => {
            const isOptionInList = selectedOptions.some((selectedOption) => selectedOption.login === option.login);

            let newSelectedOptions: ReportUtils.OptionData[];
            if (isOptionInList) {
                newSelectedOptions = selectedOptions.filter((selectedOption) => selectedOption.login !== option.login);
            } else {
                newSelectedOptions = [...selectedOptions, {...option, isSelected: true}];
            }

            setSelectedOptions(newSelectedOptions);
        },
        [selectedOptions],
    );

    const validate = useCallback(() => selectedOptions.length > 0, [selectedOptions]);

    // Non policy members should not be able to view the participants of a room
    const reportID = report?.reportID;
    const isPolicyEmployee = useMemo(() => (report?.policyID ? PolicyUtils.isPolicyEmployee(report.policyID, policies as Record<string, Policy>) : false), [report?.policyID, policies]);
    const backRoute = useMemo(() => {
        if (role === CONST.IOU.SHARE.ROLE.ACCOUNTANT) {
            return ROUTES.REPORT_WITH_ID.getRoute(reportID);
        }
        return reportID && (isPolicyEmployee ? ROUTES.ROOM_MEMBERS.getRoute(reportID) : ROUTES.REPORT_WITH_ID_DETAILS.getRoute(reportID));
    }, [isPolicyEmployee, reportID, role]);
    const reportName = useMemo(() => ReportUtils.getReportName(report), [report]);
    const inviteUsers = useCallback(() => {
        HttpUtils.cancelPendingRequests(READ_COMMANDS.SEARCH_FOR_REPORTS);

        if (!validate()) {
            return;
        }
        const invitedEmailsToAccountIDs: PolicyUtils.MemberEmailsToAccountIDs = {};
        selectedOptions.forEach((option) => {
            const login = option.login ?? '';
            const accountID = option.accountID;
            if (!login.toLowerCase().trim() || !accountID) {
                return;
            }
            invitedEmailsToAccountIDs[login] = Number(accountID);
        });
        if (reportID) {
            Report.inviteToRoom(reportID, invitedEmailsToAccountIDs);
        }
        UserSearchPhraseActions.clearUserSearchPhrase();
        Navigation.navigate(backRoute);
    }, [selectedOptions, backRoute, reportID, validate]);

    const goBack = useCallback(() => {
        if (role === CONST.IOU.SHARE.ROLE.ACCOUNTANT) {
            Navigation.dismissModal(reportID);
            return;
        }
        Navigation.goBack(backRoute);
    }, [role, reportID, backRoute]);

    const headerMessage = useMemo(() => {
        const searchValue = debouncedSearchTerm.trim().toLowerCase();
        const expensifyEmails = CONST.EXPENSIFY_EMAILS as string[];
        if (!inviteOptions.userToInvite && expensifyEmails.includes(searchValue)) {
            return translate('messages.errorMessageInvalidEmail');
        }
        if (
            !inviteOptions.userToInvite &&
            excludedUsers.includes(
                PhoneNumber.parsePhoneNumber(LoginUtils.appendCountryCode(searchValue)).possible
                    ? PhoneNumber.addSMSDomainIfPhoneNumber(LoginUtils.appendCountryCode(searchValue))
                    : searchValue,
            )
        ) {
            return translate('messages.userIsAlreadyMember', {login: searchValue, name: reportName});
        }
        return OptionsListUtils.getHeaderMessage((inviteOptions.personalDetails ?? []).length !== 0, !!inviteOptions.userToInvite, debouncedSearchTerm);
    }, [debouncedSearchTerm, inviteOptions.userToInvite, inviteOptions.personalDetails, excludedUsers, translate, reportName]);

    useEffect(() => {
        UserSearchPhraseActions.updateUserSearchPhrase(debouncedSearchTerm);
        ReportActions.searchInServer(debouncedSearchTerm);
    }, [debouncedSearchTerm]);

    return (
        <ScreenWrapper
            shouldEnableMaxHeight
            testID={RoomInvitePage.displayName}
            includeSafeAreaPaddingBottom={false}
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
                    shouldPreventDefaultFocusOnSelectRow={!DeviceCapabilities.canUseTouchScreen()}
                    showLoadingPlaceholder={!areOptionsInitialized}
                    isLoadingNewOptions={!!isSearchingForReports}
                />
                <View style={[styles.flexShrink0]}>
                    <FormAlertWithSubmitButton
                        isDisabled={!selectedOptions.length}
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

RoomInvitePage.displayName = 'RoomInvitePage';

export default withNavigationTransitionEnd(withReportOrNotFound()(RoomInvitePage));
