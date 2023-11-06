/* eslint-disable es/no-optional-chaining, es/no-nullish-coalescing-operators, react/prop-types */
import PropTypes from 'prop-types';
import React from 'react';
import {FlatList} from 'react-native';

function mergeRefs(...args) {
    return function forwardRef(node) {
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

function useMergeRefs(...args) {
    return React.useMemo(
        () => mergeRefs(...args),
        // eslint-disable-next-line
        [...args],
    );
}

const MVCPFlatList = React.forwardRef(({maintainVisibleContentPosition, horizontal, inverted, onScroll, ...props}, forwardedRef) => {
    const {minIndexForVisible: mvcpMinIndexForVisible, autoscrollToTopThreshold: mvcpAutoscrollToTopThreshold} = maintainVisibleContentPosition ?? {};
    const scrollRef = React.useRef(null);
    const prevFirstVisibleOffsetRef = React.useRef(null);
    const firstVisibleViewRef = React.useRef(null);
    const mutationObserverRef = React.useRef(null);
    const lastScrollOffsetRef = React.useRef(0);

    const getScrollOffset = React.useCallback(() => {
        if (scrollRef.current == null) {
            return 0;
        }
        return horizontal ? scrollRef.current.getScrollableNode().scrollLeft : scrollRef.current.getScrollableNode().scrollTop;
    }, [horizontal]);

    const getContentView = React.useCallback(() => scrollRef.current?.getScrollableNode().childNodes[0], []);

    const scrollToOffset = React.useCallback(
        (offset, animated) => {
            const behavior = animated ? 'smooth' : 'instant';
            scrollRef.current?.getScrollableNode().scroll(horizontal ? {left: offset, behavior} : {top: offset, behavior});
        },
        [horizontal],
    );

    const prepareForMaintainVisibleContentPosition = React.useCallback(() => {
        if (mvcpMinIndexForVisible == null) {
            return;
        }

        const contentView = getContentView();
        if (contentView == null) {
            return;
        }

        const scrollOffset = getScrollOffset();

        const contentViewLength = contentView.childNodes.length;
        for (let i = mvcpMinIndexForVisible; i < contentViewLength; i++) {
            const subview = contentView.childNodes[inverted ? contentViewLength - i - 1 : i];
            const subviewOffset = horizontal ? subview.offsetLeft : subview.offsetTop;
            if (subviewOffset > scrollOffset || i === contentViewLength - 1) {
                prevFirstVisibleOffsetRef.current = subviewOffset;
                firstVisibleViewRef.current = subview;
                break;
            }
        }
    }, [getContentView, getScrollOffset, mvcpMinIndexForVisible, horizontal, inverted]);

    const adjustForMaintainVisibleContentPosition = React.useCallback(() => {
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
            if (mvcpAutoscrollToTopThreshold != null && scrollOffset <= mvcpAutoscrollToTopThreshold) {
                scrollToOffset(0, true);
            }
        }
    }, [getScrollOffset, scrollToOffset, mvcpMinIndexForVisible, mvcpAutoscrollToTopThreshold, horizontal]);

    const setupMutationObserver = React.useCallback(() => {
        const contentView = getContentView();
        if (contentView == null) {
            return;
        }

        mutationObserverRef.current?.disconnect();

        const mutationObserver = new MutationObserver(() => {
            // Chrome adjusts scroll position when elements are added at the top of the
            // view. We want to have the same behavior as react-native / Safari so we
            // reset the scroll position to the last value we got from an event.
            const lastScrollOffset = lastScrollOffsetRef.current;
            const scrollOffset = getScrollOffset();
            if (lastScrollOffset !== scrollOffset) {
                scrollToOffset(lastScrollOffset, false);
            }

            // This needs to execute after scroll events are dispatched, but
            // in the same tick to avoid flickering. rAF provides the right timing.
            requestAnimationFrame(() => {
                adjustForMaintainVisibleContentPosition();
            });
        });
        mutationObserver.observe(contentView, {
            attributes: true,
            childList: true,
            subtree: true,
        });

        mutationObserverRef.current = mutationObserver;
    }, [adjustForMaintainVisibleContentPosition, getContentView, getScrollOffset, scrollToOffset]);

    React.useEffect(() => {
        prepareForMaintainVisibleContentPosition();
        setupMutationObserver();
    }, [prepareForMaintainVisibleContentPosition, setupMutationObserver]);

    const setMergedRef = useMergeRefs(scrollRef, forwardedRef);

    const onRef = React.useCallback(
        (newRef) => {
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

    React.useEffect(() => {
        const mutationObserver = mutationObserverRef.current;
        return () => {
            mutationObserver?.disconnect();
        };
    }, []);

    const onScrollInternal = React.useCallback(
        (ev) => {
            lastScrollOffsetRef.current = getScrollOffset();

            prepareForMaintainVisibleContentPosition();

            onScroll?.(ev);
        },
        [getScrollOffset, prepareForMaintainVisibleContentPosition, onScroll],
    );

    return (
        <FlatList
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            horizontal={horizontal}
            inverted={inverted}
            onScroll={onScrollInternal}
            scrollEventThrottle={1}
            ref={onRef}
        />
    );
});

MVCPFlatList.displayName = 'MVCPFlatList';
MVCPFlatList.propTypes = {
    maintainVisibleContentPosition: PropTypes.shape({
        minIndexForVisible: PropTypes.number.isRequired,
        autoscrollToTopThreshold: PropTypes.number,
    }),
    horizontal: PropTypes.bool,
};

MVCPFlatList.defaultProps = {
    maintainVisibleContentPosition: null,
    horizontal: false,
};

export default MVCPFlatList;
