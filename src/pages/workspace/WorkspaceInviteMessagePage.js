import React from 'react';
import PropTypes from 'prop-types';
import {Pressable, View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import _ from 'underscore';
import Str from 'expensify-common/lib/str';
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
import MultipleAvatars from '../../components/MultipleAvatars';
import CONST from '../../CONST';
import * as Link from '../../libs/actions/Link';
import Text from '../../components/Text';
import withPolicy, {policyPropTypes, policyDefaultProps} from './withPolicy';
import * as OptionsListUtils from '../../libs/OptionsListUtils';
import ROUTES from '../../ROUTES';
import * as Localize from '../../libs/Localize';
import Form from '../../components/Form';
import FullPageNotFoundView from '../../components/BlockingViews/FullPageNotFoundView';

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
    /** All of the personal details for everyone */
    personalDetails: PropTypes.objectOf(personalDetailsPropTypes),

    /** Beta features list */
    betas: PropTypes.arrayOf(PropTypes.string),

    invitedMembersDraft: PropTypes.arrayOf(PropTypes.string),

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
    personalDetails: {},
    betas: [],
    invitedMembersDraft: [],
};

class WorkspaceInviteMessagePage extends React.Component {
    constructor(props) {
        super(props);

        this.sendInvitation = this.sendInvitation.bind(this);
        this.validate = this.validate.bind(this);
        this.openPrivacyURL = this.openPrivacyURL.bind(this);
        this.state = {
            welcomeNote: this.getWelcomeNote(),
        };
    }

    componentDidUpdate(prevProps) {
        if (
            !(
                prevProps.preferredLocale !== this.props.preferredLocale &&
                this.state.welcomeNote === Localize.translate(prevProps.preferredLocale, 'workspace.inviteMessage.welcomeNote', {workspaceName: this.props.policy.name})
            )
        ) {
            return;
        }
        this.setState({welcomeNote: this.getWelcomeNote()});
    }

    getWelcomeNote() {
        return this.props.translate('workspace.inviteMessage.welcomeNote', {
            workspaceName: this.props.policy.name,
        });
    }

    getAvatarTooltips() {
        const filteredPersonalDetails = _.pick(this.props.personalDetails, this.props.invitedMembersDraft);
        return _.map(filteredPersonalDetails, (personalDetail) => Str.removeSMSDomain(personalDetail.login));
    }

    sendInvitation() {
        Policy.addMembersToWorkspace(this.props.invitedMembersDraft, this.state.welcomeNote || this.getWelcomeNote(), this.props.route.params.policyID, this.props.betas);
        Policy.setWorkspaceInviteMembersDraft(this.props.route.params.policyID, []);
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

    validate() {
        const errorFields = {};
        if (_.isEmpty(this.props.invitedMembersDraft)) {
            errorFields.welcomeMessage = this.props.translate('workspace.inviteMessage.inviteNoMembersError');
        }
        return errorFields;
    }

    render() {
        const policyName = lodashGet(this.props.policy, 'name');

        return (
            <ScreenWrapper includeSafeAreaPaddingBottom={false}>
                <FullPageNotFoundView
                    shouldShow={_.isEmpty(this.props.policy)}
                    onBackButtonPress={() => Navigation.navigate(ROUTES.SETTINGS_WORKSPACES)}
                >
                    <HeaderWithCloseButton
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
                            <Pressable
                                onPress={this.openPrivacyURL}
                                accessibilityRole="link"
                                href={CONST.PRIVACY_URL}
                                style={[styles.mv2, styles.alignSelfStart]}
                            >
                                <View style={[styles.flexRow]}>
                                    <Text style={[styles.mr1, styles.label, styles.link]}>{this.props.translate('common.privacy')}</Text>
                                </View>
                            </Pressable>
                        }
                    >
                        <View style={[styles.mv4, styles.justifyContentCenter, styles.alignItemsCenter]}>
                            <MultipleAvatars
                                size={CONST.AVATAR_SIZE.LARGE}
                                icons={OptionsListUtils.getAvatarsForLogins(this.props.invitedMembersDraft, this.props.personalDetails)}
                                shouldStackHorizontally
                                secondAvatarStyle={[styles.secondAvatarInline]}
                                avatarTooltips={this.getAvatarTooltips()}
                            />
                        </View>
                        <View style={[styles.mb5]}>
                            <Text>{this.props.translate('workspace.inviteMessage.inviteMessagePrompt')}</Text>
                        </View>
                        <View style={[styles.mb3]}>
                            <TextInput
                                inputID="welcomeMessage"
                                label={this.props.translate('workspace.inviteMessage.personalMessagePrompt')}
                                autoCompleteType="off"
                                autoCorrect={false}
                                autoGrowHeight
                                textAlignVertical="top"
                                containerStyles={[styles.workspaceInviteWelcome]}
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
    withPolicy,
    withOnyx({
        personalDetails: {
            key: ONYXKEYS.PERSONAL_DETAILS,
        },
        betas: {
            key: ONYXKEYS.BETAS,
        },
        invitedMembersDraft: {
            key: ({route}) => `${ONYXKEYS.COLLECTION.WORKSPACE_INVITE_MEMBERS_DRAFT}${route.params.policyID.toString()}`,
        },
    }),
)(WorkspaceInviteMessagePage);
