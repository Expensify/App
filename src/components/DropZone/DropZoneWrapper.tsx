import useDragAndDrop from '@hooks/useDragAndDrop';
import useThemeStyles from '@hooks/useThemeStyles';

import {shouldAcceptDrop} from '@libs/DragAndDropUtils';

import htmlDivElementRef from '@src/types/utils/htmlDivElementRef';
import viewRef from '@src/types/utils/viewRef';

import type {ReactNode} from 'react';

import React, {useRef} from 'react';
import {View} from 'react-native';

type DropZoneWrapperProps = {
    /** Callback to execute when a file is dropped */
    onDrop: (event: DragEvent) => void;

    children: (props: {isDraggingOver: boolean}) => ReactNode;
};

function DropZoneWrapper({onDrop, children}: DropZoneWrapperProps) {
    const styles = useThemeStyles();
    const dropZone = useRef<HTMLDivElement | View>(null);

    const {isDraggingOver} = useDragAndDrop({
        shouldAcceptDrop,
        onDrop,
        shouldStopPropagation: false,
        shouldHandleDragEvent: false,
        dropZone: htmlDivElementRef(dropZone),
    });

    return (
        <View
            ref={viewRef(dropZone)}
            style={styles.flex1}
        >
            {children({isDraggingOver})}
        </View>
    );
}

export default DropZoneWrapper;
