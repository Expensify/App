import FullscreenLoadingIndicator from '@components/FullscreenLoadingIndicator';

import useOnyx from '@hooks/useOnyx';
import useReportIsArchived from '@hooks/useReportIsArchived';

import {openReport} from '@libs/actions/Report';
import getComponentDisplayName from '@libs/getComponentDisplayName';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import {canAccessReport} from '@libs/ReportUtils';
import type {SkeletonSpanReasonAttributes} from '@libs/telemetry/useSkeletonSpan';

import type {
    ParticipantsNavigatorParamList,
    PrivateNotesNavigatorParamList,
    ReportChangeApproverParamList,
    ReportChangeWorkspaceNavigatorParamList,
    ReportDescriptionNavigatorParamList,
    ReportDetailsNavigatorParamList,
    ReportSettingsNavigatorParamList,
    RoomMembersNavigatorParamList,
} from '@navigation/types';

import NotFoundPage from '@pages/ErrorPage/NotFoundPage';

import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import type * as OnyxTypes from '@src/types/onyx';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

import type {ComponentType} from 'react';
import type {OnyxEntry} from 'react-native-onyx';

import {useIsFocused} from '@react-navigation/native';
import React, {useEffect} from 'react';

type WithReportOrNotFoundOnyxProps = {
    /** The report currently being looked at */
    report: OnyxTypes.Report;

    /** Metadata of the report currently being looked at */
    reportMetadata: OnyxEntry<OnyxTypes.ReportMetadata>;

    /** Loading state of the report currently being looked at */
    reportLoadingState: OnyxEntry<OnyxTypes.ReportLoadingState>;

    /** The policy linked to the report */
    policy: OnyxEntry<OnyxTypes.Policy>;

    /** Beta features list */
    betas: OnyxEntry<OnyxTypes.Beta[]>;

    /** Indicated whether the report data is loading */
    isLoadingReportData: OnyxEntry<boolean>;
};

type ScreenProps =
    | PlatformStackScreenProps<PrivateNotesNavigatorParamList, typeof SCREENS.DYNAMIC_PRIVATE_NOTES_EDIT>
    | PlatformStackScreenProps<ReportDescriptionNavigatorParamList, typeof SCREENS.DYNAMIC_REPORT_DESCRIPTION>
    | PlatformStackScreenProps<ParticipantsNavigatorParamList, typeof SCREENS.REPORT_PARTICIPANTS.DYNAMIC_ROOT>
    | PlatformStackScreenProps<ParticipantsNavigatorParamList, typeof SCREENS.REPORT_PARTICIPANTS.DYNAMIC_INVITE>
    | PlatformStackScreenProps<ParticipantsNavigatorParamList, typeof SCREENS.REPORT_PARTICIPANTS.DYNAMIC_DETAILS>
    | PlatformStackScreenProps<ParticipantsNavigatorParamList, typeof SCREENS.REPORT_PARTICIPANTS.DYNAMIC_ROLE>
    | PlatformStackScreenProps<ReportDetailsNavigatorParamList, typeof SCREENS.REPORT_DETAILS.DYNAMIC_ROOT>
    | PlatformStackScreenProps<ReportDetailsNavigatorParamList, typeof SCREENS.REPORT_DETAILS.DYNAMIC_SHARE_CODE>
    | PlatformStackScreenProps<ReportSettingsNavigatorParamList, typeof SCREENS.REPORT_SETTINGS.DYNAMIC_ROOT>
    | PlatformStackScreenProps<ReportSettingsNavigatorParamList, typeof SCREENS.REPORT_SETTINGS.DYNAMIC_NOTIFICATION_PREFERENCES>
    | PlatformStackScreenProps<ReportSettingsNavigatorParamList, typeof SCREENS.REPORT_SETTINGS.DYNAMIC_SETTINGS_NAME>
    | PlatformStackScreenProps<ReportSettingsNavigatorParamList, typeof SCREENS.REPORT_SETTINGS.DYNAMIC_SETTINGS_WRITE_CAPABILITY>
    | PlatformStackScreenProps<ReportSettingsNavigatorParamList, typeof SCREENS.REPORT_SETTINGS.DYNAMIC_SETTINGS_VISIBILITY>
    | PlatformStackScreenProps<RoomMembersNavigatorParamList, typeof SCREENS.ROOM_MEMBERS.DYNAMIC_DETAILS>
    | PlatformStackScreenProps<ReportChangeWorkspaceNavigatorParamList, typeof SCREENS.REPORT_CHANGE_WORKSPACE.DYNAMIC_ROOT>
    | PlatformStackScreenProps<ReportChangeApproverParamList, typeof SCREENS.REPORT_CHANGE_APPROVER.DYNAMIC_ROOT>;

type WithReportOrNotFoundProps = WithReportOrNotFoundOnyxProps & {
    route: ScreenProps['route'];
    navigation: ScreenProps['navigation'];
};

export default function (shouldRequireReportID = true): <TProps extends WithReportOrNotFoundProps>(WrappedComponent: ComponentType<TProps>) => ComponentType<TProps> {
    return function <TProps extends WithReportOrNotFoundProps>(WrappedComponent: ComponentType<TProps>) {
        function WithReportOrNotFound(props: TProps) {
            const params = props.route.params;
            // Most screens carry the report ID under `reportID`. The notification-preferences screen instead
            // owns its target report as a distinct path param (`notificationReportID`) so it never collides
            // with a `reportID` inherited from the surrounding report chain in the URL.
            const reportID = 'notificationReportID' in params ? params.notificationReportID : params.reportID;
            const [betas] = useOnyx(ONYXKEYS.BETAS);
            const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);
            const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${report?.policyID}`);
            const [reportMetadata] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_METADATA}${reportID}`);
            const [reportLoadingState] = useOnyx(`${ONYXKEYS.COLLECTION.RAM_ONLY_REPORT_LOADING_STATE}${reportID}`);
            const [isLoadingReportData] = useOnyx(ONYXKEYS.IS_LOADING_REPORT_DATA);
            const [introSelected] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED);
            const isFocused = useIsFocused();
            const contentShown = React.useRef(false);
            const isReportIdInRoute = !!reportID?.length;
            const isReportLoaded = !isEmptyObject(report) && !!report?.reportID;
            const isReportArchived = useReportIsArchived(report?.reportID);
            // The `isLoadingInitialReportActions` value will become `false` only after the first OpenReport API call is finished (either succeeded or failed)
            const shouldFetchReport = isReportIdInRoute && reportLoadingState?.isLoadingInitialReportActions !== false;

            // When accessing certain report-dependant pages (e.g. Task Title) by deeplink, the OpenReport API is not called,
            // So we need to call OpenReport API here to make sure the report data is loaded if it exists on the Server
            useEffect(() => {
                if (isReportLoaded || !shouldFetchReport) {
                    // If the report is not required or is already loaded, we don't need to call the API
                    return;
                }

                openReport({reportID, introSelected, betas});
                // eslint-disable-next-line react-hooks/exhaustive-deps
            }, [shouldFetchReport, isReportLoaded, reportID]);

            if (shouldRequireReportID || isReportIdInRoute) {
                const shouldShowFullScreenLoadingIndicator = !isReportLoaded && (isLoadingReportData !== false || shouldFetchReport);
                const shouldShowNotFoundPage = !isReportLoaded || !canAccessReport(report, betas, isReportArchived);

                // If the content was shown, but it's not anymore, that means the report was deleted, and we are probably navigating out of this screen.
                // Return null for this case to avoid rendering FullScreenLoadingIndicator or NotFoundPage when animating transition.
                if (shouldShowNotFoundPage && contentShown.current && !isFocused) {
                    return null;
                }

                if (shouldShowFullScreenLoadingIndicator) {
                    const reasonAttributes: SkeletonSpanReasonAttributes = {
                        context: 'withReportOrNotFound',
                        isLoadingReportData: isLoadingReportData !== false,
                        shouldFetchReport,
                    };
                    return (
                        <FullscreenLoadingIndicator
                            shouldUseGoBackButton
                            reasonAttributes={reasonAttributes}
                        />
                    );
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
                    {...props}
                    report={report}
                    betas={betas}
                    policy={policy}
                    reportMetadata={reportMetadata}
                    reportLoadingState={reportLoadingState}
                    isLoadingReportData={isLoadingReportData}
                />
            );
        }

        WithReportOrNotFound.displayName = `withReportOrNotFound(${getComponentDisplayName(WrappedComponent)})`;

        return WithReportOrNotFound;
    };
}

export type {WithReportOrNotFoundProps};
