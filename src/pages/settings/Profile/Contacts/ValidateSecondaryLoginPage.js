import Str from 'expensify-common/lib/str';
import React, {useEffect, useState} from 'react';
import {withOnyx} from 'react-native-onyx';
import PropTypes from 'prop-types';
import {View, ScrollView} from 'react-native';
import _ from 'underscore';
import HeaderWithCloseButton from '../../../../components/HeaderWithCloseButton';
import Navigation from '../../../../libs/Navigation/Navigation';
import ScreenWrapper from '../../../../components/ScreenWrapper';
import Text from '../../../../components/Text';
import styles from '../../../../styles/styles';
import * as User from '../../../../libs/actions/User';
import CONST from '../../../../CONST';
import ONYXKEYS from '../../../../ONYXKEYS';
import Button from '../../../../components/Button';
import ROUTES from '../../../../ROUTES';
import withLocalize, {withLocalizePropTypes} from '../../../../components/withLocalize';
import compose from '../../../../libs/compose';
import FixedFooter from '../../../../components/FixedFooter';
import TextInput from '../../../../components/TextInput';
import * as ErrorUtils from '../../../../libs/ErrorUtils';

const propTypes = {

    /** Session info for the currently logged in user. */
    session: PropTypes.shape({
        accountID: PropTypes.number,
    }).isRequired,

    // Route object from navigation
    route: PropTypes.shape({
        // Params that are passed into the route
        params: PropTypes.shape({
            // The login being validated
            login: PropTypes.string,
        }),
    }),

    /** Holds information about the users account that is logging in */
    account: PropTypes.shape({
        /** An error message to display to the user */
        errors: PropTypes.objectOf(PropTypes.string),

        /** Success message to display when necessary */
        success: PropTypes.string,

        /** Whether a sign on form is loading (being submitted) */
        isLoading: PropTypes.bool,
    }),
    ...withLocalizePropTypes,
};

const defaultProps = {
    route: {},
    account: {},
};

const ValidateSecondaryLoginPage = (props) => {
    const [validateCode, setValidateCode] = useState(props.credentials.validateCode || '');

    /**
     * Validate the secondary login via validate code
     */
    const submitForm = () => {
        let login = props.route.params.login;

        // Re-add SMS domain if we're validating a phone number
        if (Str.isValidPhone(login)) {
            login = `${login}@${CONST.SMS.DOMAIN}`;
        }
        User.validateSecondaryLoginAndNavigate(props.session.accountID, validateCode, login);
    };

    return (
        <ScreenWrapper>
            <HeaderWithCloseButton
                title={`${props.translate('validateSecondaryLoginPage.validate')} ${props.route.params.login}`}
                shouldShowBackButton
                onBackButtonPress={() => Navigation.navigate(ROUTES.SETTINGS_CONTACT_METHODS)}
                onCloseButtonPress={() => Navigation.dismissModal()}
            />
            {/* We use keyboardShouldPersistTaps="handled" to prevent the keyboard from being hidden when switching focus on input fields  */}
            <ScrollView style={styles.flex1} contentContainerStyle={styles.p5} keyboardShouldPersistTaps="handled">
                <Text style={[styles.mb6]}>
                    {`${props.translate('validateSecondaryLoginPage.enterMagicCodeToValidate', {login: props.route.params.login})}`}
                </Text>
                <View style={styles.mb6}>
                    <TextInput
                        label={props.translate('common.magicCode')}
                        value={validateCode}
                        onChangeText={code => setValidateCode(code)}
                        textContentType="oneTimeCode"
                    />
                </View>
                {props.account && !_.isEmpty(props.account.errors) && (
                    <Text style={styles.formError}>
                        {ErrorUtils.getLatestErrorMessage(props.account)}
                    </Text>
                )}
            </ScrollView>
            <FixedFooter style={[styles.flexGrow0]}>
                <Button
                    success
                    isDisabled={!validateCode}
                    text={props.translate('validateSecondaryLoginPage.submit')}
                    onPress={() => submitForm()}
                    pressOnEnter
                />
            </FixedFooter>
        </ScreenWrapper>
    );
};

ValidateSecondaryLoginPage.displayName = 'ValidateSecondaryLoginPage';
ValidateSecondaryLoginPage.propTypes = propTypes;
ValidateSecondaryLoginPage.defaultProps = defaultProps;

export default compose(
    withLocalize,
    withOnyx({
        session: {
            key: ONYXKEYS.SESSION,
        },
        account: {
            key: ONYXKEYS.ACCOUNT,
        },
    }),
)(ValidateSecondaryLoginPage);
