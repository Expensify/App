import {PortalHost} from '@gorhom/portal';
import {Str} from 'expensify-common';
import React, {useCallback, useEffect, useMemo, useRef} from 'react';
import {View} from 'react-native';
import useDragAndDrop from '@hooks/useDragAndDrop';
import useThemeStyles from '@hooks/useThemeStyles';
import htmlDivElementRef from '@src/types/utils/htmlDivElementRef';
import viewRef from '@src/types/utils/viewRef';
import type {DragAndDropContextParams, DragAndDropProviderProps, SetOnDropHandlerCallback} from './types';

const DragAndDropContext = React.createContext<DragAndDropContextParams>({});

function shouldAcceptDrop(event: DragEvent): boolean {
    return !!event.dataTransfer?.types.some((type) => type === 'Files');
}

function DragAndDropProvider({children, isDisabled = false, setIsDraggingOver = () => {}}: DragAndDropProviderProps) {
    const styles = useThemeStyles();
    const dropZone = useRef<HTMLDivElement | View>(null);
    const dropZoneID = useRef(Str.guid('drag-n-drop'));

    const onDropHandler = useRef<SetOnDropHandlerCallback>(() => {});
    const setOnDropHandler = useCallback((callback: SetOnDropHandlerCallback) => {
        onDropHandler.current = callback;
    }, []);

    const {isDraggingOver} = useDragAndDrop({
        dropZone: htmlDivElementRef(dropZone),
        onDrop: onDropHandler.current,
        shouldAcceptDrop,
        isDisabled,
    });

    useEffect(() => {
        setIsDraggingOver(isDraggingOver);
    }, [isDraggingOver, setIsDraggingOver]);

    const contextValue = useMemo(() => ({isDraggingOver, setOnDropHandler, dropZoneID: dropZoneID.current}), [isDraggingOver, setOnDropHandler]);

    return (
        <DragAndDropContext.Provider value={contextValue}>
            <View
                ref={viewRef(dropZone)}
                style={[styles.flex1, styles.w100, styles.h100]}
            >
                {isDraggingOver && (
                    <View style={[styles.fullScreen, styles.invisibleOverlay]}>
                        <PortalHost name={dropZoneID.current} />
                    </View>
                )}
                {children}
            </View>
        </DragAndDropContext.Provider>
    );
}

export default DragAndDropProvider;
export {DragAndDropContext};
