import React, {useRef} from 'react';
import {View} from 'react-native';
import useDragAndDrop from '@hooks/useDragAndDrop';
import styles from '@styles/styles';
import type NoDropZoneProps from './types';

function NoDropZone({children}: NoDropZoneProps) {
    const noDropZone = useRef<View>(null);

    useDragAndDrop({
        dropZone: noDropZone,
        shouldAllowDrop: false,
    });

    return (
        <View
            ref={noDropZone}
            style={[styles.fullScreen]}
        >
            {children}
        </View>
    );
}

NoDropZone.displayName = 'NoDropZone';

export default NoDropZone;
