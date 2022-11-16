import React from 'react';
import {View} from 'react-native';
import {Portal} from '@gorhom/portal';
import PropTypes from 'prop-types';
import styles from '../../../styles/styles';

const propTypes = {
    /** Name for a drop zone view holder which gives us the flexibility to mount drop zone wherever we want. The holder view can be implemented as PortalHost */
    dropZoneViewHolderName: PropTypes.string.isRequired,

    /** Drop zone content */
    children: PropTypes.node.isRequired,

    /** Required for drag and drop to properly detect dropzone */
    dropZoneId: PropTypes.string.isRequired,
};

const DropZone = props => (
    <Portal hostName={props.dropZoneViewHolderName}>
        <View style={[styles.fullScreenTransparentOverlay, styles.alignItemsCenter, styles.justifyContentCenter]}>
            {props.children}
        </View>
        {/* Necessary for blocking events on content which can publish unwanted dragleave even if we are inside dropzone  */}
        <View nativeID={props.dropZoneId} style={styles.dropZoneTopInvisibleOverlay} />
    </Portal>
);

DropZone.displayName = 'DropZone';
DropZone.propTypes = propTypes;

export default DropZone;
