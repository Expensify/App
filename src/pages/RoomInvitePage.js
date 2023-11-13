import lodashGet from 'lodash/get';
import PropTypes from 'prop-types';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import _ from 'underscore';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import FormAlertWithSubmitButton from '@components/FormAlertWithSubmitButton';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import useLocalize from '@hooks/useLocalize';
import * as Browser from '@libs/Browser';
import compose from '@libs/compose';
import Navigation from '@libs/Navigation/Navigation';
import * as OptionsListUtils from '@libs/OptionsListUtils';
import Permissions from '@libs/Permissions';
import * as PersonalDetailsUtils from '@libs/PersonalDetailsUtils';
import * as PolicyUtils from '@libs/PolicyUtils';
import * as ReportUtils from '@libs/ReportUtils';
import styles from '@styles/styles';
import * as Report from '@userActions/Report';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import withReportOrNotFound from './home/report/withReportOrNotFound';
import personalDetailsPropType from './personalDetailsPropType';
import reportPropTypes from './reportPropTypes';
import {policyDefaultProps, policyPropTypes} from './workspace/withPolicy';

const propTypes = {
    /** Beta features list */
    betas: PropTypes.arrayOf(PropTypes.string),

    /** All of the personal details for everyone */
    personalDetails: PropTypes.objectOf(personalDetailsPropType),

    /** URL Route params */
    route: PropTypes.shape({
        /** Params from the URL path */
        params: PropTypes.shape({
            /** policyID passed via route: /workspace/:policyID/invite */
            policyID: PropTypes.string,
        }),
    }).isRequired,

    /** The report currently being looked at */
    report: reportPropTypes.isRequired,

    /** The policies which the user has access to and which the report could be tied to */
    policies: PropTypes.shape({
        /** ID of the policy */
        id: PropTypes.string,
    }).isRequired,

    ...policyPropTypes,
};

const defaultProps = {
    personalDetails: {},
    betas: [],
    ...policyDefaultProps,
};

function RoomInvitePage(props) {
    const {translate} = useLocalize();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedOptions, setSelectedOptions] = useState([]);
    const [personalDetails, setPersonalDetails] = useState([]);
    const [usersToInvite, setUsersToInvite] = useState([]);

    // Any existing participants and Expensify emails should not be eligible for invitation
    const excludedUsers = useMemo(() => [...PersonalDetailsUtils.getLoginsByAccountIDs(lodashGet(props.report, 'participantAccountIDs', [])), ...CONST.EXPENSIFY_EMAILS], [props.report]);

    useEffect(() => {
        // Kick the user out if they tried to navigate to this via the URL
        if (Permissions.canUsePolicyRooms(props.betas)) {
            return;
        }
        Navigation.goBack(ROUTES.REPORT_WITH_ID_DETAILS.getRoute(props.report.reportID));

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const cleanedSearchTerm = useMemo(
        () => searchTerm
                .trim()
                .replace(/\s*,\s*/g, ','),
        [searchTerm]
    );

    const searchEmails = useMemo(
        () => _.compact(cleanedSearchTerm.split(',')),
        [cleanedSearchTerm]
    );

    useEffect(() => {
        const emails = searchEmails;

        // This ensures suggestions are displayed when there is no search term
        // or the final list entry is empty
        if (emails.length === 0 || cleanedSearchTerm.endsWith(',')) {
            emails.push('');
        }

        const newUsersToInviteDict = {};
        const newSelectedOptionsDict = {};

        _.each(emails, (email, i) => {
            const inviteOptions = OptionsListUtils.getMemberInviteOptions(props.personalDetails, props.betas, email, excludedUsers);

            // Update selectedOptions with the latest personalDetails information
            const detailsMap = {};
            _.forEach(inviteOptions.personalDetails, (detail) => (detailsMap[detail.login] = OptionsListUtils.formatMemberForList(detail, false)));

            const newSelectedOptions = [];
            _.forEach(selectedOptions, (option) => {
                newSelectedOptions.push(_.has(detailsMap, option.login) ? {...detailsMap[option.login], isSelected: true} : option);
            });

            const userToInvite = inviteOptions.userToInvite;

            // Only add the user to the invites list if it is valid
            if (userToInvite) {
                newUsersToInviteDict[userToInvite.accountID] = userToInvite;
            }

            // Only display contact suggestions for the last search term
            if (i === emails.length - 1) {
                setPersonalDetails(inviteOptions.personalDetails);
            }

            // Add all selected options to the new dict
            _.each(newSelectedOptions, (option) => {
                newSelectedOptionsDict[option.accountID] = option;
            });
        });

        // Strip out dictionary keys and update arrays
        setUsersToInvite(_.values(newUsersToInviteDict));
        setSelectedOptions(_.values(newSelectedOptionsDict));

        // eslint-disable-next-line react-hooks/exhaustive-deps -- we don't want to recalculate when selectedOptions change
    }, [props.personalDetails, props.betas, searchEmails, excludedUsers]);

    const getSections = () => {
        const sections = [];
        let indexOffset = 0;

        sections.push({
            title: undefined,
            data: selectedOptions,
            shouldShow: true,
            indexOffset,
        });
        indexOffset += selectedOptions.length;

        // Filtering out selected users from the search results
        const selectedLogins = _.map(selectedOptions, ({login}) => login);
        const personalDetailsWithoutSelected = _.filter(personalDetails, ({login}) => !_.contains(selectedLogins, login));
        const personalDetailsFormatted = _.map(personalDetailsWithoutSelected, (personalDetail) => OptionsListUtils.formatMemberForList(personalDetail, false));

        sections.push({
            title: translate('common.contacts'),
            data: personalDetailsFormatted,
            shouldShow: !_.isEmpty(personalDetailsFormatted),
            indexOffset,
        });
        indexOffset += personalDetailsFormatted.length;

        _.each(usersToInvite, (userToInvite) => {
            const userIsUnselected = !_.contains(selectedLogins, userToInvite.login);

            if (userIsUnselected) {
                sections.push({
                    title: undefined,
                    data: [OptionsListUtils.formatMemberForList(userToInvite, false)],
                    shouldShow: true,
                    indexOffset,
                });
            }
        });

        return sections;
    };

    const toggleOption = useCallback(
        (option) => {
            const isOptionInList = _.some(selectedOptions, (selectedOption) => selectedOption.login === option.login);

            let newSelectedOptions;
            if (isOptionInList) {
                newSelectedOptions = _.reject(selectedOptions, (selectedOption) => selectedOption.login === option.login);
            } else {
                newSelectedOptions = [...selectedOptions, {...option, isSelected: true}];
            }

            setSelectedOptions(newSelectedOptions);
        },
        [selectedOptions],
    );

    const validate = useCallback(() => {
        const errors = {};
        if (selectedOptions.length <= 0) {
            errors.noUserSelected = true;
        }

        return _.size(errors) <= 0;
    }, [selectedOptions]);

    // Non policy members should not be able to view the participants of a room
    const reportID = props.report.reportID;
    const isPolicyMember = useMemo(() => PolicyUtils.isPolicyMember(props.report.policyID, props.policies), [props.report.policyID, props.policies]);
    const backRoute = useMemo(() => (isPolicyMember ? ROUTES.ROOM_MEMBERS.getRoute(reportID) : ROUTES.REPORT_WITH_ID_DETAILS.getRoute(reportID)), [isPolicyMember, reportID]);
    const reportName = useMemo(() => ReportUtils.getReportName(props.report), [props.report]);
    const inviteUsers = useCallback(() => {
        if (!validate()) {
            return;
        }
        const invitedEmailsToAccountIDs = {};
        _.each(selectedOptions, (option) => {
            const login = option.login || '';
            const accountID = lodashGet(option, 'accountID', '');
            if (!login.toLowerCase().trim() || !accountID) {
                return;
            }
            invitedEmailsToAccountIDs[login] = Number(accountID);
        });
        Report.inviteToRoom(props.report.reportID, invitedEmailsToAccountIDs);
        Navigation.navigate(backRoute);
    }, [selectedOptions, backRoute, props.report.reportID, validate]);

    const headerMessage = useMemo(() => {
        const searchValue = searchTerm.trim().toLowerCase();

        if (usersToInvite.length === 0) {
            // Handle errors when a single email is specified
            if (searchEmails.length === 1) {
                const email = _.first(searchEmails);

                if (CONST.EXPENSIFY_EMAILS.includes(email)) {
                    return translate('messages.errorMessageInvalidEmail');
                }

                if (excludedUsers.includes(email)) {
                    return translate('messages.userIsAlreadyMember', {login: searchValue, name: reportName});
                }
            }

            // Handle errors when multiple emails are specified
            if (searchEmails.length > 1 && personalDetails.length === 0) {
                return translate('messages.errorMessageAllInviteesInvalid');
            }
        }

        return OptionsListUtils.getHeaderMessage(personalDetails.length !== 0, usersToInvite.length > 0, searchValue);
    }, [excludedUsers, translate, searchTerm, searchEmails, usersToInvite, personalDetails, reportName]);
    return (
        <ScreenWrapper
            shouldEnableMaxHeight
            testID={RoomInvitePage.displayName}
        >
            {({didScreenTransitionEnd}) => {
                const sections = didScreenTransitionEnd ? getSections() : [];

                return (
                    <FullPageNotFoundView
                        shouldShow={_.isEmpty(props.report)}
                        subtitleKey={_.isEmpty(props.report) ? undefined : 'roomMembersPage.notAuthorized'}
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
                            textInputLabel={translate('optionsSelector.nameEmailOrPhoneNumber')}
                            textInputValue={searchTerm}
                            onChangeText={setSearchTerm}
                            headerMessage={headerMessage}
                            onSelectRow={toggleOption}
                            onConfirm={inviteUsers}
                            showScrollIndicator
                            shouldPreventDefaultFocusOnSelectRow={!Browser.isMobile()}
                            showLoadingPlaceholder={!didScreenTransitionEnd || !OptionsListUtils.isPersonalDetailsReady(props.personalDetails)}
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

RoomInvitePage.propTypes = propTypes;
RoomInvitePage.defaultProps = defaultProps;
RoomInvitePage.displayName = 'RoomInvitePage';

export default compose(
    withReportOrNotFound(),
    withOnyx({
        personalDetails: {
            key: ONYXKEYS.PERSONAL_DETAILS_LIST,
        },
        betas: {
            key: ONYXKEYS.BETAS,
        },
        policies: {
            key: ONYXKEYS.COLLECTION.POLICY,
        },
    }),
)(RoomInvitePage);
