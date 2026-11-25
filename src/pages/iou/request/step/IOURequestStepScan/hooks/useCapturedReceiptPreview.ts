/**
 * Owns the captured-receipt card shown after a cropped capture: holds the receipt back while the card is on screen, hands it
 * on when the card ends, deletes it when the user leaves first, and takes the card down when the hand-off stays on the screen.
 */
import {getSpan} from '@libs/telemetry/activeSpans';

import {useReceiptCaptureActions} from '@pages/iou/request/step/IOURequestStepScan/components/ReceiptCaptureContext';

import CONST from '@src/CONST';

import {useNavigation} from '@react-navigation/native';
import {useEffect, useRef, useState} from 'react';

// Longer than a screen transition takes to start, so a hand-off that navigates always blurs the screen first.
const STAYED_ON_SCREEN_RESET_MS = 1500;

type CapturedReceipt = {
    /** Local URI of the cropped receipt */
    source: string;

    /** Width divided by height of the cropped receipt, so the card takes its shape before the image loads */
    aspectRatio: number;
};

type PendingCapture = {
    /** Hands the receipt on to the next page, once the card has been seen */
    finish: () => void;

    /** Deletes the receipt and anything still being prepared for it, when the user leaves before it is handed on */
    abandon: () => void;
};

function useCapturedReceiptPreview() {
    const navigation = useNavigation();
    const {setIsReceiptCaptureShown} = useReceiptCaptureActions();
    const [capturedReceipt, setCapturedReceipt] = useState<CapturedReceipt | undefined>(undefined);
    const pendingCaptureRef = useRef<(PendingCapture & {shownAt: number}) | undefined>(undefined);

    // Set after the receipt is handed on, and cleared when the screen blurs. If it fires, the hand-off stayed on this screen,
    // as when no receipt file could be built, and the card would otherwise cover the camera with its controls disabled.
    const stayedOnScreenTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

    const showCapturedReceipt = (receipt: CapturedReceipt, pendingCapture: PendingCapture) => {
        pendingCaptureRef.current = {...pendingCapture, shownAt: performance.now()};
        setCapturedReceipt(receipt);
    };

    const finishCapturedReceiptPreview = () => {
        const pendingCapture = pendingCaptureRef.current;
        pendingCaptureRef.current = undefined;
        if (!pendingCapture) {
            return;
        }
        getSpan(CONST.TELEMETRY.SPAN_SHUTTER_TO_CONFIRMATION)?.setAttribute(CONST.TELEMETRY.ATTRIBUTE_CAPTURED_RECEIPT_PREVIEW_MS, Math.round(performance.now() - pendingCapture.shownAt));
        pendingCapture.finish();
        clearTimeout(stayedOnScreenTimerRef.current);
        stayedOnScreenTimerRef.current = setTimeout(() => {
            stayedOnScreenTimerRef.current = undefined;
            setCapturedReceipt(undefined);
            setIsReceiptCaptureShown(false);
        }, STAYED_ON_SCREEN_RESET_MS);
    };

    // Focus and blur listeners in an effect that depends only on the navigation object, which stays the same for the screen's
    // life. A focus effect or an effect cleanup would also run on a re-render, clearing the card or deleting a receipt the
    // user is about to submit.
    useEffect(() => {
        const resetCapturedReceipt = () => {
            pendingCaptureRef.current = undefined;
            setCapturedReceipt(undefined);
            setIsReceiptCaptureShown(false);
        };
        const abandonPendingCapture = () => {
            clearTimeout(stayedOnScreenTimerRef.current);
            stayedOnScreenTimerRef.current = undefined;
            pendingCaptureRef.current?.abandon();
            pendingCaptureRef.current = undefined;
        };
        const unsubscribeFocus = navigation.addListener('focus', resetCapturedReceipt);
        const unsubscribeBlur = navigation.addListener('blur', abandonPendingCapture);
        return () => {
            unsubscribeFocus();
            unsubscribeBlur();
            abandonPendingCapture();
        };
    }, [navigation, setIsReceiptCaptureShown]);

    return {capturedReceipt, showCapturedReceipt, finishCapturedReceiptPreview};
}

export default useCapturedReceiptPreview;
