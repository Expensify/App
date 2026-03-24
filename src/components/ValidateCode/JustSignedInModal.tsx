import React from 'react';
import {View} from 'react-native';
import Icon from '@components/Icon';
import ImageSVG from '@components/ImageSVG';
import Lottie from '@components/Lottie';
import LottieAnimations from '@components/LottieAnimations';
import Text from '@components/Text';
import {useMemoizedLazyExpensifyIcons, useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import Accessibility from '@libs/Accessibility';
import variables from '@styles/variables';

type JustSignedInModalProps = {
    /** Whether the 2FA is needed to get fully authenticated. */
    is2FARequired: boolean;
};

function JustSignedInModal({is2FARequired}: JustSignedInModalProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['ExpensifyWordmark']);
    const isReduceMotionEnabled = Accessibility.useReducedMotion();
    const illustrations = useMemoizedLazyIllustrations(['Safe', 'Abracadabra']);
    return (
        <View style={styles.deeplinkWrapperContainer}>
            <View style={styles.deeplinkWrapperMessage}>
                <View style={styles.mb2}>
                    {isReduceMotionEnabled ? (
                        <ImageSVG
                            src={is2FARequired ? illustrations.Safe : illustrations.Abracadabra}
                            style={styles.justSignedInModalAnimation(is2FARequired)}
                        />
                    ) : (
                        <Lottie
                            source={is2FARequired ? LottieAnimations.Safe : LottieAnimations.Abracadabra}
                            style={styles.justSignedInModalAnimation(is2FARequired)}
                            webStyle={styles.justSignedInModalAnimation(is2FARequired)}
                            autoPlay
                            loop
                        />
                    )}
                </View>
                <Text style={[styles.textHeadline, styles.textXXLarge, styles.textAlignCenter]}>
                    {translate(is2FARequired ? 'validateCodeModal.tfaRequiredTitle' : 'validateCodeModal.successfulSignInTitle')}
                </Text>
                <View style={[styles.mt2, styles.mb2]}>
                    <Text style={styles.textAlignCenter}>{translate(is2FARequired ? 'validateCodeModal.tfaRequiredDescription' : 'validateCodeModal.successfulSignInDescription')}</Text>
                </View>
            </View>
            <View style={styles.deeplinkWrapperFooter}>
                <Icon
                    width={variables.modalWordmarkWidth}
                    height={variables.modalWordmarkHeight}
                    fill={theme.success}
                    src={icons.ExpensifyWordmark}
                />
            </View>
        </View>
    );
}

export default JustSignedInModal;
