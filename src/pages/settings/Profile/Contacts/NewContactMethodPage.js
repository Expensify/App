import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {View} from 'react-native';
import {ScrollView} from 'react-native-gesture-handler';
import {withOnyx} from 'react-native-onyx';
import {compose} from 'underscore';
import lodashGet from 'lodash/get';
import Str from 'expensify-common/lib/str';
import Button from '../../../../components/Button';
import FixedFooter from '../../../../components/FixedFooter';
import HeaderWithCloseButton from '../../../../components/HeaderWithCloseButton';
import ScreenWrapper from '../../../../components/ScreenWrapper';
import Text from '../../../../components/Text';
import TextInput from '../../../../components/TextInput';
import withLocalize, {withLocalizePropTypes} from '../../../../components/withLocalize';
import Navigation from '../../../../libs/Navigation/Navigation';
import Permissions from '../../../../libs/Permissions';
import ONYXKEYS from '../../../../ONYXKEYS';
import ROUTES from '../../../../ROUTES';
import styles from '../../../../styles/styles';
import * as User from '../../../../libs/actions/User';
import * as LoginUtils from '../../../../libs/LoginUtils';

const propTypes = {
    /* Onyx Props */

    /** List of betas available to current user */
    betas: PropTypes.arrayOf(PropTypes.string),

    /** Login list for the user that is signed in */
    loginList: PropTypes.shape({
        /** The partner creating the account. It depends on the source: website, mobile, integrations, ... */
        partnerName: PropTypes.string,

        /** Phone/Email associated with user */
        partnerUserID: PropTypes.string,

        /** The date when the login was validated, used to show the brickroad status */
        validatedDate: PropTypes.string,

        /** Field-specific server side errors keyed by microtime */
        errorFields: PropTypes.objectOf(PropTypes.objectOf(PropTypes.string)),

        /** Field-specific pending states for offline UI status */
        pendingFields: PropTypes.objectOf(PropTypes.objectOf(PropTypes.string)),
    }),

    ...withLocalizePropTypes,
};
const defaultProps = {
    betas: [],
    loginList: {},
};

class NewContactMethodPage extends Component {
    constructor(props) {
        super(props);

        this.state = {
            login: '',
            password: '',
        };
        this.onLoginChange = this.onLoginChange.bind(this);
        this.validateForm = this.validateForm.bind(this);
        this.submitForm = this.submitForm.bind(this);
    }

    onLoginChange(login) {
        this.setState({login});
    }

    /**
    * Determine whether the form is valid
    *
    * @returns {Boolean}
    */
    validateForm() {
        const login = this.state.login.trim();
        const phoneLogin = LoginUtils.getPhoneNumberWithoutSpecialChars(login);

        return (Permissions.canUsePasswordlessLogins(this.props.betas) || this.state.password)
            && (Str.isValidEmail(login) || Str.isValidPhone(phoneLogin));
    }

    submitForm() {
        // If this login already exists, just go back.
        if (lodashGet(this.props.loginList, this.state.login)) {
            Navigation.navigate(ROUTES.SETTINGS_CONTACT_METHODS);
            return;
        }
        User.addNewContactMethodAndNavigate(this.state.login, this.state.password);
    }

    render() {
        return (
            <ScreenWrapper
                onTransitionEnd={() => {
                    if (!this.loginInputRef) {
                        return;
                    }
                    this.loginInputRef.focus();
                }}
            >
                <HeaderWithCloseButton
                    title={this.props.translate('contacts.newContactMethod')}
                    shouldShowBackButton
                    onBackButtonPress={() => Navigation.navigate(ROUTES.SETTINGS_CONTACT_METHODS)}
                    onCloseButtonPress={() => Navigation.dismissModal(true)}
                />
                <ScrollView>
                    <Text style={[styles.ph5, styles.mb5]}>
                        {this.props.translate('common.pleaseEnterEmailOrPhoneNumber')}
                    </Text>
                    <View style={[styles.ph5, styles.mb6]}>
                        <TextInput
                            label={`${this.props.translate('common.email')}/${this.props.translate('common.phoneNumber')}`}
                            ref={el => this.loginInputRef = el}
                            value={this.state.login}
                            onChangeText={this.onLoginChange}
                            autoCapitalize="none"
                            returnKeyType={Permissions.canUsePasswordlessLogins(this.props.betas) ? 'done' : 'next'}
                        />
                    </View>
                    {!Permissions.canUsePasswordlessLogins(this.props.betas)
                        && (
                            <View style={[styles.ph5, styles.mb6]}>
                                <TextInput
                                    label={this.props.translate('common.password')}
                                    value={this.state.password}
                                    onChangeText={password => this.setState({password})}
                                    returnKeyType="done"
                                />
                            </View>
                        )}
                </ScrollView>
                <FixedFooter style={[styles.flexGrow0]}>
                    <Button
                        success
                        isDisabled={!this.validateForm()}
                        text={this.props.translate('common.add')}
                        onPress={this.submitForm}
                        pressOnEnter
                    />
                </FixedFooter>
            </ScreenWrapper>
        );
    }
}

NewContactMethodPage.propTypes = propTypes;
NewContactMethodPage.defaultProps = defaultProps;

export default compose(
    withLocalize,
    withOnyx({
        betas: {key: ONYXKEYS.BETAS},
        loginList: {key: ONYXKEYS.LOGIN_LIST},
    }),
)(NewContactMethodPage);
