import React, {useEffect} from 'react';
import {withOnyx} from 'react-native-onyx';
import {ScrollView, View} from 'react-native';
import PropTypes from 'prop-types';
import withLocalize, {withLocalizePropTypes} from '../../../../../components/withLocalize';
import compose from '../../../../../libs/compose';
import * as Session from '../../../../../libs/actions/Session';
import styles from '../../../../../styles/styles';
import Button from '../../../../../components/Button';
import Text from '../../../../../components/Text';
import ONYXKEYS from '../../../../../ONYXKEYS';
import TextLink from '../../../../../components/TextLink';
import Clipboard from '../../../../../libs/Clipboard';
import FixedFooter from '../../../../../components/FixedFooter';
import * as Expensicons from '../../../../../components/Icon/Expensicons';
import PressableWithDelayToggle from '../../../../../components/Pressable/PressableWithDelayToggle';
import TwoFactorAuthForm from '../TwoFactorAuthForm';
import QRCode from '../../../../../components/QRCode';
import expensifyLogo from '../../../../../../assets/images/expensify-logo-round-transparent.png';
import CONST from '../../../../../CONST';
import * as TwoFactorAuthActions from '../../../../../libs/actions/TwoFactorAuthActions';
import StepWrapper from "../StepWrapper/StepWrapper";

const propTypes = {
    ...withLocalizePropTypes,
    account: PropTypes.shape({
        /** Whether this account has 2FA enabled or not */
        requiresTwoFactorAuth: PropTypes.bool,

        /** Secret key to enable 2FA within the authenticator app */
        twoFactorAuthSecretKey: PropTypes.string,

        /** User primary login to attach to the authenticator QRCode */
        primaryLogin: PropTypes.string,

        /** User is submitting the authentication code */
        isLoading: PropTypes.bool,

        /** Server-side errors in the submitted authentication code */
        errors: PropTypes.objectOf(PropTypes.string),
    }),

    /** Method to set the next step */
    setStep: PropTypes.func.isRequired,
};

const defaultProps = {
    account: {
        requiresTwoFactorAuth: false,
        twoFactorAuthSecretKey: '',
        primaryLogin: '',
        isLoading: false,
        errors: {},
    },
};


const TROUBLESHOOTING_LINK = "https://community.expensify.com/discussion/7736/faq-troubleshooting-two-factor-authentication-issues/p1?new=1"

function VerifyStep({translate, setStep, account}) {
    const formRef = React.useRef(null);

    useEffect(() => {
        Session.clearAccountMessages();
    }, []);

    useEffect(() => {
        if (!account.requiresTwoFactorAuth) {
            return;
        }
        setStep(CONST.TWO_FACTOR_AUTH_STEPS.SUCCESS);
    }, [account.requiresTwoFactorAuth]);

    /**
     * Splits the two-factor auth secret key in 4 chunks
     *
     * @param {String} secret
     * @returns {string}
     */
    function splitSecretInChunks(secret) {
        if (secret.length !== 16) {
            return secret;
        }

        return `${secret.slice(0, 4)} ${secret.slice(4, 8)} ${secret.slice(8, 12)} ${secret.slice(12, secret.length)}`;
    }

    /**
     * Builds the URL string to generate the QRCode, using the otpauth:// protocol,
     * so it can be detected by authenticator apps
     *
     * @returns {string}
     */
    function buildAuthenticatorUrl() {
        return `otpauth://totp/Expensify:${account.primaryLogin}?secret=${account.twoFactorAuthSecretKey}&issuer=Expensify`;
    }


    return (
        <StepWrapper
            title={translate('twoFactorAuth.headerTitle')}
            stepCounter={{
                step: 2,
                text: translate('twoFactorAuth.stepVerify'),
                total: 3,
            }}
            onBackButtonPress={() => setStep(CONST.TWO_FACTOR_AUTH_STEPS.CODES)}
        >
            <ScrollView
                style={styles.mb5}
                keyboardShouldPersistTaps="handled"
            >
                <View style={[styles.ph5, styles.mt3]}>
                    <Text>
                        {translate('twoFactorAuth.scanCode')}
                        <TextLink href={TROUBLESHOOTING_LINK}>
                            {' '}
                            {translate('twoFactorAuth.authenticatorApp')}
                        </TextLink>
                        .
                    </Text>
                    <View style={[styles.alignItemsCenter, styles.mt5]}>
                        <QRCode
                            url={buildAuthenticatorUrl()}
                            logo={expensifyLogo}
                            logoRatio={CONST.QR.EXPENSIFY_LOGO_SIZE_RATIO}
                            logoMarginRatio={CONST.QR.EXPENSIFY_LOGO_MARGIN_RATIO}
                        />
                    </View>
                    <Text style={styles.mt5}>{translate('twoFactorAuth.addKey')}</Text>
                    <View
                        style={[styles.mt11, styles.flexRow, styles.alignItemsCenter, styles.justifyContentBetween]}>
                        {Boolean(account.twoFactorAuthSecretKey) &&
                            <Text>{splitSecretInChunks(account.twoFactorAuthSecretKey)}</Text>}
                        <PressableWithDelayToggle
                            text={translate('twoFactorAuth.copy')}
                            textChecked={translate('common.copied')}
                            icon={Expensicons.Copy}
                            inline={false}
                            onPress={() => Clipboard.setString(account.twoFactorAuthSecretKey)}
                            styles={[styles.button, styles.buttonMedium, styles.twoFactorAuthCopyCodeButton]}
                            textStyles={[styles.buttonMediumText]}
                        />
                    </View>
                    <Text style={styles.mt11}>{translate('twoFactorAuth.enterCode')}</Text>
                </View>
                <View style={[styles.mt3, styles.mh5]}>
                    <TwoFactorAuthForm innerRef={formRef}/>
                </View>
            </ScrollView>
            <FixedFooter style={[styles.mtAuto, styles.pt2]}>
                <Button
                    success
                    text={translate('common.next')}
                    isLoading={account.isLoading}
                    onPress={() => {
                        if (!formRef.current) {
                            return;
                        }
                        formRef.current.validateAndSubmitForm();
                    }}
                />
            </FixedFooter>
        </StepWrapper>
    );
}

VerifyStep.propTypes = propTypes;
VerifyStep.defaultProps = defaultProps;

export default compose(
    withLocalize,
    withOnyx({
        account: {key: ONYXKEYS.ACCOUNT},
    }),
)(VerifyStep);
