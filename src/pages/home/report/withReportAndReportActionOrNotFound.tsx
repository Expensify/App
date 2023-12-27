/* eslint-disable rulesdir/no-negated-variables */
import {RouteProp} from '@react-navigation/native';
import React, {ComponentType, ForwardedRef, RefAttributes, useCallback, useEffect} from 'react';
import {OnyxCollection, OnyxEntry, withOnyx} from 'react-native-onyx';
import FullscreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import withWindowDimensions from '@components/withWindowDimensions';
import {WindowDimensionsProps} from '@components/withWindowDimensions/types';
import compose from '@libs/compose';
import getComponentDisplayName from '@libs/getComponentDisplayName';
import * as ReportActionsUtils from '@libs/ReportActionsUtils';
import * as ReportUtils from '@libs/ReportUtils';
import NotFoundPage from '@pages/ErrorPage/NotFoundPage';
import * as Report from '@userActions/Report';
import ONYXKEYS from '@src/ONYXKEYS';
import * as OnyxTypes from '@src/types/onyx';
import {isEmptyObject, isNotEmptyObject} from '@src/types/utils/EmptyObject';

type OnyxProps = {
    /** The report currently being looked at */
    report: OnyxEntry<OnyxTypes.Report>;

    /** The report metadata */
    reportMetadata: OnyxEntry<OnyxTypes.ReportMetadata>;

    /** Array of report actions for this report */
    reportActions: OnyxEntry<OnyxTypes.ReportActions>;

    /** The policies which the user has access to */
    policies: OnyxCollection<OnyxTypes.Policy>;

    /** Beta features list */
    betas: OnyxEntry<OnyxTypes.Beta[]>;

    /** Indicated whether the report data is loading */
    isLoadingReportData: OnyxEntry<boolean>;
};

type ComponentProps = OnyxProps &
    WindowDimensionsProps & {
        route: RouteProp<{params: {reportID: string; reportActionID: string}}>;
    };

export default function <TProps extends ComponentProps, TRef>(WrappedComponent: ComponentType<TProps & RefAttributes<TRef>>): ComponentType<TProps & RefAttributes<TRef>> {
    function WithReportOrNotFound(props: TProps, ref: ForwardedRef<TRef>) {
        const getReportAction = useCallback(() => {
            let reportAction: OnyxTypes.ReportAction | Record<string, never> | undefined = props.reportActions?.[`${props.route.params.reportActionID}`];

            // Handle threads if needed
            if (!reportAction?.reportActionID) {
                reportAction = ReportActionsUtils.getParentReportAction(props.report);
            }

            return reportAction;
        }, [props.report, props.reportActions, props.route.params.reportActionID]);

        const reportAction = getReportAction();

        // For small screen, we don't call openReport API when we go to a sub report page by deeplink
        // So we need to call openReport here for small screen
        useEffect(() => {
            if (!props.isSmallScreenWidth || (isNotEmptyObject(props.report) && isNotEmptyObject(reportAction))) {
                return;
            }
            Report.openReport(props.route.params.reportID);
            // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [props.isSmallScreenWidth, props.route.params.reportID]);

        // Perform all the loading checks
        const isLoadingReport = props.isLoadingReportData && !props.report?.reportID;
        const isLoadingReportAction = isEmptyObject(props.reportActions) || (props.reportMetadata?.isLoadingInitialReportActions && isEmptyObject(getReportAction()));
        const shouldHideReport = !isLoadingReport && (!props.report?.reportID || !ReportUtils.canAccessReport(props.report, props.policies, props.betas));

        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        if ((isLoadingReport || isLoadingReportAction) && !shouldHideReport) {
            return <FullscreenLoadingIndicator />;
        }

        // Perform the access/not found checks
        if (shouldHideReport || isEmptyObject(reportAction)) {
            return <NotFoundPage />;
        }

        return (
            <WrappedComponent
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...props}
                ref={ref}
            />
        );
    }

    WithReportOrNotFound.displayName = `withReportOrNotFound(${getComponentDisplayName(WrappedComponent)})`;

    return compose(
        withOnyx<TProps & RefAttributes<TRef>, OnyxProps>({
            report: {
                key: ({route}) => `${ONYXKEYS.COLLECTION.REPORT}${route.params.reportID}`,
            },
            reportMetadata: {
                key: ({route}) => `${ONYXKEYS.COLLECTION.REPORT_METADATA}${route.params.reportID}`,
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
        withWindowDimensions,
    )(React.forwardRef(WithReportOrNotFound));
}
