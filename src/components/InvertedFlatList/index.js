import React, {
    forwardRef,
} from 'react';
import PropTypes from 'prop-types';
import {FlatList} from 'react-native';
import _ from 'underscore';
import BaseInvertedFlatList from './BaseInvertedFlatList';

const propTypes = {
    /** Passed via forwardRef so we can access the FlatList ref */
    innerRef: PropTypes.shape({
        current: PropTypes.instanceOf(FlatList),
    }).isRequired,
};

class InvertedFlatList extends React.Component {
    constructor(props) {
        super(props);

        this.list = undefined;
    }

    componentDidMount() {
        if (!_.isFunction(this.props.innerRef)) {
            // eslint-disable-next-line no-param-reassign
            this.props.innerRef.current = this.list;
        } else {
            this.props.innerRef(this.list);
        }
    }

    render() {
        return (
            <BaseInvertedFlatList
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...this.props}
                ref={el => this.list = el}
                shouldMeasureItems
            />
        );
    }
}

InvertedFlatList.propTypes = propTypes;

export default forwardRef((props, ref) => (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <InvertedFlatList {...props} innerRef={ref} />
));
