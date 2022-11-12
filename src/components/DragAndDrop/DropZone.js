
import React from 'react';
import {StyleSheet, View} from 'react-native';
import {Portal} from '@gorhom/portal';
import PropTypes from 'prop-types';
import styles from '../../styles/styles';

const propTypes = {
    /** Host name for a portal which gives us the flexibility to mount drop zone wherever we want */
    hostName: PropTypes.string.isRequired,

    /** Drop zone content */
    children: PropTypes.node.isRequired,

    /** Required for drag and drop to properly detect dropzone */
    dropZoneId: PropTypes.string.isRequired,
};

const transparentOverlay = {
    ...StyleSheet.absoluteFill,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(255,255,255,0)',
    zIndex: 1000,
};

const DropZone = props => (
    <Portal hostName={props.hostName}>
        <View style={[styles.fullScreenTransparentOverlay, styles.alignItemsCenter, styles.justifyContentCenter]}>
            {props.children}
        </View>
        {/* Necessary for blocking events on content which can publish unwanted dragleave even if we are inside dropzone  */}
        <View nativeID={props.dropZoneId} style={transparentOverlay} />
    </Portal>
);

DropZone.displayName = 'DropZone';
DropZone.propTypes = propTypes;

export default DropZone;
