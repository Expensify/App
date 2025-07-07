import React, {useCallback, useEffect, useRef, useState} from 'react';
import ReactDOM from 'react-dom';
import {View} from 'react-native';
import Animated, {FadeIn, FadeOut} from 'react-native-reanimated';
import BaseImage from '@components/Image/BaseImage';
import type {ImageOnLoadEvent} from '@components/Image/types';
import ReceiptAudit from '@components/ReceiptAudit';
import useThemeStyles from '@hooks/useThemeStyles';

const showPreviewDelay = 270;
const animationDuration = 200;

function ReceiptPreview({source, hovered}: {source: string; hovered: boolean}) {
    const [shouldShow, setShouldShow] = useState(false);
    const debounceTimeout = useRef<NodeJS.Timeout | null>(null);
    const styles = useThemeStyles();

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

    if (!shouldShow || !source) {
        return null;
    }

    return ReactDOM.createPortal(
        <Animated.View
            entering={FadeIn.duration(animationDuration)}
            exiting={FadeOut.duration(animationDuration)}
            style={[styles.receiptPreview, styles.dFlex, styles.flexColumn, styles.alignItemsCenter, styles.justifyContentCenter]}
        >
            <View style={[styles.w100]}>
                <BaseImage
                    source={{uri: source}}
                    style={[styles.w100, {aspectRatio, height: 'auto'}]}
                    onLoad={handleLoad}
                />
            </View>
            <View style={[styles.pAbsolute, {left: 20, top: 12}]}>
                <ReceiptAudit
                    shouldShowAuditResult
                    notes={[]}
                />
            </View>
        </Animated.View>,
        document.body,
    );
}

export default ReceiptPreview;
