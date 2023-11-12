import PropTypes from 'prop-types';
import React, {useContext, useRef} from 'react';
import {View} from 'react-native';
import {PopoverContext} from '@components/PopoverProvider';
import useDragAndDrop from '@hooks/useDragAndDrop';
import styles from '@styles/styles';

const propTypes = {
    /** Content */
    children: PropTypes.node.isRequired,
};

function NoDropZone({children}) {
    const noDropZone = useRef(null);
    const {close: closePopover} = useContext(PopoverContext);
    useDragAndDrop({
        dropZone: noDropZone,
        shouldAllowDrop: false,
        onDragEnter: closePopover,
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
