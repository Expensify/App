import isEmpty from 'lodash/isEmpty';
import omit from 'lodash/omit';
import PropTypes from 'prop-types';
import React from 'react';
import {withOnyx} from 'react-native-onyx';
import FullscreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import compose from '@libs/compose';
import getComponentDisplayName from '@libs/getComponentDisplayName';
import ONYXKEYS from '@src/ONYXKEYS';
import withPolicy, {policyDefaultProps, policyPropTypes} from './withPolicy';

export default function (WrappedComponent) {
    const propTypes = {
        /** The HOC takes an optional ref as a prop and passes it as a ref to the wrapped component.
         * That way, if a ref is passed to a component wrapped in the HOC, the ref is a reference to the wrapped component, not the HOC. */
        forwardedRef: PropTypes.func,

        /** Indicated whether the report data is loading */
        isLoadingReportData: PropTypes.bool,

        ...policyPropTypes,
    };

    const defaultProps = {
        forwardedRef: () => {},
        isLoadingReportData: true,
        ...policyDefaultProps,
    };

    function WithPolicyAndFullscreenLoading(props) {
        if (props.isLoadingReportData && isEmpty(props.policy) && isEmpty(props.policyDraft)) {
            return <FullscreenLoadingIndicator />;
        }

        const rest = omit(props, ['forwardedRef']);
        return (
            <WrappedComponent
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...rest}
                ref={props.forwardedRef}
            />
        );
    }

    WithPolicyAndFullscreenLoading.propTypes = propTypes;
    WithPolicyAndFullscreenLoading.defaultProps = defaultProps;
    WithPolicyAndFullscreenLoading.displayName = `WithPolicyAndFullscreenLoading(${getComponentDisplayName(WrappedComponent)})`;

    const WithPolicyAndFullscreenLoadingWithRef = React.forwardRef((props, ref) => (
        <WithPolicyAndFullscreenLoading
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            forwardedRef={ref}
        />
    ));

    WithPolicyAndFullscreenLoadingWithRef.displayName = 'WithPolicyAndFullscreenLoadingWithRef';

    return compose(
        withPolicy,
        withOnyx({
            isLoadingReportData: {
                key: ONYXKEYS.IS_LOADING_REPORT_DATA,
            },
        }),
    )(WithPolicyAndFullscreenLoadingWithRef);
}
