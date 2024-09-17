import React, {useCallback, useEffect, useMemo, useState} from 'react';
import type {SectionListData} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import {useOnyx, withOnyx} from 'react-native-onyx';
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
import * as UserSearchPhraseActions from '@libs/actions/RoomMembersUserSearchPhrase';
import * as DeviceCapabilities from '@libs/DeviceCapabilities';
import * as LoginUtils from '@libs/LoginUtils';
import Navigation from '@libs/Navigation/Navigation';
import * as OptionsListUtils from '@libs/OptionsListUtils';
import * as PersonalDetailsUtils from '@libs/PersonalDetailsUtils';
import * as PhoneNumber from '@libs/PhoneNumber';
import * as ReportUtils from '@libs/ReportUtils';
import * as Report from '@userActions/Report';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {InvitedEmailsToAccountIDs, PersonalDetailsList} from '@src/types/onyx';
import type {WithReportOrNotFoundProps} from './home/report/withReportOrNotFound';
import withReportOrNotFound from './home/report/withReportOrNotFound';

type InviteReportParticipantsPageOnyxProps = {
    /** All of the personal details for everyone */
    personalDetails: OnyxEntry<PersonalDetailsList>;
};

type InviteReportParticipantsPageProps = InviteReportParticipantsPageOnyxProps & WithReportOrNotFoundProps & WithNavigationTransitionEndProps;

type Sections = Array<SectionListData<OptionsListUtils.MemberForList, Section<OptionsListUtils.MemberForList>>>;

function InviteReportParticipantsPage({betas, personalDetails, report, didScreenTransitionEnd}: InviteReportParticipantsPageProps) {
    const {options, areOptionsInitialized} = useOptionsList({
        shouldInitialize: didScreenTransitionEnd,
    });

    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [userSearchPhrase] = useOnyx(ONYXKEYS.ROOM_MEMBERS_USER_SEARCH_PHRASE);
    const [searchValue, debouncedSearchTerm, setSearchValue] = useDebouncedState(userSearchPhrase ?? '');
    const [selectedOptions, setSelectedOptions] = useState<ReportUtils.OptionData[]>([]);

    useEffect(() => {
        UserSearchPhraseActions.updateUserSearchPhrase(debouncedSearchTerm);
    }, [debouncedSearchTerm]);

    // Any existing participants and Expensify emails should not be eligible for invitation
    const excludedUsers = useMemo(
        () => [...PersonalDetailsUtils.getLoginsByAccountIDs(ReportUtils.getParticipantsAccountIDsForDisplay(report, false, true)), ...CONST.EXPENSIFY_EMAILS],
        [report],
    );

    const defaultOptions = useMemo(() => {
        if (!areOptionsInitialized) {
            return OptionsListUtils.getEmptyOptions();
        }

        return OptionsListUtils.getMemberInviteOptions(options.personalDetails, betas ?? [], '', excludedUsers, false, options.reports, true);
    }, [areOptionsInitialized, betas, excludedUsers, options.personalDetails, options.reports]);

    const inviteOptions = useMemo(
        () => OptionsListUtils.filterOptions(defaultOptions, debouncedSearchTerm, {excludeLogins: excludedUsers}),
        [debouncedSearchTerm, defaultOptions, excludedUsers],
    );

    useEffect(() => {
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

        setSelectedOptions(newSelectedOptions);
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps -- we don't want to recalculate when selectedOptions change
    }, [personalDetails, betas, debouncedSearchTerm, excludedUsers, options]);

    const sections = useMemo(() => {
        const sectionsArr: Sections = [];

        if (!areOptionsInitialized) {
            return [];
        }

        // Filter all options that is a part of the search term or in the personal details
        let filterSelectedOptions = selectedOptions;
        if (debouncedSearchTerm !== '') {
            filterSelectedOptions = selectedOptions.filter((option) => {
                const accountID = option?.accountID;
                const isOptionInPersonalDetails = inviteOptions.personalDetails.some((personalDetail) => accountID && personalDetail?.accountID === accountID);
                const processedSearchValue = OptionsListUtils.getSearchValueForPhoneOrEmail(debouncedSearchTerm);
                const isPartOfSearchTerm = !!option.text?.toLowerCase().includes(processedSearchValue) || !!option.login?.toLowerCase().includes(processedSearchValue);
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
        const recentReportsWithoutSelected = inviteOptions.recentReports.filter(({login}) => !selectedLogins.includes(login));
        const recentReportsFormatted = recentReportsWithoutSelected.map((reportOption) => OptionsListUtils.formatMemberForList(reportOption));
        const personalDetailsWithoutSelected = inviteOptions.personalDetails.filter(({login}) => !selectedLogins.includes(login));
        const personalDetailsFormatted = personalDetailsWithoutSelected.map((personalDetail) => OptionsListUtils.formatMemberForList(personalDetail));
        const hasUnselectedUserToInvite = inviteOptions.userToInvite && !selectedLogins.includes(inviteOptions.userToInvite.login);

        sectionsArr.push({
            title: translate('common.recents'),
            data: recentReportsFormatted,
        });

        sectionsArr.push({
            title: translate('common.contacts'),
            data: personalDetailsFormatted,
        });

        if (hasUnselectedUserToInvite) {
            sectionsArr.push({
                title: undefined,
                data: inviteOptions.userToInvite ? [OptionsListUtils.formatMemberForList(inviteOptions.userToInvite)] : [],
            });
        }

        return sectionsArr;
    }, [areOptionsInitialized, selectedOptions, debouncedSearchTerm, inviteOptions.recentReports, inviteOptions.personalDetails, inviteOptions.userToInvite, translate]);

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

    const reportID = report.reportID;
    const backRoute = useMemo(() => ROUTES.REPORT_PARTICIPANTS.getRoute(reportID), [reportID]);
    const reportName = useMemo(() => ReportUtils.getGroupChatName(undefined, true, report), [report]);
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
        Report.inviteToGroupChat(reportID, invitedEmailsToAccountIDs);
        Navigation.navigate(backRoute);
    }, [selectedOptions, backRoute, reportID, validate]);

    const headerMessage = useMemo(() => {
        const processedLogin = debouncedSearchTerm.trim().toLowerCase();
        const expensifyEmails = CONST.EXPENSIFY_EMAILS as string[];
        if (!inviteOptions.userToInvite && expensifyEmails.includes(processedLogin)) {
            return translate('messages.errorMessageInvalidEmail');
        }
        if (
            !inviteOptions.userToInvite &&
            excludedUsers.includes(
                PhoneNumber.parsePhoneNumber(LoginUtils.appendCountryCode(processedLogin)).possible
                    ? PhoneNumber.addSMSDomainIfPhoneNumber(LoginUtils.appendCountryCode(processedLogin))
                    : processedLogin,
            )
        ) {
            return translate('messages.userIsAlreadyMember', {login: processedLogin, name: reportName ?? ''});
        }
        return OptionsListUtils.getHeaderMessage(inviteOptions.recentReports.length + inviteOptions.personalDetails.length !== 0, !!inviteOptions.userToInvite, processedLogin);
    }, [debouncedSearchTerm, inviteOptions.userToInvite, inviteOptions.recentReports.length, inviteOptions.personalDetails.length, excludedUsers, translate, reportName]);

    const footerContent = useMemo(
        () => (
            <FormAlertWithSubmitButton
                isDisabled={!selectedOptions.length}
                buttonText={translate('common.invite')}
                onSubmit={() => {
                    UserSearchPhraseActions.clearUserSearchPhrase();
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
            includeSafeAreaPaddingBottom={false}
        >
            <HeaderWithBackButton
                title={translate('workspace.invite.members')}
                subtitle={reportName}
                onBackButtonPress={() => {
                    Navigation.goBack(backRoute);
                }}
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
                shouldPreventDefaultFocusOnSelectRow={!DeviceCapabilities.canUseTouchScreen()}
                showLoadingPlaceholder={!didScreenTransitionEnd || !OptionsListUtils.isPersonalDetailsReady(personalDetails)}
                footerContent={footerContent}
            />
        </ScreenWrapper>
    );
}

InviteReportParticipantsPage.displayName = 'InviteReportParticipantsPage';

export default withNavigationTransitionEnd(
    withReportOrNotFound()(
        withOnyx<InviteReportParticipantsPageProps, InviteReportParticipantsPageOnyxProps>({
            personalDetails: {
                key: ONYXKEYS.PERSONAL_DETAILS_LIST,
            },
        })(InviteReportParticipantsPage),
    ),
);
