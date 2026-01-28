import {Str} from 'expensify-common';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import type {SectionListData} from 'react-native';
import {View} from 'react-native';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import FormAlertWithSubmitButton from '@components/FormAlertWithSubmitButton';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import {useOptionsList} from '@components/OptionListContextProvider';
import ScreenWrapper from '@components/ScreenWrapper';
// eslint-disable-next-line no-restricted-imports
import SelectionList from '@components/SelectionListWithSections';
import InviteMemberListItem from '@components/SelectionListWithSections/InviteMemberListItem';
import type {Section} from '@components/SelectionListWithSections/types';
import withNavigationTransitionEnd from '@components/withNavigationTransitionEnd';
import type {WithNavigationTransitionEndProps} from '@components/withNavigationTransitionEnd';
import useAncestors from '@hooks/useAncestors';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useDebouncedState from '@hooks/useDebouncedState';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useReportIsArchived from '@hooks/useReportIsArchived';
import useThemeStyles from '@hooks/useThemeStyles';
import {inviteToRoom, inviteToRoomAction, searchInServer} from '@libs/actions/Report';
import {clearUserSearchPhrase, updateUserSearchPhrase} from '@libs/actions/RoomMembersUserSearchPhrase';
import {READ_COMMANDS} from '@libs/API/types';
import {canUseTouchScreen} from '@libs/DeviceCapabilities';
import HttpUtils from '@libs/HttpUtils';
import {appendCountryCode} from '@libs/LoginUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {RoomMembersNavigatorParamList} from '@libs/Navigation/types';
import type {MemberForList} from '@libs/OptionsListUtils';
import {filterAndOrderOptions, formatMemberForList, getHeaderMessage, getMemberInviteOptions} from '@libs/OptionsListUtils';
import Parser from '@libs/Parser';
import {getLoginsByAccountIDs} from '@libs/PersonalDetailsUtils';
import {addSMSDomainIfPhoneNumber, parsePhoneNumber} from '@libs/PhoneNumber';
import type {MemberEmailsToAccountIDs} from '@libs/PolicyUtils';
import {isPolicyEmployee as isPolicyEmployeeUtil} from '@libs/PolicyUtils';
import {getReportAction} from '@libs/ReportActionsUtils';
import type {OptionData} from '@libs/ReportUtils';
import {getReportName, isHiddenForCurrentUser, isPolicyExpenseChat} from '@libs/ReportUtils';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import type {WithReportOrNotFoundProps} from './inbox/report/withReportOrNotFound';
import withReportOrNotFound from './inbox/report/withReportOrNotFound';

type RoomInvitePageProps = WithReportOrNotFoundProps & WithNavigationTransitionEndProps & PlatformStackScreenProps<RoomMembersNavigatorParamList, typeof SCREENS.ROOM_MEMBERS.INVITE>;

type Sections = Array<SectionListData<MemberForList, Section<MemberForList>>>;
function RoomInvitePage({
    betas,
    report,
    policy,
    route: {
        params: {backTo},
    },
}: RoomInvitePageProps) {
    const styles = useThemeStyles();
    const {translate, formatPhoneNumber} = useLocalize();
    const [userSearchPhrase] = useOnyx(ONYXKEYS.ROOM_MEMBERS_USER_SEARCH_PHRASE, {canBeMissing: true});
    const [countryCode = CONST.DEFAULT_COUNTRY_CODE] = useOnyx(ONYXKEYS.COUNTRY_CODE, {canBeMissing: false});
    const [loginList] = useOnyx(ONYXKEYS.LOGIN_LIST, {canBeMissing: true});
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const currentUserAccountID = currentUserPersonalDetails.accountID;
    const currentUserEmail = currentUserPersonalDetails.email ?? '';
    const [searchTerm, debouncedSearchTerm, setSearchTerm] = useDebouncedState(userSearchPhrase ?? '');
    const [selectedOptions, setSelectedOptions] = useState<OptionData[]>([]);
    const [isSearchingForReports] = useOnyx(ONYXKEYS.IS_SEARCHING_FOR_REPORTS, {initWithStoredValues: false, canBeMissing: true});
    const isReportArchived = useReportIsArchived(report.reportID);
    const [nvpDismissedProductTraining] = useOnyx(ONYXKEYS.NVP_DISMISSED_PRODUCT_TRAINING, {canBeMissing: true});

    const {options, areOptionsInitialized} = useOptionsList();

    // Any existing participants and Expensify emails should not be eligible for invitation
    const excludedUsers = useMemo(() => {
        const res = {
            ...CONST.EXPENSIFY_EMAILS_OBJECT,
        };
        const visibleParticipantAccountIDs = Object.entries(report.participants ?? {})
            .filter(([, participant]) => participant && !isHiddenForCurrentUser(participant.notificationPreference))
            .map(([accountID]) => Number(accountID));
        for (const participant of getLoginsByAccountIDs(visibleParticipantAccountIDs)) {
            const smsDomain = addSMSDomainIfPhoneNumber(participant);
            res[smsDomain] = true;
        }

        return res;
    }, [report.participants]);

    const defaultOptions = useMemo(() => {
        if (!areOptionsInitialized) {
            return {recentReports: [], personalDetails: [], userToInvite: null, currentUserOption: null};
        }

        const inviteOptions = getMemberInviteOptions(options.personalDetails, nvpDismissedProductTraining, loginList, currentUserAccountID, currentUserEmail, betas ?? [], excludedUsers);
        // Update selectedOptions with the latest personalDetails information
        const detailsMap: Record<string, MemberForList> = {};
        for (const detail of inviteOptions.personalDetails) {
            if (!detail.login) {
                continue;
            }
            detailsMap[detail.login] = formatMemberForList(detail);
        }
        const newSelectedOptions: OptionData[] = [];
        for (const option of selectedOptions) {
            newSelectedOptions.push(option.login && option.login in detailsMap ? {...detailsMap[option.login], isSelected: true} : option);
        }

        return {
            userToInvite: inviteOptions.userToInvite,
            personalDetails: inviteOptions.personalDetails,
            selectedOptions: newSelectedOptions,
            recentReports: [],
            currentUserOption: null,
        };
    }, [areOptionsInitialized, options.personalDetails, nvpDismissedProductTraining, loginList, currentUserAccountID, currentUserEmail, betas, excludedUsers, selectedOptions]);

    const inviteOptions = useMemo(() => {
        if (debouncedSearchTerm.trim() === '') {
            return defaultOptions;
        }
        const filteredOptions = filterAndOrderOptions(defaultOptions, debouncedSearchTerm, countryCode, loginList, currentUserEmail, currentUserAccountID, {
            excludeLogins: excludedUsers,
        });

        return filteredOptions;
    }, [debouncedSearchTerm, defaultOptions, countryCode, loginList, currentUserEmail, currentUserAccountID, excludedUsers]);

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
                const parsedPhoneNumber = parsePhoneNumber(appendCountryCode(Str.removeSMSDomain(debouncedSearchTerm), countryCode));
                const searchValue = parsedPhoneNumber.possible && parsedPhoneNumber.number ? parsedPhoneNumber.number.e164 : debouncedSearchTerm.toLowerCase();
                const isPartOfSearchTerm = (option.text?.toLowerCase() ?? '').includes(searchValue) || (option.login?.toLowerCase() ?? '').includes(searchValue);
                return isPartOfSearchTerm || isOptionInPersonalDetails;
            });
        }
        const filterSelectedOptionsFormatted = filterSelectedOptions.map((selectedOption) => formatMemberForList(selectedOption));

        sectionsArr.push({
            title: undefined,
            data: filterSelectedOptionsFormatted,
        });

        // Filtering out selected users from the search results
        const selectedLogins = new Set(selectedOptions.map(({login}) => login));
        const personalDetailsWithoutSelected = personalDetails ? personalDetails.filter(({login}) => !selectedLogins.has(login)) : [];
        const personalDetailsFormatted = personalDetailsWithoutSelected.map((personalDetail) => formatMemberForList(personalDetail));
        const hasUnselectedUserToInvite = userToInvite && !selectedLogins.has(userToInvite.login);

        sectionsArr.push({
            title: translate('common.contacts'),
            data: personalDetailsFormatted,
        });

        if (hasUnselectedUserToInvite) {
            sectionsArr.push({
                title: undefined,
                data: [formatMemberForList(userToInvite)],
            });
        }

        return sectionsArr;
    }, [inviteOptions, areOptionsInitialized, selectedOptions, debouncedSearchTerm, translate, countryCode]);

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

    const validate = useCallback(() => selectedOptions.length > 0, [selectedOptions.length]);

    // Non policy members should not be able to view the participants of a room
    const reportID = report?.reportID;
    const isPolicyEmployee = useMemo(() => isPolicyEmployeeUtil(report?.policyID, policy), [report?.policyID, policy]);
    const reportAction = useMemo(() => getReportAction(report?.parentReportID, report?.parentReportActionID), [report?.parentReportID, report?.parentReportActionID]);
    const shouldParserToHTML = reportAction?.actionName !== CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT;
    const backRoute = useMemo(() => {
        return reportID && (!isPolicyEmployee || isReportArchived ? ROUTES.REPORT_WITH_ID_DETAILS.getRoute(reportID, backTo) : ROUTES.ROOM_MEMBERS.getRoute(reportID, backTo));
    }, [isPolicyEmployee, reportID, backTo, isReportArchived]);

    // eslint-disable-next-line @typescript-eslint/no-deprecated
    const reportName = useMemo(() => getReportName(report), [report]);

    const ancestors = useAncestors(report);

    const inviteUsers = () => {
        HttpUtils.cancelPendingRequests(READ_COMMANDS.SEARCH_FOR_REPORTS);

        if (!validate()) {
            return;
        }
        const invitedEmailsToAccountIDs: MemberEmailsToAccountIDs = {};
        for (const option of selectedOptions) {
            const login = option.login ?? '';
            const accountID = option.accountID;
            if (!login.toLowerCase().trim() || !accountID) {
                continue;
            }
            invitedEmailsToAccountIDs[login] = Number(accountID);
        }
        if (report?.reportID) {
            if (isPolicyExpenseChat(report)) {
                inviteToRoomAction(report, ancestors, invitedEmailsToAccountIDs, currentUserPersonalDetails.timezone ?? CONST.DEFAULT_TIME_ZONE);
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

    const goBack = useCallback(() => {
        Navigation.goBack(backRoute);
    }, [backRoute]);

    const headerMessage = useMemo(() => {
        const searchValue = debouncedSearchTerm.trim().toLowerCase();
        const expensifyEmails = CONST.EXPENSIFY_EMAILS;
        if (!inviteOptions.userToInvite && expensifyEmails.includes(searchValue)) {
            return translate('messages.errorMessageInvalidEmail');
        }
        if (
            !inviteOptions.userToInvite &&
            excludedUsers[parsePhoneNumber(appendCountryCode(searchValue, countryCode)).possible ? addSMSDomainIfPhoneNumber(appendCountryCode(searchValue, countryCode)) : searchValue]
        ) {
            return translate('messages.userIsAlreadyMember', {login: searchValue, name: reportName});
        }
        return getHeaderMessage((inviteOptions.personalDetails ?? []).length !== 0, !!inviteOptions.userToInvite, debouncedSearchTerm, countryCode);
    }, [debouncedSearchTerm, inviteOptions.userToInvite, inviteOptions.personalDetails, excludedUsers, countryCode, translate, reportName]);

    useEffect(() => {
        updateUserSearchPhrase(debouncedSearchTerm);
        searchInServer(debouncedSearchTerm);
    }, [debouncedSearchTerm]);

    let subtitleKey: '' | TranslationPaths | undefined;
    if (!isEmptyObject(report)) {
        subtitleKey = isReportArchived ? 'roomMembersPage.roomArchived' : 'roomMembersPage.notAuthorized';
    }

    return (
        <ScreenWrapper
            shouldEnableMaxHeight
            testID="RoomInvitePage"
            includeSafeAreaPaddingBottom
        >
            <FullPageNotFoundView
                shouldShow={isEmptyObject(report) || isReportArchived}
                subtitleKey={subtitleKey}
                onBackButtonPress={goBack}
            >
                <HeaderWithBackButton
                    title={translate('workspace.invite.invitePeople')}
                    subtitle={shouldParserToHTML ? Parser.htmlToText(reportName) : reportName}
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

export default withNavigationTransitionEnd(withReportOrNotFound()(RoomInvitePage));
