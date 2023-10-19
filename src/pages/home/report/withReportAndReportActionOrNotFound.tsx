import React, {ComponentType, ForwardedRef, RefAttributes} from 'react';
import {withOnyx, OnyxEntry} from 'react-native-onyx';
import {RouteProp} from '@react-navigation/native';
import isEmpty from 'lodash/isEmpty';
import getComponentDisplayName from '../../../libs/getComponentDisplayName';
import NotFoundPage from '../../ErrorPage/NotFoundPage';
import ONYXKEYS from '../../../ONYXKEYS';
import type {Report, Policy, Beta} from '../../../types/onyx';
import FullscreenLoadingIndicator from '../../../components/FullscreenLoadingIndicator';
import * as ReportUtils from '../../../libs/ReportUtils';

type OnyxProps = {
    /** The report currently being looked at */
    report: OnyxEntry<Report>;

    /** The policies which the user has access to */
    policies: OnyxEntry<Policy>;

    /** Beta features list */
    betas: OnyxEntry<Beta[]>;

    /** Indicated whether the report data is loading */
    isLoadingReportData: OnyxEntry<boolean>;
};

type ComponentProps = OnyxProps & {
    route: RouteProp<{params: {reportID: string}}>;
};

export default function <TProps extends ComponentProps, TRef>(WrappedComponent: ComponentType<TProps & RefAttributes<TRef>>) {
    // eslint-disable-next-line rulesdir/no-negated-variables
    function WithReportOrNotFound(props: OnyxProps, ref: ForwardedRef<TRef>) {
        const contentShown = React.useRef(false);

        const shouldShowFullScreenLoadingIndicator = props.isLoadingReportData && (isEmpty(props.report) || !props.report.reportID);
        // eslint-disable-next-line rulesdir/no-negated-variables
        const shouldShowNotFoundPage = isEmpty(props.report) || !props.report.reportID || !ReportUtils.canAccessReport(props.report, props.policies, props.betas, {});

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
                {...(props as TProps)}
                ref={ref}
            />
        );
    }

    WithReportOrNotFound.displayName = `withReportOrNotFound(${getComponentDisplayName(WrappedComponent)})`;

    // eslint-disable-next-line rulesdir/no-negated-variables
    const withReportOrNotFound = React.forwardRef(WithReportOrNotFound);

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
    })(withReportOrNotFound);
}
