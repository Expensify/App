import React from 'react';
import {View} from 'react-native';
import {Portal} from '@gorhom/portal';
import PropTypes from 'prop-types';

const propTypes = {
    /** Name for a drop zone view holder which gives us the flexibility to mount drop zone wherever we want. The holder view can be implemented as PortalHost */
    dropZoneViewHolderName: PropTypes.string.isRequired,

    /** Drop zone content */
    children: PropTypes.node.isRequired,

    /** Required for drag and drop to properly detect dropzone */
    dropZoneId: PropTypes.string.isRequired,
};

function ReceiptDropZone(props) {
    return (
        <Portal hostName={props.dropZoneViewHolderName}>
            <View>{props.children}</View>
            {/* Necessary for blocking events on content which can publish unwanted dragleave even if we are inside dropzone  */}
            <View nativeID={props.dropZoneId} />
        </Portal>
    );
}

ReceiptDropZone.displayName = 'ReceiptDropZone';
ReceiptDropZone.propTypes = propTypes;

export default ReceiptDropZone;
