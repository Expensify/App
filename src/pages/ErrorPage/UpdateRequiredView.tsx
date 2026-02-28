import React from 'react';
import {View} from 'react-native';
import Button from '@components/Button';
import Header from '@components/Header';
import Lottie from '@components/Lottie';
import LottieAnimations from '@components/LottieAnimations';
import Text from '@components/Text';
import useEnvironment from '@hooks/useEnvironment';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useSafeAreaInsets from '@hooks/useSafeAreaInsets';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import {updateApp} from '@userActions/AppUpdate';
import CONFIG from '@src/CONFIG';

function UpdateRequiredView() {
    const insets = useSafeAreaInsets();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {translate} = useLocalize();
    const {shouldUseNarrowLayout} = useResponsiveLayout();

    const {isProduction} = useEnvironment();
    const isStandaloneNewAppProduction = isProduction && !CONFIG.IS_HYBRID_APP;

    return (
        <View style={[styles.appBG, styles.h100, StyleUtils.getPlatformSafeAreaPadding(insets)]}>
            <View style={[styles.pt5, styles.ph5, styles.updateRequiredViewHeader]}>
                <Header title={translate('updateRequiredView.updateRequired')} />
            </View>
            <View style={[styles.flex1, StyleUtils.getUpdateRequiredViewStyles(shouldUseNarrowLayout)]}>
                <Lottie
                    source={LottieAnimations.Update}
                    // For small screens it looks better to have the arms from the animation come in from the edges of the screen.
                    style={shouldUseNarrowLayout ? styles.w100 : styles.updateAnimation}
                    webStyle={shouldUseNarrowLayout ? styles.w100 : styles.updateAnimation}
                    autoPlay
                    loop
                />
                <View style={[styles.ph5, styles.alignItemsCenter, styles.mt5]}>
                    <View style={styles.updateRequiredViewTextContainer}>
                        <View style={[styles.mb3]}>
                            <Text style={[styles.newKansasLarge, styles.textAlignCenter]}>
                                {isStandaloneNewAppProduction ? translate('updateRequiredView.pleaseInstallExpensifyClassic') : translate('updateRequiredView.pleaseInstall')}
                            </Text>
                        </View>
                        <View style={styles.mb5}>
                            <Text style={[styles.textAlignCenter, styles.textSupporting]}>
                                {isStandaloneNewAppProduction ? translate('updateRequiredView.newAppNotAvailable') : translate('updateRequiredView.toGetLatestChanges')}
                            </Text>
                        </View>
                    </View>
                </View>
                <Button
                    success
                    large
                    onPress={() => updateApp(isProduction)}
                    text={translate('common.update')}
                    style={styles.updateRequiredViewTextContainer}
                />
            </View>
        </View>
    );
}

export default UpdateRequiredView;
