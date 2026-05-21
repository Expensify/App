import React from 'react';
import useThemeStyles from '@hooks/useThemeStyles';
import BaseAnchorForAttachmentsOnly from './BaseAnchorForAttachmentsOnly';
import type AnchorForAttachmentsOnlyProps from './types';

function AnchorForAttachmentsOnly(props: AnchorForAttachmentsOnlyProps) {
    const styles = useThemeStyles();
    return (
        <BaseAnchorForAttachmentsOnly
            {...props}
            style={styles.mw100}
        />
    );
}

export default AnchorForAttachmentsOnly;
