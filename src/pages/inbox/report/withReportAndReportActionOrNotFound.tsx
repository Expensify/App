/* eslint-disable rulesdir/no-negated-variables */
import type {ComponentType} from 'react';
import React, {useEffect, useMemo} from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import FullscreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import useOnyx from '@hooks/useOnyx';
import useParentReportAction from '@hooks/useParentReportAction';
import useReportIsArchived from '@hooks/useReportIsArchived';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import {openReport} from '@libs/actions/Report';
import getComponentDisplayName from '@libs/getComponentDisplayName';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {FlagCommentNavigatorParamList, SplitDetailsNavigatorParamList} from '@libs/Navigation/types';
import {canAccessReport} from '@libs/ReportUtils';
import NotFoundPage from '@pages/ErrorPage/NotFoundPage';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import type * as OnyxTypes from '@src/types/onyx';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

type WithReportAndReportActionOrNotFoundProps = PlatformStackScreenProps<
    FlagCommentNavigatorParamList & SplitDetailsNavigatorParamList,
    typeof SCREENS.FLAG_COMMENT_ROOT | typeof SCREENS.SPLIT_DETAILS.ROOT
> & {
    /** The report currently being looked at */
    report: OnyxTypes.Report;

    /** The reportAction from the current route */
    reportAction: OnyxTypes.ReportAction;

    /** The parent report if the current report is a thread and it has a parent */
    parentReport: OnyxEntry<OnyxTypes.Report>;

    /** The report's parentReportAction */
    parentReportAction: NonNullable<OnyxEntry<OnyxTypes.ReportAction>> | null;
};

export default function <TProps extends WithReportAndReportActionOrNotFoundProps>(WrappedComponent: ComponentType<TProps>): ComponentType<TProps> {
    function WithReportOrNotFound(props: TProps) {
        const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${props.route.params.reportID}`, {canBeMissing: true});
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        const [parentReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${getNonEmptyStringOnyxID(report?.parentReportID)}`, {canBeMissing: true});
        const [reportMetadata] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_METADATA}${props.route.params.reportID}`, {canBeMissing: true});
        const [isLoadingReportData] = useOnyx(ONYXKEYS.IS_LOADING_REPORT_DATA, {canBeMissing: true});
        const [betas] = useOnyx(ONYXKEYS.BETAS, {canBeMissing: false});
        const [reportActions] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${props.route.params.reportID}`, {canEvict: false, canBeMissing: true});

        const parentReportAction = useParentReportAction(report);
        const linkedReportAction = useMemo(() => {
            let reportAction: OnyxEntry<OnyxTypes.ReportAction> = reportActions?.[`${props.route.params.reportActionID}`];

            // Handle threads if needed
            if (!reportAction?.reportActionID) {
                reportAction = parentReportAction ?? undefined;
            }

            return reportAction;
        }, [reportActions, props.route.params.reportActionID, parentReportAction]);

        const {shouldUseNarrowLayout} = useResponsiveLayout();

        // For small screen, we don't call openReport API when we go to a sub report page by deeplink
        // So we need to call openReport here for small screen
        useEffect(() => {
            if (!shouldUseNarrowLayout || (!isEmptyObject(report) && !isEmptyObject(linkedReportAction))) {
                return;
            }
            openReport(props.route.params.reportID);
            // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [shouldUseNarrowLayout, props.route.params.reportID]);

        // Perform all the loading checks
        const isLoadingReport = isLoadingReportData && !report?.reportID;
        const isLoadingReportAction = isEmptyObject(reportActions) || (reportMetadata?.isLoadingInitialReportActions && isEmptyObject(linkedReportAction));
        const isReportArchived = useReportIsArchived(report?.reportID);
        const shouldHideReport = !isLoadingReport && (!report?.reportID || !canAccessReport(report, betas, isReportArchived));

        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        if ((isLoadingReport || isLoadingReportAction) && !shouldHideReport) {
            return <FullscreenLoadingIndicator />;
        }

        // Perform the access/not found checks
        // Be sure to avoid showing the not-found page while the parent report actions are still being read from Onyx. The parentReportAction will be undefined while it's being read from Onyx
        // and then linkedReportAction will either be a valid parentReportAction or an empty object. In the case of an empty object, then it's OK to show the not-found page.
        if (shouldHideReport || (parentReportAction !== undefined && isEmptyObject(linkedReportAction))) {
            return <NotFoundPage />;
        }

        return (
            <WrappedComponent
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...props}
                report={report}
                parentReport={parentReport}
                reportAction={linkedReportAction}
                parentReportAction={parentReportAction}
            />
        );
    }

    WithReportOrNotFound.displayName = `withReportOrNotFound(${getComponentDisplayName(WrappedComponent)})`;

    return WithReportOrNotFound;
}

export type {WithReportAndReportActionOrNotFoundProps};
