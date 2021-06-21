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
import Navigation from '../libs/Navigation/Navigation';
import ROUTES from '../ROUTES';

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

        this.state = {
            twoFactorAuthCode: '',
            formError: false,
            loading: false,
        };
    }

    componentDidMount() {
        // If the user has an active session already, they need to be redirected straight to the new workspace page
        if (this.props.session.authToken) {
            Navigation.navigate(ROUTES.WORKSPACE_NEW);
        }
    }

    validateAndSubmitForm() {
        if (!this.state.twoFactorAuthCode.trim()) {
            this.setState({formError: this.props.translate('passwordForm.pleaseFillOutAllFields')});
            return;
        }

        const accountID = lodashGet(this.props.route.params, 'accountID', '');
        const validateCode = lodashGet(this.props.route.params, 'validateCode', '');

        this.setState({
            formError: null,
        });
    }

    render() {
        // If the user is already logged in, don't need to display anything because they will get redirected
        if (this.props.session.authToken) {
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
