import React from 'react';
import {useStartProfiler} from '@shopify/react-native-performance';
import PropTypes from 'prop-types';
import getComponentDisplayName from '../getComponentDisplayName';

const withStartProfiler = (WrappedComponent) => {
    const WithStartProfiler = (props) => {
        const startProfiler = useStartProfiler();

        // eslint-disable-next-line react/jsx-props-no-spreading
        return <WrappedComponent {...props} startProfiler={startProfiler} />;
    };

    WithStartProfiler.displayName = `withStartProfiler(${getComponentDisplayName(WrappedComponent)})`;
    WithStartProfiler.propTypes = {
        forwardedRef: PropTypes.oneOfType([
            PropTypes.func,
            PropTypes.shape({current: PropTypes.instanceOf(React.Component)}),
        ]),
    };
    WithStartProfiler.defaultProps = {
        forwardedRef: undefined,
    };
    return React.forwardRef((props, ref) => (
        // eslint-disable-next-line react/jsx-props-no-spreading
        <WithStartProfiler {...props} forwardedRef={ref} />
    ));
};

const withStartProfilerPropTypes = {
    startProfiler: PropTypes.func.isRequired,
};

export default withStartProfiler;
export {withStartProfilerPropTypes};
