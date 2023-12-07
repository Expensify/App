import React from 'react';
import {Linking} from 'react-native';
import BaseAnchorForCommentsOnly from './BaseAnchorForCommentsOnly';
import type AnchorForCommentsOnlyProps from './types';

function AnchorForCommentsOnly(props: AnchorForCommentsOnlyProps) {
    const onPress = () => (typeof props.onPress === 'function' ? props.onPress() : Linking.openURL(props.href ?? ''));

    return (
        <BaseAnchorForCommentsOnly
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            onPress={onPress}
        />
    );
}

AnchorForCommentsOnly.displayName = 'AnchorForCommentsOnly';

export default AnchorForCommentsOnly;
