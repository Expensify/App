import useThemeStyles from '@hooks/useThemeStyles';

import React from 'react';

import type AnchorForAttachmentsOnlyProps from './types';

import BaseAnchorForAttachmentsOnly from './BaseAnchorForAttachmentsOnly';

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
