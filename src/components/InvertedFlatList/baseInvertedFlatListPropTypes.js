import PropTypes from 'prop-types';
import {FlatList} from 'react-native';

const propTypes = {
    /** Passed via forwardRef so we can access the FlatList ref */
    innerRef: PropTypes.shape({
        current: PropTypes.instanceOf(FlatList),
    }).isRequired,

    /** Any additional styles to apply */
    contentContainerStyle: PropTypes.any,

    /** Same as for FlatList */
    onScroll: PropTypes.func,

    /** Handler called when the scroll actions ends */
    onScrollEnd: PropTypes.func,
};

const defaultProps = {
    contentContainerStyle: {},
    onScroll: () => {},
    onScrollEnd: () => {},
};

export {propTypes, defaultProps};
