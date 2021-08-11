import React, {Component} from 'react';
import {TextInput, View} from 'react-native';
import lodashGet from 'lodash/get';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import _ from 'underscore';
import withLocalize, {withLocalizePropTypes} from '../components/withLocalize';
import validateLinkPropTypes from './validateLinkPropTypes';
import {continueSessionFromECom, setRedirectAfterSign} from '../libs/actions/Session';
import styles from '../styles/styles';
import ExpensifyCashLogo from '../components/ExpensifyCashLogo';
import variables from '../styles/variables';
import themeColors from '../styles/themes/default';
import CONST from '../CONST';
import Button from '../components/Button';
import Text from '../components/Text';
import compose from '../libs/compose';
import ONYXKEYS from '../ONYXKEYS';
import Navigation from '../libs/Navigation/Navigation';
import ROUTES from '../ROUTES';
import SCREENS from '../SCREENS';
import {create} from '../libs/actions/Policy';

const propTypes = {
    /* Onyx Props */

    /** The data about the current session */
    session: PropTypes.shape({
        /** The authToken for the current session */
        authToken: PropTypes.string,
    }),

    /** The accountID and validateCode are passed via the URL */
    route: validateLinkPropTypes,

    /** List of betas */
    betas: PropTypes.arrayOf(PropTypes.string),

    ...withLocalizePropTypes,
};

const defaultProps = {
    route: {
        params: {},
    },
    session: {},
    betas: [],
};
class LoginWithValidateCode2FAPage extends Component {
    constructor(props) {
        super(props);

        this.validateAndSubmitForm = this.validateAndSubmitForm.bind(this);

        this.state = {
            twoFactorAuthCode: '',
            formError: false,
            loading: false,
        };
    }

    componentDidMount() {
        // If the user has an active session already, they need to be redirected straight to the relevant page
        if (this.props.session.authToken) {
            // In order to navigate to a modal, we first have to dismiss the current modal. But there is no current
            // modal you say? I know, it confuses me too. Without dismissing the current modal, if they user cancels
            // out of the new workspace modal, then they will be routed back to
            // /v/<accountID>/<validateCode>/new-workspace and we don't want that. We want them to go back to `/` and
            // by calling dismissModal(), the /v/... route is removed from history so the user will get taken to `/`
            // if they cancel out of the new workspace modal.
            Navigation.dismissModal();

            if (_.isEmpty(this.props.betas)) {
                setRedirectAfterSign(true);
            } else if (this.props.route.name === SCREENS.LOGIN_WITH_VALIDATE_CODE_2FA_WORKSPACE_CARD) {
                Navigation.navigate(ROUTES.getWorkspaceCardRoute(this.props.route.params.policyID));
            } else if (this.props.route.name === SCREENS.LOGIN_WITH_VALIDATE_CODE_2FA_NEW_WORKSPACE) {
                // Create a new workspace so that the user will be routed to it's settings page afterwards
                create();
            } else {
                Navigation.navigate(ROUTES.HOME);
            }
        }
    }

    validateAndSubmitForm() {
        if (!this.state.twoFactorAuthCode.trim()) {
            this.setState({formError: this.props.translate('passwordForm.pleaseFillOutAllFields')});
            return;
        }

        this.setState({
            formError: null,
            loading: true,
        });

        const accountID = lodashGet(this.props.route.params, 'accountID', '');
        const validateCode = lodashGet(this.props.route.params, 'validateCode', '');
        continueSessionFromECom(accountID, validateCode, this.state.twoFactorAuthCode);
    }

    render() {
        // If the user is already logged in, don't need to display anything because they will get redirected to the
        // new workspace page in componentDidMount
        if (this.props.session.authToken) {
            return null;
        }

        return (
            <View style={[styles.signInPageInnerNative]}>
                <View style={[styles.componentHeightLarge]}>
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
                            {this.props.translate('passwordForm.enterYourTwoFactorAuthenticationCodeToContinue')}
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

LoginWithValidateCode2FAPage.propTypes = propTypes;
LoginWithValidateCode2FAPage.defaultProps = defaultProps;

export default compose(
    withLocalize,
    withOnyx({
        session: {
            key: ONYXKEYS.SESSION,
        },
        betas: {
            key: ONYXKEYS.BETAS,
        },
    }),
)(LoginWithValidateCode2FAPage);
