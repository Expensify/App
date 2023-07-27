import React, {useRef} from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import styles from '../../../styles/styles';
import useDragAndDrop from '../../../hooks/useDragAndDrop';

const propTypes = {
    /** Content */
    children: PropTypes.node.isRequired,
};

function NoDropZone({children}) {
    const noDropZone = useRef(null);
    useDragAndDrop({
        dropZoneElement: noDropZone.current,
        shouldAllowDrop: false,
    });
    return (
        <View
            ref={(e) => (noDropZone.current = e)}
            style={[styles.fullScreen]}
        >
            {children}
        </View>
    );
}

NoDropZone.displayName = 'NoDropZone';
NoDropZone.propTypes = propTypes;

export default NoDropZone;
