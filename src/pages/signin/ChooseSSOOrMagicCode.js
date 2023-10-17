import React from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import PropTypes from 'prop-types';
import _ from 'underscore';
import styles from '../../styles/styles';
import ONYXKEYS from '../../ONYXKEYS';
import Text from '../../components/Text';
import Button from '../../components/Button';
import * as Session from '../../libs/actions/Session';
import ChangeExpensifyLoginLink from './ChangeExpensifyLoginLink';
import Terms from './Terms';
import CONST from '../../CONST';
import ROUTES from '../../ROUTES';
import Navigation from '../../libs/Navigation/Navigation';
import * as ErrorUtils from '../../libs/ErrorUtils';
import useLocalize from '../../hooks/useLocalize';
import useNetwork from '../../hooks/useNetwork';
import useWindowDimensions from '../../hooks/useWindowDimensions';
import FormHelpMessage from '../../components/FormHelpMessage';

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
        isLoading: PropTypes.bool,

        /** Form that is being loaded */
        loadingForm: PropTypes.oneOf(_.values(CONST.FORMS)),

        /** Whether this account has 2FA enabled or not */
        requiresTwoFactorAuth: PropTypes.bool,

        /** Server-side errors in the submitted authentication code */
        errors: PropTypes.objectOf(PropTypes.string),
    }),

    /** Function that returns whether the user is using SAML or magic codes to log in */
    setIsUsingMagicCode: PropTypes.func.isRequired,
};

const defaultProps = {
    credentials: {},
    account: {},
};

function ChooseSSOOrMagicCode({credentials, account, setIsUsingMagicCode}) {
    const {translate} = useLocalize();
    const {isOffline} = useNetwork();
    const {isSmallScreenWidth} = useWindowDimensions();

    return (
        <>
            <View>
                <Text style={[styles.loginHeroBody, styles.mb5, styles.textNormal, !isSmallScreenWidth ? styles.textAlignLeft : {}]}>{translate('samlSignIn.welcomeSAMLEnabled')}</Text>
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
                    isLoading={account.isLoading && account.loadingForm === (account.requiresTwoFactorAuth ? CONST.FORMS.VALIDATE_TFA_CODE_FORM : CONST.FORMS.VALIDATE_CODE_FORM)}
                    onPress={() => {
                        Session.resendValidateCode(credentials.login);
                        setIsUsingMagicCode(true);
                    }}
                />
                {Boolean(account) && !_.isEmpty(account.errors) && <FormHelpMessage message={ErrorUtils.getLatestErrorMessage(account)} />}
                <ChangeExpensifyLoginLink onPress={() => Session.clearSignInData()} />
            </View>
            <View style={[styles.mt5, styles.signInPageWelcomeTextContainer]}>
                <Terms />
            </View>
        </>
    );
}

ChooseSSOOrMagicCode.propTypes = propTypes;
ChooseSSOOrMagicCode.defaultProps = defaultProps;
ChooseSSOOrMagicCode.displayName = 'ChooseSSOOrMagicCode';

export default withOnyx({
    credentials: {key: ONYXKEYS.CREDENTIALS},
    account: {key: ONYXKEYS.ACCOUNT},
})(ChooseSSOOrMagicCode);
