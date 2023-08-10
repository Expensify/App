import React from 'react';
import PropTypes from 'prop-types';
import {View, Keyboard} from 'react-native';
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
import TextInput from '../../components/TextInput';
import MultipleAvatars from '../../components/MultipleAvatars';
import CONST from '../../CONST';
import * as Link from '../../libs/actions/Link';
import Text from '../../components/Text';
import {policyPropTypes, policyDefaultProps} from './withPolicy';
import withPolicyAndFullscreenLoading from './withPolicyAndFullscreenLoading';
import * as OptionsListUtils from '../../libs/OptionsListUtils';
import ROUTES from '../../ROUTES';
import * as Localize from '../../libs/Localize';
import Form from '../../components/Form';
import FullPageNotFoundView from '../../components/BlockingViews/FullPageNotFoundView';
import withNavigationFocus from '../../components/withNavigationFocus';
import PressableWithoutFeedback from '../../components/Pressable/PressableWithoutFeedback';

const personalDetailsPropTypes = PropTypes.shape({
    /** The accountID of the person */
    accountID: PropTypes.number.isRequired,

    /** The login of the person (either email or phone number) */
    login: PropTypes.string,

    /** The URL of the person's avatar (there should already be a default avatar if
    the person doesn't have their own avatar uploaded yet, except for anon users) */
    avatar: PropTypes.string,

    /** This is either the user's full name, or their login if full name is an empty string */
    displayName: PropTypes.string,
});

const propTypes = {
    /** All of the personal details for everyone */
    allPersonalDetails: PropTypes.objectOf(personalDetailsPropTypes),

    /** Beta features list */
    betas: PropTypes.arrayOf(PropTypes.string),

    invitedEmailsToAccountIDsDraft: PropTypes.objectOf(PropTypes.number),

    /** URL Route params */
    route: PropTypes.shape({
        /** Params from the URL path */
        params: PropTypes.shape({
            /** policyID passed via route: /workspace/:policyID/invite-message */
            policyID: PropTypes.string,
        }),
    }).isRequired,

    ...policyPropTypes,
    ...withLocalizePropTypes,
};

const defaultProps = {
    ...policyDefaultProps,
    allPersonalDetails: {},
    betas: [],
    invitedEmailsToAccountIDsDraft: {},
};

class WorkspaceInviteMessagePage extends React.Component {
    constructor(props) {
        super(props);

        this.sendInvitation = this.sendInvitation.bind(this);
        this.validate = this.validate.bind(this);
        this.openPrivacyURL = this.openPrivacyURL.bind(this);
        this.state = {
            welcomeNote: this.getDefaultWelcomeNote(),
        };
    }

    componentDidMount() {
        if (_.isEmpty(this.props.invitedEmailsToAccountIDsDraft)) {
            Navigation.goBack(ROUTES.getWorkspaceInviteRoute(this.props.route.params.policyID), true);
            return;
        }
        this.focusWelcomeMessageInput();
    }

    componentDidUpdate(prevProps) {
        if (!prevProps.isFocused && this.props.isFocused) {
            this.focusWelcomeMessageInput();
        }

        if (
            !(
                (prevProps.preferredLocale !== this.props.preferredLocale || prevProps.policy.name !== this.props.policy.name) &&
                this.state.welcomeNote === Localize.translate(prevProps.preferredLocale, 'workspace.inviteMessage.welcomeNote', {workspaceName: prevProps.policy.name})
            )
        ) {
            return;
        }
        this.setState({welcomeNote: this.getDefaultWelcomeNote()});
    }

    componentWillUnmount() {
        if (!this.focusTimeout) {
            return;
        }
        clearTimeout(this.focusTimeout);
    }

    getDefaultWelcomeNote() {
        return this.props.translate('workspace.inviteMessage.welcomeNote', {
            workspaceName: this.props.policy.name,
        });
    }

    sendInvitation() {
        Keyboard.dismiss();
        Policy.addMembersToWorkspace(this.props.invitedEmailsToAccountIDsDraft, this.state.welcomeNote, this.props.route.params.policyID, this.props.betas);
        Policy.setWorkspaceInviteMembersDraft(this.props.route.params.policyID, {});
        // Pop the invite message page before navigating to the members page.
        Navigation.goBack();
        Navigation.navigate(ROUTES.getWorkspaceMembersRoute(this.props.route.params.policyID));
    }

    /**
     * Opens privacy url as an external link
     * @param {Object} event
     */
    openPrivacyURL(event) {
        event.preventDefault();
        Link.openExternalLink(CONST.PRIVACY_URL);
    }

    focusWelcomeMessageInput() {
        this.focusTimeout = setTimeout(() => {
            this.welcomeMessageInputRef.focus();
            // Below condition is needed for web, desktop and mweb only, for native cursor is set at end by default.
            if (this.welcomeMessageInputRef.value && this.welcomeMessageInputRef.setSelectionRange) {
                const length = this.welcomeMessageInputRef.value.length;
                this.welcomeMessageInputRef.setSelectionRange(length, length);
            }
        }, CONST.ANIMATED_TRANSITION);
    }

    validate() {
        const errorFields = {};
        if (_.isEmpty(this.props.invitedEmailsToAccountIDsDraft)) {
            errorFields.welcomeMessage = 'workspace.inviteMessage.inviteNoMembersError';
        }
        return errorFields;
    }

    render() {
        const policyName = lodashGet(this.props.policy, 'name');

        return (
            <ScreenWrapper includeSafeAreaPaddingBottom={false}>
                <FullPageNotFoundView
                    shouldShow={_.isEmpty(this.props.policy) || !Policy.isPolicyOwner(this.props.policy)}
                    subtitleKey={_.isEmpty(this.props.policy) ? undefined : 'workspace.common.notAuthorized'}
                    onBackButtonPress={() => Navigation.goBack(ROUTES.SETTINGS_WORKSPACES)}
                >
                    <HeaderWithBackButton
                        title={this.props.translate('workspace.inviteMessage.inviteMessageTitle')}
                        subtitle={policyName}
                        shouldShowGetAssistanceButton
                        guidesCallTaskID={CONST.GUIDES_CALL_TASK_IDS.WORKSPACE_MEMBERS}
                        shouldShowBackButton
                        onCloseButtonPress={() => Navigation.dismissModal()}
                        onBackButtonPress={() => Navigation.goBack()}
                    />
                    <Form
                        style={[styles.flexGrow1, styles.ph5]}
                        formID={ONYXKEYS.FORMS.WORKSPACE_INVITE_MESSAGE_FORM}
                        validate={this.validate}
                        onSubmit={this.sendInvitation}
                        submitButtonText={this.props.translate('common.invite')}
                        enabledWhenOffline
                        footerContent={
                            <PressableWithoutFeedback
                                onPress={this.openPrivacyURL}
                                accessibilityRole={CONST.ACCESSIBILITY_ROLE.LINK}
                                accessibilityLabel={this.props.translate('common.privacy')}
                                href={CONST.PRIVACY_URL}
                                style={[styles.mv2, styles.alignSelfStart]}
                            >
                                <View style={[styles.flexRow]}>
                                    <Text style={[styles.mr1, styles.label, styles.link]}>{this.props.translate('common.privacy')}</Text>
                                </View>
                            </PressableWithoutFeedback>
                        }
                    >
                        <View style={[styles.mv4, styles.justifyContentCenter, styles.alignItemsCenter]}>
                            <MultipleAvatars
                                size={CONST.AVATAR_SIZE.LARGE}
                                icons={OptionsListUtils.getAvatarsForAccountIDs(
                                    _.values(this.props.invitedEmailsToAccountIDsDraft),
                                    this.props.allPersonalDetails,
                                    this.props.invitedEmailsToAccountIDsDraft,
                                )}
                                shouldStackHorizontally
                                shouldDisplayAvatarsInRows
                                secondAvatarStyle={[styles.secondAvatarInline]}
                            />
                        </View>
                        <View style={[styles.mb5]}>
                            <Text>{this.props.translate('workspace.inviteMessage.inviteMessagePrompt')}</Text>
                        </View>
                        <View style={[styles.mb3]}>
                            <TextInput
                                ref={(el) => (this.welcomeMessageInputRef = el)}
                                accessibilityRole={CONST.ACCESSIBILITY_ROLE.TEXT}
                                inputID="welcomeMessage"
                                label={this.props.translate('workspace.inviteMessage.personalMessagePrompt')}
                                accessibilityLabel={this.props.translate('workspace.inviteMessage.personalMessagePrompt')}
                                autoCompleteType="off"
                                autoCorrect={false}
                                autoGrowHeight
                                textAlignVertical="top"
                                containerStyles={[styles.autoGrowHeightMultilineInput]}
                                defaultValue={this.state.welcomeNote}
                                value={this.state.welcomeNote}
                                onChangeText={(text) => this.setState({welcomeNote: text})}
                            />
                        </View>
                    </Form>
                </FullPageNotFoundView>
            </ScreenWrapper>
        );
    }
}

WorkspaceInviteMessagePage.propTypes = propTypes;
WorkspaceInviteMessagePage.defaultProps = defaultProps;

export default compose(
    withLocalize,
    withPolicyAndFullscreenLoading,
    withOnyx({
        allPersonalDetails: {
            key: ONYXKEYS.PERSONAL_DETAILS_LIST,
        },
        betas: {
            key: ONYXKEYS.BETAS,
        },
        invitedEmailsToAccountIDsDraft: {
            key: ({route}) => `${ONYXKEYS.COLLECTION.WORKSPACE_INVITE_MEMBERS_DRAFT}${route.params.policyID.toString()}`,
        },
    }),
    withNavigationFocus,
)(WorkspaceInviteMessagePage);
