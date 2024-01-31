/* eslint-disable rulesdir/no-negated-variables */
import type {RouteProp} from '@react-navigation/native';
import type {ComponentType, ForwardedRef, RefAttributes} from 'react';
import React, {useEffect} from 'react';
import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import {withOnyx} from 'react-native-onyx';
import FullscreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import getComponentDisplayName from '@libs/getComponentDisplayName';
import * as ReportUtils from '@libs/ReportUtils';
import NotFoundPage from '@pages/ErrorPage/NotFoundPage';
import * as Report from '@userActions/Report';
import ONYXKEYS from '@src/ONYXKEYS';
import type * as OnyxTypes from '@src/types/onyx';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

type WithReportOrNotFoundOnyxProps = {
    /** The report currently being looked at */
    report: OnyxEntry<OnyxTypes.Report>;
    /** The policies which the user has access to */
    policies: OnyxCollection<OnyxTypes.Policy>;
    /** Beta features list */
    betas: OnyxEntry<OnyxTypes.Beta[]>;
    /** Indicated whether the report data is loading */
    isLoadingReportData: OnyxEntry<boolean>;
};

type WithReportOrNotFoundProps = WithReportOrNotFoundOnyxProps & {
    route: RouteProp<{params: {reportID: string}}>;
};

export default function (
    shouldRequireReportID = true,
): <TProps extends WithReportOrNotFoundProps, TRef>(
    WrappedComponent: React.ComponentType<TProps & React.RefAttributes<TRef>>,
) => React.ComponentType<Omit<TProps & React.RefAttributes<TRef>, keyof WithReportOrNotFoundOnyxProps>> {
    return function <TProps extends WithReportOrNotFoundProps, TRef>(WrappedComponent: ComponentType<TProps & RefAttributes<TRef>>) {
        function WithReportOrNotFound(props: TProps, ref: ForwardedRef<TRef>) {
            const contentShown = React.useRef(false);

            const isReportIdInRoute = props.route.params.reportID?.length;

            // When accessing certain report-dependant pages (e.g. Task Title) by deeplink, the OpenReport API is not called,
            // So we need to call OpenReport API here to make sure the report data is loaded if it exists on the Server
            useEffect(() => {
                if (!isReportIdInRoute || !isEmptyObject(props.report)) {
                    // If the report is not required or is already loaded, we don't need to call the API
                    return;
                }

                Report.openReport(props.route.params.reportID);
                // eslint-disable-next-line react-hooks/exhaustive-deps
            }, [isReportIdInRoute, props.route.params.reportID]);

            if (shouldRequireReportID || isReportIdInRoute) {
                const shouldShowFullScreenLoadingIndicator = props.isLoadingReportData !== false && (!Object.entries(props.report ?? {}).length || !props.report?.reportID);

                const shouldShowNotFoundPage =
                    !Object.entries(props.report ?? {}).length || !props.report?.reportID || !ReportUtils.canAccessReport(props.report, props.policies, props.betas);

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
            }

            if (!contentShown.current) {
                contentShown.current = true;
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

        return withOnyx<TProps & RefAttributes<TRef>, WithReportOrNotFoundOnyxProps>({
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
        })(React.forwardRef(WithReportOrNotFound));
    };
}

export type {WithReportOrNotFoundProps};
