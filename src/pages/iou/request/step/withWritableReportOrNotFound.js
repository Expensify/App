import lodashGet from 'lodash/get';
import PropTypes from 'prop-types';
import React from 'react';
import {withOnyx} from 'react-native-onyx';
import _ from 'underscore';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import getComponentDisplayName from '@libs/getComponentDisplayName';
import * as ReportUtils from '@libs/ReportUtils';
import reportPropTypes from '@pages/reportPropTypes';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import IOURequestStepRoutePropTypes from './IOURequestStepRoutePropTypes';

const propTypes = {
    /** The HOC takes an optional ref as a prop and passes it as a ref to the wrapped component.
     * That way, if a ref is passed to a component wrapped in the HOC, the ref is a reference to the wrapped component, not the HOC. */
    forwardedRef: PropTypes.func,

    /** The report corresponding to the reportID in the route params */
    report: reportPropTypes,

    route: IOURequestStepRoutePropTypes.isRequired,
};

const defaultProps = {
    forwardedRef: () => {},
    report: {},
};

export default function (WrappedComponent) {
    // eslint-disable-next-line rulesdir/no-negated-variables
    function WithWritableReportOrNotFound({forwardedRef, ...props}) {
        const {
            route: {
                params: {iouType},
            },
            report,
        } = props;

        const iouTypeParamIsInvalid = !_.contains(_.values(CONST.IOU.TYPE), iouType);
        const canUserPerformWriteAction = ReportUtils.canUserPerformWriteAction(report);
        if (iouTypeParamIsInvalid || !canUserPerformWriteAction) {
            return <FullPageNotFoundView shouldShow />;
        }

        return (
            <WrappedComponent
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...props}
                ref={forwardedRef}
            />
        );
    }

    WithWritableReportOrNotFound.propTypes = propTypes;
    WithWritableReportOrNotFound.defaultProps = defaultProps;
    WithWritableReportOrNotFound.displayName = `withWritableReportOrNotFound(${getComponentDisplayName(WrappedComponent)})`;

    // eslint-disable-next-line rulesdir/no-negated-variables
    const WithWritableReportOrNotFoundWithRef = React.forwardRef((props, ref) => (
        <WithWritableReportOrNotFound
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            forwardedRef={ref}
        />
    ));

    WithWritableReportOrNotFoundWithRef.displayName = 'WithWritableReportOrNotFoundWithRef';

    return withOnyx({
        report: {
            key: ({route}) => `${ONYXKEYS.COLLECTION.REPORT}${lodashGet(route, 'params.reportID', '0')}`,
        },
    })(WithWritableReportOrNotFoundWithRef);
}
