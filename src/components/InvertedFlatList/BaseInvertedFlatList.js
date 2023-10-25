import React, {forwardRef, useCallback, useRef} from 'react';
import {View, FlatList as NativeFlatlist} from 'react-native';
import _ from 'underscore';
import PropTypes from 'prop-types';
import * as CollectionUtils from '../../libs/CollectionUtils';
import FlatList from '../FlatList';

const propTypes = {
    /** Same as FlatList can be any array of anything */
    // eslint-disable-next-line react/forbid-prop-types
    data: PropTypes.arrayOf(PropTypes.any),

    /** Same as FlatList although we wrap it in a measuring helper before passing to the actual FlatList component */
    renderItem: PropTypes.func.isRequired,

    /** This must be set to the minimum size of one of the renderItem rows. Web experiences issues when inaccurate. */
    initialRowHeight: PropTypes.number.isRequired,

    /** Passed via forwardRef so we can access the FlatList ref */
    innerRef: PropTypes.oneOfType([PropTypes.func, PropTypes.shape({current: PropTypes.instanceOf(NativeFlatlist)})]).isRequired,

    /** Should we measure these items and call getItemLayout? */
    shouldMeasureItems: PropTypes.bool,
};

const defaultProps = {
    data: [],
    shouldMeasureItems: false,
};

function BaseInvertedFlatList(props) {
    const {initialRowHeight, shouldMeasureItems, innerRef, renderItem} = props;

    // Stores each item's computed height after it renders
    // once and is then referenced for the life of this component.
    // This is essential to getting FlatList inverted to work on web
    // and also enables more predictable scrolling on native platforms.
    const sizeMap = useRef({});

    /**
     * Return default or previously cached height for
     * a renderItem row
     *
     * @param {*} data
     * @param {Number} index
     *
     * @return {Object}
     */
    const getItemLayout = (data, index) => {
        const size = sizeMap.current[index];

        if (size) {
            return {
                length: size.length,
                offset: size.offset,
                index,
            };
        }

        // If we don't have a size yet means we haven't measured this
        // item yet. However, we can still calculate the offset by looking
        // at the last size we have recorded (if any)
        const lastMeasuredItem = CollectionUtils.lastItem(sizeMap.current);

        return {
            // We haven't measured this so we must return the minimum row height
            length: initialRowHeight,

            // Offset will either be based on the lastMeasuredItem or the index +
            // initialRowHeight since we can only assume that all previous items
            // have not yet been measured
            offset: _.isUndefined(lastMeasuredItem) ? initialRowHeight * index : lastMeasuredItem.offset + initialRowHeight,
            index,
        };
    };

    /**
     * Measure item and cache the returned length (a.k.a. height)
     *
     * @param {React.NativeSyntheticEvent} nativeEvent
     * @param {Number} index
     */
    const measureItemLayout = useCallback((nativeEvent, index) => {
        const computedHeight = nativeEvent.layout.height;

        // We've already measured this item so we don't need to
        // measure it again.
        if (sizeMap.current[index]) {
            return;
        }

        const previousItem = sizeMap.current[index - 1] || {};

        // If there is no previousItem this can mean we haven't yet measured
        // the previous item or that we are at index 0 and there is no previousItem
        const previousLength = previousItem.length || 0;
        const previousOffset = previousItem.offset || 0;
        sizeMap.current[index] = {
            length: computedHeight,
            offset: previousLength + previousOffset,
        };
    }, []);

    /**
     * Render item method wraps the prop renderItem to render in a
     * View component so we can attach an onLayout handler and
     * measure it when it renders.
     *
     * @param {Object} params
     * @param {Object} params.item
     * @param {Number} params.index
     *
     * @return {React.Component}
     */
    const renderItemFromProp = useCallback(
        ({item, index}) => {
            if (shouldMeasureItems) {
                return <View onLayout={({nativeEvent}) => measureItemLayout(nativeEvent, index)}>{renderItem({item, index})}</View>;
            }

            return renderItem({item, index});
        },
        [shouldMeasureItems, measureItemLayout, renderItem],
    );

    return (
        <FlatList
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            ref={innerRef}
            renderItem={renderItemFromProp}
            // Native platforms do not need to measure items and work fine without this.
            // Web requires that items be measured or else crazy things happen when scrolling.
            getItemLayout={shouldMeasureItems ? getItemLayout : undefined}
            windowSize={15}
            maintainVisibleContentPosition={{
                minIndexForVisible: 0,
            }}
            inverted
        />
    );
}

BaseInvertedFlatList.propTypes = propTypes;
BaseInvertedFlatList.defaultProps = defaultProps;
BaseInvertedFlatList.displayName = 'BaseInvertedFlatList';

const BaseInvertedFlatListWithRef = forwardRef((props, ref) => (
    <BaseInvertedFlatList
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...props}
        innerRef={ref}
    />
));

BaseInvertedFlatListWithRef.displayName = 'BaseInvertedFlatListWithRef';

export default BaseInvertedFlatListWithRef;
