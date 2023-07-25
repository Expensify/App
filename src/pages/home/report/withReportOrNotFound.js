import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {withOnyx} from 'react-native-onyx';
import _ from 'underscore';
import getComponentDisplayName from '../../../libs/getComponentDisplayName';
import NotFoundPage from '../../ErrorPage/NotFoundPage';
import ONYXKEYS from '../../../ONYXKEYS';
import reportPropTypes from '../../reportPropTypes';
import FullscreenLoadingIndicator from '../../../components/FullscreenLoadingIndicator';

export default function (WrappedComponent) {
    const propTypes = {
        /** The HOC takes an optional ref as a prop and passes it as a ref to the wrapped component.
         * That way, if a ref is passed to a component wrapped in the HOC, the ref is a reference to the wrapped component, not the HOC. */
        forwardedRef: PropTypes.func,

        /** The report currently being looked at */
        report: reportPropTypes,

        /** Indicated whether the report data is loading */
        isLoadingReportData: PropTypes.bool,
    };

    const defaultProps = {
        forwardedRef: () => {},
        report: {},
        isLoadingReportData: true,
    };

    class WithReportOrNotFound extends Component {
        render() {
            if (this.props.isLoadingReportData && (_.isEmpty(this.props.report) || !this.props.report.reportID)) {
                return <FullscreenLoadingIndicator />;
            }
            if (_.isEmpty(this.props.report) || !this.props.report.reportID) {
                return <NotFoundPage />;
            }

            const rest = _.omit(this.props, ['forwardedRef']);

            return (
                <WrappedComponent
                    // eslint-disable-next-line react/jsx-props-no-spreading
                    {...rest}
                    ref={this.props.forwardedRef}
                />
            );
        }
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
    })(withReportOrNotFound);
}
