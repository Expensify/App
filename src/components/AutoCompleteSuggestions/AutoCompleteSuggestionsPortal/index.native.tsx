import BaseAutoCompleteSuggestions from '@components/AutoCompleteSuggestions/BaseAutoCompleteSuggestions';

import useKeyboardState from '@hooks/useKeyboardState';
import useStyleUtils from '@hooks/useStyleUtils';
import useWindowDimensionsForAutoCompleteSuggestions from '@hooks/useWindowDimensionsForAutoCompleteSuggestions';

import variables from '@styles/variables';

import {Portal} from '@gorhom/portal';
import React, {useEffect, useRef, useState} from 'react';
import {StyleSheet, View} from 'react-native';

import type {AutoCompleteSuggestionsPortalProps} from './types';

import getBottomSuggestionPadding from './getBottomSuggestionPadding';
import TransparentOverlay from './TransparentOverlay/TransparentOverlay';

const zIndexStyle = {zIndex: variables.autoCompleteSuggestionsZIndex};

function AutoCompleteSuggestionsPortal<TSuggestion>({
    left = 0,
    width = 0,
    bottom = 0,
    resetSuggestions = () => {},
    isMenuAbove = false,
    ...props
}: AutoCompleteSuggestionsPortalProps<TSuggestion>) {
    const StyleUtils = useStyleUtils();
    const {height: windowHeight} = useWindowDimensionsForAutoCompleteSuggestions();
    const {keyboardHeight} = useKeyboardState();
    const hostFrameRef = useRef<View>(null);

    const [hostBottomInset, setHostBottomInset] = useState<number | null>(null);

    const measureHostFrame = () => {
        hostFrameRef.current?.measureInWindow((x, y, frameWidth, height) => setHostBottomInset(windowHeight - y - height));
    };

    useEffect(measureHostFrame, [windowHeight, keyboardHeight]);

    if (!width) {
        return null;
    }

    return (
        <Portal hostName="suggestions">
            {/* Zero-cost probe filling the portal host, so the host's position in the window is known before positioning the suggestions. */}
            <View
                ref={hostFrameRef}
                pointerEvents="none"
                style={StyleSheet.absoluteFill}
                onLayout={measureHostFrame}
            />
            {hostBottomInset !== null && (
                <>
                    <TransparentOverlay
                        onPress={resetSuggestions}
                        style={zIndexStyle}
                    />
                    <View
                        style={[
                            StyleUtils.getBaseAutoCompleteSuggestionContainerStyle({left, width, bottom: bottom - hostBottomInset + getBottomSuggestionPadding(isMenuAbove)}),
                            zIndexStyle,
                        ]}
                    >
                        <BaseAutoCompleteSuggestions<TSuggestion>
                            width={width}
                            {...props}
                        />
                    </View>
                </>
            )}
        </Portal>
    );
}

export default AutoCompleteSuggestionsPortal;
