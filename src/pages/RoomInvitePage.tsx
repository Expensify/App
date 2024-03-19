import {useNavigation} from '@react-navigation/native';
import type {StackNavigationProp} from '@react-navigation/stack';
import Str from 'expensify-common/lib/str';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import type {SectionListData} from 'react-native';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import {withOnyx} from 'react-native-onyx';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import FormAlertWithSubmitButton from '@components/FormAlertWithSubmitButton';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import type {Section} from '@components/SelectionList/types';
import UserListItem from '@components/SelectionList/UserListItem';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import * as DeviceCapabilities from '@libs/DeviceCapabilities';
import * as LoginUtils from '@libs/LoginUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {RootStackParamList} from '@libs/Navigation/types';
import * as OptionsListUtils from '@libs/OptionsListUtils';
import * as PersonalDetailsUtils from '@libs/PersonalDetailsUtils';
import * as PhoneNumber from '@libs/PhoneNumber';
import * as PolicyUtils from '@libs/PolicyUtils';
import * as ReportUtils from '@libs/ReportUtils';
import * as Report from '@userActions/Report';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {PersonalDetailsList, Policy} from '@src/types/onyx';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import type {WithReportOrNotFoundProps} from './home/report/withReportOrNotFound';
import withReportOrNotFound from './home/report/withReportOrNotFound';
import SearchInputManager from './workspace/SearchInputManager';

type RoomInvitePageOnyxProps = {
    /** All of the personal details for everyone */
    personalDetails: OnyxEntry<PersonalDetailsList>;
};

type RoomInvitePageProps = RoomInvitePageOnyxProps & WithReportOrNotFoundProps;

type Sections = Array<SectionListData<OptionsListUtils.MemberForList, Section<OptionsListUtils.MemberForList>>>;

function RoomInvitePage({betas, personalDetails, report, policies}: RoomInvitePageProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedOptions, setSelectedOptions] = useState<ReportUtils.OptionData[]>([]);
    const [invitePersonalDetails, setInvitePersonalDetails] = useState<ReportUtils.OptionData[]>([]);
    const [userToInvite, setUserToInvite] = useState<ReportUtils.OptionData | null>(null);
    const [didScreenTransitionEnd, setDidScreenTransitionEnd] = useState(false);
    const navigation: StackNavigationProp<RootStackParamList> = useNavigation();

    useEffect(() => {
        setSearchTerm(SearchInputManager.searchInput);
    }, []);

    // Any existing participants and Expensify emails should not be eligible for invitation
    const excludedUsers = useMemo(
        () =>
            [...PersonalDetailsUtils.getLoginsByAccountIDs(report?.visibleChatMemberAccountIDs ?? []), ...CONST.EXPENSIFY_EMAILS].map((participant) =>
                PhoneNumber.addSMSDomainIfPhoneNumber(participant),
            ),
        [report],
    );

    useEffect(() => {
        const inviteOptions = OptionsListUtils.getMemberInviteOptions(personalDetails, betas ?? [], searchTerm, excludedUsers);

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

        setUserToInvite(inviteOptions.userToInvite);
        setInvitePersonalDetails(inviteOptions.personalDetails);
        setSelectedOptions(newSelectedOptions);
        // eslint-disable-next-line react-hooks/exhaustive-deps -- we don't want to recalculate when selectedOptions change
    }, [personalDetails, betas, searchTerm, excludedUsers]);

    useEffect(() => {
        const unsubscribeTransitionEnd = navigation.addListener('transitionEnd', () => {
            setDidScreenTransitionEnd(true);
        });

        return () => {
            unsubscribeTransitionEnd();
        };
        // Rule disabled because this effect is only for component did mount & will component unmount lifecycle event
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const sections = useMemo(() => {
        const sectionsArr: Sections = [];
        let indexOffset = 0;

        if (!didScreenTransitionEnd) {
            return [];
        }

        // Filter all options that is a part of the search term or in the personal details
        let filterSelectedOptions = selectedOptions;
        if (searchTerm !== '') {
            filterSelectedOptions = selectedOptions.filter((option) => {
                const accountID = option?.accountID;
                const isOptionInPersonalDetails = invitePersonalDetails.some((personalDetail) => accountID && personalDetail?.accountID === accountID);
                const parsedPhoneNumber = PhoneNumber.parsePhoneNumber(LoginUtils.appendCountryCode(Str.removeSMSDomain(searchTerm)));
                const searchValue = parsedPhoneNumber.possible && parsedPhoneNumber.number ? parsedPhoneNumber.number.e164 : searchTerm.toLowerCase();
                const isPartOfSearchTerm = (option.text?.toLowerCase() ?? '').includes(searchValue) || (option.login?.toLowerCase() ?? '').includes(searchValue);
                return isPartOfSearchTerm || isOptionInPersonalDetails;
            });
        }
        const filterSelectedOptionsFormatted = filterSelectedOptions.map((selectedOption) => OptionsListUtils.formatMemberForList(selectedOption));

        sectionsArr.push({
            title: undefined,
            data: filterSelectedOptionsFormatted,
            indexOffset,
        });
        indexOffset += filterSelectedOptions.length;

        // Filtering out selected users from the search results
        const selectedLogins = selectedOptions.map(({login}) => login);
        const personalDetailsWithoutSelected = invitePersonalDetails.filter(({login}) => !selectedLogins.includes(login));
        const personalDetailsFormatted = personalDetailsWithoutSelected.map((personalDetail) => OptionsListUtils.formatMemberForList(personalDetail));
        const hasUnselectedUserToInvite = userToInvite && !selectedLogins.includes(userToInvite.login);

        sectionsArr.push({
            title: translate('common.contacts'),
            data: personalDetailsFormatted,
            indexOffset,
        });
        indexOffset += personalDetailsFormatted.length;

        if (hasUnselectedUserToInvite) {
            sectionsArr.push({
                title: undefined,
                data: [OptionsListUtils.formatMemberForList(userToInvite)],
                indexOffset,
            });
        }

        return sectionsArr;
    }, [invitePersonalDetails, searchTerm, selectedOptions, translate, userToInvite, didScreenTransitionEnd]);

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
    const isPolicyMember = useMemo(() => (report?.policyID ? PolicyUtils.isPolicyMember(report.policyID, policies as Record<string, Policy>) : false), [report?.policyID, policies]);
    const backRoute = useMemo(() => reportID && (isPolicyMember ? ROUTES.ROOM_MEMBERS.getRoute(reportID) : ROUTES.REPORT_WITH_ID_DETAILS.getRoute(reportID)), [isPolicyMember, reportID]);
    const reportName = useMemo(() => ReportUtils.getReportName(report), [report]);
    const inviteUsers = useCallback(() => {
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
        SearchInputManager.searchInput = '';
        Navigation.navigate(backRoute);
    }, [selectedOptions, backRoute, reportID, validate]);

    const headerMessage = useMemo(() => {
        const searchValue = searchTerm.trim().toLowerCase();
        const expensifyEmails = CONST.EXPENSIFY_EMAILS as string[];
        if (!userToInvite && expensifyEmails.includes(searchValue)) {
            return translate('messages.errorMessageInvalidEmail');
        }
        if (
            !userToInvite &&
            excludedUsers.includes(
                PhoneNumber.parsePhoneNumber(LoginUtils.appendCountryCode(searchValue)).possible
                    ? PhoneNumber.addSMSDomainIfPhoneNumber(LoginUtils.appendCountryCode(searchValue))
                    : searchValue,
            )
        ) {
            return translate('messages.userIsAlreadyMember', {login: searchValue, name: reportName});
        }
        return OptionsListUtils.getHeaderMessage(invitePersonalDetails.length !== 0, Boolean(userToInvite), searchValue);
    }, [searchTerm, userToInvite, excludedUsers, invitePersonalDetails, translate, reportName]);
    return (
        <ScreenWrapper
            shouldEnableMaxHeight
            testID={RoomInvitePage.displayName}
        >
            <FullPageNotFoundView
                shouldShow={isEmptyObject(report)}
                subtitleKey={isEmptyObject(report) ? undefined : 'roomMembersPage.notAuthorized'}
                onBackButtonPress={() => Navigation.goBack(backRoute)}
            >
                <HeaderWithBackButton
                    title={translate('workspace.invite.invitePeople')}
                    subtitle={reportName}
                    onBackButtonPress={() => {
                        Navigation.goBack(backRoute);
                    }}
                />
                <SelectionList
                    canSelectMultiple
                    sections={sections}
                    ListItem={UserListItem}
                    textInputLabel={translate('optionsSelector.nameEmailOrPhoneNumber')}
                    textInputValue={searchTerm}
                    onChangeText={(value) => {
                        SearchInputManager.searchInput = value;
                        setSearchTerm(value);
                    }}
                    headerMessage={headerMessage}
                    onSelectRow={toggleOption}
                    onConfirm={inviteUsers}
                    showScrollIndicator
                    shouldPreventDefaultFocusOnSelectRow={!DeviceCapabilities.canUseTouchScreen()}
                    showLoadingPlaceholder={!didScreenTransitionEnd || !OptionsListUtils.isPersonalDetailsReady(personalDetails)}
                />
                <View style={[styles.flexShrink0]}>
                    <FormAlertWithSubmitButton
                        isDisabled={!selectedOptions.length}
                        buttonText={translate('common.invite')}
                        onSubmit={inviteUsers}
                        containerStyles={[styles.flexReset, styles.flexGrow0, styles.flexShrink0, styles.flexBasisAuto, styles.mb5]}
                        enabledWhenOffline
                        disablePressOnEnter
                        isAlertVisible={false}
                    />
                </View>
            </FullPageNotFoundView>
        </ScreenWrapper>
    );
}

RoomInvitePage.displayName = 'RoomInvitePage';

export default withReportOrNotFound()(
    withOnyx<RoomInvitePageProps, RoomInvitePageOnyxProps>({
        personalDetails: {
            key: ONYXKEYS.PERSONAL_DETAILS_LIST,
        },
    })(RoomInvitePage),
);
