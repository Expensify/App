/* eslint-disable es/no-optional-chaining, es/no-nullish-coalescing-operators, react/prop-types */
import type {ForwardedRef, RefObject} from 'react';
import React, {useCallback, useEffect, useMemo, useRef} from 'react';
import type {NativeScrollEvent, NativeSyntheticEvent} from 'react-native';
import {FlatList} from 'react-native';
import useEmitComposerScrollEvents from '@hooks/useEmitComposerScrollEvents';
import useThemeStyles from '@hooks/useThemeStyles';
import {isMobileSafari} from '@libs/Browser';
import type {CustomFlatListProps} from './types';

// Changing the scroll position during a momentum scroll does not work on mobile Safari.
// We do a best effort to avoid content jumping by using some hacks on mobile Safari only.
const IS_MOBILE_SAFARI = isMobileSafari();

function mergeRefs(...args: Array<RefObject<FlatList> | ForwardedRef<FlatList> | null>) {
    return function (node: FlatList) {
        for (const ref of args) {
            if (ref == null) {
                continue;
            }
            if (typeof ref === 'function') {
                ref(node);
                continue;
            }
            if (typeof ref === 'object') {
                // eslint-disable-next-line no-param-reassign
                ref.current = node;
                continue;
            }
            console.error(`mergeRefs cannot handle Refs of type boolean, number or string, received ref ${String(ref)}`);
        }
    };
}

function useMergeRefs(...args: Array<RefObject<FlatList> | ForwardedRef<FlatList> | null>) {
    return useMemo(
        () => mergeRefs(...args),
        // eslint-disable-next-line
        [...args],
    );
}

function getScrollableNode(flatList: FlatList | null): HTMLElement | undefined {
    return flatList?.getScrollableNode() as HTMLElement | undefined;
}

function MVCPFlatList<TItem>({
    maintainVisibleContentPosition,
    horizontal = false,
    onScroll: onScrollProp,
    initialNumToRender,
    shouldHideContent = false,
    ref,
    ...restProps
}: CustomFlatListProps<TItem>) {
    const styles = useThemeStyles();
    const {minIndexForVisible: mvcpMinIndexForVisible, autoscrollToTopThreshold: mvcpAutoscrollToTopThreshold} = maintainVisibleContentPosition ?? {};
    const scrollRef = useRef<FlatList | null>(null);
    const prevFirstVisibleOffsetRef = useRef(0);
    const firstVisibleViewRef = useRef<HTMLElement | null>(null);
    const mutationObserverRef = useRef<MutationObserver | null>(null);
    const lastScrollOffsetRef = useRef(0);
    const isListRenderedRef = useRef(false);
    const mvcpAutoscrollToTopThresholdRef = useRef(mvcpAutoscrollToTopThreshold);
    mvcpAutoscrollToTopThresholdRef.current = mvcpAutoscrollToTopThreshold;

    const getScrollOffset = useCallback((): number => {
        if (!scrollRef.current) {
            return 0;
        }
        return horizontal ? (getScrollableNode(scrollRef.current)?.scrollLeft ?? 0) : (getScrollableNode(scrollRef.current)?.scrollTop ?? 0);
    }, [horizontal]);

    const getContentView = useCallback(() => getScrollableNode(scrollRef.current)?.childNodes[0], []);

    const scrollToOffset = useCallback(
        (offset: number, animated: boolean, interrupt: boolean) => {
            const behavior = animated ? 'smooth' : 'instant';
            const node = getScrollableNode(scrollRef.current);
            if (node == null) {
                return;
            }

            const overflowProp = horizontal ? 'overflowX' : 'overflowY';
            // Stop momentum scrolling on mobile Safari otherwise the scroll position update
            // will not work.
            if (IS_MOBILE_SAFARI && interrupt) {
                node.style[overflowProp] = 'hidden';
            }
            node.scroll(horizontal ? {left: offset, behavior} : {top: offset, behavior});
            if (IS_MOBILE_SAFARI && interrupt) {
                node.style[overflowProp] = 'scroll';
            }
        },
        [horizontal],
    );

    const prepareForMaintainVisibleContentPosition = useCallback(() => {
        if (mvcpMinIndexForVisible == null) {
            return;
        }

        const contentView = getContentView();
        if (!(contentView instanceof Node)) {
            return;
        }

        const scrollOffset = getScrollOffset();
        lastScrollOffsetRef.current = scrollOffset;

        const contentViewLength = contentView.childNodes.length;
        for (let i = mvcpMinIndexForVisible; i < contentViewLength; i++) {
            const subview = contentView.childNodes[i] as HTMLElement;
            const subviewOffset = horizontal ? subview.offsetLeft : subview.offsetTop;
            if (subviewOffset > scrollOffset) {
                prevFirstVisibleOffsetRef.current = subviewOffset;
                firstVisibleViewRef.current = subview;
                break;
            }
        }
    }, [getContentView, getScrollOffset, mvcpMinIndexForVisible, horizontal]);

    const adjustForMaintainVisibleContentPosition = useCallback(
        (animated = true) => {
            if (mvcpMinIndexForVisible == null) {
                return;
            }

            const firstVisibleView = firstVisibleViewRef.current;
            const prevFirstVisibleOffset = prevFirstVisibleOffsetRef.current;
            if (firstVisibleView == null || !firstVisibleView.isConnected || prevFirstVisibleOffset == null) {
                return;
            }

            const firstVisibleViewOffset = horizontal ? firstVisibleView.offsetLeft : firstVisibleView.offsetTop;
            const delta = firstVisibleViewOffset - prevFirstVisibleOffset;
            if (Math.abs(delta) > (IS_MOBILE_SAFARI ? 100 : 0.5)) {
                const scrollOffset = lastScrollOffsetRef.current;
                prevFirstVisibleOffsetRef.current = firstVisibleViewOffset;
                scrollToOffset(scrollOffset + delta, false, true);
                if (mvcpAutoscrollToTopThresholdRef.current != null && scrollOffset <= mvcpAutoscrollToTopThresholdRef.current) {
                    scrollToOffset(0, animated, false);
                }
            }
        },
        [scrollToOffset, mvcpMinIndexForVisible, horizontal],
    );

    const setupMutationObserver = useCallback(() => {
        const contentView = getContentView();
        if (!(contentView instanceof Node)) {
            return;
        }

        mutationObserverRef.current?.disconnect();

        const mutationObserver = new MutationObserver((mutations) => {
            let isEditComposerAdded = false;
            // Check if the first visible view is removed and re-calculate it
            // if needed.
            for (const mutation of mutations) {
                for (const node of mutation.removedNodes) {
                    if (node !== firstVisibleViewRef.current) {
                        continue;
                    }
                    firstVisibleViewRef.current = null;
                }
                for (const node of mutation.addedNodes) {
                    if (node.nodeType !== Node.ELEMENT_NODE || !(node as HTMLElement).querySelector('#composer')) {
                        continue;
                    }
                    isEditComposerAdded = true;
                }
            }

            if (firstVisibleViewRef.current == null) {
                prepareForMaintainVisibleContentPosition();
            }

            // When the list is hidden, the size will be 0.
            // Ignore the callback if the list is hidden because scrollOffset will always be 0.
            if (!getScrollableNode(scrollRef.current)?.clientHeight) {
                return;
            }

            adjustForMaintainVisibleContentPosition(!isEditComposerAdded);
            prepareForMaintainVisibleContentPosition();
        });
        mutationObserver.observe(contentView, {
            attributes: true,
            childList: true,
            subtree: true,
        });

        mutationObserverRef.current = mutationObserver;
    }, [adjustForMaintainVisibleContentPosition, prepareForMaintainVisibleContentPosition, getContentView]);

    useEffect(() => {
        if (!isListRenderedRef.current) {
            return;
        }
        const animationFrame = requestAnimationFrame(() => {
            prepareForMaintainVisibleContentPosition();
            setupMutationObserver();
        });
        return () => {
            cancelAnimationFrame(animationFrame);
        };
    }, [prepareForMaintainVisibleContentPosition, setupMutationObserver]);

    const setMergedRef = useMergeRefs(scrollRef, ref as ForwardedRef<FlatList>);

    const onRef = useCallback(
        (newRef: FlatList) => {
            // Make sure to only call refs and re-attach listeners if the node changed.
            if (newRef == null || newRef === scrollRef.current) {
                return;
            }

            setMergedRef(newRef);
            prepareForMaintainVisibleContentPosition();
            setupMutationObserver();
        },
        [prepareForMaintainVisibleContentPosition, setMergedRef, setupMutationObserver],
    );

    useEffect(() => {
        const mutationObserver = mutationObserverRef.current;
        return () => {
            mutationObserver?.disconnect();
            mutationObserverRef.current = null;
        };
    }, []);

    const emitComposerScrollEvents = useEmitComposerScrollEvents({enabled: true, inverted: restProps.inverted});
    const handleScroll = useCallback(
        (e: NativeSyntheticEvent<NativeScrollEvent>) => {
            onScrollProp?.(e);
            prepareForMaintainVisibleContentPosition();
            emitComposerScrollEvents();
        },
        [emitComposerScrollEvents, onScrollProp, prepareForMaintainVisibleContentPosition],
    );

    return (
        <FlatList
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...restProps}
            maintainVisibleContentPosition={maintainVisibleContentPosition}
            horizontal={horizontal}
            onScroll={handleScroll}
            scrollEventThrottle={1}
            ref={onRef}
            initialNumToRender={Math.max(0, initialNumToRender ?? 0) || undefined}
            onLayout={(e) => {
                isListRenderedRef.current = true;
                if (!mutationObserverRef.current) {
                    prepareForMaintainVisibleContentPosition();
                    setupMutationObserver();
                }
                restProps.onLayout?.(e);
            }}
            contentContainerStyle={[restProps.contentContainerStyle, shouldHideContent && styles.visibilityHidden]}
        />
    );
}

export default MVCPFlatList;
