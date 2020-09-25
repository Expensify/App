import React, {forwardRef, Component} from 'react';
import PropTypes from 'prop-types';
import {FlatList, View} from 'react-native';

const INITIAL_ROW_HEIGHT = 42;

const propTypes = {
    // Same as FlatList can be any array of anything
    data: PropTypes.arrayOf(PropTypes.any),

    // Ref to the underlying FlatList component
    innerRef: PropTypes.func.isRequired,

    // Same as FlatList although we wrap it in a measuring helper
    // before passing to the actual FlatList component
    renderItem: PropTypes.func.isRequired,
};

const defaultProps = {
    data: [],
};

class InvertedFlatList extends Component {
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
        const size = this.sizeMap[index] || {};
        return {
            length: size.length || INITIAL_ROW_HEIGHT,
            offset: INITIAL_ROW_HEIGHT * index,
            index
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
        if (this.sizeMap[index]) {
            return;
        }
        this.sizeMap[index] = {
            length: computedHeight,
        };
    }

    /**
     * Render item method wraps the real itm to render in a
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
        return (
            <View onLayout={({nativeEvent}) => this.measureItemLayout(nativeEvent, index)}>
                {this.props.renderItem({item, index})}
            </View>
        );
    }

    render() {
        return (
            <FlatList
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...this.props}
                ref={this.props.innerRef}
                inverted
                renderItem={this.renderItem}
                getItemLayout={this.getItemLayout}
            />
        );
    }
}

InvertedFlatList.propTypes = propTypes;
InvertedFlatList.defaultProps = defaultProps;

export default forwardRef((props, ref) => (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <InvertedFlatList {...props} innerRef={ref} />
));
