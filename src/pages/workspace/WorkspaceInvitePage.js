import React from 'react';
import PropTypes from 'prop-types';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import _ from 'underscore';
import lodashGet from 'lodash/get';
import withLocalize, {withLocalizePropTypes} from '../../components/withLocalize';
import ScreenWrapper from '../../components/ScreenWrapper';
import HeaderWithCloseButton from '../../components/HeaderWithCloseButton';
import Navigation from '../../libs/Navigation/Navigation';
import styles from '../../styles/styles';
import compose from '../../libs/compose';
import ONYXKEYS from '../../ONYXKEYS';
import * as Policy from '../../libs/actions/Policy';
import FormAlertWithSubmitButton from '../../components/FormAlertWithSubmitButton';
import FormSubmit from '../../components/FormSubmit';
import OptionsSelector from '../../components/OptionsSelector';
import * as OptionsListUtils from '../../libs/OptionsListUtils';
import CONST from '../../CONST';
import FullScreenLoadingIndicator from '../../components/FullscreenLoadingIndicator';
import * as Link from '../../libs/actions/Link';
import withPolicy, {policyPropTypes, policyDefaultProps} from './withPolicy';
import {withNetwork} from '../../components/OnyxProvider';
import FullPageNotFoundView from '../../components/BlockingViews/FullPageNotFoundView';
import networkPropTypes from '../../components/networkPropTypes';
import ROUTES from '../../ROUTES';

const personalDetailsPropTypes = PropTypes.shape({
    /** The login of the person (either email or phone number) */
    login: PropTypes.string.isRequired,

    /** The URL of the person's avatar (there should already be a default avatar if
    the person doesn't have their own avatar uploaded yet) */
    avatar: PropTypes.string.isRequired,

    /** This is either the user's full name, or their login if full name is an empty string */
    displayName: PropTypes.string.isRequired,
});

const propTypes = {
    /** Beta features list */
    betas: PropTypes.arrayOf(PropTypes.string),

    /** All of the personal details for everyone */
    personalDetails: PropTypes.objectOf(personalDetailsPropTypes),

    /** URL Route params */
    route: PropTypes.shape({
        /** Params from the URL path */
        params: PropTypes.shape({
            /** policyID passed via route: /workspace/:policyID/invite */
            policyID: PropTypes.string,
        }),
    }).isRequired,

    ...policyPropTypes,
    ...withLocalizePropTypes,
    network: networkPropTypes.isRequired,
};

const defaultProps = {
    personalDetails: {},
    betas: [],
    ...policyDefaultProps,
};

class WorkspaceInvitePage extends React.Component {
    constructor(props) {
        super(props);

        this.inviteUser = this.inviteUser.bind(this);
        this.clearErrors = this.clearErrors.bind(this);
        this.getExcludedUsers = this.getExcludedUsers.bind(this);
        this.toggleOption = this.toggleOption.bind(this);
        this.updateOptionsWithSearchTerm = this.updateOptionsWithSearchTerm.bind(this);
        this.openPrivacyURL = this.openPrivacyURL.bind(this);

        const {personalDetails, userToInvite} = OptionsListUtils.getMemberInviteOptions(props.personalDetails, props.betas, '', this.getExcludedUsers());
        this.state = {
            searchTerm: '',
            personalDetails,
            selectedOptions: [],
            userToInvite,
        };
    }

    componentDidMount() {
        this.clearErrors();

        const clientPolicyMembers = _.keys(this.props.policyMemberList);
        Policy.openWorkspaceInvitePage(this.props.route.params.policyID, clientPolicyMembers);
    }

    componentDidUpdate(prevProps) {
        const isReconnecting = prevProps.network.isOffline && !this.props.network.isOffline;
        if (!isReconnecting) {
            return;
        }

        const clientPolicyMembers = _.keys(this.props.policyMemberList);
        Policy.openWorkspaceInvitePage(this.props.route.params.policyID, clientPolicyMembers);
    }

    getExcludedUsers() {
        const policyMemberList = lodashGet(this.props, 'policyMemberList', {});
        const usersToExclude = _.filter(
            _.keys(policyMemberList),
            (policyMember) =>
                this.props.network.isOffline ||
                policyMemberList[policyMember].pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE ||
                !_.isEmpty(policyMemberList[policyMember].errors),
        );
        return [...CONST.EXPENSIFY_EMAILS, ...usersToExclude];
    }

    /**
     * @returns {Boolean}
     */
    getShouldShowAlertPrompt() {
        return _.size(lodashGet(this.props.policy, 'errors', {})) > 0 || lodashGet(this.props.policy, 'alertMessage', '').length > 0;
    }

    /**
     * Returns the sections needed for the OptionsSelector
     * @returns {Array}
     */
    getSections() {
        const sections = [];
        let indexOffset = 0;

        sections.push({
            title: undefined,
            data: this.state.selectedOptions,
            shouldShow: true,
            indexOffset,
        });
        indexOffset += this.state.selectedOptions.length;

        // Filtering out selected users from the search results
        const filterText = _.reduce(this.state.selectedOptions, (str, {login}) => `${str} ${login}`, '');
        const personalDetailsWithoutSelected = _.filter(this.state.personalDetails, ({login}) => !filterText.includes(login));
        const hasUnselectedUserToInvite = this.state.userToInvite && !filterText.includes(this.state.userToInvite.login);

        sections.push({
            title: this.props.translate('common.contacts'),
            data: personalDetailsWithoutSelected,
            shouldShow: !_.isEmpty(personalDetailsWithoutSelected),
            indexOffset,
        });
        indexOffset += personalDetailsWithoutSelected.length;

        if (hasUnselectedUserToInvite) {
            sections.push({
                title: undefined,
                data: [this.state.userToInvite],
                shouldShow: true,
                indexOffset,
            });
        }

        return sections;
    }

    updateOptionsWithSearchTerm(searchTerm = '') {
        const {personalDetails, userToInvite} = OptionsListUtils.getMemberInviteOptions(this.props.personalDetails, this.props.betas, searchTerm, this.getExcludedUsers());
        this.setState({
            searchTerm,
            userToInvite,
            personalDetails,
        });
    }

    openPrivacyURL(e) {
        e.preventDefault();
        Link.openExternalLink(CONST.PRIVACY_URL);
    }

    clearErrors(closeModal = false) {
        Policy.setWorkspaceErrors(this.props.route.params.policyID, {});
        Policy.hideWorkspaceAlertMessage(this.props.route.params.policyID);
        if (closeModal) {
            Navigation.dismissModal();
        }
    }

    /**
     * Removes a selected option from list if already selected. If not already selected add this option to the list.
     * @param {Object} option
     */
    toggleOption(option) {
        this.clearErrors();

        this.setState((prevState) => {
            const isOptionInList = _.some(prevState.selectedOptions, (selectedOption) => selectedOption.login === option.login);

            let newSelectedOptions;

            if (isOptionInList) {
                newSelectedOptions = _.reject(prevState.selectedOptions, (selectedOption) => selectedOption.login === option.login);
            } else {
                newSelectedOptions = [...prevState.selectedOptions, option];
            }

            const {personalDetails, userToInvite} = OptionsListUtils.getMemberInviteOptions(this.props.personalDetails, this.props.betas, prevState.searchTerm, this.getExcludedUsers());

            return {
                selectedOptions: newSelectedOptions,
                personalDetails,
                userToInvite,
                searchTerm: prevState.searchTerm,
            };
        });
    }

    /**
     * Handle the invite button click
     */
    inviteUser() {
        if (!this.validate()) {
            return;
        }

        const logins = _.map(this.state.selectedOptions, (option) => option.login);
        const filteredLogins = _.chain(logins)
            .map((login) => login.toLowerCase().trim())
            .compact()
            .uniq()
            .value();
        Policy.setWorkspaceInviteMembersDraft(this.props.route.params.policyID, filteredLogins);
        Navigation.navigate(ROUTES.getWorkspaceInviteMessageRoute(this.props.route.params.policyID));
    }

    /**
     * @returns {Boolean}
     */
    validate() {
        const errors = {};
        if (this.state.selectedOptions.length <= 0) {
            errors.noUserSelected = true;
        }

        Policy.setWorkspaceErrors(this.props.route.params.policyID, errors);
        return _.size(errors) <= 0;
    }

    render() {
        const sections = this.getSections();
        const headerMessage = OptionsListUtils.getHeaderMessage(this.state.personalDetails.length !== 0, Boolean(this.state.userToInvite), this.state.searchTerm);
        const policyName = lodashGet(this.props.policy, 'name');

        return (
            <ScreenWrapper shouldEnableMaxHeight>
                {({didScreenTransitionEnd}) => (
                    <FullPageNotFoundView
                        shouldShow={_.isEmpty(this.props.policy)}
                        onBackButtonPress={() => Navigation.navigate(ROUTES.SETTINGS_WORKSPACES)}
                    >
                        <FormSubmit
                            style={[styles.flex1]}
                            onSubmit={this.inviteUser}
                        >
                            <HeaderWithCloseButton
                                title={this.props.translate('workspace.invite.invitePeople')}
                                subtitle={policyName}
                                onCloseButtonPress={() => this.clearErrors(true)}
                                shouldShowGetAssistanceButton
                                guidesCallTaskID={CONST.GUIDES_CALL_TASK_IDS.WORKSPACE_MEMBERS}
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
                                        textInputLabel={this.props.translate('optionsSelector.nameEmailOrPhoneNumber')}
                                    />
                                ) : (
                                    <FullScreenLoadingIndicator />
                                )}
                            </View>
                            <View style={[styles.flexShrink0]}>
                                <FormAlertWithSubmitButton
                                    isDisabled={!this.state.selectedOptions.length}
                                    isAlertVisible={this.getShouldShowAlertPrompt()}
                                    buttonText={this.props.translate('common.next')}
                                    onSubmit={this.inviteUser}
                                    message={this.props.policy.alertMessage}
                                    containerStyles={[styles.flexReset, styles.flexGrow0, styles.flexShrink0, styles.flexBasisAuto, styles.mb5]}
                                    enabledWhenOffline
                                    disablePressOnEnter
                                />
                            </View>
                        </FormSubmit>
                    </FullPageNotFoundView>
                )}
            </ScreenWrapper>
        );
    }
}

WorkspaceInvitePage.propTypes = propTypes;
WorkspaceInvitePage.defaultProps = defaultProps;

export default compose(
    withLocalize,
    withPolicy,
    withNetwork(),
    withOnyx({
        personalDetails: {
            key: ONYXKEYS.PERSONAL_DETAILS,
        },
        betas: {
            key: ONYXKEYS.BETAS,
        },
    }),
)(WorkspaceInvitePage);
