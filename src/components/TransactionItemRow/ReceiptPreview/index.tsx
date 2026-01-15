import React, {useCallback, useEffect, useRef, useState} from 'react';
import ReactDOM from 'react-dom';
import type {LayoutChangeEvent} from 'react-native';
import {StyleSheet, View} from 'react-native';
import Animated, {FadeIn, FadeOut} from 'react-native-reanimated';
import ActivityIndicator from '@components/ActivityIndicator';
import DistanceEReceipt from '@components/DistanceEReceipt';
import EReceiptWithSizeCalculation from '@components/EReceiptWithSizeCalculation';
import type {ImageOnLoadEvent} from '@components/Image/types';
import useDebouncedState from '@hooks/useDebouncedState';
import useResponsiveLayoutOnWideRHP from '@hooks/useResponsiveLayoutOnWideRHP';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import {hasReceiptSource, isDistanceRequest, isManualDistanceRequest, isPerDiemRequest} from '@libs/TransactionUtils';
import variables from '@styles/variables';
import Image from '@src/components/Image';
import CONST from '@src/CONST';
import type {Transaction} from '@src/types/onyx';
import type {ReceiptSource} from '@src/types/onyx/Transaction';

type ReceiptPreviewProps = {
    /** Path to the image to be opened in the preview */
    source: ReceiptSource;

    /** Whether the preview should be shown (e.g. if we are hovered over certain ReceiptCell) */
    hovered: boolean;

    /** Is preview for an e-receipt */
    isEReceipt: boolean;

    /** Transaction object related to the preview */
    transactionItem: Transaction;
};

function ReceiptPreview({source, hovered, isEReceipt = false, transactionItem}: ReceiptPreviewProps) {
    const isDistanceEReceipt = isDistanceRequest(transactionItem) && !isManualDistanceRequest(transactionItem);
    const isPerDiemEReceipt = isPerDiemRequest(transactionItem) && !hasReceiptSource(transactionItem) && !!transactionItem.transactionID;
    const styles = useThemeStyles();
    const [eReceiptScaleFactor, setEReceiptScaleFactor] = useState(0);
    const [imageAspectRatio, setImageAspectRatio] = useState<string | number | undefined>(undefined);
    const [distanceEReceiptAspectRatio, setDistanceEReceiptAspectRatio] = useState<string | number | undefined>(undefined);
    const [shouldShow, debounceShouldShow, setShouldShow] = useDebouncedState(false, CONST.TIMING.SHOW_HOVER_PREVIEW_DELAY);
    const {shouldUseNarrowLayout} = useResponsiveLayoutOnWideRHP();
    const hasMeasured = useRef(false);
    const {windowHeight} = useWindowDimensions();
    const [isLoading, setIsLoading] = useState(true);

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
        (e: ImageOnLoadEvent) => {
            const {width, height} = e.nativeEvent;
            updateImageAspectRatio(width, height);
            setIsLoading(false);
        },
        [updateImageAspectRatio],
    );

    const handleError = () => {
        setIsLoading(false);
    };

    useEffect(() => {
        setShouldShow(hovered);
    }, [hovered, setShouldShow]);

    if (shouldUseNarrowLayout || !debounceShouldShow || !shouldShow || (!source && !isEReceipt && !isDistanceEReceipt && !isPerDiemEReceipt)) {
        return null;
    }

    const shouldShowImage = source && !(isEReceipt || isDistanceEReceipt || isPerDiemEReceipt);
    const shouldShowDistanceEReceipt = isDistanceEReceipt && !isEReceipt && !isPerDiemEReceipt;

    return ReactDOM.createPortal(
        <Animated.View
            entering={FadeIn.duration(CONST.TIMING.SHOW_HOVER_PREVIEW_ANIMATION_DURATION)}
            exiting={FadeOut.duration(CONST.TIMING.SHOW_HOVER_PREVIEW_ANIMATION_DURATION)}
            style={[styles.receiptPreview, styles.flexColumn, styles.alignItemsCenter, styles.justifyContentStart]}
        >
            {shouldShowImage ? (
                <View style={[styles.w100]}>
                    {isLoading && (
                        <View style={[StyleSheet.absoluteFillObject, styles.justifyContentCenter, styles.alignItemsCenter]}>
                            <ActivityIndicator size={CONST.ACTIVITY_INDICATOR_SIZE.LARGE} />
                        </View>
                    )}

                    <Image
                        source={typeof source === 'string' ? {uri: source} : source}
                        style={[
                            styles.w100,
                            {aspectRatio: imageAspectRatio ?? 1},
                            isLoading && {opacity: 0}, // hide until loaded
                        ]}
                        onLoadStart={() => {
                            if (isLoading) {
                                return;
                            }
                            setIsLoading(true);
                        }}
                        onError={handleError}
                        onLoad={handleLoad}
                        isAuthTokenRequired
                    />
                </View>
            ) : (
                <View style={styles.receiptPreviewEReceiptsContainer}>
                    {shouldShowDistanceEReceipt && (
                        <View
                            onLayout={handleDistanceEReceiptLayout}
                            style={[
                                {
                                    transformOrigin: 'center',
                                    scale: eReceiptScaleFactor,
                                    aspectRatio: distanceEReceiptAspectRatio,
                                },
                            ]}
                        >
                            <DistanceEReceipt
                                transaction={transactionItem}
                                hoverPreview
                            />
                        </View>
                    )}
                    {!shouldShowDistanceEReceipt && isPerDiemEReceipt && (
                        <EReceiptWithSizeCalculation
                            transactionID={transactionItem.transactionID}
                            shouldUseAspectRatio
                            receiptType="perDiem"
                        />
                    )}
                    {!shouldShowDistanceEReceipt && !isPerDiemEReceipt && (
                        <EReceiptWithSizeCalculation
                            transactionID={transactionItem.transactionID}
                            transactionItem={transactionItem}
                            shouldUseAspectRatio
                        />
                    )}
                </View>
            )}
        </Animated.View>,
        document.body,
    );
}

export default ReceiptPreview;
