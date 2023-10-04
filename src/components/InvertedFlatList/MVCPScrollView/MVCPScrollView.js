import React, {forwardRef, useEffect, useRef} from 'react';
import {ScrollView, StyleSheet} from 'react-native';
import PropTypes from 'prop-types';


const MVCPScrollView = forwardRef(({maintainVisibleContentPosition, horizontal, ...props}, ref) => {
    const scrollViewRef = useRef(null);
    const prevFirstVisibleOffset = useRef(null);
    const firstVisibleView = useRef(null);
    const mutationObserver = useRef(null);

    const getContentView = () => scrollViewRef.current?.childNodes[0];

    const prepareForMaintainVisibleContentPosition = () => {
        if (maintainVisibleContentPosition == null || scrollViewRef.current == null) {
            return;
        }

        const contentView = getContentView();
        const minIdx = maintainVisibleContentPosition.minIndexForVisible;
        for (let ii = minIdx; ii < contentView.childNodes.length; ii++) {
            const subview = contentView.childNodes[ii];
            const hasNewView = horizontal ? subview.offsetLeft > scrollViewRef.current.scrollLeft : subview.offsetTop > scrollViewRef.current.scrollTop;
            if (hasNewView || ii === contentView.childNodes.length - 1) {
                prevFirstVisibleOffset.current = horizontal ? subview.offsetLeft : subview.offsetTop;
                firstVisibleView.current = subview;
                break;
            }
        }
    };
    const scrollEventListener = useRef(() => {
        prepareForMaintainVisibleContentPosition();
    });

    const adjustForMaintainVisibleContentPosition = () => {
        if (maintainVisibleContentPosition == null || scrollViewRef.current == null || firstVisibleView.current == null || prevFirstVisibleOffset.current == null) {
            return;
        }

        const autoscrollThreshold = maintainVisibleContentPosition.autoscrollToTopThreshold;
        if (horizontal) {
            const deltaX = firstVisibleView.current.offsetLeft - prevFirstVisibleOffset.current;
            if (Math.abs(deltaX) > 0.5) {
                const x = scrollViewRef.current.scrollLeft;
                prevFirstVisibleOffset.current = firstVisibleView.current.offsetLeft;
                scrollViewRef.current.scrollTo({x: x + deltaX, animated: false});
                if (autoscrollThreshold != null && x <= autoscrollThreshold) {
                    scrollViewRef.current.scrollTo({x: 0, animated: true});
                }
            }
        } else {
            const deltaY = firstVisibleView.current.offsetTop - prevFirstVisibleOffset.current;
            if (Math.abs(deltaY) > 0.5) {
                const y = scrollViewRef.current.scrollTop;
                prevFirstVisibleOffset.current = firstVisibleView.current.offsetTop;
                scrollViewRef.current.scrollTo({y: y + deltaY, animated: false});
                if (autoscrollThreshold != null && y <= autoscrollThreshold) {
                    scrollViewRef.current.scrollTo({y: 0, animated: true});
                }
            }
        }
    };

    if (mutationObserver.current == null) {
        mutationObserver.current = new MutationObserver(() => {
            // This needs to execute after scroll events are dispatched, but
            // in the same tick to avoid flickering. rAF provides the right timing.
            requestAnimationFrame(adjustForMaintainVisibleContentPosition);
        });
    }

    const onRef = (newRef) => {
        scrollViewRef.current = newRef;
        if (typeof ref === 'function') {
            ref(newRef);
        } else {
            // eslint-disable-next-line no-param-reassign
            ref.current = newRef;
        }
        prepareForMaintainVisibleContentPosition();
        mutationObserver.current.disconnect();
        mutationObserver.current.observe(getContentView(), {
            attributes: true,
            childList: true,
            subtree: true,
        });
        newRef.removeEventListener('scroll', scrollEventListener.current);
        newRef.addEventListener('scroll', scrollEventListener.current);
    };

    useEffect(() => {
        const currentObserver = mutationObserver.current;
        const currentScrollEventListener = scrollEventListener.current;
        return () => {
            currentObserver.disconnect();
            scrollViewRef.current.removeEventListener('scroll', currentScrollEventListener);
        };
    }, []);

    return (
        <ScrollView
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            inverted
            // style={[props.style, styles.inverted]} 
            // style={styles.inverted} 
            horizontal={horizontal}
            ref={onRef}
        />
    );
});

const styles = StyleSheet.create({
  inverted: {
    transform: [{ scaleY: -1 }],
  },
});


MVCPScrollView.propTypes = {
  maintainVisibleContentPosition: PropTypes.shape({
      minIndexForVisible: PropTypes.number.isRequired,
      autoscrollToTopThreshold: PropTypes.number,
  }),
  horizontal: PropTypes.bool,
};

export default MVCPScrollView;
