/* eslint-disable react/jsx-props-no-multi-spaces */
import _ from 'underscore';
import React, {forwardRef, Component} from 'react';
import PropTypes from 'prop-types';
import {FlatList, View} from 'react-native';
import * as CollectionUtils from '../../libs/CollectionUtils';

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

    /** Padding that we should account for in our sizeMap */
    measurementPadding: PropTypes.number,

    /** Callback for when measurement is done */
    onMeasurementEnd: PropTypes.func,
};

const defaultProps = {
    data: [],
    shouldMeasureItems: false,
    shouldRemoveClippedSubviews: false,
    measurementPadding: 0,
    onMeasurementEnd: () => {},
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

    componentDidMount() {
        if (this.props.shouldMeasureItems) {
            return;
        }

        // For native devices since we're not measuring let's make this callback sooner.
        this.props.onMeasurementEnd();
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
        const lastMeasuredItem = CollectionUtils.lastItem(this.sizeMap);

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

        // Before an item is rendered on screen its possible its computedHeight is 0 so let's return early and once its rendered it will it this method again with proper values.
        if (computedHeight === 0) {
            return;
        }

        // We've already measured this item so we don't need to measure it again.
        if (this.sizeMap[index]) {
            return;
        }

        this.sizeMap[index] = {
            length: computedHeight,
        };

        if (_.size(this.sizeMap) === this.props.data.length) {
            // All items have been measured so update the offset now that we have all heights
            for (let i = 0; i < this.props.data.length; i++) {
                // If there is no previousItem we are at index 0 and there is no previousItem
                const previousItem = this.sizeMap[i - 1] || {};

                if (i === 0 && this.props.measurementPadding) {
                    this.sizeMap[0].length += this.props.measurementPadding;
                }

                const previousLength = previousItem.length || 0;
                const previousOffset = previousItem.offset || 0;
                this.sizeMap[i].offset = previousLength + previousOffset;
            }
            this.props.onMeasurementEnd();
        }
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

                // We keep this property very low so that chat switching remains fast
                maxToRenderPerBatch={1}
                windowSize={15}
                removeClippedSubviews={this.props.shouldRemoveClippedSubviews}
                maintainVisibleContentPosition={{minIndexForVisible: 0, autoscrollToTopThreshold: 0}}
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
