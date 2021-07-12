/* eslint-disable react/jsx-props-no-multi-spaces */
import _ from 'underscore';
import React, {forwardRef, Component} from 'react';
import PropTypes from 'prop-types';
import {FlatList, View} from 'react-native';
import {lastItem} from '../../libs/CollectionUtils';

const propTypes = {
    /** Same as FlatList can be any array of anything */
    data: PropTypes.arrayOf(PropTypes.any),

    /** Same as FlatList although we wrap it in a measuring helper before passing to the actual FlatList component */
    renderItem: PropTypes.func.isRequired,

    /** This must be set to the minimum size of one of the renderItem rows. Web experiences issues when inaccurate. */
    initialRowHeight: PropTypes.number.isRequired,

    /** Passed via forwardRef so we can access the FlatList ref */
    innerRef: PropTypes.oneOfType([
        PropTypes.func,
        PropTypes.shape({current: PropTypes.instanceOf(FlatList)}),
    ]).isRequired,

    /** Should we measure these items and call getItemLayout? */
    shouldMeasureItems: PropTypes.bool,

    /** Should we remove the clipped sub views? */
    shouldRemoveClippedSubviews: PropTypes.bool,
};

const defaultProps = {
    data: [],
    shouldMeasureItems: false,
    shouldRemoveClippedSubviews: false,
};

class BaseInvertedFlatList extends Component {
    constructor(props) {
        super(props);

        this.renderItem = this.renderItem.bind(this);
        this.getItemLayout = this.getItemLayout.bind(this);

        // Stores each item's computed height after it renders
        // once and is then referenced for the life of this component.
        // This is essential to getting FlatList inverted to work on web
        // and also enables more predictable scrolling on native platforms.
        this.sizeMap = {};
    }

    /**
     * Return default or previously cached height for
     * a renderItem row
     *
     * @param {*} data
     * @param {Number} index
     *
     * @return {Object}
     */
    getItemLayout(data, index) {
        const size = this.sizeMap[index];

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
        const lastMeasuredItem = lastItem(this.sizeMap);

        return {
            // We haven't measured this so we must return the minimum row height
            length: this.props.initialRowHeight,

            // Offset will either be based on the lastMeasuredItem or the index +
            // initialRowHeight since we can only assume that all previous items
            // have not yet been measured
            offset: _.isUndefined(lastMeasuredItem)
                ? this.props.initialRowHeight * index
                : lastMeasuredItem.offset + this.props.initialRowHeight,
            index,
        };
    }

    /**
     * Measure item and cache the returned length (a.k.a. height)
     *
     * @param {React.NativeSyntheticEvent} nativeEvent
     * @param {Number} index
     */
    measureItemLayout(nativeEvent, index) {
        const computedHeight = nativeEvent.layout.height;

        // We've already measured this item so we don't need to
        // measure it again.
        if (this.sizeMap[index]) {
            return;
        }

        const previousItem = this.sizeMap[index - 1] || {};

        // If there is no previousItem this can mean we haven't yet measured
        // the previous item or that we are at index 0 and there is no previousItem
        const previousLength = previousItem.length || 0;
        const previousOffset = previousItem.offset || 0;
        this.sizeMap[index] = {
            length: computedHeight,
            offset: previousLength + previousOffset,
        };
    }

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
    renderItem({item, index}) {
        if (this.props.shouldMeasureItems) {
            return (
                <View onLayout={({nativeEvent}) => this.measureItemLayout(nativeEvent, index)}>
                    {this.props.renderItem({item, index})}
                </View>
            );
        }

        return this.props.renderItem({item, index});
    }

    render() {
        return (
            <FlatList
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...this.props}
                ref={this.props.innerRef}
                inverted
                renderItem={this.renderItem}

                // Native platforms do not need to measure items and work fine without this.
                // Web requires that items be measured or else crazy things happen when scrolling.
                getItemLayout={this.props.shouldMeasureItems ? this.getItemLayout : undefined}
                bounces={false}

                // We keep this property very low so that chat switching remains fast
                maxToRenderPerBatch={1}
                windowSize={15}
                removeClippedSubviews={this.props.shouldRemoveClippedSubviews}
            />
        );
    }
}

BaseInvertedFlatList.propTypes = propTypes;
BaseInvertedFlatList.defaultProps = defaultProps;

export default forwardRef((props, ref) => (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <BaseInvertedFlatList {...props} innerRef={ref} />
));
