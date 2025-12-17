import React from 'react';
import useThemeStyles from '@hooks/useThemeStyles';
import BaseAnchorForAttachmentsOnly from './BaseAnchorForAttachmentsOnly';
import type AnchorForAttachmentsOnlyProps from './types';

function AnchorForAttachmentsOnly(props: AnchorForAttachmentsOnlyProps) {
    const styles = useThemeStyles();
    return (
        <BaseAnchorForAttachmentsOnly
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            style={styles.mw100}
        />
    );
}

export default AnchorForAttachmentsOnly;
