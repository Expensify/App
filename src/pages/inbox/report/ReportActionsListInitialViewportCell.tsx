import React, {useEffect} from 'react';
import {View} from 'react-native';
import type {InitialViewportRange} from './InitialViewportUtils';

type InitialViewportItemMountObserverProps = {
    children: React.ReactNode;
    index: number;
    onMount?: (index: number) => void;
};

function InitialViewportItemMountObserver({children, index, onMount}: InitialViewportItemMountObserverProps) {
    useEffect(() => {
        onMount?.(index);
    }, [index, onMount]);

    return children;
}

type ReportActionsListInitialViewportCellProps = {
    children: React.ReactNode;
    flashListIndex: number;
    flashListTarget: string;
    initialViewportRange: InitialViewportRange | undefined;
    isInitialViewportLoading: boolean;
    initialScrollKeyForInitialScroll: string | undefined;
    reportActionKey: string;
    hasInitialScrollTarget: boolean;
    onInitialViewportItemMounted: (index: number) => void;
    onInitialScrollTargetLayout: (layoutHeight: number) => void;
};

function ReportActionsListInitialViewportCell({
    children,
    flashListIndex,
    flashListTarget,
    initialViewportRange,
    isInitialViewportLoading,
    initialScrollKeyForInitialScroll,
    reportActionKey,
    hasInitialScrollTarget,
    onInitialViewportItemMounted,
    onInitialScrollTargetLayout,
}: ReportActionsListInitialViewportCellProps) {
    const isListCell = flashListTarget === 'Cell';
    const isInsideInitialViewport =
        isListCell && !!initialViewportRange && isInitialViewportLoading && flashListIndex >= initialViewportRange.first && flashListIndex <= initialViewportRange.last;

    const isMeasuredScrollTargetRow = isListCell && !!initialScrollKeyForInitialScroll && reportActionKey === initialScrollKeyForInitialScroll && hasInitialScrollTarget;

    let cellContent = children;

    if (isInsideInitialViewport) {
        cellContent = (
            <InitialViewportItemMountObserver
                index={flashListIndex}
                onMount={onInitialViewportItemMounted}
            >
                {cellContent}
            </InitialViewportItemMountObserver>
        );
    }

    if (!isMeasuredScrollTargetRow) {
        return cellContent;
    }

    return (
        <View
            collapsable={false}
            onLayout={(event) => {
                onInitialScrollTargetLayout(event.nativeEvent.layout.height);
            }}
        >
            {cellContent}
        </View>
    );
}

export default ReportActionsListInitialViewportCell;
