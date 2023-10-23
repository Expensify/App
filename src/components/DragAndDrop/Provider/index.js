import _ from 'underscore';
import React, {useRef, useCallback, useEffect, useMemo} from 'react';
import {View} from 'react-native';
import {PortalHost} from '@gorhom/portal';
import Str from 'expensify-common/lib/str';
import dragAndDropProviderPropTypes from './dragAndDropProviderPropTypes';
import styles from '../../../styles/styles';
import useDragAndDrop from '../../../hooks/useDragAndDrop';

const DragAndDropContext = React.createContext({});

/**
 * @param {Event} event – drag event
 * @returns {Boolean}
 */
function shouldAcceptDrop(event) {
    return _.some(event.dataTransfer.types, (type) => type === 'Files');
}

function DragAndDropProvider({children, isDisabled = false, setIsDraggingOver = () => {}}) {
    const dropZone = useRef(null);
    const dropZoneID = useRef(Str.guid('drag-n-drop'));

    const onDropHandler = useRef(() => {});
    const setOnDropHandler = useCallback((callback) => {
        onDropHandler.current = callback;
    }, []);

    const {isDraggingOver} = useDragAndDrop({
        dropZone,
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
                ref={(e) => (dropZone.current = e)}
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

DragAndDropProvider.propTypes = dragAndDropProviderPropTypes;
DragAndDropProvider.displayName = 'DragAndDropProvider';

export default DragAndDropProvider;
export {DragAndDropContext};
