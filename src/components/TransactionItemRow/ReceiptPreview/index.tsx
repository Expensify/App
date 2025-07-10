import React, {useCallback, useEffect, useRef, useState} from 'react';
import ReactDOM from 'react-dom';
import type {LayoutChangeEvent} from 'react-native';
import {View} from 'react-native';
import Animated, {FadeIn, FadeOut} from 'react-native-reanimated';
import EReceipt from '@components/EReceipt';
import BaseImage from '@components/Image/BaseImage';
import type {ImageOnLoadEvent} from '@components/Image/types';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import variables from '@styles/variables';

const showPreviewDelay = 270;
const animationDuration = 200;
const eReceiptAspectRatio = variables.eReceiptBGHWidth / variables.eReceiptBGHeight;

type ReceiptPreviewProps = {source: string; hovered: boolean; isEReceipt: boolean; transactionID: string};

function ReceiptPreview({source, hovered, isEReceipt = false, transactionID = ''}: ReceiptPreviewProps) {
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

    if (shouldUseNarrowLayout || !shouldShow || (!source && !isEReceipt)) {
        return null;
    }

    const shouldShowEReceipt = !source && isEReceipt;

    return ReactDOM.createPortal(
        <Animated.View
            entering={FadeIn.duration(animationDuration)}
            exiting={FadeOut.duration(animationDuration)}
            style={[styles.receiptPreview, styles.dFlex, styles.flexColumn, styles.alignItemsCenter, styles.justifyContentCenter]}
        >
            {shouldShowEReceipt ? (
                <View
                    onLayout={onLayout}
                    style={[styles.w100, styles.flexColumn, styles.alignItemsCenter, styles.justifyContentCenter, {aspectRatio: eReceiptAspectRatio, scale: eReceiptScaleFactor}]}
                >
                    <EReceipt transactionID={transactionID} />
                </View>
            ) : (
                <View style={[styles.w100]}>
                    <BaseImage
                        source={{uri: source}}
                        style={[styles.w100, {aspectRatio: imageAspectRatio}]}
                        onLoad={handleLoad}
                    />
                </View>
            )}
        </Animated.View>,
        document.body,
    );
}

export default ReceiptPreview;
