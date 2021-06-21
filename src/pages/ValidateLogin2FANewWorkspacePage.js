import React, {Component} from 'react';
import {Text, TextInput, View} from 'react-native';
import lodashGet from 'lodash/get';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import withLocalize, {withLocalizePropTypes} from '../components/withLocalize';
import validateLinkPropTypes from './validateLinkPropTypes';
import {validateLogin} from '../libs/actions/User';
import styles from '../styles/styles';
import ExpensifyCashLogo from '../components/ExpensifyCashLogo';
import variables from '../styles/variables';
import themeColors from '../styles/themes/default';
import CONST from '../CONST';
import Button from '../components/Button';
import compose from '../libs/compose';
import ONYXKEYS from '../ONYXKEYS';

const propTypes = {
    /* Onyx Props */

    /** The data about the current session */
    session: PropTypes.shape({
        /** The authToken for the current session */
        authToken: PropTypes.string,
    }),

    /** The accountID and validateCode are passed via the URL */
    route: validateLinkPropTypes,

    ...withLocalizePropTypes,
};

const defaultProps = {
    route: {
        params: {},
    },
    session: {},
};
class ValidateLogin2FANewWorkspacePage extends Component {
    constructor(props) {
        super(props);

        this.requiresTwoFactorAuth = lodashGet(this.props.route.params, '2fa') === 'true';

        this.state = {
            twoFactorAuthCode: '',
            formError: false,
            loading: false,
        };
    }

    componentDidMount() {
        console.log('2');
        // const accountID = lodashGet(this.props.route.params, 'accountID', '');
        // const validateCode = lodashGet(this.props.route.params, 'validateCode', '');
        //
        // // If there is no need to get a 2fa code, then validate the login right away, otherwise there will be a UI
        // // displayed for the user to enter their 2fa code.
        // if (!this.requiresTwoFactorAuth) {
        //     validateLogin(accountID, validateCode);
        // }
    }

    validateAndSubmitForm() {
        if (!this.state.twoFactorAuthCode.trim()) {
            this.setState({formError: this.props.translate('passwordForm.pleaseFillOutAllFields')});
            return;
        }

        this.setState({
            formError: null,
        });
    }

    render() {
        // Don't render anything here since we will redirect the user once we've attempted to validate their login
        if (!this.requiresTwoFactorAuth) {
            return null;
        }

        return (
            <View style={[styles.signInPageInnerNative]}>
                <View style={[styles.signInPageLogoNative]}>
                    <ExpensifyCashLogo width={variables.componentSizeLarge} height={variables.componentSizeLarge} />
                </View>
                <View style={[styles.mb6, styles.alignItemsCenter]}>
                    <Text style={[styles.h1]}>
                        {this.props.translate('signInPage.expensifyDotCash')}
                    </Text>
                </View>

                <View style={[styles.signInPageFormContainer]}>
                    <View style={[styles.mb4]}>
                        <Text style={[styles.formLabel]}>
                            {this.props.translate('passwordForm.EnterATwoFactorAuthenticationCodeToContinue')}
                        </Text>
                        <TextInput
                            style={[styles.textInput]}
                            value={this.state.twoFactorAuthCode}
                            placeholder={this.props.translate('passwordForm.twoFactorCode')}
                            placeholderTextColor={themeColors.placeholderText}
                            onChangeText={text => this.setState({twoFactorAuthCode: text})}
                            onSubmitEditing={this.validateAndSubmitForm}
                            keyboardType={CONST.KEYBOARD_TYPE.NUMERIC}
                        />
                    </View>
                    <View>
                        <Button
                            success
                            style={[styles.mb2]}
                            text={this.props.translate('common.continue')}
                            isLoading={this.state.loading}
                            onPress={this.validateAndSubmitForm}
                        />
                    </View>
                    {this.state.formError && (
                        <Text style={[styles.formError]}>
                            {this.state.formError}
                        </Text>
                    )}
                </View>
            </View>
        );
    }
}

ValidateLogin2FANewWorkspacePage.propTypes = propTypes;
ValidateLogin2FANewWorkspacePage.defaultProps = defaultProps;

export default compose(
    withLocalize,
    withOnyx({
        session: {
            key: ONYXKEYS.SESSION,
        },
    }),
)(ValidateLogin2FANewWorkspacePage);
