import React, {useRef} from 'react';
import {View} from 'react-native';
import useDragAndDrop from '@hooks/useDragAndDrop';
import useThemeStyles from '@hooks/useThemeStyles';
import htmlDivElementRef from '@src/types/utils/htmlDivElementRef';
import viewRef from '@src/types/utils/viewRef';
import type NoDropZoneProps from './types';

function NoDropZone({children}: NoDropZoneProps) {
    const styles = useThemeStyles();
    const noDropZone = useRef<View | HTMLDivElement>(null);

    useDragAndDrop({
        dropZone: htmlDivElementRef(noDropZone),
        shouldAllowDrop: false,
    });

    return (
        <View
            ref={viewRef(noDropZone)}
            style={[styles.fullScreen]}
        >
            {children}
        </View>
    );
}

export default NoDropZone;
