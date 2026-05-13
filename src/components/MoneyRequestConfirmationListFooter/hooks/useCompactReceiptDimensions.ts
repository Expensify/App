import {useRef, useState} from 'react';
import type {LayoutChangeEvent} from 'react-native';
import getCompactReceiptDimensions from '@components/MoneyRequestConfirmationListFooter/getCompactReceiptDimensions';
import getImageCompactModeStyle from '@components/MoneyRequestConfirmationListFooter/getImageCompactModeStyle';
import getReceiptContainerCompactModeStyle from '@components/MoneyRequestConfirmationListFooter/getReceiptContainerCompactModeStyle';
import {endSpan} from '@libs/telemetry/activeSpans';
import CONST from '@src/CONST';

type UseCompactReceiptDimensionsParams = {
    /** Whether the user has expanded the optional fields (disables compact mode) */
    showMoreFields: boolean;

    /** Whether the active transaction is a scan (compact mode is scan-only) */
    isScan: boolean;

    /** Whether the device is currently in landscape orientation (disables compact mode) */
    isInLandscapeMode: boolean;

    /** Width of the application window, in pixels */
    windowWidth: number;

    /** Horizontal margin applied around the receipt image, in pixels */
    horizontalMargin: number;
};

function useCompactReceiptDimensions({showMoreFields, isScan, isInLandscapeMode, windowWidth, horizontalMargin}: UseCompactReceiptDimensionsParams) {
    const isCompactMode = !showMoreFields && isScan && !isInLandscapeMode;

    const [receiptAspectRatio, setReceiptAspectRatio] = useState<number | null>(null);
    const [compactReceiptContainerWidth, setCompactReceiptContainerWidth] = useState(0);
    const hasEndedReceiptLoadSpan = useRef(false);

    const handleReceiptLoad = (event?: {nativeEvent: {width: number; height: number}}) => {
        if (!hasEndedReceiptLoadSpan.current) {
            hasEndedReceiptLoadSpan.current = true;
            endSpan(CONST.TELEMETRY.SPAN_CONFIRMATION_RECEIPT_LOAD);
        }
        const width = event?.nativeEvent.width ?? 0;
        const height = event?.nativeEvent.height ?? 0;
        if (!width || !height) {
            return;
        }
        const ratio = width / height;
        setReceiptAspectRatio((previousRatio) => (previousRatio === ratio ? previousRatio : ratio));
    };

    const handleCompactReceiptContainerLayout = (event: LayoutChangeEvent) => {
        const width = event.nativeEvent.layout.width;
        if (!width) {
            return;
        }
        setCompactReceiptContainerWidth((previousWidth) => (previousWidth === width ? previousWidth : width));
    };

    const {compactReceiptMaxWidth, compactReceiptMaxHeight} = getCompactReceiptDimensions({
        windowWidth,
        horizontalMargin,
        containerWidth: compactReceiptContainerWidth,
        aspectRatio: receiptAspectRatio,
    });

    const compactReceiptStyle = (() => {
        if (!isCompactMode) {
            return undefined;
        }
        const baseStyle = getImageCompactModeStyle(compactReceiptMaxWidth);
        return {...baseStyle, maxHeight: compactReceiptMaxHeight};
    })();

    const compactReceiptContainerStyle = (() => {
        if (!isCompactMode) {
            return undefined;
        }
        return getReceiptContainerCompactModeStyle(compactReceiptMaxWidth, compactReceiptMaxHeight);
    })();

    return {
        isCompactMode,
        handleReceiptLoad,
        handleCompactReceiptContainerLayout,
        compactReceiptStyle,
        compactReceiptContainerStyle,
        compactReceiptMaxWidth,
        compactReceiptMaxHeight,
    };
}

export default useCompactReceiptDimensions;
