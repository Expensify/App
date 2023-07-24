import React from 'react';
import PropTypes from 'prop-types';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import _ from 'underscore';
import lodashGet from 'lodash/get';
import withLocalize, {withLocalizePropTypes} from '../../components/withLocalize';
import ScreenWrapper from '../../components/ScreenWrapper';
import HeaderWithBackButton from '../../components/HeaderWithBackButton';
import Navigation from '../../libs/Navigation/Navigation';
import styles from '../../styles/styles';
import compose from '../../libs/compose';
import ONYXKEYS from '../../ONYXKEYS';
import * as Policy from '../../libs/actions/Policy';
import FormAlertWithSubmitButton from '../../components/FormAlertWithSubmitButton';
import OptionsSelector from '../../components/OptionsSelector';
import * as OptionsListUtils from '../../libs/OptionsListUtils';
import CONST from '../../CONST';
import * as Link from '../../libs/actions/Link';
import {policyPropTypes, policyDefaultProps} from './withPolicy';
import withPolicyAndFullscreenLoading from './withPolicyAndFullscreenLoading';
import {withNetwork} from '../../components/OnyxProvider';
import FullPageNotFoundView from '../../components/BlockingViews/FullPageNotFoundView';
import networkPropTypes from '../../components/networkPropTypes';
import ROUTES from '../../ROUTES';
import * as Browser from '../../libs/Browser';
import * as PolicyUtils from '../../libs/PolicyUtils';

const personalDetailsPropTypes = PropTypes.shape({
    /** The login of the person (either email or phone number) */
    login: PropTypes.string.isRequired,

    /** The URL of the person's avatar (there should already be a default avatar if
    the person doesn't have their own avatar uploaded yet, except for anon users) */
    avatar: PropTypes.string,

    /** This is either the user's full name, or their login if full name is an empty string */
    displayName: PropTypes.string,
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
        const policyMemberEmailsToAccountIDs = PolicyUtils.getClientPolicyMemberEmailsToAccountIDs(this.props.policyMembers, this.props.personalDetails);
        Policy.openWorkspaceInvitePage(this.props.route.params.policyID, _.keys(policyMemberEmailsToAccountIDs));
    }

    componentDidUpdate(prevProps) {
        if (!_.isEqual(prevProps.personalDetails, this.props.personalDetails) || !_.isEqual(prevProps.policyMembers, this.props.policyMembers)) {
            this.updateOptionsWithSearchTerm(this.state.searchTerm);
        }

        const isReconnecting = prevProps.network.isOffline && !this.props.network.isOffline;
        if (!isReconnecting) {
            return;
        }

        const policyMemberEmailsToAccountIDs = PolicyUtils.getClientPolicyMemberEmailsToAccountIDs(this.props.policyMembers, this.props.personalDetails);
        Policy.openWorkspaceInvitePage(this.props.route.params.policyID, _.keys(policyMemberEmailsToAccountIDs));
    }

    getExcludedUsers() {
        // Exclude any expensify emails or valid policy members from the invite options
        const memberEmailsToExclude = [...CONST.EXPENSIFY_EMAILS];
        _.each(this.props.policyMembers, (policyMember, accountID) => {
            // Policy members that are pending delete or have errors are not valid and we should show them in the invite options (don't exclude them).
            if (policyMember.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE || !_.isEmpty(policyMember.errors)) {
                return;
            }
            const memberEmail = lodashGet(this.props.personalDetails, `[${accountID}].login`);
            if (!memberEmail) {
                return;
            }
            memberEmailsToExclude.push(memberEmail);
        });
        return memberEmailsToExclude;
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
        const selectedLogins = _.map(this.state.selectedOptions, ({login}) => login);
        const personalDetailsWithoutSelected = _.filter(this.state.personalDetails, ({login}) => !_.contains(selectedLogins, login));
        const hasUnselectedUserToInvite = this.state.userToInvite && !_.contains(selectedLogins, this.state.userToInvite.login);

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

        // Update selectedOptions with the latest personalDetails and policyMembers information
        const detailsMap = {};
        _.forEach(personalDetails, (detail) => (detailsMap[detail.login] = detail));
        const selectedOptions = [];
        _.forEach(this.state.selectedOptions, (option) => {
            selectedOptions.push(_.has(detailsMap, option.login) ? detailsMap[option.login] : option);
        });

        this.setState({
            searchTerm,
            userToInvite,
            personalDetails,
            selectedOptions,
        });
    }

    openPrivacyURL(e) {
        e.preventDefault();
        Link.openExternalLink(CONST.PRIVACY_URL);
    }

    clearErrors() {
        Policy.setWorkspaceErrors(this.props.route.params.policyID, {});
        Policy.hideWorkspaceAlertMessage(this.props.route.params.policyID);
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

        const invitedEmailsToAccountIDs = {};
        _.each(this.state.selectedOptions, (option) => {
            const login = option.login || '';
            const accountID = lodashGet(option, 'participantsList[0].accountID');
            if (!login.toLowerCase().trim() || !accountID) {
                return;
            }
            invitedEmailsToAccountIDs[login] = Number(accountID);
        });
        Policy.setWorkspaceInviteMembersDraft(this.props.route.params.policyID, invitedEmailsToAccountIDs);
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
        const headerMessage = OptionsListUtils.getHeaderMessage(this.state.personalDetails.length !== 0, Boolean(this.state.userToInvite), this.state.searchTerm);
        const policyName = lodashGet(this.props.policy, 'name');

        return (
            <ScreenWrapper shouldEnableMaxHeight>
                {({didScreenTransitionEnd}) => {
                    const sections = didScreenTransitionEnd ? this.getSections() : [];
                    return (
                        <FullPageNotFoundView
                            shouldShow={_.isEmpty(this.props.policy) || !Policy.isPolicyOwner(this.props.policy)}
                            subtitleKey={_.isEmpty(this.props.policy) ? undefined : 'workspace.common.notAuthorized'}
                            onBackButtonPress={() => Navigation.goBack(ROUTES.SETTINGS_WORKSPACES)}
                        >
                            <HeaderWithBackButton
                                title={this.props.translate('workspace.invite.invitePeople')}
                                subtitle={policyName}
                                shouldShowGetAssistanceButton
                                guidesCallTaskID={CONST.GUIDES_CALL_TASK_IDS.WORKSPACE_MEMBERS}
                                onBackButtonPress={() => {
                                    this.clearErrors();
                                    Navigation.goBack(ROUTES.getWorkspaceMembersRoute(this.props.route.params.policyID));
                                }}
                            />
                            <View style={[styles.flexGrow1, styles.flexShrink0, styles.flexBasisAuto]}>
                                <OptionsSelector
                                    contentContainerStyles={[styles.flexGrow1, styles.flexShrink0, styles.flexBasisAuto]}
                                    listContainerStyles={[styles.flexGrow1, styles.flexShrink1, styles.flexBasis0]}
                                    canSelectMultipleOptions
                                    sections={sections}
                                    selectedOptions={this.state.selectedOptions}
                                    value={this.state.searchTerm}
                                    shouldShowOptions={didScreenTransitionEnd && OptionsListUtils.isPersonalDetailsReady(this.props.personalDetails)}
                                    onSelectRow={this.toggleOption}
                                    onChangeText={this.updateOptionsWithSearchTerm}
                                    onConfirmSelection={this.inviteUser}
                                    headerMessage={headerMessage}
                                    hideSectionHeaders
                                    boldStyle
                                    shouldDelayFocus
                                    shouldFocusOnSelectRow={!Browser.isMobile()}
                                    textInputLabel={this.props.translate('optionsSelector.nameEmailOrPhoneNumber')}
                                />
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
                        </FullPageNotFoundView>
                    );
                }}
            </ScreenWrapper>
        );
    }
}

WorkspaceInvitePage.propTypes = propTypes;
WorkspaceInvitePage.defaultProps = defaultProps;

export default compose(
    withLocalize,
    withPolicyAndFullscreenLoading,
    withNetwork(),
    withOnyx({
        personalDetails: {
            key: ONYXKEYS.PERSONAL_DETAILS_LIST,
        },
        betas: {
            key: ONYXKEYS.BETAS,
        },
    }),
)(WorkspaceInvitePage);
