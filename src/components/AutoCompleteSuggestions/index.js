import React from 'react';
import {View} from 'react-native';
import ReactDOM from 'react-dom';
import BaseAutoCompleteSuggestions from './BaseAutoCompleteSuggestions';
import * as DeviceCapabilities from '../../libs/DeviceCapabilities';
import {propTypes} from './autoCompleteSuggestionsPropTypes';
import * as StyleUtils from '../../styles/StyleUtils';

/**
 * On the mobile-web platform, when long-pressing on auto-complete suggestions,
 * we need to prevent focus shifting to avoid blurring the main input (which makes the suggestions picker close and fires the onSelect callback).
 * The desired pattern for all platforms is to do nothing on long-press.
 * On the native platform, tapping on auto-complete suggestions will not blur the main input.
 */

function AutoCompleteSuggestions(props) {
    const containerRef = React.useRef(null);
    const [containerState, setContainerState] = React.useState({
        width: 0,
        height: 0,
        x: 0,
        y: 0,
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
        if (!props.parentContainerRef || !props.parentContainerRef.current) {
            return;
        }
        props.parentContainerRef.current.measureInWindow((x, y, width, height) => setContainerState({x, y, width, height}));
    }, [props.parentContainerRef]);

    if (!containerState.width || !containerState.height) {
        return (
            <BaseAutoCompleteSuggestions
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...props}
                ref={containerRef}
            />
        );
    }

    return (
        ReactDOM.createPortal(
            <View style={StyleUtils.getBaseAutoCompleteSuggestionContainerStyle(containerState)}>
                <BaseAutoCompleteSuggestions
                    // eslint-disable-next-line react/jsx-props-no-spreading
                    {...props}
                    ref={containerRef}
                />
            </View>,
            document.querySelector('body')
        )
    );
}

AutoCompleteSuggestions.propTypes = propTypes;
AutoCompleteSuggestions.displayName = 'AutoCompleteSuggestions';

export default AutoCompleteSuggestions;
