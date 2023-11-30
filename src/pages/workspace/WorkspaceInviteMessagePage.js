import {isEmpty} from 'lodash';
import lodashGet from 'lodash/get';
import PropTypes from 'prop-types';
import React from 'react';
import {Keyboard, View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import _ from 'underscore';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import Form from '@components/Form';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import MultipleAvatars from '@components/MultipleAvatars';
import PressableWithoutFeedback from '@components/Pressable/PressableWithoutFeedback';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import TextInput from '@components/TextInput';
import withLocalize, {withLocalizePropTypes} from '@components/withLocalize';
import withNavigationFocus from '@components/withNavigationFocus';
import withThemeStyles, {withThemeStylesPropTypes} from '@components/withThemeStyles';
import compose from '@libs/compose';
import * as Localize from '@libs/Localize';
import Navigation from '@libs/Navigation/Navigation';
import * as OptionsListUtils from '@libs/OptionsListUtils';
import * as PolicyUtils from '@libs/PolicyUtils';
import * as Link from '@userActions/Link';
import * as Policy from '@userActions/Policy';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import {policyDefaultProps, policyPropTypes} from './withPolicy';
import withPolicyAndFullscreenLoading from './withPolicyAndFullscreenLoading';

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
    ...withThemeStylesPropTypes,
};

const defaultProps = {
    ...policyDefaultProps,
    allPersonalDetails: {},
    invitedEmailsToAccountIDsDraft: {},
};

class WorkspaceInviteMessagePage extends React.Component {
    constructor(props) {
        super(props);

        this.sendInvitation = this.sendInvitation.bind(this);
        this.validate = this.validate.bind(this);
        this.openPrivacyURL = this.openPrivacyURL.bind(this);
        this.debouncedSaveDraf = _.debounce((newDraft) => {
            Policy.setWorkspaceInviteMessageDraft(this.props.route.params.policyID, newDraft);
        }, 2000);
        this.state = {
            welcomeNote: this.props.workspaceInviteMessageDraft || this.getDefaultWelcomeNote(),
        };
    }

    componentDidMount() {
        if (_.isEmpty(this.props.invitedEmailsToAccountIDsDraft)) {
            Navigation.goBack(ROUTES.WORKSPACE_INVITE.getRoute(this.props.route.params.policyID), true);
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
        Policy.addMembersToWorkspace(this.props.invitedEmailsToAccountIDsDraft, this.state.welcomeNote, this.props.route.params.policyID);
        Policy.setWorkspaceInviteMembersDraft(this.props.route.params.policyID, {});
        // Pop the invite message page before navigating to the members page.
        Navigation.goBack(ROUTES.HOME);
        Navigation.navigate(ROUTES.WORKSPACE_MEMBERS.getRoute(this.props.route.params.policyID));
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
            <ScreenWrapper
                includeSafeAreaPaddingBottom={false}
                testID={WorkspaceInviteMessagePage.displayName}
            >
                <FullPageNotFoundView
                    shouldShow={_.isEmpty(this.props.policy) || !PolicyUtils.isPolicyAdmin(this.props.policy) || PolicyUtils.isPendingDeletePolicy(this.props.policy)}
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
                        onBackButtonPress={() => Navigation.goBack(ROUTES.WORKSPACE_INVITE.getRoute(this.props.route.params.policyID))}
                    />

                    <Form
                        style={[this.props.themeStyles.flexGrow1, this.props.themeStyles.ph5]}
                        formID={ONYXKEYS.FORMS.WORKSPACE_INVITE_MESSAGE_FORM}
                        validate={this.validate}
                        onSubmit={this.sendInvitation}
                        submitButtonText={this.props.translate('common.invite')}
                        enabledWhenOffline
                        footerContent={
                            <PressableWithoutFeedback
                                onPress={this.openPrivacyURL}
                                role={CONST.ACCESSIBILITY_ROLE.LINK}
                                accessibilityLabel={this.props.translate('common.privacy')}
                                href={CONST.PRIVACY_URL}
                                style={[this.props.themeStyles.mv2, this.props.themeStyles.alignSelfStart]}
                            >
                                <View style={[this.props.themeStyles.flexRow]}>
                                    <Text style={[this.props.themeStyles.mr1, this.props.themeStyles.label, this.props.themeStyles.link]}>{this.props.translate('common.privacy')}</Text>
                                </View>
                            </PressableWithoutFeedback>
                        }
                    >
                        <View style={[this.props.themeStyles.mv4, this.props.themeStyles.justifyContentCenter, this.props.themeStyles.alignItemsCenter]}>
                            <MultipleAvatars
                                size={CONST.AVATAR_SIZE.LARGE}
                                icons={OptionsListUtils.getAvatarsForAccountIDs(
                                    _.values(this.props.invitedEmailsToAccountIDsDraft),
                                    this.props.allPersonalDetails,
                                    this.props.invitedEmailsToAccountIDsDraft,
                                )}
                                shouldStackHorizontally
                                shouldDisplayAvatarsInRows
                                secondAvatarStyle={[this.props.themeStyles.secondAvatarInline]}
                            />
                        </View>
                        <View style={[this.props.themeStyles.mb5]}>
                            <Text>{this.props.translate('workspace.inviteMessage.inviteMessagePrompt')}</Text>
                        </View>
                        <View style={[this.props.themeStyles.mb3]}>
                            <TextInput
                                ref={(el) => (this.welcomeMessageInputRef = el)}
                                role={CONST.ACCESSIBILITY_ROLE.TEXT}
                                inputID="welcomeMessage"
                                label={this.props.translate('workspace.inviteMessage.personalMessagePrompt')}
                                accessibilityLabel={this.props.translate('workspace.inviteMessage.personalMessagePrompt')}
                                autoCompleteType="off"
                                autoCorrect={false}
                                autoGrowHeight
                                inputStyle={[this.props.themeStyles.verticalAlignTop]}
                                containerStyles={[this.props.themeStyles.autoGrowHeightMultilineInput]}
                                defaultValue={this.state.welcomeNote}
                                value={this.state.welcomeNote}
                                onChangeText={(text) => {
                                    this.debouncedSaveDraf(text);
                                    this.setState({welcomeNote: text});
                                }}
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
WorkspaceInviteMessagePage.displayName = 'WorkspaceInviteMessagePage';

export default compose(
    withLocalize,
    withPolicyAndFullscreenLoading,
    withOnyx({
        allPersonalDetails: {
            key: ONYXKEYS.PERSONAL_DETAILS_LIST,
        },
        invitedEmailsToAccountIDsDraft: {
            key: ({route}) => `${ONYXKEYS.COLLECTION.WORKSPACE_INVITE_MEMBERS_DRAFT}${route.params.policyID.toString()}`,
        },
        workspaceInviteMessageDraft: {
            key: ({route}) => `${ONYXKEYS.COLLECTION.WORKSPACE_INVITE_MESSAGE_DRAFT}${route.params.policyID.toString()}`,
            selector: (draft) => (isEmpty(draft) ? '' : draft),
        },
    }),
    withNavigationFocus,
    withThemeStyles,
)(WorkspaceInviteMessagePage);
