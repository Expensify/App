import React from 'react';
import Text from '../Text';
import * as baseTextPropTypes from '../Text/baseTextPropTypes';

// As this workaround is not needed on the native platform, we simply render Text  
const EmojiText = props => (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <Text {...props} />
);

EmojiText.propTypes = baseTextPropTypes.propTypes;
EmojiText.defaultProps = baseTextPropTypes.defaultProps;
EmojiText.displayName = 'EmojiText';

export default EmojiText;
