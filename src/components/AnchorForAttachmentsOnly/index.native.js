import React from 'react';
import styles from '@styles/styles';
import * as anchorForAttachmentsOnlyPropTypes from './anchorForAttachmentsOnlyPropTypes';
import BaseAnchorForAttachmentsOnly from './BaseAnchorForAttachmentsOnly';

function AnchorForAttachmentsOnly(props) {
    return (
        <BaseAnchorForAttachmentsOnly
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            style={styles.mw100}
        />
    );
}

AnchorForAttachmentsOnly.propTypes = anchorForAttachmentsOnlyPropTypes.propTypes;
AnchorForAttachmentsOnly.defaultProps = anchorForAttachmentsOnlyPropTypes.defaultProps;
AnchorForAttachmentsOnly.displayName = 'AnchorForAttachmentsOnly';

export default AnchorForAttachmentsOnly;
