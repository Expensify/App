import React from 'react';
import {View} from 'react-native';
import expensifyLogo from '@assets/images/expensify-logo-round-transparent.png';
import * as Expensicons from '@components/Icon/Expensicons';
import PressableWithDelayToggle from '@components/Pressable/PressableWithDelayToggle';
import QRCode from '@components/QRCode';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Clipboard from '@libs/Clipboard';
import {buildAuthenticatorUrl, splitSecretInChunks} from '@libs/TwoFactorAuthUtils';
import CONST from '@src/CONST';

type TwoFactorAuthSecretDisplayProps = {
    /** The contact method (email) for the authenticator URL */
    contactMethod: string;

    /** The two-factor auth secret key */
    secretKey: string;

    /** Optional description text to show above the QR code */
    description?: React.ReactNode;
};

function TwoFactorAuthSecretDisplay({contactMethod, secretKey, description}: TwoFactorAuthSecretDisplayProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    return (
        <>
            {description}
            <View
                style={[styles.alignItemsCenter, styles.mt5]}
                fsClass={CONST.FULLSTORY.CLASS.EXCLUDE}
            >
                <QRCode
                    url={buildAuthenticatorUrl(contactMethod, secretKey)}
                    logo={expensifyLogo}
                    logoRatio={CONST.QR.EXPENSIFY_LOGO_SIZE_RATIO}
                    logoMarginRatio={CONST.QR.EXPENSIFY_LOGO_MARGIN_RATIO}
                />
            </View>
            <Text style={styles.mt5}>{translate('twoFactorAuth.addKey')}</Text>
            <View style={[styles.twoFactorAuthSecretBox, styles.mt6, styles.p4, styles.flexRow, styles.alignItemsCenter, styles.justifyContentBetween]}>
                {!!secretKey && (
                    <Text
                        style={[styles.textMono]}
                        fsClass={CONST.FULLSTORY.CLASS.MASK}
                    >
                        {splitSecretInChunks(secretKey)}
                    </Text>
                )}
                <PressableWithDelayToggle
                    text={translate('twoFactorAuth.copy')}
                    textChecked={translate('common.copied')}
                    tooltipText=""
                    tooltipTextChecked=""
                    icon={Expensicons.Copy}
                    inline={false}
                    onPress={() => Clipboard.setString(secretKey)}
                    styles={[styles.button, styles.buttonMedium, styles.twoFactorAuthCopyCodeButton]}
                    textStyles={[styles.buttonMediumText]}
                    accessible={false}
                />
            </View>
        </>
    );
}

export default TwoFactorAuthSecretDisplay;
