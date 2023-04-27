import React from 'react';
import BaseEmojiSuggestions from './BaseEmojiSuggestions';
import {propTypes, defaultProps} from './emojiSuggestionsPropTypes';

const EmojiSuggestions = props => (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <BaseEmojiSuggestions {...props} />
);

EmojiSuggestions.propTypes = propTypes;
EmojiSuggestions.defaultProps = defaultProps;
EmojiSuggestions.displayName = 'EmojiSuggestions';

export default EmojiSuggestions;
