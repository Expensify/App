import React from 'react';
import useThemeStyles from '@hooks/useThemeStyles';
import AnchorForAttachmentsOnlyProps from './types';
import BaseAnchorForAttachmentsOnly from './BaseAnchorForAttachmentsOnly';

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

AnchorForAttachmentsOnly.displayName = 'AnchorForAttachmentsOnly';

export default AnchorForAttachmentsOnly;
