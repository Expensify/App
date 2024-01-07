import PropTypes from 'prop-types';
import React, {useEffect, useImperativeHandle, useMemo, useRef, useState} from 'react';
import {View} from 'react-native';
import {createNativeWrapper} from 'react-native-gesture-handler';
import PagerView from 'react-native-pager-view';
import Animated, {runOnJS, useAnimatedReaction, useEvent, useHandler, useSharedValue} from 'react-native-reanimated';
import _ from 'underscore';
import CarouselItem from '@components/Attachments/AttachmentCarousel/CarouselItem';
import refPropTypes from '@components/refPropTypes';
import useThemeStyles from '@hooks/useThemeStyles';
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

const pagerPropTypes = {
    items: PropTypes.arrayOf(
        PropTypes.shape({
            key: PropTypes.string,
            url: PropTypes.string,
        }),
    ).isRequired,
    activeSource: PropTypes.string.isRequired,
    initialPage: PropTypes.number,
    scrollEnabled: PropTypes.bool,
    onPageSelected: PropTypes.func,
    onTap: PropTypes.func,
    onScaleChanged: PropTypes.func,
    forwardedRef: refPropTypes,
};

const pagerDefaultProps = {
    initialPage: 0,
    scrollEnabled: true,
    onPageSelected: () => {},
    onTap: () => {},
    onScaleChanged: () => {},
    forwardedRef: null,
};

function AttachmentCarouselPager({items, activeSource, initialPage, scrollEnabled, onPageSelected, onTap, onScaleChanged, forwardedRef}) {
    const styles = useThemeStyles();
    const pagerRef = useRef(null);

    const activePage = useSharedValue(initialPage);
    const [activePageState, setActivePageState] = useState(initialPage);

    // Set active page initially and when initial page changes
    useEffect(() => {
        setActivePageState(initialPage);
        activePage.value = initialPage;
    }, [activePage, initialPage]);

    const itemsMeta = useMemo(() => _.map(items, (item, index) => ({source: item.source, index, isActive: index === activePageState})), [activePageState, items]);

    const isPagerSwiping = useSharedValue(false);
    const pageScrollHandler = usePageScrollHandler(
        {
            onPageScroll: (e) => {
                'worklet';

                activePage.value = e.position;
                isPagerSwiping.value = e.offset !== 0;
            },
        },
        [],
    );

    const [isPagerSwipingState, setPagerSwipingState] = useState(false);
    useAnimatedReaction(
        () => [isPagerSwiping.value],
        (isSwiping) => {
            runOnJS(setPagerSwipingState)(isSwiping);
        },
    );

    const contextValue = useMemo(
        () => ({
            itemsMeta,
            activePage: activePageState,
            isPagerSwiping: isPagerSwipingState,
            onTap,
            onScaleChanged,
            pagerRef,
        }),
        [activePageState, isPagerSwipingState, itemsMeta, onScaleChanged, onTap],
    );

    useImperativeHandle(
        forwardedRef,
        () => ({
            setPage: (...props) => pagerRef.current.setPage(...props),
        }),
        [],
    );

    const Content = useMemo(
        () =>
            _.map(items, (item, index) => (
                <View
                    key={item.source}
                    style={styles.flex1}
                >
                    <CarouselItem
                        item={item}
                        isSingleItem={items.length === 1}
                        index={index}
                        isFocused={index === activePageState && activeSource === item.source}
                    />
                </View>
            )),
        [activePageState, activeSource, items, styles.flex1],
    );

    return (
        <AttachmentCarouselPagerContext.Provider value={contextValue}>
            <AnimatedPagerView
                pageMargin={40}
                offscreenPageLimit={1}
                scrollEnabled={scrollEnabled}
                onPageScroll={pageScrollHandler}
                onPageSelected={onPageSelected}
                style={styles.flex1}
                initialPage={initialPage}
                ref={pagerRef}
            >
                {Content}
            </AnimatedPagerView>
        </AttachmentCarouselPagerContext.Provider>
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
