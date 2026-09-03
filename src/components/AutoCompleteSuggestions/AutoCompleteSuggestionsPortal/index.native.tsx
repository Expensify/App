import BaseAutoCompleteSuggestions from '@components/AutoCompleteSuggestions/BaseAutoCompleteSuggestions';

import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensionsForAutoCompleteSuggestions from '@hooks/useWindowDimensionsForAutoCompleteSuggestions';

import variables from '@styles/variables';

import {Portal} from '@gorhom/portal';
import React, {useEffect, useRef, useState} from 'react';
import {View} from 'react-native';

import type {AutoCompleteSuggestionsPortalProps} from './types';

import getBottomSuggestionPadding from './getBottomSuggestionPadding';
import TransparentOverlay from './TransparentOverlay/TransparentOverlay';

const zIndexStyle = {zIndex: variables.autoCompleteSuggestionsZIndex};

function AutoCompleteSuggestionsPortal<TSuggestion>({
    left = 0,
    width = 0,
    bottom = 0,
    keyboardHeight = 0,
    resetSuggestions = () => {},
    isInLandscapeMode = false,
    ...props
}: AutoCompleteSuggestionsPortalProps<TSuggestion>) {
    const StyleUtils = useStyleUtils();
    const styles = useThemeStyles();
    const {height: windowHeight} = useWindowDimensionsForAutoCompleteSuggestions();
    const hostFrameRef = useRef<View>(null);
    const [hostFrameBottom, setHostFrameBottom] = useState<number | null>(null);

    // Re-base `bottom` (measured from the window bottom, offset by the keyboard) onto the portal host's own frame, which can sit higher on screens with bottom-docked content.
    const measureHostFrame = () => {
        hostFrameRef.current?.measureInWindow((x, y, frameWidth, height) => setHostFrameBottom(y + height));
    };
    useEffect(measureHostFrame, [windowHeight, keyboardHeight, bottom]);

    const hostRelativeBottom = hostFrameBottom === null ? 0 : bottom + keyboardHeight - (windowHeight - hostFrameBottom);
    const isHostFrameMeasured = hostFrameBottom !== null;
    const bottomPadding = getBottomSuggestionPadding(bottom, isInLandscapeMode);
    const containerStyle = StyleUtils.getBaseAutoCompleteSuggestionContainerStyle({left, width, bottom: hostRelativeBottom + bottomPadding});

    if (!width) {
        return null;
    }

    return (
        <Portal hostName="suggestions">
            {/* Zero-cost probe filling the portal host, so the host's position in the window is known before positioning the suggestions. */}
            <View
                ref={hostFrameRef}
                pointerEvents="none"
                style={styles.fullScreen}
                onLayout={measureHostFrame}
            />
            {isHostFrameMeasured && (
                <>
                    <TransparentOverlay
                        onPress={resetSuggestions}
                        style={zIndexStyle}
                    />
                    <View style={[containerStyle, zIndexStyle]}>
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
