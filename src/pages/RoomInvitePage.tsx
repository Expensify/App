import Str from 'expensify-common/lib/str';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import {withOnyx} from 'react-native-onyx';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import FormAlertWithSubmitButton from '@components/FormAlertWithSubmitButton';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import * as DeviceCapabilities from '@libs/DeviceCapabilities';
import * as LoginUtils from '@libs/LoginUtils';
import Navigation from '@libs/Navigation/Navigation';
import * as OptionsListUtils from '@libs/OptionsListUtils';
import * as PersonalDetailsUtils from '@libs/PersonalDetailsUtils';
import {parsePhoneNumber} from '@libs/PhoneNumber';
import * as PolicyUtils from '@libs/PolicyUtils';
import * as ReportUtils from '@libs/ReportUtils';
import * as Report from '@userActions/Report';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {PersonalDetailsList, Policy} from '@src/types/onyx';
import type {WithReportOrNotFoundProps} from './home/report/withReportOrNotFound';
import withReportOrNotFound from './home/report/withReportOrNotFound';

type RoomInvitePageOnyxProps = {
    /** All of the personal details for everyone */
    personalDetails: OnyxEntry<PersonalDetailsList>;
};

type RoomInvitePageProps = RoomInvitePageOnyxProps & WithReportOrNotFoundProps;

function RoomInvitePage({betas, personalDetails, report, policies}: RoomInvitePageProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedOptions, setSelectedOptions] = useState<ReportUtils.OptionData[]>([]);
    const [invitePersonalDetails, setPersonalDetails] = useState<ReportUtils.OptionData[]>([]);
    const [userToInvite, setUserToInvite] = useState<ReportUtils.OptionData | null>(null);

    // Any existing participants and Expensify emails should not be eligible for invitation
    const excludedUsers = useMemo(() => [...PersonalDetailsUtils.getLoginsByAccountIDs(report?.visibleChatMemberAccountIDs ?? []), ...CONST.EXPENSIFY_EMAILS], [report]);

    useEffect(() => {
        // @ts-expect-error TODO: Remove this once OptionsListUtils (https://github.com/Expensify/App/issues/24921) is migrated to TypeScript.
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const inviteOptions: any = OptionsListUtils.getMemberInviteOptions(personalDetails, betas, searchTerm, excludedUsers);

        // Update selectedOptions with the latest personalDetails information
        const detailsMap: Record<string, ReportUtils.OptionData> = {};
        // @ts-expect-error TODO: Remove this once OptionsListUtils (https://github.com/Expensify/App/issues/24921) is migrated to TypeScript.
        inviteOptions.personalDetails.forEach((detail) => (detailsMap[detail.login] = OptionsListUtils.formatMemberForList(detail, false)));
        const newSelectedOptions: ReportUtils.OptionData[] = [];
        selectedOptions.forEach((option) => {
            newSelectedOptions.push(option.login && option.login in detailsMap ? {...detailsMap[option.login], isSelected: true} : option);
        });

        setUserToInvite(inviteOptions.userToInvite);
        setPersonalDetails(inviteOptions.personalDetails);
        setSelectedOptions(newSelectedOptions);
        // eslint-disable-next-line react-hooks/exhaustive-deps -- we don't want to recalculate when selectedOptions change
    }, [personalDetails, betas, searchTerm, excludedUsers]);

    const getSections = () => {
        const sections = [];
        let indexOffset = 0;

        // Filter all options that is a part of the search term or in the personal details
        let filterSelectedOptions = selectedOptions;
        if (searchTerm !== '') {
            filterSelectedOptions = selectedOptions.filter((option) => {
                const accountID = option.accountID;
                const isOptionInPersonalDetails = invitePersonalDetails.filter((personalDetail) => personalDetail.accountID === accountID);
                const parsedPhoneNumber = parsePhoneNumber(LoginUtils.appendCountryCode(Str.removeSMSDomain(searchTerm)));
                const searchValue = parsedPhoneNumber.possible && parsedPhoneNumber.number ? parsedPhoneNumber.number.e164 : searchTerm.toLowerCase();
                const isPartOfSearchTerm = option.text.toLowerCase().includes(searchValue) || option.login?.toLowerCase().includes(searchValue);
                return isPartOfSearchTerm ?? isOptionInPersonalDetails;
            });
        }

        sections.push({
            title: undefined,
            data: filterSelectedOptions,
            indexOffset,
        });
        indexOffset += filterSelectedOptions.length;

        // Filtering out selected users from the search results
        const selectedLogins = selectedOptions.map(({login}) => login);
        const personalDetailsWithoutSelected = invitePersonalDetails.filter(({login}) => !selectedLogins.includes(login));
        const personalDetailsFormatted = personalDetailsWithoutSelected.map((personalDetail) => OptionsListUtils.formatMemberForList(personalDetail, false));
        const hasUnselectedUserToInvite = userToInvite && !selectedLogins.includes(userToInvite.login);

        sections.push({
            title: translate('common.contacts'),
            data: personalDetailsFormatted,
            indexOffset,
        });
        indexOffset += personalDetailsFormatted.length;

        if (hasUnselectedUserToInvite) {
            sections.push({
                title: undefined,
                data: [OptionsListUtils.formatMemberForList(userToInvite, false)],
                indexOffset,
            });
        }

        return sections;
    };

    const toggleOption = useCallback(
        (option: ReportUtils.OptionData) => {
            const isOptionInList = selectedOptions.some((selectedOption) => selectedOption.login === option.login);

            let newSelectedOptions;
            if (isOptionInList) {
                newSelectedOptions = selectedOptions.filter((selectedOption) => selectedOption.login === option.login);
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
        Navigation.navigate(backRoute);
    }, [selectedOptions, backRoute, reportID, validate]);

    const headerMessage = useMemo(() => {
        const searchValue = searchTerm.trim().toLowerCase();
        const expensifyEmails = CONST.EXPENSIFY_EMAILS as string[];
        if (!userToInvite && expensifyEmails.includes(searchValue)) {
            return translate('messages.errorMessageInvalidEmail');
        }
        if (!userToInvite && excludedUsers.includes(searchValue)) {
            return translate('messages.userIsAlreadyMember', {login: searchValue, name: reportName});
        }
        return OptionsListUtils.getHeaderMessage(invitePersonalDetails.length !== 0, Boolean(userToInvite), searchValue);
    }, [excludedUsers, translate, searchTerm, userToInvite, invitePersonalDetails, reportName]);
    return (
        <ScreenWrapper
            shouldEnableMaxHeight
            testID={RoomInvitePage.displayName}
        >
            {({didScreenTransitionEnd}) => {
                const sections = didScreenTransitionEnd ? getSections() : [];

                return (
                    <FullPageNotFoundView
                        shouldShow={!!report}
                        subtitleKey={report ? undefined : 'roomMembersPage.notAuthorized'}
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
                            // @ts-expect-error TODO: Remove this once SelectionList (https://github.com/Expensify/App/issues/31981) is migrated to TypeScript.
                            canSelectMultiple
                            sections={sections}
                            textInputLabel={translate('optionsSelector.nameEmailOrPhoneNumber')}
                            textInputValue={searchTerm}
                            onChangeText={setSearchTerm}
                            headerMessage={headerMessage}
                            onSelectRow={toggleOption}
                            onConfirm={inviteUsers}
                            showScrollIndicator
                            shouldPreventDefaultFocusOnSelectRow={!DeviceCapabilities.canUseTouchScreen()}
                            // @ts-expect-error TODO: Remove this once OptionsListUtils (https://github.com/Expensify/App/issues/24921) is migrated to TypeScript.
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
                );
            }}
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
