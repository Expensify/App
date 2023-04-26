import React from 'react';
import BaseEmojiSuggestions from './BaseEmojiSuggestions';
import * as DeviceCapabilities from '../../libs/DeviceCapabilities';
import {propTypes, defaultProps} from './emojiSuggestionsPropTypes';

/**
 * On the web platform, when tapping on emoji suggestions, we need to prevent focus shifting to avoid blurring the main input.
 * On the native platform, tapping on emoji suggestions will not blur the main input.
 */

const EmojiSuggestions = (props) => {
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
        return () => container.onpointerdown = null;
    }, []);

    return (
        // eslint-disable-next-line react/jsx-props-no-spreading
        <BaseEmojiSuggestions {...props} ref={containerRef} />
    );
};

EmojiSuggestions.propTypes = propTypes;
EmojiSuggestions.defaultProps = defaultProps;
EmojiSuggestions.displayName = 'EmojiSuggestions';

export default EmojiSuggestions;
