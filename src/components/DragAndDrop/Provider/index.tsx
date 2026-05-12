import {PortalHost} from '@gorhom/portal';
import {Str} from 'expensify-common';
import React, {useCallback, useEffect, useMemo, useRef} from 'react';
import {View} from 'react-native';
import useDragAndDrop from '@hooks/useDragAndDrop';
import useThemeStyles from '@hooks/useThemeStyles';
import htmlDivElementRef from '@src/types/utils/htmlDivElementRef';
import viewRef from '@src/types/utils/viewRef';
import {DragAndDropActionsContext, DragAndDropStateContext} from './DragAndDropContext';
import type {DragAndDropActionsContextType, DragAndDropProviderProps, DragAndDropStateContextType, SetOnDropHandlerCallback} from './types';

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

    const stateValue = useMemo<DragAndDropStateContextType>(
        () => ({
            isDraggingOver: isDraggingOver ?? false,
            dropZoneID: dropZoneID.current,
        }),
        [isDraggingOver],
    );

    const actionsValue = useMemo<DragAndDropActionsContextType>(
        () => ({
            setOnDropHandler,
        }),
        [setOnDropHandler],
    );

    return (
        <DragAndDropStateContext.Provider value={stateValue}>
            <DragAndDropActionsContext.Provider value={actionsValue}>
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
            </DragAndDropActionsContext.Provider>
        </DragAndDropStateContext.Provider>
    );
}

export default DragAndDropProvider;
export {useDragAndDropActions, useDragAndDropState} from './DragAndDropContext';
