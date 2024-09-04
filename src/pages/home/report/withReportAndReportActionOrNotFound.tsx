/* eslint-disable rulesdir/no-negated-variables */
import type {StackScreenProps} from '@react-navigation/stack';
import type {ComponentType, ForwardedRef, RefAttributes} from 'react';
import React, {useCallback, useEffect} from 'react';
import type {OnyxCollection, OnyxEntry, WithOnyxState} from 'react-native-onyx';
import {withOnyx} from 'react-native-onyx';
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
): ComponentType<Omit<TProps & RefAttributes<TRef>, keyof OnyxProps>> {
    function WithReportOrNotFound(props: TProps, ref: ForwardedRef<TRef>) {
        const getReportAction = useCallback(() => {
            let reportAction: OnyxEntry<OnyxTypes.ReportAction> = props.reportActions?.[`${props.route.params.reportActionID}`];

            // Handle threads if needed
            if (!reportAction?.reportActionID) {
                reportAction = props?.parentReportAction ?? undefined;
            }

            return reportAction;
        }, [props.reportActions, props.route.params.reportActionID, props.parentReportAction]);

        const reportAction = getReportAction();

        const {shouldUseNarrowLayout} = useResponsiveLayout();

        // For small screen, we don't call openReport API when we go to a sub report page by deeplink
        // So we need to call openReport here for small screen
        useEffect(() => {
            if (!shouldUseNarrowLayout || (!isEmptyObject(props.report) && !isEmptyObject(reportAction))) {
                return;
            }
            Report.openReport(props.route.params.reportID);
            // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
        }, [shouldUseNarrowLayout, props.route.params.reportID]);

        // Perform all the loading checks
        const isLoadingReport = props.isLoadingReportData && !props.report?.reportID;
        const isLoadingReportAction = isEmptyObject(props.reportActions) || (props.reportMetadata?.isLoadingInitialReportActions && isEmptyObject(getReportAction()));
        const shouldHideReport = !isLoadingReport && (!props.report?.reportID || !ReportUtils.canAccessReport(props.report, props.policies, props.betas));

        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        if ((isLoadingReport || isLoadingReportAction) && !shouldHideReport) {
            return <FullscreenLoadingIndicator />;
        }

        // Perform the access/not found checks
        // Be sure to avoid showing the not-found page while the parent report actions are still being read from Onyx. The parentReportAction will be undefined while it's being read from Onyx
        // and then reportAction will either be a valid parentReportAction or an empty object. In the case of an empty object, then it's OK to show the not-found page.
        if (shouldHideReport || (props?.parentReportAction !== undefined && isEmptyObject(reportAction))) {
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

    return withOnyx<TProps & RefAttributes<TRef>, OnyxProps>({
        report: {
            key: ({route}) => `${ONYXKEYS.COLLECTION.REPORT}${route.params.reportID}`,
        },
        parentReport: {
            key: ({report}) => `${ONYXKEYS.COLLECTION.REPORT}${report ? report.parentReportID : '-1'}`,
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
        parentReportAction: {
            key: ({report}) => `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report ? report.parentReportID : 0}`,
            selector: (parentReportActions: OnyxEntry<OnyxTypes.ReportActions>, props?: WithOnyxState<OnyxProps>): NonNullable<OnyxEntry<OnyxTypes.ReportAction>> | null => {
                const parentReportActionID = props?.report?.parentReportActionID;
                if (!parentReportActionID) {
                    return null;
                }
                return parentReportActions?.[parentReportActionID] ?? null;
            },
            canEvict: false,
        },
    })(React.forwardRef(WithReportOrNotFound));
}

export type {WithReportAndReportActionOrNotFoundProps};
