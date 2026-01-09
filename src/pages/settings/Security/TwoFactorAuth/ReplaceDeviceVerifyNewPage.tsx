import React, {useRef} from 'react';
import {InteractionManager, View} from 'react-native';
// eslint-disable-next-line no-restricted-imports
import type {ScrollView as RNScrollView} from 'react-native';
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
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import Clipboard from '@libs/Clipboard';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Session} from '@src/types/onyx';
import {getContactMethod} from '@libs/UserUtils';
import TwoFactorAuthForm from './TwoFactorAuthForm';
import type {BaseTwoFactorAuthFormRef} from './TwoFactorAuthForm/types';
import TwoFactorAuthWrapper from './TwoFactorAuthWrapper';

function ReplaceDeviceVerifyNewPage() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [session] = useOnyx<Session>(ONYXKEYS.SESSION, {canBeMissing: false});
    const [account] = useOnyx(ONYXKEYS.ACCOUNT, {canBeMissing: true});
    const contactMethod = getContactMethod(account?.primaryLogin, session?.email);
    const formRef = useRef<BaseTwoFactorAuthFormRef>(null);

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

    const scrollViewRef = useRef<RNScrollView>(null);
    const handleInputFocus = () => {
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        InteractionManager.runAfterInteractions(() => {
            requestAnimationFrame(() => {
                scrollViewRef.current?.scrollToEnd({animated: true});
            });
        });
    };

    return (
        <TwoFactorAuthWrapper
            stepName={CONST.TWO_FACTOR_AUTH_STEPS.REPLACE_VERIFY_NEW}
            title={translate('twoFactorAuth.replaceDeviceTitle')}
        >
            <ScrollView
                ref={scrollViewRef}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={styles.flexGrow1}
            >
                <View style={[styles.ph5, styles.mt3]}>
                    <Text style={[styles.textLabel, styles.mb4]}>{translate('twoFactorAuth.verifyNewDeviceDescription')}</Text>
                    <View style={[styles.alignItemsCenter, styles.justifyContentCenter]}>
                        <View
                            style={[styles.mt5, styles.border, 
                                // styles.borderColorCardBorder, 
                                styles.p2, styles.br4]}
                            testID="qrCodeContainer"
                        >
                            <QRCode
                                url={buildAuthenticatorUrl()}
                                logo={expensifyLogo}
                                logoRatio={CONST.QR.EXPENSIFY_LOGO_SIZE_RATIO}
                                logoMarginRatio={CONST.QR.EXPENSIFY_LOGO_MARGIN_RATIO}
                            />
                        </View>
                    </View>
                    <Text style={[styles.mt5, styles.mb3, styles.textLabel]}>{translate('twoFactorAuth.addKey')}</Text>
                    <View style={[styles.flexRow, styles.alignItemsCenter]}>
                        <Text style={[styles.flex1]}>{splitSecretInChunks(account?.twoFactorAuthSecretKey ?? '')}</Text>
                        <PressableWithDelayToggle
                            text={translate('twoFactorAuth.copy')}
                            textChecked={translate('common.copied')}
                            icon={Expensicons.Copy}
                            inline
                            onPress={() => {
                                Clipboard.setString(account?.twoFactorAuthSecretKey ?? '');
                            }}
                            styles={[styles.button, styles.buttonMedium, styles.twoFactorAuthCodesButton]}
                            textStyles={[styles.buttonMediumText]}
                            accessible={false}
                            tooltipText=""
                            tooltipTextChecked=""
                        />
                    </View>

                    <Text style={[styles.mt5, styles.mb3, styles.textLabel]}>{translate('twoFactorAuth.enterCode')}</Text>
                    <TwoFactorAuthForm
                        innerRef={formRef}
                        onFocus={handleInputFocus}
                        validateInsteadOfDisable
                        step={CONST.TWO_FACTOR_AUTH_STEPS.REPLACE_VERIFY_NEW}
                    />
                    <TextLink
                        style={[styles.mt2, styles.mb5]}
                        href='https://help.expensify.com/articles/new-expensify/settings/Enable-Two-Factor-Authentication'
                    >
                        {/* {`${translate('common.needHelp')}?`} */}
                        Help! Translate me!
                    </TextLink>
                </View>
            </ScrollView>
            <FixedFooter style={[styles.mt2, styles.pt2]}>
                <Button
                    success
                    large
                    text={translate('common.continue')}
                    isLoading={account?.isLoading}
                    onPress={() => {
                        if (!formRef.current) {
                            return;
                        }
                        formRef.current.validateAndSubmitForm();
                    }}
                />
            </FixedFooter>
        </TwoFactorAuthWrapper>
    );
}

export default ReplaceDeviceVerifyNewPage;

