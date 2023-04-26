import React from 'react';
import * as StyleUtils from '../../styles/StyleUtils';
import styles from '../../styles/styles';
import BaseAnchorForAttachmentsOnly from './BaseAnchorForAttachmentsOnly';
import * as anchorForAttachmentsOnlyPropTypes from './anchorForAttachmentsOnlyPropTypes';

// eslint-disable-next-line react/jsx-props-no-spreading
const AnchorForAttachmentsOnly = props => <BaseAnchorForAttachmentsOnly {...props} style={[...StyleUtils.parseStyleAsArray(props.style), styles.mw100]} />;

AnchorForAttachmentsOnly.propTypes = anchorForAttachmentsOnlyPropTypes.propTypes;
AnchorForAttachmentsOnly.defaultProps = anchorForAttachmentsOnlyPropTypes.defaultProps;
AnchorForAttachmentsOnly.displayName = 'AnchorForAttachmentsOnly';

export default AnchorForAttachmentsOnly;
