import React from 'react';
import useThemeStyles from '@hooks/useThemeStyles';
import AnchorForAttachmentsOnlyTypes from './AnchorForAttachmentsOnlyTypes';
import BaseAnchorForAttachmentsOnly from './BaseAnchorForAttachmentsOnly';

function AnchorForAttachmentsOnly({source, displayName}: AnchorForAttachmentsOnlyTypes) {
    const styles = useThemeStyles();
    return (
        <BaseAnchorForAttachmentsOnly
            source={source}
            displayName={displayName}
            style={styles.mw100}
        />
    );
}

AnchorForAttachmentsOnly.displayName = 'AnchorForAttachmentsOnly';

export default AnchorForAttachmentsOnly;
