import React, {
    forwardRef,
} from 'react';
import PropTypes from 'prop-types';
import {FlatList, StyleSheet} from 'react-native';
import _ from 'underscore';
import BaseInvertedFlatList from './BaseInvertedFlatList';
import styles from '../../styles/styles';

const propTypes = {
    /** Passed via forwardRef so we can access the FlatList ref */
    innerRef: PropTypes.shape({
        current: PropTypes.instanceOf(FlatList),
    }).isRequired,

    /** Any additional styles to apply */
    // eslint-disable-next-line react/forbid-prop-types
    contentContainerStyle: PropTypes.any,
};

// This is adapted from https://codesandbox.io/s/react-native-dsyse
// It's a HACK alert since FlatList has inverted scrolling on web
class InvertedFlatList extends React.Component {
    constructor(props) {
        super(props);

        this.invertedWheelEvent = this.invertedWheelEvent.bind(this);
        this.list = undefined;
    }

    componentDidMount() {
        if (!_.isFunction(this.props.innerRef)) {
            // eslint-disable-next-line no-param-reassign
            this.props.innerRef.current = this.list;
        } else {
            this.props.innerRef(this.list);
        }

        if (!this.list) {
            return;
        }

        this.list
            .getScrollableNode()
            .addEventListener('wheel', this.invertedWheelEvent);
    }

    componentWillUnmount() {
        this.list.getScrollableNode()
            .removeEventListener('wheel', this.invertedWheelEvent);
    }

    invertedWheelEvent(e) {
        this.list.getScrollableNode().scrollTop -= e.deltaY;
        e.preventDefault();
    }

    render() {
        return (
            <BaseInvertedFlatList
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...this.props}
                ref={el => this.list = el}
                shouldMeasureItems
                contentContainerStyle={StyleSheet.compose(this.props.contentContainerStyle, styles.justifyContentEnd)}
                style={{transform: [{translateX: 0}, {translateY: 0}, {scaleY: -1}]}}
            />
        );
    }
}

InvertedFlatList.propTypes = propTypes;
InvertedFlatList.defaultProps = {
    contentContainerStyle: {},
};

export default forwardRef((props, ref) => (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <InvertedFlatList {...props} innerRef={ref} />
));
