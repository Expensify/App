/* eslint-disable rulesdir/no-negated-variables */
import {RouteProp} from '@react-navigation/native';
import React, {ComponentType, ForwardedRef, RefAttributes} from 'react';
import {OnyxCollection, OnyxEntry, withOnyx} from 'react-native-onyx';
import FullscreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import getComponentDisplayName from '@libs/getComponentDisplayName';
import * as ReportUtils from '@libs/ReportUtils';
import NotFoundPage from '@pages/ErrorPage/NotFoundPage';
import ONYXKEYS from '@src/ONYXKEYS';
import * as OnyxTypes from '@src/types/onyx';

type OnyxProps = {
    /** The report currently being looked at */
    report: OnyxEntry<OnyxTypes.Report>;
    /** The policies which the user has access to */
    policies: OnyxCollection<OnyxTypes.Policy>;
    /** Beta features list */
    betas: OnyxEntry<OnyxTypes.Beta[]>;
    /** Indicated whether the report data is loading */
    isLoadingReportData: OnyxEntry<boolean>;
};

type ComponentProps = OnyxProps & {
    route: RouteProp<{params: {reportID: string}}>;
};

export default function (
    shouldRequireReportID = true,
): <TProps extends ComponentProps, TRef>(
    WrappedComponent: React.ComponentType<TProps & React.RefAttributes<TRef>>,
) => React.ComponentType<Omit<TProps & React.RefAttributes<TRef>, keyof OnyxProps>> {
    return function <TProps extends ComponentProps, TRef>(WrappedComponent: ComponentType<TProps & RefAttributes<TRef>>) {
        function WithReportOrNotFound(props: TProps, ref: ForwardedRef<TRef>) {
            const contentShown = React.useRef(false);

            const isReportIdInRoute = props.route.params.reportID?.length;

            if (shouldRequireReportID || isReportIdInRoute) {
                const shouldShowFullScreenLoadingIndicator = props.isLoadingReportData !== false && (!Object.entries(props.report ?? {}).length || !props.report?.reportID);

                const shouldShowNotFoundPage =
                    !Object.entries(props.report ?? {}).length || !props.report?.reportID || !ReportUtils.canAccessReport(props.report, props.policies, props.betas, {});

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

        return withOnyx<TProps & RefAttributes<TRef>, OnyxProps>({
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
