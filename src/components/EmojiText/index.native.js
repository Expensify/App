import React from 'react';
import Text from '../Text';

// As this workaround is not needed on the native platform, we simply render Text  
const EmojiText = props => (
    <Text {...props} />
);

EmojiText.displayName = 'EmojiText';

export default EmojiText;
