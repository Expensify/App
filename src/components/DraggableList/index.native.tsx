import React, {useCallback, useMemo, useRef, useState} from 'react';
import type {RenderItemParams} from 'react-native-draggable-flatlist';
import DraggableFlatList from 'react-native-draggable-flatlist';
import type {FlatList} from 'react-native-gesture-handler';
import useArrowKeyFocusManager from '@hooks/useArrowKeyFocusManager';
import useKeyboardShortcut from '@hooks/useKeyboardShortcut';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
import type DraggableListProps from './types';

function DraggableList<T>({
    ref,
    data = [],
    renderItem,
    keyExtractor,
    onDragEnd: onDragEndCallback,
    isItemDisabled,
    ListFooterComponent,
    focusedIndex: controlledFocusedIndex,
}: DraggableListProps<T> & {ref?: React.ForwardedRef<FlatList<T>>}) {
    const styles = useThemeStyles();
    const isControlled = controlledFocusedIndex !== undefined;

    const [isKeyboardMoving, setIsKeyboardMoving] = useState(false);
    const [localData, setLocalData] = useState<T[]>([]);
    const originalDataRef = useRef<T[]>([]);

    const activeData = isKeyboardMoving ? localData : data;

    const disabledArrowKeyIndexes = useMemo(() => (isItemDisabled ? data.flatMap((item, index) => (isItemDisabled(item) ? [index] : [])) : []), [data, isItemDisabled]);

    // Arrow key focus management — disabled during keyboard moving so arrows can reorder instead
    const [focusedIndex, setFocusedIndex] = useArrowKeyFocusManager({
        maxIndex: activeData.length - 1,
        isActive: !isControlled && !isKeyboardMoving,
        disabledIndexes: disabledArrowKeyIndexes,
        disableCyclicTraversal: true,
        initialFocusedIndex: -1,
    });

    const activeFocusedIndex = isControlled ? controlledFocusedIndex : focusedIndex;

    // Space: toggle keyboard moving mode
    const handleSpace = useCallback(() => {
        if (isKeyboardMoving) {
            // Confirm the reorder
            onDragEndCallback?.({data: localData});
            setIsKeyboardMoving(false);
        } else if (activeFocusedIndex >= 0) {
            // Enter moving mode for the focused item
            originalDataRef.current = [...data];
            setLocalData([...data]);
            setIsKeyboardMoving(true);
        }
    }, [isKeyboardMoving, activeFocusedIndex, data, localData, onDragEndCallback]);

    useKeyboardShortcut(CONST.KEYBOARD_SHORTCUTS.SPACE, handleSpace, {
        isActive: !isControlled && (isKeyboardMoving || activeFocusedIndex >= 0),
    });

    // Escape: cancel moving mode and restore original order
    const handleEscape = useCallback(() => {
        setLocalData(originalDataRef.current);
        setIsKeyboardMoving(false);
    }, []);

    useKeyboardShortcut(CONST.KEYBOARD_SHORTCUTS.ESCAPE, handleEscape, {
        isActive: isKeyboardMoving,
    });

    // Arrow Up during moving: swap the item one position up
    const handleArrowUp = useCallback(() => {
        if (activeFocusedIndex <= 0) {
            return;
        }
        const newIndex = activeFocusedIndex - 1;
        setLocalData((prev) => {
            const result = [...prev];
            const temp = result.at(activeFocusedIndex) as T;
            result[activeFocusedIndex] = result.at(newIndex) as T;
            result[newIndex] = temp;
            return result;
        });
        setFocusedIndex(newIndex);
    }, [activeFocusedIndex, setFocusedIndex]);

    useKeyboardShortcut(CONST.KEYBOARD_SHORTCUTS.ARROW_UP, handleArrowUp, {
        isActive: isKeyboardMoving,
    });

    // Arrow Down during moving: swap the item one position down
    const handleArrowDown = useCallback(() => {
        if (activeFocusedIndex >= activeData.length - 1) {
            return;
        }
        const newIndex = activeFocusedIndex + 1;
        setLocalData((prev) => {
            const result = [...prev];
            const temp = result.at(activeFocusedIndex) as T;
            result[activeFocusedIndex] = result.at(newIndex) as T;
            result[newIndex] = temp;
            return result;
        });
        setFocusedIndex(newIndex);
    }, [activeFocusedIndex, activeData.length, setFocusedIndex]);

    useKeyboardShortcut(CONST.KEYBOARD_SHORTCUTS.ARROW_DOWN, handleArrowDown, {
        isActive: isKeyboardMoving,
    });

    // Wrap renderItem to inject keyboard navigation state
    const wrappedRenderItem = useCallback(
        (params: RenderItemParams<T>) => {
            const index = params.getIndex() ?? -1;
            return renderItem({
                ...params,
                isActive: (isKeyboardMoving && index === activeFocusedIndex) || params.isActive,
                isFocused: index === activeFocusedIndex,
                isKeyboardMoving,
            });
        },
        [renderItem, isKeyboardMoving, activeFocusedIndex],
    );

    return (
        <DraggableFlatList
            ref={ref}
            data={activeData}
            renderItem={wrappedRenderItem}
            keyExtractor={keyExtractor}
            onDragBegin={() => {
                if (!isKeyboardMoving) {
                    return;
                }
                // Cancel keyboard moving mode if a touch drag starts
                setIsKeyboardMoving(false);
            }}
            onDragEnd={(event) => {
                onDragEndCallback?.({data: event.data});
            }}
            extraData={`${activeFocusedIndex}-${isKeyboardMoving}`}
            containerStyle={styles.flex1}
            contentContainerStyle={styles.flexGrow1}
            ListFooterComponentStyle={styles.flex1}
            ListFooterComponent={ListFooterComponent}
        />
    );
}

export default DraggableList;
