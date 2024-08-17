/* eslint-disable es/no-optional-chaining, es/no-nullish-coalescing-operators, react/prop-types */
import type {ForwardedRef, MutableRefObject} from 'react';
import React, {useCallback, useEffect, useMemo, useRef} from 'react';
import type {FlatListProps, NativeScrollEvent, NativeSyntheticEvent} from 'react-native';
import {FlatList} from 'react-native';
import {isMobileSafari} from '@libs/Browser';

// Changing the scroll position during a momentum scroll does not work on mobile Safari.
// We do a best effort to avoid content jumping by using some hacks on mobile Safari only.
const IS_MOBILE_SAFARI = isMobileSafari();

function mergeRefs(...args: Array<MutableRefObject<FlatList> | ForwardedRef<FlatList> | null>) {
    return function forwardRef(node: FlatList) {
        args.forEach((ref) => {
            if (ref == null) {
                return;
            }
            if (typeof ref === 'function') {
                ref(node);
                return;
            }
            if (typeof ref === 'object') {
                // eslint-disable-next-line no-param-reassign
                ref.current = node;
                return;
            }
            console.error(`mergeRefs cannot handle Refs of type boolean, number or string, received ref ${String(ref)}`);
        });
    };
}

function useMergeRefs(...args: Array<MutableRefObject<FlatList> | ForwardedRef<FlatList> | null>) {
    return useMemo(
        () => mergeRefs(...args),
        // eslint-disable-next-line
        [...args],
    );
}

function getScrollableNode(flatList: FlatList | null): HTMLElement | undefined {
    return flatList?.getScrollableNode() as HTMLElement | undefined;
}

function MVCPFlatList<TItem>({maintainVisibleContentPosition, horizontal = false, onScroll, ...props}: FlatListProps<TItem>, ref: ForwardedRef<FlatList>) {
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
        return horizontal ? getScrollableNode(scrollRef.current)?.scrollLeft ?? 0 : getScrollableNode(scrollRef.current)?.scrollTop ?? 0;
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
        if (contentView == null) {
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

    const adjustForMaintainVisibleContentPosition = useCallback(() => {
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
                scrollToOffset(0, true, false);
            }
        }
    }, [scrollToOffset, mvcpMinIndexForVisible, horizontal]);

    const setupMutationObserver = useCallback(() => {
        const contentView = getContentView();
        if (contentView == null) {
            return;
        }

        mutationObserverRef.current?.disconnect();

        const mutationObserver = new MutationObserver((mutations) => {
            // Check if the first visible view is removed and re-calculate it
            // if needed.
            mutations.forEach((mutation) => {
                mutation.removedNodes.forEach((node) => {
                    if (node !== firstVisibleViewRef.current) {
                        return;
                    }
                    firstVisibleViewRef.current = null;
                });
            });

            if (firstVisibleViewRef.current == null) {
                prepareForMaintainVisibleContentPosition();
            }

            // When the list is hidden, the size will be 0.
            // Ignore the callback if the list is hidden because scrollOffset will always be 0.
            if (!getScrollableNode(scrollRef.current)?.clientHeight) {
                return;
            }

            adjustForMaintainVisibleContentPosition();
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

    const setMergedRef = useMergeRefs(scrollRef, ref);

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

    const onScrollInternal = useCallback(
        (event: NativeSyntheticEvent<NativeScrollEvent>) => {
            prepareForMaintainVisibleContentPosition();

            onScroll?.(event);
        },
        [prepareForMaintainVisibleContentPosition, onScroll],
    );

    return (
        <FlatList
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            maintainVisibleContentPosition={maintainVisibleContentPosition}
            horizontal={horizontal}
            onScroll={onScrollInternal}
            scrollEventThrottle={1}
            ref={onRef}
            onLayout={(e) => {
                isListRenderedRef.current = true;
                if (!mutationObserverRef.current) {
                    prepareForMaintainVisibleContentPosition();
                    setupMutationObserver();
                }
                props.onLayout?.(e);
            }}
        />
    );
}

MVCPFlatList.displayName = 'MVCPFlatList';

export default React.forwardRef(MVCPFlatList);
