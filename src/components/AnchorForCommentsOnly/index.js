import React from 'react';
import * as anchorForCommentsOnlyPropTypes from './anchorForCommentsOnlyPropTypes';
import BaseAnchorForCommentsOnly from './BaseAnchorForCommentsOnly';
import * as DeviceCapabilities from '../../libs/DeviceCapabilities';
import ControlSelection from '../../libs/ControlSelection';
import styles from '../../styles/styles';

const AnchorForCommentsOnly = (props) => (
    <BaseAnchorForCommentsOnly
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...props}
        onPressIn={() => DeviceCapabilities.canUseTouchScreen() && ControlSelection.block()}
        onPressOut={() => ControlSelection.unblock()}
        // HTML renderer root view display is flex. Using flex will force all child elements
        // to be block elements even when they have display inline added to them.
        // This will affect elements like <a> which are inline by default.
        // Setting display block to the container view will solve that.
        containerStyles={[styles.dBlock]}
    />
);

AnchorForCommentsOnly.propTypes = anchorForCommentsOnlyPropTypes.propTypes;
AnchorForCommentsOnly.defaultProps = anchorForCommentsOnlyPropTypes.defaultProps;
AnchorForCommentsOnly.displayName = 'AnchorForCommentsOnly';

export default AnchorForCommentsOnly;
