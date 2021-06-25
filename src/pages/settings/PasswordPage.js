import React, {Component} from 'react';
import {View, ScrollView} from 'react-native';
import Onyx, {withOnyx} from 'react-native-onyx';
import PropTypes from 'prop-types';
import {isEmpty} from 'underscore';

import HeaderWithCloseButton from '../../components/HeaderWithCloseButton';
import Navigation from '../../libs/Navigation/Navigation';
import ROUTES from '../../ROUTES';
import ScreenWrapper from '../../components/ScreenWrapper';
import Text from '../../components/Text';
import styles from '../../styles/styles';
import ONYXKEYS from '../../ONYXKEYS';
import CONST from '../../CONST';
import Button from '../../components/Button';
import {changePassword} from '../../libs/actions/User';
import withLocalize, {withLocalizePropTypes} from '../../components/withLocalize';
import compose from '../../libs/compose';
import KeyboardAvoidingView from '../../components/KeyboardAvoidingView';
import FixedFooter from '../../components/FixedFooter';
import ExpensiTextInput from '../../components/ExpensiTextInput';

const propTypes = {
    /* Onyx Props */

    /** Holds information about the users account that is logging in */
    account: PropTypes.shape({
        /** An error message to display to the user */
        error: PropTypes.string,

        /** Success message to display when necessary */
        success: PropTypes.string,

        /** Whether or not a sign on form is loading (being submitted) */
        loading: PropTypes.bool,
    }),

    ...withLocalizePropTypes,
};

const defaultProps = {
    account: {},
};
class PasswordPage extends Component {
    constructor(props) {
        super(props);

        this.state = {
            currentPassword: '',
            newPassword: '',
            confirmNewPassword: '',
            isPasswordRequirementsVisible: false,
        };

        this.handleChangePassword = this.handleChangePassword.bind(this);
    }

    componentWillUnmount() {
        Onyx.merge(ONYXKEYS.ACCOUNT, {error: '', success: ''});
    }

    handleChangePassword() {
        changePassword(this.state.currentPassword, this.state.newPassword)
            .then((response) => {
                if (response.jsonCode === 200) {
                    Navigation.navigate(ROUTES.SETTINGS);
                }
            });
    }

    render() {
        return (
            <ScreenWrapper>
                <KeyboardAvoidingView>
                    <HeaderWithCloseButton
                        title={this.props.translate('passwordPage.changePassword')}
                        shouldShowBackButton
                        onBackButtonPress={() => Navigation.navigate(ROUTES.SETTINGS)}
                        onCloseButtonPress={() => Navigation.dismissModal(true)}
                    />
                    <ScrollView style={styles.flex1} contentContainerStyle={styles.p5}>
                        <Text style={[styles.mb6, styles.textP]}>
                            {this.props.translate('passwordPage.changingYourPasswordPrompt')}
                        </Text>
                        <View style={styles.mb6}>
                            <ExpensiTextInput
                                label={`${this.props.translate('passwordPage.currentPassword')}*`}
                                secureTextEntry
                                autoCompleteType="password"
                                textContentType="password"
                                value={this.state.currentPassword}
                                onChangeText={currentPassword => this.setState({currentPassword})}
                            />
                        </View>
                        <View style={styles.mb6}>
                            <ExpensiTextInput
                                label={`${this.props.translate('passwordPage.newPassword')}*`}
                                secureTextEntry
                                autoCompleteType="password"
                                textContentType="password"
                                value={this.state.newPassword}
                                onChangeText={newPassword => this.setState({newPassword})}
                                onFocusExtra={() => this.setState({isPasswordRequirementsVisible: true})}
                                onBlurExtra={() => this.setState({isPasswordRequirementsVisible: false})}
                            />
                            {this.state.isPasswordRequirementsVisible && (
                                <Text style={[styles.formHint, styles.mt1]}>
                                    {this.props.translate('passwordPage.newPasswordPrompt')}
                                </Text>
                            )}
                        </View>
                        <View style={styles.mb6}>
                            <ExpensiTextInput
                                label={`${this.props.translate('passwordPage.confirmNewPassword')}*`}
                                secureTextEntry
                                autoCompleteType="password"
                                textContentType="password"
                                value={this.state.confirmNewPassword}
                                onChangeText={confirmNewPassword => this.setState({confirmNewPassword})}
                                onSubmitEditing={this.handleChangePassword}
                            />
                        </View>
                        {!isEmpty(this.props.account.error) && (
                            <Text style={styles.formError}>
                                {this.props.account.error}
                            </Text>
                        )}
                    </ScrollView>
                    <FixedFooter style={[styles.flexGrow0]}>
                        <Button
                            success
                            style={[styles.mb2]}
                            isDisabled={!this.state.currentPassword || !this.state.newPassword
                                || !this.state.confirmNewPassword
                                || (this.state.newPassword !== this.state.confirmNewPassword)
                                || (this.state.currentPassword === this.state.newPassword)
                                || !this.state.newPassword.match(CONST.PASSWORD_COMPLEXITY_REGEX_STRING)}
                            isLoading={this.props.account.loading}
                            text={this.props.translate('common.save')}
                            onPress={this.handleChangePassword}
                        />
                    </FixedFooter>
                </KeyboardAvoidingView>
            </ScreenWrapper>
        );
    }
}

PasswordPage.displayName = 'PasswordPage';
PasswordPage.propTypes = propTypes;
PasswordPage.defaultProps = defaultProps;

export default compose(
    withLocalize,
    withOnyx({
        account: {
            key: ONYXKEYS.ACCOUNT,
        },
    }),
)(PasswordPage);
