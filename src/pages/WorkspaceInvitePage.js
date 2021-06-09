import React from 'react';
import PropTypes from 'prop-types';
import {TextInput, View} from 'react-native';
import withLocalize, {withLocalizePropTypes} from '../components/withLocalize';
import ScreenWrapper from '../components/ScreenWrapper';
import HeaderWithCloseButton from '../components/HeaderWithCloseButton';
import Navigation from '../libs/Navigation/Navigation';
import styles from '../styles/styles';
import Text from '../components/Text';
import Button from '../components/Button';

const propTypes = {
    ...withLocalizePropTypes,

    /** PolicyID of the workspace */
    policyID: PropTypes.string.isRequired,
};

class WorkspaceInvitePage extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            emailOrPhone: '',
            welcomeMessage: '',
        };
    }

    inviteUser() {
        console.debug('user invited');
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
                                value={this.state.welcomeMessage}
                                placeholder={this.props.translate('workspaceInvitePage.welcomeMessage', {
                                    workspaceName: 'TODO testing',
                                })}
                                onChangeText={text => this.setState({welcomeMessage: text})}
                            />
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

export default withLocalize(WorkspaceInvitePage);
