import React, {useEffect, useRef, useState} from 'react';
import ReactDOM from 'react-dom';
import Animated, {FadeIn, FadeOut} from 'react-native-reanimated';
import Image from '@components/Image';
import useThemeStyles from '@hooks/useThemeStyles';

function ReceiptPreview({source, hovered}: {source: string; hovered: boolean}) {
    const [shouldShow, setShouldShow] = useState(false);
    const debounceTimeout = useRef<NodeJS.Timeout | null>(null);
    const body = document.querySelector('body');
    const styles = useThemeStyles();

    useEffect(() => {
        if (hovered) {
            debounceTimeout.current = setTimeout(() => {
                setShouldShow(true);
            }, 333);
        } else {
            if (debounceTimeout.current) {
                clearTimeout(debounceTimeout.current);
                debounceTimeout.current = null;
            }
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

    if (!body || !shouldShow || !source) {
        return null;
    }

    return ReactDOM.createPortal(
        <Animated.View
            entering={FadeIn.duration(200)}
            exiting={FadeOut.duration(200)}
            style={styles.receiptPreview}
        >
            <Animated.View style={styles.receiptPreviewImageWrapper}>
                <Image
                    source={{uri: source}}
                    style={styles.receiptPreviewImage}
                />
            </Animated.View>
        </Animated.View>,
        body,
    );
}

export default ReceiptPreview;
