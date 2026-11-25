/** The card that shows the cropped receipt for a moment after the capture, before the receipt is handed on. */
import Icon from '@components/Icon';
import Image from '@components/Image';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import variables from '@styles/variables';

import React, {useEffect} from 'react';
import {StyleSheet, View} from 'react-native';
import Animated, {FadeIn, ZoomIn} from 'react-native-reanimated';

import ReceiptStatusPill from './ReceiptStatusPill';

const CAPTURED_RECEIPT_DISPLAY_MS = 600;

const APPEAR_DURATION_MS = 200;
const APPEAR_START_SCALE = 0.96;

type CapturedReceiptPreviewProps = {
    /** Local URI of the cropped receipt */
    source: string;

    /** Width divided by height of the cropped receipt, so the card takes its shape */
    aspectRatio: number;

    /** Called once the receipt has been on screen long enough */
    onFinish: () => void;
};

function CapturedReceiptPreview({source, aspectRatio, onFinish}: CapturedReceiptPreviewProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['Checkmark']);

    useEffect(() => {
        const finishTimer = setTimeout(onFinish, CAPTURED_RECEIPT_DISPLAY_MS);
        return () => clearTimeout(finishTimer);
    }, [onFinish]);

    return (
        <Animated.View
            entering={FadeIn.duration(APPEAR_DURATION_MS)}
            style={[StyleSheet.absoluteFill, styles.appBG]}
        >
            <View style={[styles.flex1, styles.alignItemsCenter, styles.justifyContentCenter, styles.ph10, styles.pt10, styles.pb20, styles.mb10]}>
                <Animated.View
                    entering={ZoomIn.duration(APPEAR_DURATION_MS).withInitialValues({scale: APPEAR_START_SCALE})}
                    style={[styles.capturedReceiptCard, StyleUtils.getCameraViewfinderStyle(aspectRatio, true)]}
                >
                    {/* eslint-disable-next-line react-native-a11y/has-valid-accessibility-ignores-invert-colors -- Custom Image wrapper does not support this prop. */}
                    <Image
                        source={{uri: source}}
                        style={styles.flex1}
                        resizeMode="contain"
                        loadingIconSize="small"
                        loadingIndicatorStyles={styles.bgTransparent}
                    />
                </Animated.View>
            </View>
            <ReceiptStatusPill message={translate('receipt.receiptCaptured')}>
                <Icon
                    src={icons.Checkmark}
                    width={variables.iconSizeSmall}
                    height={variables.iconSizeSmall}
                    fill={theme.iconSuccessFill}
                />
            </ReceiptStatusPill>
        </Animated.View>
    );
}

export default CapturedReceiptPreview;
export {CAPTURED_RECEIPT_DISPLAY_MS};
