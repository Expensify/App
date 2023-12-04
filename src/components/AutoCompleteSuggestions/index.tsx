import React from 'react';
import ReactDOM from 'react-dom';
import {View} from 'react-native';
import useWindowDimensions from '@hooks/useWindowDimensions';
import * as DeviceCapabilities from '@libs/DeviceCapabilities';
import * as StyleUtils from '@styles/StyleUtils';
import BaseAutoCompleteSuggestions from './BaseAutoCompleteSuggestions';
import type {AutoCompleteSuggestionsProps} from './types';

/**
 * On the mobile-web platform, when long-pressing on auto-complete suggestions,
 * we need to prevent focus shifting to avoid blurring the main input (which makes the suggestions picker close and fires the onSelect callback).
 * The desired pattern for all platforms is to do nothing on long-press.
 * On the native platform, tapping on auto-complete suggestions will not blur the main input.
 */

function AutoCompleteSuggestions<TSuggestion>({measureParentContainer = () => {}, ...props}: AutoCompleteSuggestionsProps<TSuggestion>) {
    const containerRef = React.useRef<HTMLDivElement>(null);
    const {windowHeight, windowWidth} = useWindowDimensions();
    const [{width, left, bottom}, setContainerState] = React.useState({
        width: 0,
        left: 0,
        bottom: 0,
    });
    React.useEffect(() => {
        const container = containerRef.current;
        if (!container) {
            return () => {};
        }
        container.onpointerdown = (e) => {
            if (DeviceCapabilities.hasHoverSupport()) {
                return;
            }
            e.preventDefault();
        };
        return () => (container.onpointerdown = null);
    }, []);

    React.useEffect(() => {
        if (!measureParentContainer) {
            return;
        }
        measureParentContainer((x, y, w) => setContainerState({left: x, bottom: windowHeight - y, width: w}));
    }, [measureParentContainer, windowHeight, windowWidth]);

    const componentToRender = (
        <BaseAutoCompleteSuggestions<TSuggestion>
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            ref={containerRef}
        />
    );

    const bodyElement = document.querySelector('body');

    return (
        !!width && bodyElement && ReactDOM.createPortal(<View style={StyleUtils.getBaseAutoCompleteSuggestionContainerStyle({left, width, bottom})}>{componentToRender}</View>, bodyElement)
    );
}

AutoCompleteSuggestions.displayName = 'AutoCompleteSuggestions';

export default AutoCompleteSuggestions;
