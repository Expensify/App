/** Short dark pill at the bottom of the camera viewfinder confirming that receipt enhancements were turned on. */
import Icon from '@components/Icon';
import Text from '@components/Text';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import variables from '@styles/variables';

import CONST from '@src/CONST';

import React, {useEffect} from 'react';
import {View} from 'react-native';
import Animated, {FadeIn, FadeOut} from 'react-native-reanimated';

type ReceiptEnhancementToastProps = {
    onHide: () => void;
};

function ReceiptEnhancementToast({onHide}: ReceiptEnhancementToastProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['Sparkles']);

    useEffect(() => {
        const hideTimer = setTimeout(onHide, CONST.GROWL.DURATION);
        return () => clearTimeout(hideTimer);
    }, [onHide]);

    return (
        <View
            style={styles.receiptEnhancementToastContainer}
            pointerEvents="none"
        >
            <Animated.View
                entering={FadeIn}
                exiting={FadeOut}
                style={[styles.growlNotificationBox, styles.ph4, styles.pv3]}
                role={CONST.ROLE.STATUS}
                accessibilityLiveRegion="polite"
            >
                <Icon
                    src={icons.Sparkles}
                    width={variables.iconSizeSmall}
                    height={variables.iconSizeSmall}
                    fill={theme.iconSuccessFill}
                />
                <Text style={styles.productTrainingTooltipText}>{translate('receipt.receiptEnhancementsEnabled')}</Text>
            </Animated.View>
        </View>
    );
}

export default ReceiptEnhancementToast;
