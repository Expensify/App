import PropTypes from 'prop-types';
import React from 'react';
import {withOnyx} from 'react-native-onyx';
import _ from 'underscore';
import getComponentDisplayName from '../../../libs/getComponentDisplayName';
import NotFoundPage from '../../ErrorPage/NotFoundPage';
import ONYXKEYS from '../../../ONYXKEYS';
import reportPropTypes from '../../reportPropTypes';
import FullscreenLoadingIndicator from '../../../components/FullscreenLoadingIndicator';
import * as ReportUtils from '../../../libs/ReportUtils';

export default function (WrappedComponent) {
    const propTypes = {
        /** The HOC takes an optional ref as a prop and passes it as a ref to the wrapped component.
         * That way, if a ref is passed to a component wrapped in the HOC, the ref is a reference to the wrapped component, not the HOC. */
        forwardedRef: PropTypes.func,

        /** The report currently being looked at */
        report: reportPropTypes,

        /** The policies which the user has access to */
        policies: PropTypes.objectOf(
            PropTypes.shape({
                /** The policy name */
                name: PropTypes.string,

                /** The type of the policy */
                type: PropTypes.string,
            }),
        ),

        /** Beta features list */
        betas: PropTypes.arrayOf(PropTypes.string),

        /** Indicated whether the report data is loading */
        isLoadingReportData: PropTypes.bool,
    };

    const defaultProps = {
        forwardedRef: () => {},
        report: {},
        policies: {},
        betas: [],
        isLoadingReportData: true,
    };

    // eslint-disable-next-line rulesdir/no-negated-variables
    function WithReportOrNotFound(props) {
        const contentShown = React.useRef(false);

        const shouldShowFullScreenLoadingIndicator = props.isLoadingReportData && (_.isEmpty(props.report) || !props.report.reportID);
        // eslint-disable-next-line rulesdir/no-negated-variables
        const shouldShowNotFoundPage = _.isEmpty(props.report) || !props.report.reportID || !ReportUtils.canAccessReport(props.report, props.policies, props.betas);

        // If the content was shown but it's not anymore that means the report was deleted and we are probably navigating out of this screen.
        // Return null for this case to avoid rendering FullScreenLoadingIndicator or NotFoundPage when animating transition.
        if (shouldShowNotFoundPage && contentShown.current) {
            return null;
        }

        if (shouldShowFullScreenLoadingIndicator) {
            return <FullscreenLoadingIndicator />;
        }

        if (shouldShowNotFoundPage) {
            return <NotFoundPage />;
        }

        if (!contentShown.current) {
            contentShown.current = true;
        }

        const rest = _.omit(props, ['forwardedRef']);
        return (
            <WrappedComponent
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...rest}
                ref={props.forwardedRef}
            />
        );
    }

    WithReportOrNotFound.propTypes = propTypes;
    WithReportOrNotFound.defaultProps = defaultProps;
    WithReportOrNotFound.displayName = `withReportOrNotFound(${getComponentDisplayName(WrappedComponent)})`;

    // eslint-disable-next-line rulesdir/no-negated-variables
    const withReportOrNotFound = React.forwardRef((props, ref) => (
        <WithReportOrNotFound
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            forwardedRef={ref}
        />
    ));

    return withOnyx({
        report: {
            key: ({route}) => `${ONYXKEYS.COLLECTION.REPORT}${route.params.reportID}`,
        },
        isLoadingReportData: {
            key: ONYXKEYS.IS_LOADING_REPORT_DATA,
        },
        betas: {
            key: ONYXKEYS.BETAS,
        },
        policies: {
            key: ONYXKEYS.COLLECTION.POLICY,
        },
    })(withReportOrNotFound);
}
