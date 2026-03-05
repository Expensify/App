/**
 * Extends useReceiptScan with mobile-specific features
 */
import {useAnimatedStyle, useSharedValue, withTiming} from 'react-native-reanimated';
import HapticFeedback from '@libs/HapticFeedback';
import type {UseReceiptScanParams} from '@pages/iou/request/step/IOURequestStepScan/types';
import useReceiptScan from './useReceiptScan';

function useMobileReceiptScan(params: UseReceiptScanParams) {
    const receiptScan = useReceiptScan(params);

    const blinkOpacity = useSharedValue(0);
    const blinkStyle = useAnimatedStyle(() => ({
        opacity: blinkOpacity.get(),
    }));

    function showBlink() {
        blinkOpacity.set(
            withTiming(1, {duration: 50}, () => {
                blinkOpacity.set(withTiming(0, {duration: 150}));
            }),
        );
        HapticFeedback.press();
    }

    return {
        ...receiptScan,
        blinkStyle,
        showBlink,
    };
}

export default useMobileReceiptScan;
