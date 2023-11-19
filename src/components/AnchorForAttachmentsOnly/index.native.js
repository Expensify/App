import React from 'react';
import useThemeStyles from '@styles/useThemeStyles';
import * as anchorForAttachmentsOnlyPropTypes from './anchorForAttachmentsOnlyPropTypes';
import BaseAnchorForAttachmentsOnly from './BaseAnchorForAttachmentsOnly';

function AnchorForAttachmentsOnly(props) {
    const styles = useThemeStyles();
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
