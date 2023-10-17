import React, {ComponentType, ForwardedRef, RefAttributes} from 'react';
import {OnyxEntry, withOnyx} from 'react-native-onyx';
import getComponentDisplayName from '../../../libs/getComponentDisplayName';
import NotFoundPage from '../../ErrorPage/NotFoundPage';
import ONYXKEYS from '../../../ONYXKEYS';
import FullscreenLoadingIndicator from '../../../components/FullscreenLoadingIndicator';
import * as ReportUtils from '../../../libs/ReportUtils';
import * as OnyxTypes from '../../../types/onyx';

type OnyxProps = {
    /** The report currently being looked at */
    report: OnyxEntry<OnyxTypes.Report>;
    /** The policies which the user has access to */
    policies: OnyxEntry<OnyxTypes.Policy>;
    /** Beta features list */
    betas: OnyxEntry<OnyxTypes.Beta[]>;
    /** Indicated whether the report data is loading */
    isLoadingReportData: OnyxEntry<boolean>;
};

type RouteProps = {
    route: {
        params: {
            reportID: string;
        };
    };
};

export default function <TProps extends OnyxProps, TRef>(WrappedComponent: ComponentType<TProps & RefAttributes<TRef>>) {
    // eslint-disable-next-line rulesdir/no-negated-variables
    function WithReportOrNotFound(props: TProps, ref: ForwardedRef<TRef>) {
        const contentShown = React.useRef(false);

        const shouldShowFullScreenLoadingIndicator = props.isLoadingReportData && (!Object.entries(props.report ?? {}).length || !props.report?.reportID);
        // eslint-disable-next-line rulesdir/no-negated-variables
        const shouldShowNotFoundPage = !Object.entries(props.report ?? {}).length || !props.report?.reportID || !ReportUtils.canAccessReport(props.report, props.policies, props.betas, {});

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

    // eslint-disable-next-line rulesdir/no-negated-variables
    const withReportOrNotFound = React.forwardRef(WithReportOrNotFound);

    return withOnyx<TProps & RefAttributes<TRef> & RouteProps, OnyxProps>({
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
    })(withReportOrNotFound);
}
