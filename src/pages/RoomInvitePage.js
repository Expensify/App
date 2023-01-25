import React from 'react';
import PropTypes from 'prop-types';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import _ from 'underscore';
import lodashGet from 'lodash/get';
import ScreenWrapper from '../components/ScreenWrapper';
import HeaderWithCloseButton from '../components/HeaderWithCloseButton';
import FullScreenLoadingIndicator from '../components/FullscreenLoadingIndicator';
import FormAlertWithSubmitButton from '../components/FormAlertWithSubmitButton';
import OptionsSelector from '../components/OptionsSelector';
import * as OptionsListUtils from '../libs/OptionsListUtils';
import compose from '../libs/compose';
import ONYXKEYS from '../ONYXKEYS';
import {withNetwork} from '../components/OnyxProvider';
import withLocalize, {withLocalizePropTypes} from '../components/withLocalize';
import networkPropTypes from '../components/networkPropTypes';
import reportPropTypes from './reportPropTypes';
import styles from '../styles/styles';
import Navigation from '../libs/Navigation/Navigation';
import withReportOrNavigateHome from './home/report/withReportOrNavigateHome';
import policyMemberPropType from './policyMemberPropType';
import * as Report from '../libs/actions/Report';
import personalDetailsPropType from './personalDetailsPropType';
import * as ReportUtils from '../libs/ReportUtils';

const propTypes = {
    /** Beta features list */
    betas: PropTypes.arrayOf(PropTypes.string).isRequired,

    /** All of the personal details for everyone */
    personalDetails: PropTypes.objectOf(personalDetailsPropType).isRequired,

    /** The active report */
    report: reportPropTypes.isRequired,

    /** List of policy members */
    policyMemberList: PropTypes.objectOf(policyMemberPropType),

    ...withLocalizePropTypes,
    network: networkPropTypes.isRequired,
};

const defaultProps = {
    policyMemberList: {},
};

class RoomInvitePage extends React.Component {
    constructor(props) {
        super(props);

        this.getSections = this.getSections.bind(this);
        this.inviteUser = this.inviteUser.bind(this);
        this.updateOptionsWithSearchTerm = this.updateOptionsWithSearchTerm.bind(this);
        this.getPolicyMemberPersonalDetails = this.getPolicyMemberPersonalDetails.bind(this);
        this.toggleOption = this.toggleOption.bind(this);

        const {
            personalDetails,
        } = OptionsListUtils.getMemberInviteOptions(
            this.getPolicyMemberPersonalDetails(),
            props.betas,
            '',
            props.report.participants,
        );

        this.state = {
            personalDetails,
            searchTerm: '',
            selectedOptions: [],
            shouldDisableButton: false,
        };
    }

    componentDidMount() {
        // If a user tried to navigate to this page via the URL for a report that isn't a user created policy room
        // kick them out
        if (!ReportUtils.isUserCreatedPolicyRoom(this.props.report)) {
            Navigation.dismissModal();
        }

        Report.openRoomInvitePage(this.props.report.policyID);
    }

    componentDidUpdate(prevProps) {
        if (!_.isEqual(prevProps.policyMemberList, this.props.policyMemberList)) {
            this.updateOptionsWithSearchTerm(this.state.searchTerm);
        }

        const isReconnecting = prevProps.network.isOffline && !this.props.network.isOffline;
        if (!isReconnecting) {
            return;
        }

        Report.openRoomInvitePage(this.props.route.params.policyID);
    }

    getPolicyMemberPersonalDetails() {
        const policyMemberEmails = _.keys(this.props.policyMemberList[`${ONYXKEYS.COLLECTION.POLICY_MEMBER_LIST}${this.props.report.policyID}`]);
        const policyMemberPersonalDetails = {};
        _.forEach(policyMemberEmails, (email) => {
            if (!this.props.personalDetails[email]) {
                return;
            }
            policyMemberPersonalDetails[email] = this.props.personalDetails[email];
        });
        return policyMemberPersonalDetails;
    }

    /**
     * Returns the sections needed for the OptionsSelector
     * @returns {Array}
     */
    getSections() {
        const sections = [];
        let indexOffset = 0;

        sections.push({
            data: this.state.selectedOptions,
            shouldShow: true,
            indexOffset,
        });
        indexOffset += this.state.selectedOptions.length;

        // Filtering out selected users from the search results
        const filterText = _.reduce(this.state.selectedOptions, (str, {login}) => `${str} ${login}`, '');
        const personalDetailsWithoutSelected = _.filter(this.state.personalDetails, ({login}) => !filterText.includes(login));

        sections.push({
            data: personalDetailsWithoutSelected,
            shouldShow: !_.isEmpty(personalDetailsWithoutSelected),
            indexOffset,
        });
        indexOffset += personalDetailsWithoutSelected.length;

        return sections;
    }

    /**
     * Handle the invite button click
     */
    inviteUser() {
        this.setState({shouldDisableButton: true}, () => {
            const logins = _.map(this.state.selectedOptions, option => option.login);
            const filteredLogins = _.uniq(_.compact(_.map(logins, login => login.toLowerCase().trim())));
            Report.inviteToWorkspaceRoom(this.props.report, filteredLogins);
            Navigation.goBack();
        });
    }

    updateOptionsWithSearchTerm(searchTerm = '') {
        const {
            personalDetails,
        } = OptionsListUtils.getMemberInviteOptions(
            this.getPolicyMemberPersonalDetails(),
            this.props.betas,
            searchTerm,
            this.props.report.participants,
        );
        this.setState({
            searchTerm,
            personalDetails,
        });
    }

    /**
     * Removes a selected option from list if already selected. If not already selected add this option to the list.
     * @param {Object} option
     */
    toggleOption(option) {
        this.setState((prevState) => {
            const isOptionInList = _.some(prevState.selectedOptions, selectedOption => (
                selectedOption.login === option.login
            ));

            let newSelectedOptions;

            if (isOptionInList) {
                newSelectedOptions = _.reject(prevState.selectedOptions, selectedOption => (
                    selectedOption.login === option.login
                ));
            } else {
                newSelectedOptions = [...prevState.selectedOptions, option];
            }

            const {
                personalDetails,
            } = OptionsListUtils.getMemberInviteOptions(
                this.getPolicyMemberPersonalDetails(),
                this.props.betas,
                prevState.searchTerm,
                this.props.report.participants,
            );

            return {
                selectedOptions: newSelectedOptions,
                personalDetails,
                searchTerm: prevState.searchTerm,
            };
        });
    }

    render() {
        const sections = this.getSections();
        const headerMessage = OptionsListUtils.getHeaderMessage(
            this.state.personalDetails.length !== 0,
            false,
            this.state.searchTerm,
        );
        const roomName = lodashGet(this.props.report, 'displayName');

        return (
            <ScreenWrapper>
                {({didScreenTransitionEnd}) => (
                    <>
                        <HeaderWithCloseButton
                            title={this.props.translate('roomInvitePage.inviteToRoom')}
                            subtitle={roomName}
                            onCloseButtonPress={() => Navigation.dismissModal()}
                            shouldShowBackButton
                            onBackButtonPress={() => Navigation.goBack()}
                        />
                        <View style={[styles.flex1]}>
                            {didScreenTransitionEnd ? (
                                <OptionsSelector
                                    autoFocus={false}
                                    canSelectMultipleOptions
                                    sections={sections}
                                    selectedOptions={this.state.selectedOptions}
                                    value={this.state.searchTerm}
                                    onSelectRow={this.toggleOption}
                                    onChangeText={this.updateOptionsWithSearchTerm}
                                    onConfirmSelection={this.inviteUser}
                                    headerMessage={headerMessage}
                                    hideSectionHeaders
                                    boldStyle
                                    shouldFocusOnSelectRow
                                    placeholderText={this.props.translate('optionsSelector.nameEmailOrPhoneNumber')}
                                />
                            ) : (
                                <FullScreenLoadingIndicator />
                            )}
                        </View>
                        <View style={[styles.flexShrink0, styles.mb3]}>
                            <FormAlertWithSubmitButton
                                isDisabled={!this.state.selectedOptions.length || this.state.shouldDisableButton}
                                isAlertVisible={false}
                                buttonText={this.props.translate('common.invite')}
                                onSubmit={this.inviteUser}
                                containerStyles={[styles.flexReset, styles.mb0, styles.flexGrow0, styles.flexShrink0, styles.flexBasisAuto]}
                                enabledWhenOffline
                            />
                        </View>
                    </>
                )}
            </ScreenWrapper>
        );
    }
}

RoomInvitePage.propTypes = propTypes;
RoomInvitePage.defaultProps = defaultProps;

export default compose(
    withLocalize,
    withReportOrNavigateHome,
    withNetwork(),
    withOnyx({
        personalDetails: {
            key: ONYXKEYS.PERSONAL_DETAILS,
        },
        betas: {
            key: ONYXKEYS.BETAS,
        },
        policyMemberList: {
            key: ONYXKEYS.COLLECTION.POLICY_MEMBER_LIST,
        },
    }),
)(RoomInvitePage);
