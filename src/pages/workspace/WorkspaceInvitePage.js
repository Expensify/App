import React from 'react';
import PropTypes from 'prop-types';
import { View } from 'react-native';
import { withOnyx } from 'react-native-onyx';
import _ from 'underscore';
import lodashGet from 'lodash/get';
import withLocalize, { withLocalizePropTypes } from '../../components/withLocalize';
import ScreenWrapper from '../../components/ScreenWrapper';
import HeaderWithBackButton from '../../components/HeaderWithBackButton';
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
import * as Link from '../../libs/actions/Link';
import { policyPropTypes, policyDefaultProps } from './withPolicy';
import withPolicyAndFullscreenLoading from './withPolicyAndFullscreenLoading';
import { withNetwork } from '../../components/OnyxProvider';
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

        const { personalDetails, userToInvite } = OptionsListUtils.getMemberInviteOptions(
            props.personalDetails,
            props.betas,
            '',
            this.getExcludedUsers()
        );
        this.state = {
            searchTerm: '',
            personalDetails,
            selectedOptions: [],
            userToInvite,
        };
    }

    componentDidMount() {
        this.clearErrors();
        const policyMemberEmailsToAccountIDs = PolicyUtils.getClientPolicyMemberEmailsToAccountIDs(
            this.props.policy,
            this.props.personalDetails
        );
        if (_.isEmpty(policyMemberEmailsToAccountIDs)) {
            Policy.createPolicy();
        }
    }

    /**
     * Returns an array of user logins (emails and/or phone numbers)
     * that should be excluded from the invite options list.
     *
     * @returns {Array}
     */
    getExcludedUsers() {
        const excludedUsers = [];

        // Exclude the current user from the invite options list
        excludedUsers.push(this.props.personalDetails.login);

        // Exclude the users who are already policy members from the invite options list
        const policyMembers = lodashGet(this.props.policy, 'members', []);
        policyMembers.forEach((member) => {
            excludedUsers.push(member.login);
        });

        return excludedUsers;
    }

    /**
     * Toggles the selection of an option.
     *
     * @param {Object} option
     */
    toggleOption(option) {
        this.setState((prevState) => {
            const selectedOptions = [...prevState.selectedOptions];
            const optionIndex = selectedOptions.findIndex((selectedOption) => (
                selectedOption.login === option.login
            ));

            if (optionIndex === -1) {
                // Option not found in selectedOptions, add it
                selectedOptions.push(option);
            } else {
                // Option found in selectedOptions, remove it
                selectedOptions.splice(optionIndex, 1);
            }

            return { selectedOptions };
        });
    }

    /**
     * Updates the options list with the provided search term.
     *
     * @param {String} searchTerm
     */
    updateOptionsWithSearchTerm(searchTerm) {
        this.setState((prevState) => {
            const { personalDetails, userToInvite } = OptionsListUtils.getMemberInviteOptions(
                prevState.personalDetails,
                this.props.betas,
                searchTerm,
                this.getExcludedUsers()
            );

            return {
                searchTerm,
                personalDetails,
                userToInvite,
            };
        });
    }

    /**
     * Invites the selected user(s) to the workspace.
     */
    inviteUser() {
        // Logic to invite the selected user(s) to the workspace
    }

    /**
     * Clears any errors displayed on the screen.
     */
    clearErrors() {
        // Logic to clear errors
    }

    /**
     * Opens the privacy policy URL in the browser.
     */
    openPrivacyURL() {
        Link.openURL(CONST.PRIVACY_URL);
    }

    render() {
        const { personalDetails, userToInvite, selectedOptions, searchTerm } = this.state;

        if (!this.props.policy || !this.props.policy.isLoading) {
            return (
                <ScreenWrapper>
                    <HeaderWithBackButton
                        title={this.props.translate('workspace.invitePage.title')}
                        onBackButtonPress={() => Navigation.navigate(ROUTES.WORKSPACE)}
                    />
                    <View style={[styles.flex1, styles.pRelative]}>
                        {!this.props.policy
                            && (
                                <FullPageNotFoundView
                                    title={this.props.translate('workspace.invitePage.invalidPolicy')}
                                    subtitle={this.props.translate('workspace.invitePage.invalidPolicySubtitle')}
                                />
                            )}
                        <FormAlertWithSubmitButton
                            successTitle={this.props.translate('workspace.invitePage.successTitle')}
                            successSubtitle={this.props.translate('workspace.invitePage.successSubtitle')}
                            errors={this.props.policy ? this.props.policy.error : {}}
                            shouldShowFieldErrors={false}
                            onClearErrors={this.clearErrors}
                            buttonText={this.props.translate('workspace.invitePage.inviteButtonText')}
                            onSubmit={this.inviteUser}
                        >
                            <OptionsSelector
                                options={userToInvite}
                                selectedOptions={selectedOptions}
                                onOptionPress={this.toggleOption}
                                searchTerm={searchTerm}
                                onUpdateSearchTerm={this.updateOptionsWithSearchTerm}
                            />
                            <FormSubmit
                                text={this.props.translate('workspace.invitePage.inviteButtonText')}
                                isLoading={this.props.network.isLoading}
                                disabled={!selectedOptions.length}
                            />
                        </FormAlertWithSubmitButton>
                    </View>
                </ScreenWrapper>
            );
        }

        return null;
    }
}

WorkspaceInvitePage.propTypes = propTypes;
WorkspaceInvitePage.defaultProps = defaultProps;

export default compose(
    withLocalize,
    withPolicyAndFullscreenLoading,
    withOnyx({
        personalDetails: { key: ONYXKEYS.PERSONAL_DETAILS },
        betas: { key: ONYXKEYS.BETAS },
        policy: {
            key: ({ route }) => ONYXKEYS.COLLECTION.POLICY + route.params.policyID,
        },
    }),
    withNetwork
)(WorkspaceInvitePage);
