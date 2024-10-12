/* eslint-disable rulesdir/no-negated-variables */
import type {RouteProp} from '@react-navigation/native';
import type {ComponentType, ForwardedRef, RefAttributes} from 'react';
import React, {useEffect} from 'react';
import {useOnyx} from 'react-native-onyx';
import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import FullscreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import getComponentDisplayName from '@libs/getComponentDisplayName';
import * as ReportUtils from '@libs/ReportUtils';
import type {
    ParticipantsNavigatorParamList,
    PrivateNotesNavigatorParamList,
    ReportDescriptionNavigatorParamList,
    ReportDetailsNavigatorParamList,
    ReportSettingsNavigatorParamList,
    RoomMembersNavigatorParamList,
} from '@navigation/types';
import NotFoundPage from '@pages/ErrorPage/NotFoundPage';
import * as Report from '@userActions/Report';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import type * as OnyxTypes from '@src/types/onyx';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

type WithReportOrNotFoundProps = {
    route:
        | RouteProp<PrivateNotesNavigatorParamList, typeof SCREENS.PRIVATE_NOTES.EDIT>
        | RouteProp<ReportDescriptionNavigatorParamList, typeof SCREENS.REPORT_DESCRIPTION_ROOT>
        | RouteProp<ParticipantsNavigatorParamList, typeof SCREENS.REPORT_PARTICIPANTS.ROOT>
        | RouteProp<ParticipantsNavigatorParamList, typeof SCREENS.REPORT_PARTICIPANTS.DETAILS>
        | RouteProp<ParticipantsNavigatorParamList, typeof SCREENS.REPORT_PARTICIPANTS.ROLE>
        | RouteProp<ReportDetailsNavigatorParamList, typeof SCREENS.REPORT_DETAILS.ROOT>
        | RouteProp<ReportDetailsNavigatorParamList, typeof SCREENS.REPORT_DETAILS.SHARE_CODE>
        | RouteProp<ReportSettingsNavigatorParamList, typeof SCREENS.REPORT_SETTINGS.ROOT>
        | RouteProp<RoomMembersNavigatorParamList, typeof SCREENS.ROOM_MEMBERS.DETAILS>;

    /** The report currently being looked at */
    report: OnyxTypes.Report;

    /** Metadata of the report currently being looked at */
    reportMetadata: OnyxEntry<OnyxTypes.ReportMetadata>;

    /** The policies which the user has access to */
    policies: OnyxCollection<OnyxTypes.Policy>;

    /** Beta features list */
    betas: OnyxEntry<OnyxTypes.Beta[]>;

    /** Indicated whether the report data is loading */
    isLoadingReportData: OnyxEntry<boolean>;
};

export default function (
    shouldRequireReportID = true,
): <TProps extends WithReportOrNotFoundProps, TRef>(WrappedComponent: React.ComponentType<TProps & React.RefAttributes<TRef>>) => React.ComponentType<TProps & React.RefAttributes<TRef>> {
    return function <TProps extends WithReportOrNotFoundProps, TRef>(WrappedComponent: ComponentType<TProps & RefAttributes<TRef>>) {
        function WithReportOrNotFound(props: TProps, ref: ForwardedRef<TRef>) {
            const [betas] = useOnyx(ONYXKEYS.BETAS);
            const [policies] = useOnyx(ONYXKEYS.COLLECTION.POLICY);
            const [reportMetadata] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_METADATA}${props.route.params.reportID}`);
            const [isLoadingReportData] = useOnyx(ONYXKEYS.IS_LOADING_REPORT_DATA);
            const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${props.route.params.reportID}`);
            const contentShown = React.useRef(false);
            const isReportIdInRoute = !!props.route.params.reportID?.length;
            const isReportLoaded = !isEmptyObject(report) && !!report?.reportID;

            // The `isLoadingInitialReportActions` value will become `false` only after the first OpenReport API call is finished (either succeeded or failed)
            const shouldFetchReport = isReportIdInRoute && reportMetadata?.isLoadingInitialReportActions !== false;

            // When accessing certain report-dependant pages (e.g. Task Title) by deeplink, the OpenReport API is not called,
            // So we need to call OpenReport API here to make sure the report data is loaded if it exists on the Server
            useEffect(() => {
                if (isReportLoaded || !shouldFetchReport) {
                    // If the report is not required or is already loaded, we don't need to call the API
                    return;
                }

                Report.openReport(props.route.params.reportID);
                // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
            }, [shouldFetchReport, isReportLoaded, props.route.params.reportID]);

            if (shouldRequireReportID || isReportIdInRoute) {
                const shouldShowFullScreenLoadingIndicator = !isReportLoaded && (isLoadingReportData !== false || shouldFetchReport);
                const shouldShowNotFoundPage = !isReportLoaded || !ReportUtils.canAccessReport(report, policies, betas);

                // If the content was shown, but it's not anymore, that means the report was deleted, and we are probably navigating out of this screen.
                // Return null for this case to avoid rendering FullScreenLoadingIndicator or NotFoundPage when animating transition.
                if (shouldShowNotFoundPage && contentShown.current) {
                    return null;
                }

                if (shouldShowFullScreenLoadingIndicator) {
                    return <FullscreenLoadingIndicator />;
                }

                if (shouldShowNotFoundPage) {
                    return <NotFoundPage isReportRelatedPage />;
                }
            }

            if (!contentShown.current) {
                contentShown.current = true;
            }

            return (
                <WrappedComponent
                    // eslint-disable-next-line react/jsx-props-no-spreading
                    {...props}
                    report={report}
                    betas={betas}
                    policies={policies}
                    reportMetadata={reportMetadata}
                    isLoadingReportData={isLoadingReportData}
                    ref={ref}
                />
            );
        }

        WithReportOrNotFound.displayName = `withReportOrNotFound(${getComponentDisplayName(WrappedComponent)})`;

        return React.forwardRef(WithReportOrNotFound);
    };
}

export type {WithReportOrNotFoundProps};
