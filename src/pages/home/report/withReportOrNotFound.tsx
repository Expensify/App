/* eslint-disable rulesdir/no-negated-variables */
import {useIsFocused} from '@react-navigation/native';
import type {ComponentType} from 'react';
import React, {useEffect} from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import FullscreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import useOnyx from '@hooks/useOnyx';
import useReportIsArchived from '@hooks/useReportIsArchived';
import {openReport} from '@libs/actions/Report';
import getComponentDisplayName from '@libs/getComponentDisplayName';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import {canAccessReport} from '@libs/ReportUtils';
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

type WithReportOrNotFoundOnyxProps = {
    /** The report currently being looked at */
    report: OnyxTypes.Report;

    /** Metadata of the report currently being looked at */
    reportMetadata: OnyxEntry<OnyxTypes.ReportMetadata>;

    /** The policy linked to the report */
    policy: OnyxEntry<OnyxTypes.Policy>;

    /** Beta features list */
    betas: OnyxEntry<OnyxTypes.Beta[]>;

    /** Indicated whether the report data is loading */
    isLoadingReportData: OnyxEntry<boolean>;
};

type ScreenProps =
    | PlatformStackScreenProps<PrivateNotesNavigatorParamList, typeof SCREENS.PRIVATE_NOTES.EDIT>
    | PlatformStackScreenProps<ReportDescriptionNavigatorParamList, typeof SCREENS.REPORT_DESCRIPTION_ROOT>
    | PlatformStackScreenProps<ParticipantsNavigatorParamList, typeof SCREENS.REPORT_PARTICIPANTS.ROOT>
    | PlatformStackScreenProps<ParticipantsNavigatorParamList, typeof SCREENS.REPORT_PARTICIPANTS.DETAILS>
    | PlatformStackScreenProps<ParticipantsNavigatorParamList, typeof SCREENS.REPORT_PARTICIPANTS.ROLE>
    | PlatformStackScreenProps<ReportDetailsNavigatorParamList, typeof SCREENS.REPORT_DETAILS.ROOT>
    | PlatformStackScreenProps<ReportDetailsNavigatorParamList, typeof SCREENS.REPORT_DETAILS.SHARE_CODE>
    | PlatformStackScreenProps<ReportSettingsNavigatorParamList, typeof SCREENS.REPORT_SETTINGS.ROOT>
    | PlatformStackScreenProps<RoomMembersNavigatorParamList, typeof SCREENS.ROOM_MEMBERS.DETAILS>
    | PlatformStackScreenProps<ReportChangeWorkspaceNavigatorParamList, typeof SCREENS.REPORT_CHANGE_WORKSPACE.ROOT>
    | PlatformStackScreenProps<ReportChangeApproverParamList, typeof SCREENS.REPORT_CHANGE_APPROVER.ROOT>;

type WithReportOrNotFoundProps = WithReportOrNotFoundOnyxProps & {
    route: ScreenProps['route'];
    navigation: ScreenProps['navigation'];
};

export default function (shouldRequireReportID = true): <TProps extends WithReportOrNotFoundProps>(WrappedComponent: ComponentType<TProps>) => ComponentType<TProps> {
    return function <TProps extends WithReportOrNotFoundProps>(WrappedComponent: ComponentType<TProps>) {
        function WithReportOrNotFound(props: TProps) {
            const [betas] = useOnyx(ONYXKEYS.BETAS, {canBeMissing: false});
            const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${props.route.params.reportID}`, {canBeMissing: true});
            const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${report?.policyID}`, {canBeMissing: true});
            const [reportMetadata] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_METADATA}${props.route.params.reportID}`, {canBeMissing: true});
            const [isLoadingReportData] = useOnyx(ONYXKEYS.IS_LOADING_REPORT_DATA, {canBeMissing: true});
            const isFocused = useIsFocused();
            const contentShown = React.useRef(false);
            const isReportIdInRoute = !!props.route.params.reportID?.length;
            const isReportLoaded = !isEmptyObject(report) && !!report?.reportID;
            const isReportArchived = useReportIsArchived(report?.reportID);
            // The `isLoadingInitialReportActions` value will become `false` only after the first OpenReport API call is finished (either succeeded or failed)
            const shouldFetchReport = isReportIdInRoute && reportMetadata?.isLoadingInitialReportActions !== false;

            // When accessing certain report-dependant pages (e.g. Task Title) by deeplink, the OpenReport API is not called,
            // So we need to call OpenReport API here to make sure the report data is loaded if it exists on the Server
            useEffect(() => {
                if (isReportLoaded || !shouldFetchReport) {
                    // If the report is not required or is already loaded, we don't need to call the API
                    return;
                }

                openReport(props.route.params.reportID);
                // eslint-disable-next-line react-hooks/exhaustive-deps
            }, [shouldFetchReport, isReportLoaded, props.route.params.reportID]);

            if (shouldRequireReportID || isReportIdInRoute) {
                const shouldShowFullScreenLoadingIndicator = !isReportLoaded && (isLoadingReportData !== false || shouldFetchReport);
                const shouldShowNotFoundPage = !isReportLoaded || !canAccessReport(report, betas, isReportArchived);

                // If the content was shown, but it's not anymore, that means the report was deleted, and we are probably navigating out of this screen.
                // Return null for this case to avoid rendering FullScreenLoadingIndicator or NotFoundPage when animating transition.
                if (shouldShowNotFoundPage && contentShown.current && !isFocused) {
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
                    policy={policy}
                    reportMetadata={reportMetadata}
                    isLoadingReportData={isLoadingReportData}
                />
            );
        }

        WithReportOrNotFound.displayName = `withReportOrNotFound(${getComponentDisplayName(WrappedComponent)})`;

        return WithReportOrNotFound;
    };
}

export type {WithReportOrNotFoundProps};
