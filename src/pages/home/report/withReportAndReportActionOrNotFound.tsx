/* eslint-disable rulesdir/no-negated-variables */
import type {StackScreenProps} from '@react-navigation/stack';
import type {ComponentType, ForwardedRef, RefAttributes} from 'react';
import React, {useCallback, useEffect} from 'react';
import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import {useOnyx} from 'react-native-onyx';
import FullscreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import getComponentDisplayName from '@libs/getComponentDisplayName';
import type {FlagCommentNavigatorParamList, SplitDetailsNavigatorParamList} from '@libs/Navigation/types';
import * as ReportUtils from '@libs/ReportUtils';
import NotFoundPage from '@pages/ErrorPage/NotFoundPage';
import * as Report from '@userActions/Report';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import type * as OnyxTypes from '@src/types/onyx';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

type OnyxProps = {
    /** The report currently being looked at */
    report: OnyxEntry<OnyxTypes.Report>;

    /** The parent report if the current report is a thread and it has a parent */
    parentReport: OnyxEntry<OnyxTypes.Report>;

    /** The report metadata */
    reportMetadata: OnyxEntry<OnyxTypes.ReportMetadata>;

    /** Array of report actions for this report */
    reportActions: OnyxEntry<OnyxTypes.ReportActions>;

    /** The report's parentReportAction */
    parentReportAction: NonNullable<OnyxEntry<OnyxTypes.ReportAction>> | null;

    /** The policies which the user has access to */
    policies: OnyxCollection<OnyxTypes.Policy>;

    /** Beta features list */
    betas: OnyxEntry<OnyxTypes.Beta[]>;

    /** Indicated whether the report data is loading */
    isLoadingReportData: OnyxEntry<boolean>;
};

type WithReportAndReportActionOrNotFoundProps = OnyxProps &
    StackScreenProps<FlagCommentNavigatorParamList & SplitDetailsNavigatorParamList, typeof SCREENS.FLAG_COMMENT_ROOT | typeof SCREENS.SPLIT_DETAILS.ROOT>;

export default function <TProps extends WithReportAndReportActionOrNotFoundProps, TRef>(
    WrappedComponent: ComponentType<TProps & RefAttributes<TRef>>,
): ComponentType<TProps & RefAttributes<TRef>> {
    function WithReportOrNotFound(props: TProps, ref: ForwardedRef<TRef>) {
        const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${props.route.params.reportID}`);
        const [parentReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${report ? report.parentReportID : '-1'}`);
        const [reportMetadata] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_METADATA}${props.route.params.reportID}`);
        const [isLoadingReportData] = useOnyx(ONYXKEYS.IS_LOADING_REPORT_DATA);
        const [betas] = useOnyx(ONYXKEYS.BETAS);
        const [policies] = useOnyx(ONYXKEYS.COLLECTION.POLICY);
        const [reportActions] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${props.route.params.reportID}`, {canEvict: false});
        const [parentReportAction] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report ? report.parentReportID : 0}`, {
            selector: (parentReportActions: OnyxEntry<OnyxTypes.ReportActions>): NonNullable<OnyxEntry<OnyxTypes.ReportAction>> | null => {
                const parentReportActionID = report?.parentReportActionID;
                if (!parentReportActionID) {
                    return null;
                }
                return parentReportActions?.[parentReportActionID] ?? null;
            },
            canEvict: false,
        });
        const getReportAction = useCallback(() => {
            let reportAction: OnyxEntry<OnyxTypes.ReportAction> = reportActions?.[`${props.route.params.reportActionID}`];

            // Handle threads if needed
            if (!reportAction?.reportActionID) {
                reportAction = parentReportAction ?? undefined;
            }

            return reportAction;
        }, [reportActions, props.route.params.reportActionID, parentReportAction]);

        const reportAction = getReportAction();

        const {shouldUseNarrowLayout} = useResponsiveLayout();

        // For small screen, we don't call openReport API when we go to a sub report page by deeplink
        // So we need to call openReport here for small screen
        useEffect(() => {
            if (!shouldUseNarrowLayout || (!isEmptyObject(report) && !isEmptyObject(reportAction))) {
                return;
            }
            Report.openReport(props.route.params.reportID);
            // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
        }, [shouldUseNarrowLayout, props.route.params.reportID]);

        // Perform all the loading checks
        const isLoadingReport = isLoadingReportData && !report?.reportID;
        const isLoadingReportAction = isEmptyObject(reportActions) || (reportMetadata?.isLoadingInitialReportActions && isEmptyObject(getReportAction()));
        const shouldHideReport = !isLoadingReport && (!report?.reportID || !ReportUtils.canAccessReport(report, policies, betas));

        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        if ((isLoadingReport || isLoadingReportAction) && !shouldHideReport) {
            return <FullscreenLoadingIndicator />;
        }

        // Perform the access/not found checks
        // Be sure to avoid showing the not-found page while the parent report actions are still being read from Onyx. The parentReportAction will be undefined while it's being read from Onyx
        // and then reportAction will either be a valid parentReportAction or an empty object. In the case of an empty object, then it's OK to show the not-found page.
        if (shouldHideReport || (parentReportAction !== undefined && isEmptyObject(reportAction))) {
            return <NotFoundPage />;
        }

        return (
            <WrappedComponent
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...{...props, report, parentReport, reportMetadata, isLoadingReportData, betas, policies, reportActions, parentReportAction}}
                ref={ref}
            />
        );
    }

    WithReportOrNotFound.displayName = `withReportOrNotFound(${getComponentDisplayName(WrappedComponent)})`;

    return React.forwardRef(WithReportOrNotFound);
}

export type {WithReportAndReportActionOrNotFoundProps};
