import React from 'react';
import Text, {propTypes, defaultProps} from '../Text';

// As this workaround is not needed on the native platform, we simply render Text  
const EmojiText = props => (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <Text {...props} />
);

EmojiText.propTypes = propTypes;
EmojiText.defaultProps = defaultProps;
EmojiText.displayName = 'EmojiText';

export default EmojiText;
