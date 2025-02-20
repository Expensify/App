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
        // eslint-disable-next-line react-compiler/react-compiler
        dropZone: htmlDivElementRef(noDropZone),
        shouldAllowDrop: false,
    });

    return (
        <View
            // eslint-disable-next-line react-compiler/react-compiler
            ref={viewRef(noDropZone)}
            style={[styles.fullScreen]}
        >
            {children}
        </View>
    );
}

NoDropZone.displayName = 'NoDropZone';

export default NoDropZone;
