import React, { useState } from 'react';
import _ from 'underscore';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import PropTypes from 'prop-types';
import styles from '../../styles/styles';
import ONYXKEYS from '../../ONYXKEYS';
import compose from '../../libs/compose';
import Text from '../../components/Text';
import Button from '../../components/Button';
import {withNetwork} from '../../components/OnyxProvider';
import networkPropTypes from '../../components/networkPropTypes';
import withLocalize, {withLocalizePropTypes} from '../../components/withLocalize';
import withWindowDimensions, {windowDimensionsPropTypes} from '../../components/withWindowDimensions';
import SAMLSignInPage from './SAMLSignInPage';
import * as Session from '../../libs/actions/Session';
import ChangeExpensifyLoginLink from './ChangeExpensifyLoginLink';
import Terms from './Terms';
import CONST from '../../CONST';
import ValidateCodeForm from './ValidateCodeForm';
import ROUTES from '../../ROUTES';
import Navigation from '../../libs/Navigation/Navigation';

const propTypes = {
    /* Onyx Props */

    /** The credentials of the logged in person */
    credentials: PropTypes.shape({
        /** The email/phone the user logged in with */
        login: PropTypes.string,
    }),

    /** The details about the account that the user is signing in with */
    account: PropTypes.shape({
        /** Whether or not a sign on form is loading (being submitted) */
        loading: PropTypes.bool,
    }),

    /** Information about the network */
    network: networkPropTypes.isRequired,

    ...withLocalizePropTypes,

    ...windowDimensionsPropTypes,

};

const defaultProps = {
    credentials: {},
    account: {},
};

function SAMLEnabledForm (props) {

    const [showSAMLSignInPage, setShowSAMLSignInPage] = useState(false);
    const [showValidateCodeForm, setShowValidateCodeForm] = useState(false);

    return (
        <>
            {!showSAMLSignInPage && !showValidateCodeForm && (
            <>
                <View>
                    <Text style={[styles.loginHeroBody, styles.mb5, styles.textNormal, !props.isSmallScreenWidth ? styles.textAlignLeft : {}]}>
                        {props.translate('samlSignIn.welcomeSAMLEnabled')}
                    </Text>
                    <Button
                        isDisabled={props.network.isOffline}
                        success
                        style={[styles.mv3]}
                        text={props.translate('samlSignIn.useSingleSignOn')}
                        isLoading={props.account.isLoading}
                        onPress={() => {
                            Navigation.navigate(ROUTES.SAML_SIGN_IN);
                            //setShowSAMLSignInPage(true)
                        }}
                    />

                    <View style={[styles.mt5]}>
                        <Text style={[styles.loginHeroBody, styles.mb5, styles.textNormal, !props.isSmallScreenWidth ? styles.textAlignLeft : {}]}>
                            {props.translate('samlSignIn.orContinueWithMagicCode')}
                        </Text>
                    </View>

                    <Button
                        isDisabled={props.network.isOffline}
                        style={[styles.mv3]}
                        text={props.translate('samlSignIn.useMagicCode')}
                        isLoading={
                            props.account.isLoading && props.account.loadingForm === (props.account.requiresTwoFactorAuth ? CONST.FORMS.VALIDATE_TFA_CODE_FORM : CONST.FORMS.VALIDATE_CODE_FORM)
                        }
                        onPress={() => {
                            setShowValidateCodeForm(true)
                            Session.resendValidateCode(props.credentials.login);
                        }}
                    />
                    <ChangeExpensifyLoginLink onPress={() => Session.clearSignInData()} />
                </View>
                <View style={[styles.mt5, styles.signInPageWelcomeTextContainer]}>
                    <Terms />
                </View>
            </>
            )}
            {showSAMLSignInPage &&  <SAMLSignInPage /> }
            {showValidateCodeForm && (
                <>
                    <Text style={[styles.loginHeroBody, styles.mb5, styles.textNormal, !props.isSmallScreenWidth ? styles.textAlignLeft : {}]}>
                        {props.translate('welcomeText.welcomeEnterMagicCode', {login: props.credentials.login})}
                    </Text>
                    <ValidateCodeForm />
                </>
            )}
        </>
    );
}

SAMLEnabledForm.propTypes = propTypes;
SAMLEnabledForm.defaultProps = defaultProps;
SAMLEnabledForm.displayName = 'SAMLEnabledForm';

export default compose(
    withLocalize,
    withWindowDimensions,
    withNetwork(),
    withOnyx({
        credentials: {key: ONYXKEYS.CREDENTIALS},
        account: {key: ONYXKEYS.ACCOUNT},
    }),
)(SAMLEnabledForm);
