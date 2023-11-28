import PropTypes from 'prop-types';
import React from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import _ from 'underscore';
import Button from '@components/Button';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import Navigation from '@libs/Navigation/Navigation';
import * as Session from '@userActions/Session';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import ValidateCodeForm from './ValidateCodeForm';

const propTypes = {
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
    /** Determines if user is switched to using recovery code instead of 2fa code */
    isUsingRecoveryCode: PropTypes.bool.isRequired,
    /** Function to change `isUsingRecoveryCode` state when user toggles between 2fa code and recovery code */
    setIsUsingRecoveryCode: PropTypes.func.isRequired,
};

const defaultProps = {
    account: {},
};

function ChooseSSOOrMagicCode({account, setIsUsingMagicCode, isUsingRecoveryCode, setIsUsingRecoveryCode}) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {isOffline} = useNetwork();
    const {isSmallScreenWidth} = useWindowDimensions();
    const loginTextAfterMagicCode = isUsingRecoveryCode ? translate('validateCodeForm.enterRecoveryCode') : translate('validateCodeForm.enterAuthenticatorCode');
    const loginText = account.requiresTwoFactorAuth ? loginTextAfterMagicCode : translate('samlSignIn.orContinueWithMagicCode');

    return (
        <>
            <View>
                <Text style={[styles.loginHeroBody, styles.mb5, styles.textNormal, !isSmallScreenWidth ? styles.textAlignLeft : {}]}>{translate('samlSignIn.welcomeSAMLEnabled')}</Text>
                <Button
                    isDisabled={isOffline}
                    success
                    style={[styles.mv3]}
                    text={translate('samlSignIn.useSingleSignOn')}
                    onPress={() => {
                        Navigation.navigate(ROUTES.SAML_SIGN_IN);
                    }}
                />

                <View style={[styles.mt5]}>
                    <Text style={[styles.loginHeroBody, styles.mb5, styles.textNormal, !isSmallScreenWidth ? styles.textAlignLeft : {}]}>{loginText}</Text>
                </View>

                <ValidateCodeForm
                    setIsUsingMagicCode={setIsUsingMagicCode}
                    isUsingRecoveryCode={isUsingRecoveryCode}
                    setIsUsingRecoveryCode={setIsUsingRecoveryCode}
                    account={account}
                />
            </View>
        </>
    );
}

ChooseSSOOrMagicCode.propTypes = propTypes;
ChooseSSOOrMagicCode.defaultProps = defaultProps;
ChooseSSOOrMagicCode.displayName = 'ChooseSSOOrMagicCode';

export default withOnyx({account: {key: ONYXKEYS.ACCOUNT}})(ChooseSSOOrMagicCode);
