import FullscreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import {getReportOrNotFoundDecision} from '@components/ReportOrNotFoundGuard';

import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import useReportIsArchived from '@hooks/useReportIsArchived';

import getComponentDisplayName from '@libs/getComponentDisplayName';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import {hasExpensifyGuidesEmails} from '@libs/ReportUtils';

import type {
    ParticipantsNavigatorParamList,
    PrivateNotesNavigatorParamList,
    ReportChangeApproverParamList,
    ReportChangeWorkspaceNavigatorParamList,
    ReportDescriptionNavigatorParamList,
    ReportDetailsNavigatorParamList,
    ReportHistoryNavigatorParamList,
    ReportSettingsNavigatorParamList,
    RoomMembersNavigatorParamList,
} from '@navigation/types';

import NotFoundPage from '@pages/ErrorPage/NotFoundPage';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import type * as OnyxTypes from '@src/types/onyx';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

import type {ComponentType} from 'react';
import type {OnyxEntry} from 'react-native-onyx';

import {useIsFocused} from '@react-navigation/native';
import React from 'react';

import useReportDeepLinkOnOpen from './useReportDeepLinkOnOpen';

type WithReportOrNotFoundOnyxProps = {
    report: OnyxTypes.Report;
    reportMetadata: OnyxEntry<OnyxTypes.ReportMetadata>;
    reportLoadingState: OnyxEntry<OnyxTypes.ReportLoadingState>;

    /** The policy linked to the report */
    policy: OnyxEntry<OnyxTypes.Policy>;

    isLoadingReportData: OnyxEntry<boolean>;
};

type ScreenProps =
    | PlatformStackScreenProps<PrivateNotesNavigatorParamList, typeof SCREENS.DYNAMIC_PRIVATE_NOTES_EDIT>
    | PlatformStackScreenProps<ReportDescriptionNavigatorParamList, typeof SCREENS.DYNAMIC_REPORT_DESCRIPTION>
    | PlatformStackScreenProps<ReportHistoryNavigatorParamList, typeof SCREENS.DYNAMIC_REPORT_HISTORY>
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
            const {isBetaEnabled} = usePermissions();
            const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);
            const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${report?.policyID}`);
            const [reportMetadata] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_METADATA}${reportID}`);
            const [reportLoadingState] = useOnyx(`${ONYXKEYS.COLLECTION.RAM_ONLY_REPORT_LOADING_STATE}${reportID}`);
            const [isLoadingReportData] = useOnyx(ONYXKEYS.IS_LOADING_REPORT_DATA);
            const [deleteTransactionNavigateBackUrl] = useOnyx(ONYXKEYS.NVP_DELETE_TRANSACTION_NAVIGATE_BACK_URL);
            const [guideAccountIDs] = useOnyx(ONYXKEYS.DERIVED.GUIDE_ACCOUNT_IDS);
            const hasGuidesEmails = hasExpensifyGuidesEmails(Object.keys(report?.participants ?? {}).map(Number), guideAccountIDs);
            const isFocused = useIsFocused();
            const contentShown = React.useRef(false);
            const isReportIdInRoute = !!reportID?.length;
            const isReportLoaded = !isEmptyObject(report) && !!report?.reportID;
            const isReportArchived = useReportIsArchived(report?.reportID);
            // The `isLoadingInitialReportActions` value will become `false` only after the first OpenReport API call is finished (either succeeded or failed)
            const shouldFetchReport = isReportIdInRoute && reportLoadingState?.isLoadingInitialReportActions !== false;

            useReportDeepLinkOnOpen({reportID, isReportLoaded, shouldFetchReport});

            const decision = getReportOrNotFoundDecision({
                shouldRequireReportID,
                isReportIdInRoute,
                isReportLoaded,
                report,
                isLoadingReportData,
                shouldFetchReport,
                isDefaultRoomsBetaEnabled: isBetaEnabled(CONST.BETAS.DEFAULT_ROOMS),
                hasGuidesEmails,
                isReportArchived,
                isFocused,
                hasShownContent: contentShown.current,
                deleteTransactionNavigateBackUrl,
            });

            if (decision === 'blank') {
                return null;
            }

            if (decision === 'loading') {
                return <FullscreenLoadingIndicator shouldUseGoBackButton />;
            }

            if (decision === 'notFound') {
                return <NotFoundPage isReportRelatedPage />;
            }

            if (!contentShown.current) {
                contentShown.current = true;
            }

            return (
                <WrappedComponent
                    {...props}
                    report={report}
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
