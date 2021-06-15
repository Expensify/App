import React from 'react';
import PropTypes from 'prop-types';
import {TextInput, View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import withLocalize, {withLocalizePropTypes} from '../../components/withLocalize';
import ScreenWrapper from '../../components/ScreenWrapper';
import HeaderWithCloseButton from '../../components/HeaderWithCloseButton';
import Navigation from '../../libs/Navigation/Navigation';
import styles from '../../styles/styles';
import Text from '../../components/Text';
import Button from '../../components/Button';
import compose from '../../libs/compose';
import ONYXKEYS from '../../ONYXKEYS';
import {invite} from '../../libs/actions/Policy';
import TextLink from '../../components/TextLink';
import getEmailKeyboardType from '../../libs/getEmailKeyboardType';
import themeColors from '../../styles/themes/default';
import Growl from '../../libs/Growl';
import CONST from '../../CONST';
import Str from 'expensify-common/lib/str';

const propTypes = {
    ...withLocalizePropTypes,

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
};

const defaultProps = {
    policy: {
        name: '',
    },
};

class WorkspaceInvitePage extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            emailOrPhone: '',
            welcomeNote: '',
        };

        this.getWelcomeNotePlaceholder = this.getWelcomeNotePlaceholder.bind(this);
        this.inviteUser = this.inviteUser.bind(this);
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
     * Handle the invite button click
     */
    inviteUser() {
        if (!Str.isValidEmail(this.state.emailOrPhone) && !Str.isValidPhone(this.state.emailOrPhone)) {
            Growl.show(this.props.translate('workspace.invite.pleaseEnterValidLogin'), CONST.GROWL.ERROR, 5000);
            return;
        }

        invite(this.state.emailOrPhone, this.state.welcomeNote || this.getWelcomeNotePlaceholder(),
            this.props.route.params.policyID);
        Navigation.goBack();
    }

    render() {
        return (
            <ScreenWrapper>
                <HeaderWithCloseButton
                    title={this.props.translate('workspace.invite.invitePeople')}
                    onCloseButtonPress={() => Navigation.dismissModal()}
                />
                <View style={[styles.p5, styles.flex1, styles.overflowAuto]}>
                    <View style={styles.flexGrow1}>
                        <Text style={[styles.mb6, styles.textP]}>
                            {this.props.translate('workspace.invite.invitePeoplePrompt')}
                        </Text>
                        <View style={styles.mb6}>
                            <Text style={[styles.textP, styles.mb2]}>
                                {this.props.translate('workspace.invite.enterEmailOrPhone')}
                            </Text>
                            <TextInput
                                autoCompleteType="email"
                                autoCorrect={false}
                                autoCapitalize="none"
                                style={[styles.textInput]}
                                value={this.state.emailOrPhone}
                                keyboardType={getEmailKeyboardType()}
                                onChangeText={text => this.setState({emailOrPhone: text})}
                            />
                        </View>
                        <View style={styles.mb6}>
                            <Text style={[styles.textP, styles.mb2]}>
                                {this.props.translate('workspace.invite.personalMessagePrompt')}
                            </Text>
                            <TextInput
                                autoCompleteType="off"
                                autoCorrect={false}
                                style={[styles.textInput, styles.workspaceInviteWelcome, styles.mb6]}
                                numberOfLines={10}
                                textAlignVertical="top"
                                multiline
                                value={this.state.welcomeNote}
                                placeholder={this.getWelcomeNotePlaceholder()}
                                placeholderTextColor={themeColors.placeholderText}
                                onChangeText={text => this.setState({welcomeNote: text})}
                            />
                            <TextLink href="https://use.expensify.com/privacy">
                                {this.props.translate('common.privacy')}
                            </TextLink>
                        </View>
                    </View>
                    <View style={styles.flexGrow0}>
                        <Button
                            success
                            style={[styles.mb2]}
                            isDisabled={!this.state.emailOrPhone}
                            text={this.props.translate('common.invite')}
                            onPress={this.inviteUser}
                        />
                    </View>
                </View>
            </ScreenWrapper>
        );
    }
}

WorkspaceInvitePage.propTypes = propTypes;
WorkspaceInvitePage.defaultProps = defaultProps;

export default compose(
    withLocalize,
    withOnyx({
        policy: {
            key: ({route}) => `${ONYXKEYS.COLLECTION.POLICY}${route.params.policyID}`,
        },
    }),
)(WorkspaceInvitePage);
