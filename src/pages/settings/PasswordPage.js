import React, {Component} from 'react';
import {View, TextInput} from 'react-native';
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
import ButtonWithLoader from '../../components/ButtonWithLoader';
import {changePassword} from '../../libs/actions/User';

const propTypes = {
    /* Onyx Props */
    // Holds information about the users account that is logging in
    account: PropTypes.shape({
        // An error message to display to the user
        error: PropTypes.string,

        // Success message to display when necessary
        success: PropTypes.string,

        // Whether or not a sign on form is loading (being submitted)
        loading: PropTypes.bool,
    }),
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
                <HeaderWithCloseButton
                    title="Change Password"
                    shouldShowBackButton
                    onBackButtonPress={() => Navigation.navigate(ROUTES.SETTINGS)}
                    onCloseButtonPress={Navigation.dismissModal}
                />
                <View style={[styles.p5, styles.flex1, styles.overflowAuto]}>
                    <View style={styles.flexGrow1}>
                        <Text style={[styles.mb6, styles.textP]}>
                            Changing your password will update your password for both your Expensify.com
                            and Expensify.cash accounts.
                        </Text>
                        <View style={styles.mb6}>
                            <Text style={[styles.mb1, styles.formLabel]}>Current Password*</Text>
                            <TextInput
                                secureTextEntry
                                autoCompleteType="password"
                                textContentType="password"
                                style={styles.textInput}
                                value={this.state.currentPassword}
                                onChangeText={currentPassword => this.setState({currentPassword})}
                            />
                        </View>
                        <View style={styles.mb6}>
                            <Text style={[styles.mb1, styles.formLabel]}>New Password*</Text>
                            <TextInput
                                secureTextEntry
                                autoCompleteType="password"
                                textContentType="password"
                                style={styles.textInput}
                                value={this.state.newPassword}
                                onChangeText={newPassword => this.setState({newPassword})}
                                onFocus={() => this.setState({isPasswordRequirementsVisible: true})}
                                onBlur={() => this.setState({isPasswordRequirementsVisible: false})}
                            />
                            {this.state.isPasswordRequirementsVisible && (
                                <Text style={[styles.formHint, styles.mt1]}>
                                    New password must be different than your old password, have at least 8 characters,
                                    1 capital letter, 1 lowercase letter, 1 number.
                                </Text>
                            )}
                        </View>
                        <View style={styles.mb6}>
                            <Text style={[styles.mb1, styles.formLabel]}>Confirm New Password*</Text>
                            <TextInput
                                secureTextEntry
                                autoCompleteType="password"
                                textContentType="password"
                                style={styles.textInput}
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
                    </View>
                    <View style={styles.flexGrow0}>
                        <ButtonWithLoader
                            isDisabled={!this.state.currentPassword || !this.state.newPassword
                                || !this.state.confirmNewPassword
                                || (this.state.newPassword !== this.state.confirmNewPassword)
                                || (this.state.currentPassword === this.state.newPassword)
                                || !this.state.newPassword.match(CONST.PASSWORD_COMPLEXITY_REGEX_STRING)}
                            isLoading={this.props.account.loading}
                            text="Save"
                            onClick={this.handleChangePassword}
                        />
                    </View>
                </View>
            </ScreenWrapper>
        );
    }
}

PasswordPage.displayName = 'PasswordPage';
PasswordPage.propTypes = propTypes;
PasswordPage.defaultProps = defaultProps;

export default withOnyx({
    account: {
        key: ONYXKEYS.ACCOUNT,
    },
})(PasswordPage);
