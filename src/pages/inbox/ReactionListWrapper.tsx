import React, {useEffect, useRef, useState} from 'react';
import type {SyntheticEvent} from 'react';
import {Dimensions} from 'react-native';
import PopoverReactionList from './report/ReactionList/PopoverReactionList';
import {ReactionListContext} from './ReportScreenContext';
import type {ReactionListAnchor, ReactionListContextType, ReactionListEvent} from './ReportScreenContext';

type AnchorPosition = {horizontal: number; vertical: number};

type ActiveReactionList = {
    reportActionID: string;
    emojiName: string;
    cursorRelativePosition: AnchorPosition;
    anchorPosition: AnchorPosition;
};

function getAnchorOrigin(anchor: ReactionListAnchor | null): {x: number; y: number} {
    if (!anchor) {
        return {x: 0, y: 0};
    }
    const rect = anchor.getBoundingClientRect();
    return {x: rect.left, y: rect.top};
}

function getNativeMouseEvent(event: ReactionListEvent | undefined): {pageX: number; pageY: number} {
    if (!event) {
        return {pageX: 0, pageY: 0};
    }
    const synthetic = event as SyntheticEvent<ReactionListAnchor, MouseEvent>;
    const native = synthetic.nativeEvent as {pageX?: number; pageY?: number} | undefined;
    return {pageX: native?.pageX ?? 0, pageY: native?.pageY ?? 0};
}

function ReactionListWrapper({children}: {children: React.ReactNode}) {
    const [activeReactionList, setActiveReactionList] = useState<ActiveReactionList | null>(null);
    const anchorRef = useRef<ReactionListAnchor>(null);

    const showReactionList = (event: ReactionListEvent | undefined, reactionListAnchor: ReactionListAnchor, emojiName: string, reportActionID: string): void => {
        const {pageX, pageY} = getNativeMouseEvent(event);
        const {x, y} = getAnchorOrigin(reactionListAnchor);
        anchorRef.current = reactionListAnchor;
        setActiveReactionList({
            reportActionID,
            emojiName,
            cursorRelativePosition: {horizontal: pageX - x, vertical: pageY - y},
            anchorPosition: {horizontal: pageX, vertical: pageY},
        });
    };

    const hideReactionList = (): void => {
        anchorRef.current = null;
        setActiveReactionList(null);
    };

    const isActiveReportAction = (reportActionID: number | string): boolean => !!reportActionID && !!activeReactionList && activeReactionList.reportActionID === reportActionID;

    const isVisible = activeReactionList !== null;
    const cursorHorizontal = activeReactionList?.cursorRelativePosition.horizontal ?? 0;
    const cursorVertical = activeReactionList?.cursorRelativePosition.vertical ?? 0;

    // Recompute the popover anchor position when window dimensions change so the popover
    // stays anchored to the reaction bubble after rotation/resize.
    useEffect(() => {
        if (!isVisible) {
            return;
        }
        const dimensionsEventListener = Dimensions.addEventListener('change', () => {
            const {x, y} = getAnchorOrigin(anchorRef.current);
            if (!x || !y) {
                return;
            }
            setActiveReactionList((prev) => {
                if (!prev) {
                    return prev;
                }
                return {
                    ...prev,
                    anchorPosition: {
                        horizontal: prev.cursorRelativePosition.horizontal + x,
                        vertical: prev.cursorRelativePosition.vertical + y,
                    },
                };
            });
        });
        return () => {
            dimensionsEventListener.remove();
        };
    }, [isVisible, cursorHorizontal, cursorVertical]);

    const contextValue: ReactionListContextType = {showReactionList, hideReactionList, isActiveReportAction};

    return (
        <ReactionListContext.Provider value={contextValue}>
            {children}
            <PopoverReactionList
                isVisible={isVisible}
                emojiName={activeReactionList?.emojiName ?? ''}
                reportActionID={activeReactionList?.reportActionID}
                anchorPosition={activeReactionList?.anchorPosition ?? {horizontal: 0, vertical: 0}}
                anchorRef={anchorRef}
                onClose={hideReactionList}
            />
        </ReactionListContext.Provider>
    );
}

export default ReactionListWrapper;
