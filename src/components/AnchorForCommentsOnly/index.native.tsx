import React from 'react';
import {Linking} from 'react-native';
import Log from '@libs/Log';
import {isExternalLinkSchemeAllowed} from '@libs/Url';
import BaseAnchorForCommentsOnly from './BaseAnchorForCommentsOnly';
import type {AnchorForCommentsOnlyProps} from './types';

function AnchorForCommentsOnly({onPress, href = '', ...props}: AnchorForCommentsOnlyProps) {
    const onLinkPress = () => {
        if (onPress) {
            onPress();
        } else if (!isExternalLinkSchemeAllowed(href)) {
            Log.warn('[AnchorForCommentsOnly] blocked link with disallowed scheme');
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
