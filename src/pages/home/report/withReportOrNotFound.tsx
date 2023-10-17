import PropTypes from 'prop-types';
import React, {ComponentType, ForwardedRef, RefAttributes} from 'react';
import {withOnyx} from 'react-native-onyx';
import _ from 'underscore';
import getComponentDisplayName from '../../../libs/getComponentDisplayName';
import NotFoundPage from '../../ErrorPage/NotFoundPage';
import ONYXKEYS from '../../../ONYXKEYS';
import reportPropTypes from '../../reportPropTypes';
import FullscreenLoadingIndicator from '../../../components/FullscreenLoadingIndicator';
import * as ReportUtils from '../../../libs/ReportUtils';
import * as OnyxTypes from '../../../types/onyx';

// export default function withNavigation<TProps extends WithNavigationProps, TRef>(WrappedComponent: ComponentType<TProps & RefAttributes<TRef>>) {
//     function WithNavigation(props: Omit<TProps, keyof WithNavigationProps>, ref: ForwardedRef<TRef>) {
//         const navigation = useNavigation();
//         return (
//             <WrappedComponent
//                 // eslint-disable-next-line react/jsx-props-no-spreading
//                 {...(props as TProps)}
//                 ref={ref}
//                 navigation={navigation}
//             />
//         );
//     }

//     WithNavigation.displayName = `withNavigation(${getComponentDisplayName(WrappedComponent)})`;
//     return React.forwardRef(WithNavigation);
// }

type WithReportOrNotFoundProps = {
    /** The report currently being looked at */
    report: OnyxTypes.Report;
    /** The policies which the user has access to */
    policies: OnyxTypes.Policy;
    /** Beta features list */
    betas: OnyxTypes.Beta[];
    /** Indicated whether the report data is loading */
    isLoadingReportData: boolean;
};

export default function <TProps extends WithReportOrNotFoundProps, TRef>(WrappedComponent: ComponentType<TProps & RefAttributes<TRef>>) {
    // eslint-disable-next-line rulesdir/no-negated-variables
    function WithReportOrNotFound(props: WithReportOrNotFoundProps, ref: ForwardedRef<TRef>) {
        console.log('***********!!!!!************');

        const contentShown = React.useRef(false);

        const shouldShowFullScreenLoadingIndicator = props.isLoadingReportData && (_.isEmpty(props.report) || !props.report.reportID);
        // eslint-disable-next-line rulesdir/no-negated-variables
        const shouldShowNotFoundPage = _.isEmpty(props.report) || !props.report.reportID || !ReportUtils.canAccessReport(props.report, props.policies, props.betas);

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

        // const rest = _.omit(props, ['forwardedRef']);
        return (
            <WrappedComponent
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...(props as TProps)}
                ref={ref}
            />
        );
    }

    // eslint-disable-next-line rulesdir/no-negated-variables
    const withReportOrNotFound = React.forwardRef(WithReportOrNotFound);

    WithReportOrNotFound.displayName = `withReportOrNotFound(${getComponentDisplayName(WrappedComponent)})`;
    return withOnyx({
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
