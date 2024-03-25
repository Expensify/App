import type {RouteProp} from '@react-navigation/core';
import type {ComponentType, ForwardedRef, RefAttributes} from 'react';
import React, {forwardRef} from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import {withOnyx} from 'react-native-onyx';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import getComponentDisplayName from '@libs/getComponentDisplayName';
import type {MoneyRequestNavigatorParamList} from '@libs/Navigation/types';
import * as ReportUtils from '@libs/ReportUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import type {Report} from '@src/types/onyx';

type WithWritableReportOrNotFoundOnyxProps = {
    /** The report corresponding to the reportID in the route params */
    report: OnyxEntry<Report>;
};

type Route = RouteProp<MoneyRequestNavigatorParamList, typeof SCREENS.MONEY_REQUEST.STEP_WAYPOINT>;

type WithWritableReportOrNotFoundProps = WithWritableReportOrNotFoundOnyxProps & {route: Route};

export default function <TProps extends WithWritableReportOrNotFoundProps, TRef>(
    WrappedComponent: ComponentType<TProps & RefAttributes<TRef>>,
): React.ComponentType<Omit<TProps & RefAttributes<TRef>, keyof WithWritableReportOrNotFoundOnyxProps>> {
    // eslint-disable-next-line rulesdir/no-negated-variables
    function WithWritableReportOrNotFound(props: TProps, ref: ForwardedRef<TRef>) {
        const {report = {reportID: ''}, route} = props;
        const iouTypeParamIsInvalid = !Object.values(CONST.IOU.TYPE).includes(route.params?.iouType);
        const canUserPerformWriteAction = ReportUtils.canUserPerformWriteAction(report);

        if (iouTypeParamIsInvalid || !canUserPerformWriteAction) {
            return <FullPageNotFoundView shouldShow />;
        }

        return (
            <WrappedComponent
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...props}
                ref={ref}
            />
        );
    }

    WithWritableReportOrNotFound.displayName = `withWritableReportOrNotFound(${getComponentDisplayName(WrappedComponent)})`;

    return withOnyx<TProps & RefAttributes<TRef>, WithWritableReportOrNotFoundOnyxProps>({
        report: {
            key: ({route}) => `${ONYXKEYS.COLLECTION.REPORT}${route.params?.reportID ?? '0'}`,
        },
    })(forwardRef(WithWritableReportOrNotFound));
}

export type {WithWritableReportOrNotFoundProps};
