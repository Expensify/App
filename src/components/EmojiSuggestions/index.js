import React from 'react';
import BaseEmojiSuggestions from './BaseEmojiSuggestions';
import * as DeviceCapabilities from '../../libs/DeviceCapabilities';
import {propTypes, defaultProps} from './emojiSuggestionsPropTypes';

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
