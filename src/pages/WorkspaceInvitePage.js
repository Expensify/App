import React from 'react';
import PropTypes from 'prop-types';
import {TextInput, View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import withLocalize, {withLocalizePropTypes} from '../components/withLocalize';
import ScreenWrapper from '../components/ScreenWrapper';
import HeaderWithCloseButton from '../components/HeaderWithCloseButton';
import Navigation from '../libs/Navigation/Navigation';
import styles from '../styles/styles';
import Text from '../components/Text';
import Button from '../components/Button';
import compose from '../libs/compose';
import ONYXKEYS from '../ONYXKEYS';
import {invite} from '../libs/actions/Policy';
import TextLink from '../components/TextLink';

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

    inviteUser() {
        invite(this.state.emailOrPhone, this.state.welcomeNote || this.getWelcomeNotePlaceholder(),
            this.props.route.params.policyID);
    }

    getWelcomeNotePlaceholder() {
        return this.props.translate('workspaceInvitePage.welcomeNote', {
            workspaceName: this.props.policy.name,
        });
    }

    render() {
        return (
            <ScreenWrapper>
                <HeaderWithCloseButton
                    title={this.props.translate('workspaceInvitePage.invitePeople')}
                    onCloseButtonPress={() => Navigation.dismissModal()}
                />
                <View style={[styles.p5, styles.flex1, styles.overflowAuto]}>
                    <View style={styles.flexGrow1}>
                        <Text style={[styles.mb6, styles.textP]}>
                            {this.props.translate('workspaceInvitePage.invitePeoplePrompt')}
                        </Text>
                        <View style={styles.mb6}>
                            <TextInput
                                autoCompleteType="off"
                                autoCorrect={false}
                                style={[styles.textInput]}
                                value={this.state.emailOrPhone}
                                placeholder={this.props.translate('workspaceInvitePage.enterEmailOrPhone')}
                                onChangeText={text => this.setState({emailOrPhone: text})}
                            />
                        </View>
                        <View style={styles.mb6}>
                            <TextInput
                                autoCompleteType="off"
                                autoCorrect={false}
                                style={[styles.textInput, styles.workspaceInviteWelcome]}
                                numberOfLines={10}
                                multiline
                                value={this.state.welcomeNote}
                                placeholder={this.getWelcomeNotePlaceholder()}
                                onChangeText={text => this.setState({welcomeNote: text})}
                            />
                        </View>
                        <TextLink href="https://use.expensify.com/privacy">
                            {`${this.props.translate('common.privacyPolicy')} `}
                        </TextLink>
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
