import React, {
    useEffect,
    forwardRef,
} from 'react';
import PropTypes from 'prop-types';

const propTypes = {
    children: PropTypes.oneOfType([
        PropTypes.arrayOf(PropTypes.node),
        PropTypes.node,
    ]).isRequired,
    onRender: PropTypes.func,
};
const defaultProps = {
    onRender: () => {},
};

export default function InvertedFlatListItem(props) {
    useEffect(() => {
        if (props.onRender) {
            setTimeout(() => {
                props.onRender();
            }, 1000);

        }
    }, []);

    return (
        <>
            {Array.isArray(props.children) ? {...props.children} : props.children}
        </>
    );
}

InvertedFlatListItem.propTypes = propTypes;
InvertedFlatListItem.defaultProps = defaultProps;
