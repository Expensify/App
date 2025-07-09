import React, {useCallback, useEffect, useRef, useState} from 'react';
import ReactDOM from 'react-dom';
import type {LayoutChangeEvent} from 'react-native';
import {View} from 'react-native';
import Animated, {FadeIn, FadeOut} from 'react-native-reanimated';
import EReceipt from '@components/EReceipt';
import BaseImage from '@components/Image/BaseImage';
import type {ImageOnLoadEvent} from '@components/Image/types';
import useThemeStyles from '@hooks/useThemeStyles';
import variables from '@styles/variables';

const showPreviewDelay = 270;
const animationDuration = 200;

function ReceiptPreview({source, hovered, isEReceipt = false, transactionID = ''}: {source: string; hovered: boolean; isEReceipt?: boolean; transactionID?: string}) {
    const [shouldShow, setShouldShow] = useState(false);
    const debounceTimeout = useRef<NodeJS.Timeout | null>(null);
    const styles = useThemeStyles();
    const [scaleFactor, setScaleFactor] = useState(0);
    const [aspectRatio, setAspectRatio] = useState<string | number | undefined>(undefined);

    const updateAspectRatio = useCallback(
        (width: number, height: number) => {
            if (!source) {
                return;
            }

            setAspectRatio(height ? width / height : 'auto');
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
        setScaleFactor(width / variables.eReceiptBGHWidth);
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

    if (!shouldShow || (!source && !isEReceipt)) {
        return null;
    }

    return ReactDOM.createPortal(
        <Animated.View
            entering={FadeIn.duration(animationDuration)}
            exiting={FadeOut.duration(animationDuration)}
            style={[styles.receiptPreview, styles.dFlex, styles.flexColumn, styles.alignItemsCenter, styles.justifyContentCenter]}
        >
            {!!source && (
                <View style={[styles.w100]}>
                    <BaseImage
                        source={{uri: source}}
                        style={[styles.w100, {aspectRatio}]}
                        onLoad={handleLoad}
                    />
                </View>
            )}
            {!!isEReceipt && (
                <View
                    onLayout={onLayout}
                    style={[
                        styles.w100,
                        styles.dFlex,
                        styles.flexColumn,
                        styles.alignItemsCenter,
                        styles.justifyContentCenter,
                        {aspectRatio: variables.eReceiptBGHWidth / variables.eReceiptBGHeight, scale: scaleFactor},
                    ]}
                >
                    <EReceipt transactionID={transactionID} />
                </View>
            )}
        </Animated.View>,
        document.body,
    );
}

export default ReceiptPreview;
