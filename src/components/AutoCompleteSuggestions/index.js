import React from 'react';
import {View} from 'react-native';
import ReactDOM from 'react-dom';
import BaseAutoCompleteSuggestions from './BaseAutoCompleteSuggestions';
import * as DeviceCapabilities from '../../libs/DeviceCapabilities';
import {propTypes} from './autoCompleteSuggestionsPropTypes';
import * as StyleUtils from '../../styles/StyleUtils';
import useWindowDimensions from '../../hooks/useWindowDimensions';

/**
 * On the mobile-web platform, when long-pressing on auto-complete suggestions,
 * we need to prevent focus shifting to avoid blurring the main input (which makes the suggestions picker close and fires the onSelect callback).
 * The desired pattern for all platforms is to do nothing on long-press.
 * On the native platform, tapping on auto-complete suggestions will not blur the main input.
 */

function AutoCompleteSuggestions({parentContainerRef, ...props}) {
    const containerRef = React.useRef(null);
    const {windowHeight, windowWidth} = useWindowDimensions();
    const [{width, left, bottom}, setContainerState] = React.useState({
        width: 0,
        left: 0,
        bottom: 0,
    });
    React.useEffect(() => {
        const container = containerRef.current;
        if (!container) {
            return;
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
        if (!parentContainerRef || !parentContainerRef.current) {
            return;
        }
        parentContainerRef.current.measureInWindow((x, y, w) => setContainerState({left: x, bottom: windowHeight - y, width: w}));
    }, [parentContainerRef, windowHeight, windowWidth]);

    const componentToRender = (
        <BaseAutoCompleteSuggestions
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            ref={containerRef}
        />
    );

    if (!width) {
        return componentToRender;
    }

    return ReactDOM.createPortal(<View style={StyleUtils.getBaseAutoCompleteSuggestionContainerStyle({left, width, bottom})}>{componentToRender}</View>, document.querySelector('body'));
}

AutoCompleteSuggestions.propTypes = propTypes;
AutoCompleteSuggestions.displayName = 'AutoCompleteSuggestions';

export default AutoCompleteSuggestions;
