import PropTypes from 'prop-types';
import React, {useRef} from 'react';
import {View} from 'react-native';
import useDragAndDrop from '@hooks/useDragAndDrop';
import styles from '@styles/styles';

const propTypes = {
    /** Content */
    children: PropTypes.node.isRequired,
};

function NoDropZone({children}) {
    const noDropZone = useRef(null);
    useDragAndDrop({
        dropZone: noDropZone,
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
