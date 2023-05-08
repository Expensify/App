import React from 'react';
import BaseAutoCompleteSuggestions from './BaseAutoCompleteSuggestions';
import * as DeviceCapabilities from '../../libs/DeviceCapabilities';
import {propTypes} from './autoCompleteSuggestionsPropTypes';

/**
 * On the mobile-web platform, when long-pressing on auto-complete suggestions,
 * we need to prevent focus shifting to avoid blurring the main input (which makes the suggestions picker close and fires the onSelect callback).
 * The desired pattern for all platforms is to do nothing on long-press.
 * On the native platform, tapping on auto-complete suggestions will not blur the main input.
 */

const AutoCompleteSuggestions = (props) => {
    const containerRef = React.useRef(null);
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

    return (
        <BaseAutoCompleteSuggestions
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            ref={containerRef}
        />
    );
};

AutoCompleteSuggestions.propTypes = propTypes;
AutoCompleteSuggestions.displayName = 'AutoCompleteSuggestions';

export default AutoCompleteSuggestions;
