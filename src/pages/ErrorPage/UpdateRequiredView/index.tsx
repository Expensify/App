import Button from '@components/ButtonComposed';
import Header from '@components/Header';
import ImageSVG from '@components/ImageSVG';
import Lottie from '@components/Lottie';
import LottieAnimations from '@components/LottieAnimations';
import Text from '@components/Text';

import useEnvironment from '@hooks/useEnvironment';
import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useSafeAreaInsets from '@hooks/useSafeAreaInsets';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';

import Accessibility from '@libs/Accessibility';

import variables from '@styles/variables';

import {updateApp} from '@userActions/AppUpdate';

import CONST from '@src/CONST';

import React from 'react';
import {View} from 'react-native';

function UpdateRequiredView() {
    const insets = useSafeAreaInsets();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {translate} = useLocalize();
    const {shouldUseNarrowLayout} = useResponsiveLayout();

    const isReduceMotionEnabled = Accessibility.useReducedMotion();
    const illustrations = useMemoizedLazyIllustrations(['UpgradeRocket']);
    const {isProduction} = useEnvironment();

    return (
        <View style={[styles.appBG, styles.h100, StyleUtils.getPlatformSafeAreaPadding(insets)]}>
            <View style={[styles.pt5, styles.ph5, styles.updateRequiredViewHeader]}>
                <Header title={translate('updateRequiredView.updateAvailable')} />
            </View>
            <View style={[styles.flex1, StyleUtils.getUpdateRequiredViewStyles(shouldUseNarrowLayout)]}>
                {isReduceMotionEnabled ? (
                    <ImageSVG
                        src={illustrations.UpgradeRocket}
                        width={variables.updateRocketW}
                        height={variables.updateRocketH}
                    />
                ) : (
                    <Lottie
                        source={LottieAnimations.Update}
                        // For small screens it looks better to have the arms from the animation come in from the edges of the screen.
                        style={shouldUseNarrowLayout ? styles.w100 : styles.updateAnimation}
                        webStyle={shouldUseNarrowLayout ? styles.updateAnimationNarrowWeb : styles.updateAnimation}
                        autoPlay
                        loop
                    />
                )}
                <View style={[styles.ph5, styles.alignItemsCenter, styles.mt5]}>
                    <View style={styles.updateRequiredViewTextContainer}>
                        <View style={styles.mb5}>
                            <Text style={[styles.newKansasLarge, styles.textAlignCenter]}>{translate('updateRequiredView.pleaseRefresh')}</Text>
                        </View>
                    </View>
                </View>
                <Button
                    variant={CONST.BUTTON_VARIANT.SUCCESS}
                    size={CONST.BUTTON_SIZE.LARGE}
                    onPress={() => updateApp(isProduction)}
                    style={styles.updateRequiredViewTextContainer}
                >
                    <Button.Text>{translate('updateRequiredView.refreshPage')}</Button.Text>
                </Button>
            </View>
        </View>
    );
}

export default UpdateRequiredView;
