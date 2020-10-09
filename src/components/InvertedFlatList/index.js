import React, {
    useRef,
    forwardRef
} from 'react';
import PropTypes from 'prop-types';
import BaseInvertedFlatList from './BaseInvertedFlatList';

const propTypes = {
    // Passed via forwardRef so we can access the FlatList ref
    innerRef: PropTypes.func.isRequired,
};

// This is copied from https://codesandbox.io/s/react-native-dsyse
// It's a HACK alert since FlatList has inverted scrolling on web
const InvertedFlatList = (props) => {
    const ref = useRef(null);
    props.innerRef(ref.current);
    return (
        <BaseInvertedFlatList
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            ref={ref}
        />
    );
};

InvertedFlatList.propTypes = propTypes;

export default forwardRef((props, ref) => (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <InvertedFlatList {...props} innerRef={ref} />
));
