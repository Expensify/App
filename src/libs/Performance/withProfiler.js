import React from 'react';
import {useResetFlow, useStartProfiler} from '@shopify/react-native-performance';
import PropTypes from 'prop-types';
import getComponentDisplayName from '../getComponentDisplayName';

const withProfiler = (WrappedComponent) => {
    const WithProfiler = (props) => {
        const startProfiler = useStartProfiler();
        const {resetFlow, componentInstanceId} = useResetFlow();

        return (
            <WrappedComponent
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...props}
                startProfiler={startProfiler}
                resetFlow={resetFlow}
                componentInstanceId={componentInstanceId}
            />
        );
    };

    WithProfiler.displayName = `withProfiler(${getComponentDisplayName(WrappedComponent)})`;
    WithProfiler.propTypes = {
        forwardedRef: PropTypes.oneOfType([
            PropTypes.func,
            PropTypes.shape({current: PropTypes.instanceOf(React.Component)}),
        ]),
    };
    WithProfiler.defaultProps = {
        forwardedRef: undefined,
    };
    return React.forwardRef((props, ref) => (
        // eslint-disable-next-line react/jsx-props-no-spreading
        <WithProfiler {...props} forwardedRef={ref} />
    ));
};

const withProfilerPropTypes = {
    /**
     * When the same component re-renders call this, see
     * https://shopify.github.io/react-native-performance/docs/fundamentals/measuring-render-times#3-measuring-screen-re-render-times
     */
    resetFlow: PropTypes.func.isRequired,
    componentInstanceId: PropTypes.string.isRequired,

    /**
     * Call this to mark the start of a flow, see
     * https://shopify.github.io/react-native-performance/docs/fundamentals/measuring-render-times#2-measuring-navigation-render-times-
     */
    startProfiler: PropTypes.func.isRequired,
};

export default withProfiler;
export {withProfilerPropTypes};
