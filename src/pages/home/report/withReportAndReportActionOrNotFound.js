import PropTypes from 'prop-types';
import React, {useEffect, useCallback} from 'react';
import {withOnyx} from 'react-native-onyx';
import _ from 'underscore';
import getComponentDisplayName from '../../../libs/getComponentDisplayName';
import NotFoundPage from '../../ErrorPage/NotFoundPage';
import ONYXKEYS from '../../../ONYXKEYS';
import reportPropTypes from '../../reportPropTypes';
import reportActionPropTypes from './reportActionPropTypes';
import FullscreenLoadingIndicator from '../../../components/FullscreenLoadingIndicator';
import * as ReportUtils from '../../../libs/ReportUtils';
import * as ReportActionsUtils from '../../../libs/ReportActionsUtils';
import * as Report from '../../../libs/actions/Report';
import compose from '../../../libs/compose';
import withWindowDimensions from '../../../components/withWindowDimensions';

export default function (WrappedComponent) {
    const propTypes = {
        /** The HOC takes an optional ref as a prop and passes it as a ref to the wrapped component.
         * That way, if a ref is passed to a component wrapped in the HOC, the ref is a reference to the wrapped component, not the HOC. */
        forwardedRef: PropTypes.func,

        /** The report currently being looked at */
        report: reportPropTypes,

        /** Array of report actions for this report */
        reportActions: PropTypes.shape(reportActionPropTypes),

        /** The policies which the user has access to */
        policies: PropTypes.objectOf(
            PropTypes.shape({
                /** The policy name */
                name: PropTypes.string,

                /** The type of the policy */
                type: PropTypes.string,
            }),
        ),

        /** Route params */
        route: PropTypes.shape({
            params: PropTypes.shape({
                /** Report ID passed via route */
                reportID: PropTypes.string,

                /** ReportActionID passed via route */
                reportActionID: PropTypes.string,
            }),
        }).isRequired,

        /** Beta features list */
        betas: PropTypes.arrayOf(PropTypes.string),

        /** Indicated whether the report data is loading */
        isLoadingReportData: PropTypes.bool,

        /** Is the window width narrow, like on a mobile device? */
        isSmallScreenWidth: PropTypes.bool.isRequired,
    };

    const defaultProps = {
        forwardedRef: () => {},
        reportActions: {},
        report: {},
        policies: {},
        betas: [],
        isLoadingReportData: true,
    };

    // eslint-disable-next-line rulesdir/no-negated-variables
    function WithReportAndReportActionOrNotFound(props) {
        const getReportAction = useCallback(() => {
            let reportAction = props.reportActions[`${props.route.params.reportActionID}`];

            // Handle threads if needed
            if (reportAction === undefined || reportAction.reportActionID === undefined) {
                reportAction = ReportActionsUtils.getParentReportAction(props.report);
            }

            return reportAction;
        }, [props.report, props.reportActions, props.route.params.reportActionID]);

        const reportAction = getReportAction();

        // For small screen, we don't call openReport API when we go to a sub report page by deeplink
        // So we need to call openReport here for small screen
        useEffect(() => {
            if (!props.isSmallScreenWidth || (!_.isEmpty(props.report) && !_.isEmpty(reportAction))) {
                return;
            }
            Report.openReport(props.route.params.reportID);
            // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [props.isSmallScreenWidth, props.route.params.reportID]);

        // Perform all the loading checks
        const isLoadingReport = props.isLoadingReportData && (_.isEmpty(props.report) || !props.report.reportID);
        const isLoadingReportAction = _.isEmpty(props.reportActions) || (props.report.isLoadingReportActions && _.isEmpty(getReportAction()));
        const shouldHideReport = !isLoadingReport && (_.isEmpty(props.report) || !props.report.reportID || !ReportUtils.canAccessReport(props.report, props.policies, props.betas));

        if ((isLoadingReport || isLoadingReportAction) && !shouldHideReport) {
            return <FullscreenLoadingIndicator />;
        }

        // Perform the access/not found checks
        if (shouldHideReport || _.isEmpty(reportAction)) {
            return <NotFoundPage />;
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

    WithReportAndReportActionOrNotFound.propTypes = propTypes;
    WithReportAndReportActionOrNotFound.defaultProps = defaultProps;
    WithReportAndReportActionOrNotFound.displayName = `withReportAndReportActionOrNotFound(${getComponentDisplayName(WrappedComponent)})`;

    // eslint-disable-next-line rulesdir/no-negated-variables
    const withReportAndReportActionOrNotFound = React.forwardRef((props, ref) => (
        <WithReportAndReportActionOrNotFound
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            forwardedRef={ref}
        />
    ));

    return compose(
        withWindowDimensions,
        withOnyx({
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
            reportActions: {
                key: ({route}) => `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${route.params.reportID}`,
                canEvict: false,
            },
        }),
    )(withReportAndReportActionOrNotFound);
}
