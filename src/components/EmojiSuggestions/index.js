import React from 'react';
import BaseEmojiSuggestions from './BaseEmojiSuggestions';
import * as DeviceCapabilities from '../../libs/DeviceCapabilities';
import {propTypes, defaultProps} from './emojiSuggestionsPropTypes';

/**
 * On the mobile-web platform, when long-pressing on emoji suggestions,
 * we need to prevent focus shifting to avoid blurring the main input which makes the emoji picker close and adds the emoji to the composer.
 * The desired pattern for all platforms is to do nothing on long-press.
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
