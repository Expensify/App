import React, {useCallback, useEffect, useRef, useState} from 'react';
import ReactDOM from 'react-dom';
import type {LayoutChangeEvent} from 'react-native';
import {View} from 'react-native';
import Animated, {FadeIn, FadeOut} from 'react-native-reanimated';
import DistanceEReceipt from '@components/DistanceEReceipt';
import EReceipt from '@components/EReceipt';
import BaseImage from '@components/Image/BaseImage';
import type {ImageOnLoadEvent} from '@components/Image/types';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import {isDistanceRequest} from '@libs/TransactionUtils';
import colors from '@styles/theme/colors';
import variables from '@styles/variables';
import type {Transaction} from '@src/types/onyx';

const showPreviewDelay = 270;
const animationDuration = 200;
const eReceiptAspectRatio = variables.eReceiptBGHWidth / variables.eReceiptBGHeight;

type ReceiptPreviewProps = {source: string; hovered: boolean; isEReceipt: boolean; transactionItem: Transaction};

function ReceiptPreview({source, hovered, isEReceipt = false, transactionItem}: ReceiptPreviewProps) {
    const isDistanceEReceipt = isDistanceRequest(transactionItem);
    const [shouldShow, setShouldShow] = useState(false);
    const debounceTimeout = useRef<NodeJS.Timeout | null>(null);
    const styles = useThemeStyles();
    const [eReceiptScaleFactor, setEReceiptScaleFactor] = useState(0);
    const [imageAspectRatio, setImageAspectRatio] = useState<string | number | undefined>(undefined);
    const {shouldUseNarrowLayout} = useResponsiveLayout();

    const updateAspectRatio = useCallback(
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

            updateAspectRatio(width, height);
        },
        [updateAspectRatio],
    );

    const onLayout = (e: LayoutChangeEvent) => {
        const {width} = e.nativeEvent.layout;
        setEReceiptScaleFactor(width / variables.eReceiptBGHWidth);
    };

    useEffect(() => {
        if (hovered) {
            debounceTimeout.current = setTimeout(() => {
                setShouldShow(true);
            }, showPreviewDelay);
        } else {
            setShouldShow(false);
        }

        return () => {
            if (!debounceTimeout.current) {
                return;
            }
            clearTimeout(debounceTimeout.current);
            debounceTimeout.current = null;
        };
    }, [hovered]);

    if (shouldUseNarrowLayout || !shouldShow || (!source && !isEReceipt && !isDistanceEReceipt)) {
        return null;
    }

    const shouldShowImage = source && !(isEReceipt || isDistanceEReceipt);
    const shouldShowDistanceEReceipt = isDistanceEReceipt && !isEReceipt;

    return ReactDOM.createPortal(
        <Animated.View
            entering={FadeIn.duration(animationDuration)}
            exiting={FadeOut.duration(animationDuration)}
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
                <View style={[styles.w100, styles.h100]}>
                    {shouldShowDistanceEReceipt ? (
                        <View style={[styles.mhv5, styles.w100, styles.justifyContentCenter, styles.alignItemsCenter, {backgroundColor: colors.green800}]}>
                            <DistanceEReceipt transaction={transactionItem} />
                        </View>
                    ) : (
                        <View
                            onLayout={onLayout}
                            style={[styles.w100, styles.flexColumn, styles.alignItemsCenter, styles.justifyContentCenter, {aspectRatio: eReceiptAspectRatio, scale: eReceiptScaleFactor}]}
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
