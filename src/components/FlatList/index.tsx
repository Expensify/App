/* eslint-disable es/no-optional-chaining, es/no-nullish-coalescing-operators, react/prop-types */
import type {ForwardedRef, MutableRefObject} from 'react';
import React, {useCallback, useEffect, useMemo, useRef} from 'react';
import type {FlatListProps, NativeScrollEvent, NativeSyntheticEvent} from 'react-native';
import {FlatList} from 'react-native';

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
        (offset: number, animated: boolean) => {
            const behavior = animated ? 'smooth' : 'instant';
            getScrollableNode(scrollRef.current)?.scroll(horizontal ? {left: offset, behavior} : {top: offset, behavior});
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
        if (firstVisibleView == null || prevFirstVisibleOffset == null) {
            return;
        }

        const firstVisibleViewOffset = horizontal ? firstVisibleView.offsetLeft : firstVisibleView.offsetTop;
        const delta = firstVisibleViewOffset - prevFirstVisibleOffset;
        if (Math.abs(delta) > 0.5) {
            const scrollOffset = getScrollOffset();
            prevFirstVisibleOffsetRef.current = firstVisibleViewOffset;
            scrollToOffset(scrollOffset + delta, false);
            if (mvcpAutoscrollToTopThresholdRef.current != null && scrollOffset <= mvcpAutoscrollToTopThresholdRef.current) {
                scrollToOffset(0, true);
            }
        }
    }, [getScrollOffset, scrollToOffset, mvcpMinIndexForVisible, horizontal]);

    const setupMutationObserver = useCallback(() => {
        const contentView = getContentView();
        if (contentView == null) {
            return;
        }

        mutationObserverRef.current?.disconnect();

        const mutationObserver = new MutationObserver(() => {
            // This needs to execute after scroll events are dispatched, but
            // in the same tick to avoid flickering. rAF provides the right timing.
            requestAnimationFrame(() => {
                // Chrome adjusts scroll position when elements are added at the top of the
                // view. We want to have the same behavior as react-native / Safari so we
                // reset the scroll position to the last value we got from an event.
                const lastScrollOffset = lastScrollOffsetRef.current;
                const scrollOffset = getScrollOffset();
                if (lastScrollOffset !== scrollOffset) {
                    scrollToOffset(lastScrollOffset, false);
                }

                adjustForMaintainVisibleContentPosition();
                prepareForMaintainVisibleContentPosition();
            });
        });
        mutationObserver.observe(contentView, {
            attributes: true,
            childList: true,
            subtree: true,
        });

        mutationObserverRef.current = mutationObserver;
    }, [adjustForMaintainVisibleContentPosition, prepareForMaintainVisibleContentPosition, getContentView, getScrollOffset, scrollToOffset]);

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
