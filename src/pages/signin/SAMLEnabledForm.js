import React from 'react';
import {View, useWindowDimensions} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import PropTypes from 'prop-types';
import styles from '../../styles/styles';
import ONYXKEYS from '../../ONYXKEYS';
import compose from '../../libs/compose';
import Text from '../../components/Text';
import Button from '../../components/Button';
import networkPropTypes from '../../components/networkPropTypes';
import * as Session from '../../libs/actions/Session';
import ChangeExpensifyLoginLink from './ChangeExpensifyLoginLink';
import Terms from './Terms';
import CONST from '../../CONST';
import ROUTES from '../../ROUTES';
import Navigation from '../../libs/Navigation/Navigation';
import useLocalize from '../../hooks/useLocalize';
import useNetwork from '../../hooks/useNetwork';

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

    /** Function to change whether the user is using SAML or magic codes to log in */
    setIsUsingSAMLLogin: PropTypes.func.isRequired,
};

const defaultProps = {
    credentials: {},
    account: {},
};

function SAMLEnabledForm({credentials, account, setIsUsingSAMLLogin}) {
    const {translate} = useLocalize();
    const {isOffline} = useNetwork();
    const {isSmallScreenWidth} = useWindowDimensions();

    return (
        <>
            <View>
                <Text style={[styles.loginHeroBody, styles.mb5, styles.textNormal, !isSmallScreenWidth ? styles.textAlignLeft : {}]}>
                    {translate('samlSignIn.welcomeSAMLEnabled')}
                </Text>
                <Button
                    isDisabled={isOffline}
                    success
                    style={[styles.mv3]}
                    text={translate('samlSignIn.useSingleSignOn')}
                    isLoading={account.isLoading}
                    onPress={() => {
                        Navigation.navigate(ROUTES.SAML_SIGN_IN);
                    }}
                />

                <View style={[styles.mt5]}>
                    <Text style={[styles.loginHeroBody, styles.mb5, styles.textNormal, !isSmallScreenWidth ? styles.textAlignLeft : {}]}>
                        {translate('samlSignIn.orContinueWithMagicCode')}
                    </Text>
                </View>

                <Button
                    isDisabled={isOffline}
                    style={[styles.mv3]}
                    text={translate('samlSignIn.useMagicCode')}
                    isLoading={
                        account.isLoading && account.loadingForm === (account.requiresTwoFactorAuth ? CONST.FORMS.VALIDATE_TFA_CODE_FORM : CONST.FORMS.VALIDATE_CODE_FORM)
                    }
                    onPress={() => {
                        Session.resendValidateCode(credentials.login);
                        setIsUsingSAMLLogin(false);
                    }}
                />
                <ChangeExpensifyLoginLink onPress={() => Session.clearSignInData()} />
            </View>
            <View style={[styles.mt5, styles.signInPageWelcomeTextContainer]}>
                <Terms />
            </View>
        </>
    );
}

SAMLEnabledForm.propTypes = propTypes;
SAMLEnabledForm.defaultProps = defaultProps;
SAMLEnabledForm.displayName = 'SAMLEnabledForm';

export default compose(
    withOnyx({
        credentials: {key: ONYXKEYS.CREDENTIALS},
        account: {key: ONYXKEYS.ACCOUNT},
    }),
)(SAMLEnabledForm);
