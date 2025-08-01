import {useRoute} from '@react-navigation/native';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import type {SectionListData} from 'react-native';
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
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import {inviteToGroupChat, searchInServer} from '@libs/actions/Report';
import {clearUserSearchPhrase, updateUserSearchPhrase} from '@libs/actions/RoomMembersUserSearchPhrase';
import {canUseTouchScreen} from '@libs/DeviceCapabilities';
import {appendCountryCode} from '@libs/LoginUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackRouteProp} from '@libs/Navigation/PlatformStackNavigation/types';
import type {ParticipantsNavigatorParamList} from '@libs/Navigation/types';
import {
    filterAndOrderOptions,
    formatMemberForList,
    getEmptyOptions,
    getHeaderMessage,
    getMemberInviteOptions,
    getSearchValueForPhoneOrEmail,
    isPersonalDetailsReady,
} from '@libs/OptionsListUtils';
import type {MemberForList} from '@libs/OptionsListUtils';
import {getLoginsByAccountIDs} from '@libs/PersonalDetailsUtils';
import {addSMSDomainIfPhoneNumber, parsePhoneNumber} from '@libs/PhoneNumber';
import {getGroupChatName, getParticipantsAccountIDsForDisplay} from '@libs/ReportUtils';
import type {OptionData} from '@libs/ReportUtils';
import tokenizedSearch from '@libs/tokenizedSearch';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {InvitedEmailsToAccountIDs} from '@src/types/onyx';
import type {WithReportOrNotFoundProps} from './home/report/withReportOrNotFound';
import withReportOrNotFound from './home/report/withReportOrNotFound';

type InviteReportParticipantsPageProps = WithReportOrNotFoundProps & WithNavigationTransitionEndProps;

type Sections = Array<SectionListData<MemberForList, Section<MemberForList>>>;

function InviteReportParticipantsPage({betas, report, didScreenTransitionEnd}: InviteReportParticipantsPageProps) {
    const route = useRoute<PlatformStackRouteProp<ParticipantsNavigatorParamList, typeof SCREENS.REPORT_PARTICIPANTS.INVITE>>();
    const {options, areOptionsInitialized} = useOptionsList({
        shouldInitialize: didScreenTransitionEnd,
    });

    const styles = useThemeStyles();
    const {translate, formatPhoneNumber} = useLocalize();
    const [personalDetails] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST, {canBeMissing: false});
    const [userSearchPhrase] = useOnyx(ONYXKEYS.ROOM_MEMBERS_USER_SEARCH_PHRASE, {canBeMissing: true});
    const [searchValue, debouncedSearchTerm, setSearchValue] = useDebouncedState(userSearchPhrase ?? '');
    const [selectedOptions, setSelectedOptions] = useState<OptionData[]>([]);

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

    const defaultOptions = useMemo(() => {
        if (!areOptionsInitialized) {
            return getEmptyOptions();
        }

        return getMemberInviteOptions(options.personalDetails, betas ?? [], excludedUsers, false, options.reports, true);
    }, [areOptionsInitialized, betas, excludedUsers, options.personalDetails, options.reports]);

    const inviteOptions = useMemo(() => filterAndOrderOptions(defaultOptions, debouncedSearchTerm, {excludeLogins: excludedUsers}), [debouncedSearchTerm, defaultOptions, excludedUsers]);

    useEffect(() => {
        // Update selectedOptions with the latest personalDetails information
        const detailsMap: Record<string, MemberForList> = {};
        inviteOptions.personalDetails.forEach((detail) => {
            if (!detail.login) {
                return;
            }
            detailsMap[detail.login] = formatMemberForList(detail);
        });
        const newSelectedOptions: OptionData[] = [];
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
            const processedSearchValue = getSearchValueForPhoneOrEmail(debouncedSearchTerm);
            filterSelectedOptions = tokenizedSearch(selectedOptions, processedSearchValue, (option) => [option.text ?? '', option.login ?? '']).filter((option) => {
                const accountID = option?.accountID;
                const isOptionInPersonalDetails = inviteOptions.personalDetails.some((personalDetail) => accountID && personalDetail?.accountID === accountID);
                const isPartOfSearchTerm = !!option.text?.toLowerCase().includes(processedSearchValue) || !!option.login?.toLowerCase().includes(processedSearchValue);
                return isPartOfSearchTerm || isOptionInPersonalDetails;
            });
        }
        const filterSelectedOptionsFormatted = filterSelectedOptions.map((selectedOption) => formatMemberForList(selectedOption));

        sectionsArr.push({
            title: undefined,
            data: filterSelectedOptionsFormatted,
        });

        // Filtering out selected users from the search results
        const selectedLogins = selectedOptions.map(({login}) => login);
        const recentReportsWithoutSelected = inviteOptions.recentReports.filter(({login}) => !selectedLogins.includes(login));
        const recentReportsFormatted = recentReportsWithoutSelected.map((reportOption) => formatMemberForList(reportOption));
        const personalDetailsWithoutSelected = inviteOptions.personalDetails.filter(({login}) => !selectedLogins.includes(login));
        const personalDetailsFormatted = personalDetailsWithoutSelected.map((personalDetail) => formatMemberForList(personalDetail));
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
                data: inviteOptions.userToInvite ? [formatMemberForList(inviteOptions.userToInvite)] : [],
            });
        }

        return sectionsArr;
    }, [areOptionsInitialized, selectedOptions, debouncedSearchTerm, inviteOptions.recentReports, inviteOptions.personalDetails, inviteOptions.userToInvite, translate]);

    const toggleOption = useCallback(
        (option: MemberForList) => {
            const isOptionInList = selectedOptions.some((selectedOption) => selectedOption.login === option.login);

            let newSelectedOptions: OptionData[];
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
        const processedLogin = debouncedSearchTerm.trim().toLowerCase();
        const expensifyEmails = CONST.EXPENSIFY_EMAILS;
        if (!inviteOptions.userToInvite && expensifyEmails.includes(processedLogin)) {
            return translate('messages.errorMessageInvalidEmail');
        }
        if (
            !inviteOptions.userToInvite &&
            excludedUsers[parsePhoneNumber(appendCountryCode(processedLogin)).possible ? addSMSDomainIfPhoneNumber(appendCountryCode(processedLogin)) : processedLogin]
        ) {
            return translate('messages.userIsAlreadyMember', {login: processedLogin, name: reportName ?? ''});
        }
        return getHeaderMessage(inviteOptions.recentReports.length + inviteOptions.personalDetails.length !== 0, !!inviteOptions.userToInvite, processedLogin);
    }, [debouncedSearchTerm, inviteOptions.userToInvite, inviteOptions.recentReports.length, inviteOptions.personalDetails.length, excludedUsers, translate, reportName]);

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
                textInputValue={searchValue}
                onChangeText={(value) => {
                    setSearchValue(value);
                }}
                headerMessage={headerMessage}
                onSelectRow={toggleOption}
                onConfirm={inviteUsers}
                showScrollIndicator
                shouldPreventDefaultFocusOnSelectRow={!canUseTouchScreen()}
                showLoadingPlaceholder={!didScreenTransitionEnd || !isPersonalDetailsReady(personalDetails)}
                footerContent={footerContent}
            />
        </ScreenWrapper>
    );
}

InviteReportParticipantsPage.displayName = 'InviteReportParticipantsPage';

export default withNavigationTransitionEnd(withReportOrNotFound()(InviteReportParticipantsPage));
