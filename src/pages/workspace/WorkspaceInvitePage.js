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
import {hideWorkspaceAlertMessage, invite, setWorkspaceErrors} from '../../libs/actions/Policy';
import ExpensiTextInput from '../../components/ExpensiTextInput';
import KeyboardAvoidingView from '../../components/KeyboardAvoidingView';
import FormAlertWithSubmitButton from '../../components/FormAlertWithSubmitButton';
import OptionsSelector from '../../components/OptionsSelector';
import {getNewGroupOptions, getHeaderMessage} from '../../libs/OptionsListUtils';
import {EXCLUDED_GROUP_EMAILS} from '../../CONST';
import FullScreenLoadingIndicator from '../../components/FullscreenLoadingIndicator';

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
    betas: PropTypes.arrayOf(PropTypes.string).isRequired,

    /** All of the personal details for everyone */
    personalDetails: PropTypes.objectOf(personalDetailsPropTypes).isRequired,

    /** The policy passed via the route */
    policy: PropTypes.shape({
        /** The policy name */
        name: PropTypes.string,
    }),

    /** URL Route params */
    route: PropTypes.shape({
        /** Params from the URL path */
        params: PropTypes.shape({
            /** policyID passed via route: /workspace/:policyID/invite */
            policyID: PropTypes.string,
        }),
    }).isRequired,

    ...withLocalizePropTypes,

};

const defaultProps = {
    policy: {
        name: '',
    },
};

class WorkspaceInvitePage extends React.Component {
    constructor(props) {
        super(props);

        this.inviteUser = this.inviteUser.bind(this);
        this.clearErrors = this.clearErrors.bind(this);
        this.getExcludedUsers = this.getExcludedUsers.bind(this);
        this.toggleOption = this.toggleOption.bind(this);
        const {
            personalDetails,
            userToInvite,
        } = getNewGroupOptions(
            [],
            props.personalDetails,
            props.betas,
            '',
            [],
            this.getExcludedUsers(),
        );
        this.state = {
            searchValue: '',
            personalDetails,
            selectedOptions: [],
            userToInvite,
            welcomeNote: this.getWelcomeNotePlaceholder(),
        };
    }

    componentDidMount() {
        this.clearErrors();
    }

    getExcludedUsers() {
        const policyEmployeeList = lodashGet(this.props, 'policy.employeeList', []);
        return [...EXCLUDED_GROUP_EMAILS, ...policyEmployeeList];
    }

    /**
     * Gets the welcome note default text
     *
     * @returns {Object}
     */
    getWelcomeNotePlaceholder() {
        return this.props.translate('workspace.invite.welcomeNote', {
            workspaceName: this.props.policy.name,
        });
    }

    /**
     * @returns {String}
     */
    getErrorText() {
        const errors = lodashGet(this.props.policy, 'errors', {});

        if (errors.noUserSelected) {
            return this.props.translate('workspace.invite.pleaseSelectUser');
        }

        return '';
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
        sections.push({
            title: undefined,
            data: this.state.selectedOptions,
            shouldShow: true,
            indexOffset: 0,
        });

        sections.push({
            title: this.props.translate('common.contacts'),
            data: this.state.personalDetails,
            shouldShow: !_.isEmpty(this.state.personalDetails),
            indexOffset: sections.reduce((prev, {data}) => prev + data.length, 0),
        });

        if (this.state.userToInvite) {
            sections.push(({
                title: undefined,
                data: [this.state.userToInvite],
                shouldShow: true,
                indexOffset: 0,
            }));
        }

        return sections;
    }

    clearErrors() {
        setWorkspaceErrors(this.props.route.params.policyID, {});
        hideWorkspaceAlertMessage(this.props.route.params.policyID);
    }

    /**
     * Removes a selected option from list if already selected. If not already selected add this option to the list.
     * @param {Object} option
     */
    toggleOption(option) {
        this.clearErrors();

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
                userToInvite,
            } = getNewGroupOptions(
                [],
                this.props.personalDetails,
                this.props.betas,
                isOptionInList ? prevState.searchValue : '',
                newSelectedOptions,
                this.getExcludedUsers(),
            );

            return {
                selectedOptions: newSelectedOptions,
                personalDetails,
                userToInvite,
                searchValue: isOptionInList ? prevState.searchValue : '',
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

        const logins = _.map(this.state.selectedOptions, option => option.login);
        invite(logins, this.state.welcomeNote || this.getWelcomeNotePlaceholder(), this.props.route.params.policyID);
    }

    /**
     * @returns {Boolean}
     */
    validate() {
        const errors = {};
        if (this.state.selectedOptions.length <= 0) {
            errors.noUserSelected = true;
        }

        setWorkspaceErrors(this.props.route.params.policyID, errors);
        return _.size(errors) <= 0;
    }

    render() {
        const sections = this.getSections();
        const headerMessage = getHeaderMessage(
            this.state.personalDetails.length !== 0,
            Boolean(this.state.userToInvite),
            this.state.searchValue,
        );
        return (
            <ScreenWrapper>
                {({didScreenTransitionEnd}) => (
                    <KeyboardAvoidingView>
                        <HeaderWithCloseButton
                            title={this.props.translate('workspace.invite.invitePeople')}
                            onCloseButtonPress={() => {
                                this.clearErrors();
                                Navigation.dismissModal();
                            }}
                            shouldShowBackButton
                            onBackButtonPress={() => Navigation.goBack()}
                        />
                        <View style={[styles.flex1]}>
                            <FullScreenLoadingIndicator visible={!didScreenTransitionEnd} />
                            {didScreenTransitionEnd && (
                                <OptionsSelector
                                    canSelectMultipleOptions
                                    sections={sections}
                                    selectedOptions={this.state.selectedOptions}
                                    value={this.state.searchValue}
                                    onSelectRow={this.toggleOption}
                                    onChangeText={(searchValue = '') => {
                                        const {
                                            personalDetails,
                                            userToInvite,
                                        } = getNewGroupOptions(
                                            [],
                                            this.props.personalDetails,
                                            this.props.betas,
                                            searchValue,
                                            [],
                                            this.getExcludedUsers(),
                                        );
                                        this.setState({
                                            searchValue,
                                            userToInvite,
                                            personalDetails,
                                        });
                                    }}
                                    headerMessage={headerMessage}
                                    disableArrowKeysActions
                                    hideSectionHeaders
                                    hideAdditionalOptionStates
                                    forceTextUnreadStyle
                                />
                            )}
                        </View>
                        <View style={[styles.flexShrink0]}>
                            <View style={[styles.ph5, styles.pv3]}>
                                <ExpensiTextInput
                                    label={this.props.translate('workspace.invite.personalMessagePrompt')}
                                    autoCompleteType="off"
                                    autoCorrect={false}
                                    numberOfLines={3}
                                    textAlignVertical="top"
                                    multiline
                                    containerStyles={[styles.workspaceInviteWelcome]}
                                    value={this.state.welcomeNote}
                                    placeholder={this.getWelcomeNotePlaceholder()}
                                    onChangeText={text => this.setState({welcomeNote: text})}
                                />
                            </View>
                            <FormAlertWithSubmitButton
                                isDisabled={!this.state.selectedOptions.length}
                                isAlertVisible={this.getShouldShowAlertPrompt()}
                                buttonText={this.props.translate('common.invite')}
                                onSubmit={this.inviteUser}
                                onFixTheErrorsLinkPressed={() => {}}
                                message={this.props.policy.alertMessage}
                                containerStyles={[styles.flex0, styles.flexShrink0, styles.flexBasisAuto]}
                            />
                        </View>
                    </KeyboardAvoidingView>
                )}
            </ScreenWrapper>
        );
    }
}

WorkspaceInvitePage.propTypes = propTypes;
WorkspaceInvitePage.defaultProps = defaultProps;

export default compose(
    withLocalize,
    withOnyx({
        personalDetails: {
            key: ONYXKEYS.PERSONAL_DETAILS,
        },
        policy: {
            key: ({route}) => `${ONYXKEYS.COLLECTION.POLICY}${route.params.policyID}`,
        },
        betas: {
            key: ONYXKEYS.BETAS,
        },
    }),
)(WorkspaceInvitePage);
