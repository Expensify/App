import React from 'react';
import PropTypes from 'prop-types';
import {Pressable, View} from 'react-native';
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
import TextInput from '../../components/TextInput';
import KeyboardAvoidingView from '../../components/KeyboardAvoidingView';
import FormAlertWithSubmitButton from '../../components/FormAlertWithSubmitButton';
import OptionsSelector from '../../components/OptionsSelector';
import * as OptionsListUtils from '../../libs/OptionsListUtils';
import CONST from '../../CONST';
import FullScreenLoadingIndicator from '../../components/FullscreenLoadingIndicator';
import * as Link from '../../libs/actions/Link';
import Text from '../../components/Text';
import withFullPolicy, {fullPolicyPropTypes, fullPolicyDefaultProps} from './withFullPolicy';

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

    /** URL Route params */
    route: PropTypes.shape({
        /** Params from the URL path */
        params: PropTypes.shape({
            /** policyID passed via route: /workspace/:policyID/invite */
            policyID: PropTypes.string,
        }),
    }).isRequired,

    ...fullPolicyPropTypes,
    ...withLocalizePropTypes,
};

const defaultProps = fullPolicyDefaultProps;

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
        } = OptionsListUtils.getNewChatOptions(
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
            welcomeNote: this.getWelcomeNote(),
        };
    }

    componentDidMount() {
        this.clearErrors();
    }

    getExcludedUsers() {
        const policyEmployeeList = lodashGet(this.props, 'policy.employeeList', []);
        return [...CONST.EXPENSIFY_EMAILS, ...policyEmployeeList];
    }

    /**
     * Gets the welcome note default text
     *
     * @returns {Object}
     */
    getWelcomeNote() {
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

        // Filtering out selected users from the search results
        const filterText = _.reduce(this.state.selectedOptions, (str, {login}) => `${str} ${login}`, '');
        const personalDetailsWithoutSelected = _.filter(this.state.personalDetails, ({login}) => !filterText.includes(login));

        sections.push({
            title: this.props.translate('common.contacts'),
            data: personalDetailsWithoutSelected,
            shouldShow: !_.isEmpty(personalDetailsWithoutSelected),
            indexOffset: _.reduce(sections, (prev, {data}) => prev + data.length, 0),
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
            } = OptionsListUtils.getNewChatOptions(
                [],
                this.props.personalDetails,
                this.props.betas,
                prevState.searchValue,
                [],
                this.getExcludedUsers(),
            );

            return {
                selectedOptions: newSelectedOptions,
                personalDetails,
                userToInvite,
                searchValue: prevState.searchValue,
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
        const filteredLogins = _.uniq(_.compact(_.map(logins, login => login.toLowerCase().trim())));
        Policy.invite(filteredLogins, this.state.welcomeNote || this.getWelcomeNote(), this.props.route.params.policyID);
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
        const headerMessage = OptionsListUtils.getHeaderMessage(
            this.state.personalDetails.length !== 0,
            Boolean(this.state.userToInvite),
            this.state.searchValue,
        );
        const policyName = lodashGet(this.props.policy, 'name');
        return (
            <ScreenWrapper>
                {({didScreenTransitionEnd}) => (
                    <KeyboardAvoidingView>
                        <HeaderWithCloseButton
                            title={this.props.translate('workspace.invite.invitePeople')}
                            subtitle={policyName}
                            onCloseButtonPress={() => {
                                this.clearErrors();
                                Navigation.dismissModal();
                            }}
                            shouldShowGetAssistanceButton
                            guidesCallTaskID={CONST.GUIDES_CALL_TASK_IDS.WORKSPACE_MEMBERS}
                            shouldShowBackButton
                            onBackButtonPress={() => Navigation.goBack()}
                        />
                        <View style={[styles.flex1]}>
                            <FullScreenLoadingIndicator visible={!didScreenTransitionEnd} />
                            {didScreenTransitionEnd && (
                                <OptionsSelector
                                    autoFocus={false}
                                    canSelectMultipleOptions
                                    sections={sections}
                                    selectedOptions={this.state.selectedOptions}
                                    value={this.state.searchValue}
                                    onSelectRow={this.toggleOption}
                                    onChangeText={(searchValue = '') => {
                                        const {
                                            personalDetails,
                                            userToInvite,
                                        } = OptionsListUtils.getNewChatOptions(
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
                                    shouldFocusOnSelectRow
                                />
                            )}
                        </View>
                        <View style={[styles.flexShrink0]}>
                            <View style={[styles.ph5, styles.pv3]}>
                                <TextInput
                                    label={this.props.translate('workspace.invite.personalMessagePrompt')}
                                    autoCompleteType="off"
                                    autoCorrect={false}
                                    numberOfLines={4}
                                    textAlignVertical="top"
                                    multiline
                                    containerStyles={[styles.workspaceInviteWelcome]}
                                    value={this.state.welcomeNote}
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
                                containerStyles={[styles.flexReset, styles.mb0, styles.flexGrow0, styles.flexShrink0, styles.flexBasisAuto]}
                            />
                            <Pressable
                                onPress={(e) => {
                                    e.preventDefault();
                                    Link.openExternalLink(CONST.PRIVACY_URL);
                                }}
                                accessibilityRole="link"
                                href={CONST.PRIVACY_URL}
                                style={[styles.mh5, styles.mv2, styles.alignSelfStart]}
                            >
                                {({hovered, pressed}) => (
                                    <View style={[styles.flexRow]}>
                                        <Text
                                            style={[styles.mr1, styles.label, (hovered || pressed) ? styles.linkHovered : styles.link]}
                                        >
                                            {this.props.translate('common.privacyPolicy')}
                                        </Text>
                                    </View>
                                )}
                            </Pressable>
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
    withFullPolicy,
    withOnyx({
        personalDetails: {
            key: ONYXKEYS.PERSONAL_DETAILS,
        },
        betas: {
            key: ONYXKEYS.BETAS,
        },
    }),
)(WorkspaceInvitePage);
