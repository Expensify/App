import PropTypes from 'prop-types';
import React, {useImperativeHandle, useMemo, useRef, useState} from 'react';
import {View} from 'react-native';
import {createNativeWrapper, GestureHandlerRootView} from 'react-native-gesture-handler';
import PagerView from 'react-native-pager-view';
import Animated, {runOnJS, useAnimatedProps, useAnimatedReaction, useEvent, useHandler, useSharedValue} from 'react-native-reanimated';
import _ from 'underscore';
import refPropTypes from '@components/refPropTypes';
import useThemeStyles from '@styles/useThemeStyles';
import AttachmentCarouselPagerContext from './AttachmentCarouselPagerContext';

const AnimatedPagerView = Animated.createAnimatedComponent(createNativeWrapper(PagerView));

function usePageScrollHandler(handlers, dependencies) {
    const {context, doDependenciesDiffer} = useHandler(handlers, dependencies);
    const subscribeForEvents = ['onPageScroll'];

    return useEvent(
        (event) => {
            'worklet';

            const {onPageScroll} = handlers;
            if (onPageScroll && event.eventName.endsWith('onPageScroll')) {
                onPageScroll(event, context);
            }
        },
        subscribeForEvents,
        doDependenciesDiffer,
    );
}

const noopWorklet = () => {
    'worklet';

    // noop
};

const pagerPropTypes = {
    items: PropTypes.arrayOf(
        PropTypes.shape({
            key: PropTypes.string,
            url: PropTypes.string,
        }),
    ).isRequired,
    renderItem: PropTypes.func.isRequired,
    initialIndex: PropTypes.number,
    onPageSelected: PropTypes.func,
    onTap: PropTypes.func,
    onSwipe: PropTypes.func,
    onSwipeSuccess: PropTypes.func,
    onSwipeDown: PropTypes.func,
    onPinchGestureChange: PropTypes.func,
    forwardedRef: refPropTypes,
    containerWidth: PropTypes.number.isRequired,
    containerHeight: PropTypes.number.isRequired,
};

const pagerDefaultProps = {
    initialIndex: 0,
    onPageSelected: () => {},
    onTap: () => {},
    onSwipe: noopWorklet,
    onSwipeSuccess: () => {},
    onSwipeDown: () => {},
    onPinchGestureChange: () => {},
    forwardedRef: null,
};

function AttachmentCarouselPager({
    items,
    renderItem,
    initialIndex,
    onPageSelected,
    onTap,
    onSwipe = noopWorklet,
    onSwipeSuccess,
    onSwipeDown,
    onPinchGestureChange,
    forwardedRef,
    containerWidth,
    containerHeight,
}) {
    const styles = useThemeStyles();
    const shouldPagerScroll = useSharedValue(true);
    const pagerRef = useRef(null);

    const isScrolling = useSharedValue(false);
    const activeIndex = useSharedValue(initialIndex);

    const pageScrollHandler = usePageScrollHandler(
        {
            onPageScroll: (e) => {
                'worklet';

                activeIndex.value = e.position;
                isScrolling.value = e.offset !== 0;
            },
        },
        [],
    );

    const [activePage, setActivePage] = useState(initialIndex);

    // we use reanimated for this since onPageSelected is called
    // in the middle of the pager animation
    useAnimatedReaction(
        () => isScrolling.value,
        (stillScrolling) => {
            if (stillScrolling) {
                return;
            }

            runOnJS(setActivePage)(activeIndex.value);
        },
    );

    useImperativeHandle(
        forwardedRef,
        () => ({
            setPage: (...props) => pagerRef.current.setPage(...props),
        }),
        [],
    );

    const animatedProps = useAnimatedProps(() => ({
        scrollEnabled: shouldPagerScroll.value,
    }));

    const contextValue = useMemo(
        () => ({
            canvasWidth: containerWidth,
            canvasHeight: containerHeight,
            isScrolling,
            pagerRef,
            shouldPagerScroll,
            onPinchGestureChange,
            onTap,
            onSwipe,
            onSwipeSuccess,
            onSwipeDown,
        }),
        [containerWidth, containerHeight, isScrolling, pagerRef, shouldPagerScroll, onPinchGestureChange, onTap, onSwipe, onSwipeSuccess, onSwipeDown],
    );

    return (
        <GestureHandlerRootView style={styles.flex1}>
            <AttachmentCarouselPagerContext.Provider value={contextValue}>
                <AnimatedPagerView
                    pageMargin={40}
                    offscreenPageLimit={1}
                    onPageScroll={pageScrollHandler}
                    animatedProps={animatedProps}
                    onPageSelected={onPageSelected}
                    ref={pagerRef}
                    style={styles.flex1}
                    initialPage={initialIndex}
                >
                    {_.map(items, (item, index) => (
                        <View
                            key={item.source}
                            style={styles.flex1}
                        >
                            {renderItem({item, index, isActive: index === activePage})}
                        </View>
                    ))}
                </AnimatedPagerView>
            </AttachmentCarouselPagerContext.Provider>
        </GestureHandlerRootView>
    );
}

AttachmentCarouselPager.propTypes = pagerPropTypes;
AttachmentCarouselPager.defaultProps = pagerDefaultProps;
AttachmentCarouselPager.displayName = 'AttachmentCarouselPager';

const AttachmentCarouselPagerWithRef = React.forwardRef((props, ref) => (
    <AttachmentCarouselPager
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...props}
        forwardedRef={ref}
    />
));

AttachmentCarouselPagerWithRef.displayName = 'AttachmentCarouselPagerWithRef';

export default AttachmentCarouselPagerWithRef;
