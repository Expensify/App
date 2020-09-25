import React, {forwardRef, Component} from 'react';
import _ from 'underscore';
import lodashGet from 'lodash.get';
import PropTypes from 'prop-types';
import {FlatList} from 'react-native';

const INITIAL_ROW_HEIGHT = 42;

const propTypes = {
    // Same as FlatList can be any array of anything
    data: PropTypes.arrayOf(PropTypes.any),

    // Ref to the underlying FlatList component
    innerRef: PropTypes.func.isRequired,

    // Similar to FlatList renderItem however also
    // passed an onLayout and needsLayoutCalculation
    // property that must be implemented by the component
    // being rendered
    renderItem: PropTypes.func.isRequired,
};

const defaultProps = {
    data: [],
};

class InvertedFlatList extends Component {
    constructor(props) {
        super(props);

        // Stores each item's computed height and offset after it
        // renders once and is referenced for the life of the component.
        // This is essential to getting FlatList inverted to work on web
        // and also enables more predictable scrolling on mobile.
        this.sizeMap = {};
    }

    render() {
        return (
            <FlatList
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...this.props}
                ref={this.props.innerRef}
                inverted
                getItemLayout={(data, index) => {
                    const size = this.sizeMap[index] || {};
                    return {
                        length: size.length || INITIAL_ROW_HEIGHT,
                        offset: size.offset || (INITIAL_ROW_HEIGHT * index),
                        index
                    };
                }}
                renderItem={({item, index}) => this.props.renderItem({
                    item,
                    index,
                    onLayout: ({nativeEvent}) => {
                        const computedHeight = nativeEvent.layout.height;
                        if (this.sizeMap[index]) {
                            return;
                        }
                        const prevHeight = lodashGet(this.sizeMap, [index - 1, 'height'], 0);
                        const prevOffset = lodashGet(this.sizeMap, [index - 1, 'offset'], 0);
                        this.sizeMap[index] = {
                            length: computedHeight,
                            offset: prevOffset + prevHeight,
                        };
                    },
                    needsLayoutCalculation: _.isUndefined(this.sizeMap[index]),
                })}
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
