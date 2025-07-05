import React, {useEffect, useRef, useState} from 'react';
import ReactDOM from 'react-dom';
import Animated, {FadeIn, FadeOut} from 'react-native-reanimated';
import Image from '@components/Image';
import useThemeStyles from '@hooks/useThemeStyles';

const showPreviewDelay = 333;
const animationDuration = 200;

function ReceiptPreview({source, hovered}: {source: string; hovered: boolean}) {
    const [shouldShow, setShouldShow] = useState(false);
    const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

    const styles = useThemeStyles();

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
            style={styles.receiptPreview}
        >
            <Animated.View style={[styles.h100, styles.w100]}>
                <Image
                    source={{uri: source}}
                    style={[styles.h100, styles.w100]}
                />
            </Animated.View>
        </Animated.View>,
        document.body,
    );
}

export default ReceiptPreview;
