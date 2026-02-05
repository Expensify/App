import type {ReactNode} from 'react';
import React, {useRef} from 'react';
import {View} from 'react-native';
import useDragAndDrop from '@hooks/useDragAndDrop';
import useThemeStyles from '@hooks/useThemeStyles';
import htmlDivElementRef from '@src/types/utils/htmlDivElementRef';
import viewRef from '@src/types/utils/viewRef';

type DropZoneWrapperProps = {
    /** Callback to execute when a file is dropped */
    onDrop: (event: DragEvent) => void;

    /** Function to render the children */
    children: (props: {isDraggingOver: boolean}) => ReactNode;
};

function DropZoneWrapper({onDrop, children}: DropZoneWrapperProps) {
    const styles = useThemeStyles();
    const dropZone = useRef<HTMLDivElement | View>(null);

    const {isDraggingOver} = useDragAndDrop({
        shouldAcceptDrop: (event) => !!event.dataTransfer?.types.some((type) => type === 'Files'),
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
