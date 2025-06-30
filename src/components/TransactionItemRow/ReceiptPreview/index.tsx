import React, {useEffect, useRef, useState} from 'react';
import ReactDOM from 'react-dom';
import Animated, {FadeIn, FadeOut, useAnimatedStyle, useSharedValue, withSequence, withTiming} from 'react-native-reanimated';
import Image from '@components/Image';

function ReceiptPreview({source, hovered}: {source: string; hovered: boolean}) {
    const [shouldShow, setShouldShow] = useState(false);
    const debounceTimeout = useRef<NodeJS.Timeout | null>(null);
    const body = document.querySelector('body');

    const translateX = useSharedValue(0);

    useEffect(() => {
        if (!shouldShow) {
            return;
        }
        translateX.set(withSequence(withTiming(-20, {duration: 100}), withTiming(20, {duration: 100}), withTiming(0, {duration: 100})));
    }, [shouldShow, translateX]);

    const animatedStyles = useAnimatedStyle(() => ({
        transform: [{translateX: translateX.get()}],
    }));

    useEffect(() => {
        if (hovered) {
            debounceTimeout.current = setTimeout(() => {
                setShouldShow(true);
            }, 150);
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
            style={{
                position: 'absolute',
                left: 60,
                top: 100,
                width: 400,
                height: 600,
                borderRadius: 24,
                overflow: 'hidden',
            }}
        >
            <Animated.View style={[animatedStyles, {width: '100%', height: '100%'}]}>
                <Image
                    source={{uri: source}}
                    style={{width: '100%', height: '100%'}}
                />
            </Animated.View>
        </Animated.View>,
        body,
    );
}

export default ReceiptPreview;
