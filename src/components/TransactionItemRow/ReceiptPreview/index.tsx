import React, {useCallback, useEffect, useRef, useState} from 'react';
import ReactDOM from 'react-dom';
import type {LayoutChangeEvent} from 'react-native';
import {View} from 'react-native';
import Animated, {FadeIn, FadeOut} from 'react-native-reanimated';
import DistanceEReceipt from '@components/DistanceEReceipt';
import EReceipt from '@components/EReceipt';
import BaseImage from '@components/Image/BaseImage';
import type {ImageOnLoadEvent} from '@components/Image/types';
import useDebouncedState from '@hooks/useDebouncedState';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import {isDistanceRequest} from '@libs/TransactionUtils';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import type {Transaction} from '@src/types/onyx';

const eReceiptAspectRatio = variables.eReceiptBGHWidth / variables.eReceiptBGHeight;

type ReceiptPreviewProps = {
    /** Path to the image to be opened in the preview */
    source: string;

    /** Whether the preview should be shown (e.g. if we are hovered over certain ReceiptCell) */
    hovered: boolean;

    /** Is preview for an e-receipt */
    isEReceipt: boolean;

    /** Transaction object related to the preview */
    transactionItem: Transaction;
};

function ReceiptPreview({source, hovered, isEReceipt = false, transactionItem}: ReceiptPreviewProps) {
    const isDistanceEReceipt = isDistanceRequest(transactionItem);
    const styles = useThemeStyles();
    const [eReceiptScaleFactor, setEReceiptScaleFactor] = useState(0);
    const [imageAspectRatio, setImageAspectRatio] = useState<string | number | undefined>(undefined);
    const [distanceEReceiptAspectRatio, setDistanceEReceiptAspectRatio] = useState<string | number | undefined>(undefined);
    const [shouldShow, debounceShouldShow, setShouldShow] = useDebouncedState(false, CONST.TIMING.SHOW_HOVER_PREVIEW_DELAY);
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const hasMeasured = useRef(false);
    const {windowHeight} = useWindowDimensions();

    const handleDistanceEReceiptLayout = (e: LayoutChangeEvent) => {
        if (hasMeasured.current) {
            return;
        }
        hasMeasured.current = true;

        const {height, width} = e.nativeEvent.layout;
        if (height === 0) {
            // on the initial layout, measured height is 0, so we want to set everything on the second one
            hasMeasured.current = false;
            return;
        }
        if (height * eReceiptScaleFactor > windowHeight - CONST.RECEIPT_PREVIEW_TOP_BOTTOM_MARGIN) {
            setDistanceEReceiptAspectRatio(variables.eReceiptBGHWidth / (windowHeight - CONST.RECEIPT_PREVIEW_TOP_BOTTOM_MARGIN));
            return;
        }
        setDistanceEReceiptAspectRatio(variables.eReceiptBGHWidth / height);
        setEReceiptScaleFactor(width / variables.eReceiptBGHWidth);
    };

    const updateImageAspectRatio = useCallback(
        (width: number, height: number) => {
            if (!source) {
                return;
            }

            setImageAspectRatio(height ? width / height : 'auto');
        },
        [source],
    );

    const handleLoad = useCallback(
        (event: ImageOnLoadEvent) => {
            const {width, height} = event.nativeEvent;

            updateImageAspectRatio(width, height);
        },
        [updateImageAspectRatio],
    );

    const handleEReceiptLayout = (e: LayoutChangeEvent) => {
        const {width} = e.nativeEvent.layout;
        setEReceiptScaleFactor(width / variables.eReceiptBGHWidth);
    };

    useEffect(() => {
        setShouldShow(hovered);
    }, [hovered, setShouldShow]);

    if (shouldUseNarrowLayout || !debounceShouldShow || !shouldShow || (!source && !isEReceipt && !isDistanceEReceipt)) {
        return null;
    }

    const shouldShowImage = source && !(isEReceipt || isDistanceEReceipt);
    const shouldShowDistanceEReceipt = isDistanceEReceipt && !isEReceipt;

    return ReactDOM.createPortal(
        <Animated.View
            entering={FadeIn.duration(CONST.TIMING.SHOW_HOVER_PREVIEW_ANIMATION_DURATION)}
            exiting={FadeOut.duration(CONST.TIMING.SHOW_HOVER_PREVIEW_ANIMATION_DURATION)}
            style={[styles.receiptPreview, styles.flexColumn, styles.alignItemsCenter, styles.justifyContentStart]}
        >
            {shouldShowImage ? (
                <View style={[styles.w100]}>
                    <BaseImage
                        source={{uri: source}}
                        style={[styles.w100, {aspectRatio: imageAspectRatio}]}
                        onLoad={handleLoad}
                    />
                </View>
            ) : (
                <View style={styles.receiptPreviewEReceiptsContainer}>
                    {shouldShowDistanceEReceipt ? (
                        <View
                            onLayout={handleDistanceEReceiptLayout}
                            style={[{transformOrigin: 'center', scale: eReceiptScaleFactor, aspectRatio: distanceEReceiptAspectRatio}]}
                        >
                            <DistanceEReceipt
                                transaction={transactionItem}
                                hoverPreview
                            />
                        </View>
                    ) : (
                        <View
                            onLayout={handleEReceiptLayout}
                            style={[styles.receiptPreviewEReceipt, {aspectRatio: eReceiptAspectRatio, scale: eReceiptScaleFactor}]}
                        >
                            <EReceipt
                                transactionID={transactionItem.transactionID}
                                transactionItem={transactionItem}
                            />
                        </View>
                    )}
                </View>
            )}
        </Animated.View>,
        document.body,
    );
}

export default ReceiptPreview;
