import React, {useEffect, useRef} from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import expensifyLogo from '@assets/images/expensify-logo-round-transparent.png';
import Button from '@components/Button';
import FixedFooter from '@components/FixedFooter';
import * as Expensicons from '@components/Icon/Expensicons';
import PressableWithDelayToggle from '@components/Pressable/PressableWithDelayToggle';
import QRCode from '@components/QRCode';
import ScrollView from '@components/ScrollView';
import Text from '@components/Text';
import TextLink from '@components/TextLink';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Clipboard from '@libs/Clipboard';
import * as UserUtils from '@libs/UserUtils';
import StepWrapper from '@pages/settings/Security/TwoFactorAuth/StepWrapper/StepWrapper';
import useTwoFactorAuthContext from '@pages/settings/Security/TwoFactorAuth/TwoFactorAuthContext/useTwoFactorAuth';
import TwoFactorAuthForm from '@pages/settings/Security/TwoFactorAuth/TwoFactorAuthForm';
import type {BaseTwoFactorAuthFormRef} from '@pages/settings/Security/TwoFactorAuth/TwoFactorAuthForm/types';
import * as Session from '@userActions/Session';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

const TROUBLESHOOTING_LINK = 'https://community.expensify.com/discussion/7736/faq-troubleshooting-two-factor-authentication-issues/p1?new=1';

function VerifyStep() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const contactMethod = UserUtils.getContactMethod();
    const [account] = useOnyx(ONYXKEYS.ACCOUNT);
    const formRef = useRef<BaseTwoFactorAuthFormRef>(null);

    const {setStep} = useTwoFactorAuthContext();

    useEffect(() => {
        Session.clearAccountMessages();
        return () => {
            Session.clearAccountMessages();
        };
    }, []);

    useEffect(() => {
        if (!account?.requiresTwoFactorAuth) {
            return;
        }
        setStep(CONST.TWO_FACTOR_AUTH_STEPS.SUCCESS);
    }, [account?.requiresTwoFactorAuth, setStep]);

    /**
     * Splits the two-factor auth secret key in 4 chunks
     */
    function splitSecretInChunks(secret: string) {
        if (secret.length !== 16) {
            return secret;
        }

        return `${secret.slice(0, 4)} ${secret.slice(4, 8)} ${secret.slice(8, 12)} ${secret.slice(12, secret.length)}`;
    }

    /**
     * Builds the URL string to generate the QRCode, using the otpauth:// protocol,
     * so it can be detected by authenticator apps
     */
    function buildAuthenticatorUrl() {
        return `otpauth://totp/Expensify:${contactMethod}?secret=${account?.twoFactorAuthSecretKey}&issuer=Expensify`;
    }

    return (
        <StepWrapper
            title={translate('twoFactorAuth.headerTitle')}
            stepCounter={{
                step: 2,
                text: translate('twoFactorAuth.stepVerify'),
                total: 3,
            }}
            onBackButtonPress={() => setStep(CONST.TWO_FACTOR_AUTH_STEPS.CODES, CONST.ANIMATION_DIRECTION.OUT)}
            onEntryTransitionEnd={() => formRef.current && formRef.current.focus()}
        >
            <ScrollView
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={styles.flexGrow1}
            >
                <View style={[styles.ph5, styles.mt3]}>
                    <Text>
                        {translate('twoFactorAuth.scanCode')}
                        <TextLink href={TROUBLESHOOTING_LINK}> {translate('twoFactorAuth.authenticatorApp')}</TextLink>.
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
                    <View style={[styles.mt11, styles.flexRow, styles.alignItemsCenter, styles.justifyContentBetween]}>
                        {!!account?.twoFactorAuthSecretKey && <Text>{splitSecretInChunks(account?.twoFactorAuthSecretKey ?? '')}</Text>}
                        <PressableWithDelayToggle
                            text={translate('twoFactorAuth.copy')}
                            textChecked={translate('common.copied')}
                            tooltipText=""
                            tooltipTextChecked=""
                            icon={Expensicons.Copy}
                            inline={false}
                            onPress={() => Clipboard.setString(account?.twoFactorAuthSecretKey ?? '')}
                            styles={[styles.button, styles.buttonMedium, styles.twoFactorAuthCopyCodeButton]}
                            textStyles={[styles.buttonMediumText]}
                            accessible={false}
                        />
                    </View>
                    <Text style={styles.mt11}>{translate('twoFactorAuth.enterCode')}</Text>
                </View>
            </ScrollView>
            <FixedFooter style={[styles.mt2, styles.pt2]}>
                <View style={[styles.mh5, styles.mb4]}>
                    <TwoFactorAuthForm innerRef={formRef} />
                </View>
                <Button
                    success
                    large
                    text={translate('common.next')}
                    isLoading={account?.isLoading}
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

VerifyStep.displayName = 'VerifyStep';

export default VerifyStep;
