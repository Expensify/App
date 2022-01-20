import React from 'react';
import Text from '../Text';
import {propTypes, defaultProps} from '../Text/baseTextPropTypes';

// As this workaround is not needed on the native platform, we simply render Text  
const EmojiText = props => (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <Text {...props} />
);

EmojiText.propTypes = propTypes;
EmojiText.defaultProps = defaultProps;
EmojiText.displayName = 'EmojiText';

export default EmojiText;
