import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {withOnyx} from 'react-native-onyx';
import _ from 'underscore';
import getComponentDisplayName from '../../../libs/getComponentDisplayName';
import NotFoundPage from '../../ErrorPage/NotFoundPage';
import ONYXKEYS from '../../../ONYXKEYS';
import reportPropTypes from '../../reportPropTypes';

export default function (WrappedComponent) {
    const propTypes = {
        /** The HOC takes an optional ref as a prop and passes it as a ref to the wrapped component.
          * That way, if a ref is passed to a component wrapped in the HOC, the ref is a reference to the wrapped component, not the HOC. */
        forwardedRef: PropTypes.func,

        /** The report currently being looked at */
        report: reportPropTypes,
    };

    const defaultProps = {
        forwardedRef: () => {},
        report: {},
    };

    class WithReportOrNotFound extends Component {
        render() {
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
        // eslint-disable-next-line react/jsx-props-no-spreading
        <WithReportOrNotFound {...props} forwardedRef={ref} />
    ));

    return withOnyx({
        report: {
            key: ({route}) => `${ONYXKEYS.COLLECTION.REPORT}${route.params.reportID}`,
        },
    })(withReportOrNotFound);
}
