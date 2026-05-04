import React, {useEffect, useState} from 'react';
import {Image, StyleSheet, TextInput} from 'react-native';
import Animated, {runOnJS, useAnimatedStyle, useSharedValue, withTiming} from 'react-native-reanimated';
import type {SharedValue} from 'react-native-reanimated';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import variables from '@styles/variables';
import CONST from '@src/CONST';

const PLACEHOLDER_CYCLE_MS = 3000;
const INPUT_WIDTH_DEFAULT = 200;
const INPUT_WIDTH_FOCUSED = 260;
const CONCIERGE_INPUT_ID = 'ask-concierge-input';

const STATIC_PLACEHOLDER = 'Ask anything';

// Edit these to change the cycling placeholder text
const PLACEHOLDERS = ["What's my average spend?", 'How much did I spend on food?', "Who's the biggest spender?"];

function fadeOut(opacity: SharedValue<number>, onFadedOut: () => void) {
    'worklet';

    opacity.set(
        withTiming(0, {duration: 300}, (finished) => {
            'worklet';

            if (!finished) {
                return;
            }
            runOnJS(onFadedOut)();
        }),
    );
}

function fadeIn(opacity: SharedValue<number>) {
    'worklet';

    opacity.set(withTiming(1, {duration: 300}));
}

function AskConciergeInput() {
    const theme = useTheme();
    const {translate} = useLocalize();

    const [isFocused, setIsFocused] = useState(false);
    const [placeholderIndex, setPlaceholderIndex] = useState(0);
    const opacity = useSharedValue(1);
    const isFocusedShared = useSharedValue(false);

    const animatedPlaceholderStyle = useAnimatedStyle(() => ({opacity: opacity.get()}));
    const animatedContainerStyle = useAnimatedStyle(() => ({
        width: withTiming(isFocusedShared.get() ? INPUT_WIDTH_FOCUSED : INPUT_WIDTH_DEFAULT, {duration: 200}),
    }));

    useEffect(() => {
        if (typeof document === 'undefined') {
            return;
        }
        const styleEl = document.createElement('style');
        // Target the inner <input> rendered by React Native Web's TextInput
        styleEl.textContent = `#${CONCIERGE_INPUT_ID} input:focus, #${CONCIERGE_INPUT_ID} textarea:focus, #${CONCIERGE_INPUT_ID}:focus { outline: none !important; box-shadow: none !important; }`;
        document.head.appendChild(styleEl);
        return () => styleEl.remove();
    }, []);

    useEffect(() => {
        if (!isFocused) {
            return;
        }

        const advance = () => {
            fadeOut(opacity, () => {
                setPlaceholderIndex((prev) => (prev + 1) % PLACEHOLDERS.length);
                fadeIn(opacity);
            });
        };

        const interval = setInterval(advance, PLACEHOLDER_CYCLE_MS);
        return () => clearInterval(interval);
    }, [isFocused, opacity]);

    return (
        <Animated.View
            style={[
                {
                    height: variables.componentSizeNormal,
                    borderRadius: variables.buttonBorderRadius,
                    backgroundColor: theme.appBG,
                    borderWidth: 1,
                    borderColor: isFocused ? theme.success : theme.border,
                    marginRight: 8,
                    overflow: 'hidden',
                },
                animatedContainerStyle,
            ]}
        >
            <Animated.View style={[StyleSheet.absoluteFill, animatedPlaceholderStyle]}>
                <TextInput
                    nativeID={CONCIERGE_INPUT_ID}
                    accessibilityLabel={translate('reportActionCompose.askConciergeForHelp')}
                    placeholder={isFocused ? PLACEHOLDERS.at(placeholderIndex) : STATIC_PLACEHOLDER}
                    placeholderTextColor={theme.textSupporting}
                    style={{
                        flex: 1,
                        color: theme.text,
                        fontSize: 14,
                        padding: 0,
                        paddingLeft: 40,
                        paddingRight: 8,
                        height: '100%',
                    }}
                    underlineColorAndroid="transparent"
                    onFocus={() => {
                        setIsFocused(true);
                        setPlaceholderIndex(0);
                        opacity.set(1);
                        isFocusedShared.set(true);
                    }}
                    onBlur={() => {
                        setIsFocused(false);
                        isFocusedShared.set(false);
                    }}
                />
            </Animated.View>
            <Image
                source={{uri: CONST.CONCIERGE_ICON_URL}}
                style={{
                    position: 'absolute',
                    left: 8,
                    top: 8,
                    width: 24,
                    height: 24,
                    borderRadius: 12,
                }}
            />
        </Animated.View>
    );
}

export default AskConciergeInput;
