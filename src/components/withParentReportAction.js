import React from 'react';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import _ from 'underscore';
import lodashGet from 'lodash/get';
import getComponentDisplayName from '../libs/getComponentDisplayName';
import ONYXKEYS from '../ONYXKEYS';
import reportActionPropTypes from '../pages/home/report/reportActionPropTypes';
import reportPropTypes from '../pages/reportPropTypes';

const withParentReportActionPropTypes = {
    parentReportAction: PropTypes.shape(reportActionPropTypes),
};

const withParentReportActionDefaultProps = {
    parentReportAction: {},
};

export default function (WrappedComponent) {
    const propTypes = {
        forwardedRef: PropTypes.oneOfType([
            PropTypes.func,
            PropTypes.shape({current: PropTypes.instanceOf(React.Component)}),
        ]),

        /** All Report actions for the parent report */
        parentReportActions: PropTypes.objectOf(PropTypes.shape(reportActionPropTypes)),

        /** Thread (child) report */
        report: reportPropTypes,
    };
    const defaultProps = {
        forwardedRef: undefined,
        report: null,
        parentReportActions: null,
    };

    const WithParentReportAction = (props) => {
        const parentReportActionID = props.report ? `${lodashGet(props.report, 'parentReportActionID', '')}` : '';
        const parentReportAction = parentReportActionID ? lodashGet(props.parentReportActions, 'parentReportActionID', {}) : {};

        return (
            <WrappedComponent
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...props}
                ref={props.forwardedRef}
                parentReportAction={parentReportAction}
            />
        );
    };

    WithParentReportAction.displayName = `WithParentReportAction(${getComponentDisplayName(WrappedComponent)})`;
    WithParentReportAction.propTypes = propTypes;

    WithParentReportAction.defaultProps = defaultProps;

    const withParentReportAction = React.forwardRef((props, ref) => (
        // eslint-disable-next-line react/jsx-props-no-spreading
        <WithParentReportAction {...props} forwardedRef={ref} />
    ));

    return withOnyx({
        parentReportActions: {
            // default to current report if not a thread
            key: ({report}) => `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report.parentReportID || report.reportID}`,
            canEvict: false,
        },
    })(withParentReportAction);
}

export {
    withParentReportActionPropTypes,
    withParentReportActionDefaultProps,
};
