import React from 'react';
import {Linking} from 'react-native';

import type {AnchorForCommentsOnlyProps} from './types';

import BaseAnchorForCommentsOnly from './BaseAnchorForCommentsOnly';

function AnchorForCommentsOnly({onPress, href = '', ...props}: AnchorForCommentsOnlyProps) {
    const onLinkPress = () => {
        if (onPress) {
            onPress();
        } else {
            Linking.openURL(href);
        }
    };

    return (
        <BaseAnchorForCommentsOnly
            {...props}
            href={href}
            onPress={onLinkPress}
        />
    );
}

export default AnchorForCommentsOnly;
