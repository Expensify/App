import React, {Component} from 'react';
import {TextInput, View} from 'react-native';
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
import withLocalize, {withLocalizePropTypes} from '../../components/withLocalize';
import compose from '../../libs/compose';
import TestComp from './TestComp';

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
                <HeaderWithCloseButton
                    title={this.props.translate('passwordPage.changePassword')}
                    shouldShowBackButton
                    onBackButtonPress={() => Navigation.navigate(ROUTES.SETTINGS)}
                    onCloseButtonPress={() => Navigation.dismissModal(true)}
                />
                <View style={[styles.p5, styles.flex1, styles.overflowAuto]}>
                    <View style={styles.flexGrow1}>
                        <Text style={[styles.mb6, styles.textP]}>
                            {this.props.translate('passwordPage.changingYourPasswordPrompt')}
                        </Text>
                        <View style={styles.mb6}>
                            <Text style={[styles.mb1, styles.formLabel]}>
                                {`${this.props.translate('passwordPage.currentPassword')}*`}
                            </Text>
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
                            <Text style={[styles.mb1, styles.formLabel]}>
                                {`${this.props.translate('passwordPage.newPassword')}*`}
                            </Text>
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
                                    {this.props.translate('passwordPage.newPasswordPrompt')}
                                </Text>
                            )}
                        </View>
                        <View style={styles.mb6}>
                            <Text style={[styles.mb1, styles.formLabel]}>
                                {`${this.props.translate('passwordPage.confirmNewPassword')}*`}
                            </Text>
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
                            text={this.props.translate('common.save')}
                            onClick={this.handleChangePassword}
                        />
                    </View>
                    <TestComp />
                </View>
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
