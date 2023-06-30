import React, {forwardRef} from 'react';
import {View, FlatList} from 'react-native';
import PropTypes from 'prop-types';
import _ from 'underscore';
import BaseInvertedFlatList from './BaseInvertedFlatList';
import styles from '../../styles/styles';
import stylePropTypes from '../../styles/stylePropTypes';

const propTypes = {
    /** Passed via forwardRef so we can access the FlatList ref */
    innerRef: PropTypes.shape({
        current: PropTypes.instanceOf(FlatList),
    }).isRequired,

    /** The style of the footer of the list */
    ListFooterComponentStyle: stylePropTypes,
};

const defaultProps = {
    ListFooterComponentStyle: {},
};

function InvertedCell(props) {
    return (
        <View
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            style={styles.invert}
        />
    );
}

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
                ref={(el) => (this.list = el)}
                // Manually invert the FlatList to circumvent a react-native bug that causes ANR (application not responding) on android 13
                inverted={false}
                style={styles.invert}
                ListFooterComponentStyle={[styles.invert, this.props.ListFooterComponentStyle]}
                verticalScrollbarPosition="left" // We are mirroring the X and Y axis, so we need to swap the scrollbar position
                CellRendererComponent={InvertedCell}
            />
        );
    }
}
InvertedFlatList.propTypes = propTypes;
InvertedFlatList.defaultProps = defaultProps;

export default forwardRef((props, ref) => (
    <InvertedFlatList
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...props}
        innerRef={ref}
    />
));
