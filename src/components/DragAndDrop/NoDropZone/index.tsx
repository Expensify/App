import useDragAndDrop from '@hooks/useDragAndDrop';
import useThemeStyles from '@hooks/useThemeStyles';

import mergeRefs from '@libs/mergeRefs';

import htmlDivElementRef from '@src/types/utils/htmlDivElementRef';

import type {ComponentRef} from 'react';

import React, {useRef} from 'react';
import {View} from 'react-native';

import type NoDropZoneProps from './types';

function NoDropZone({children, ref}: NoDropZoneProps) {
    const styles = useThemeStyles();
    const noDropZone = useRef<ComponentRef<typeof View> | HTMLDivElement>(null);

    useDragAndDrop({
        dropZone: htmlDivElementRef(noDropZone),
        shouldAllowDrop: false,
    });

    const setNoDropZone = (element: ComponentRef<typeof View> | HTMLDivElement | null) => {
        noDropZone.current = element;
    };

    return (
        <View
            ref={mergeRefs(setNoDropZone, ref)}
            style={[styles.fullScreen]}
        >
            {children}
        </View>
    );
}

export default NoDropZone;
