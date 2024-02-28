import type {RouteProp} from '@react-navigation/native';
import type {ComponentType, ForwardedRef} from 'react';
import React, {forwardRef} from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import {withOnyx} from 'react-native-onyx';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import getComponentDisplayName from '@libs/getComponentDisplayName';
import * as ReportUtils from '@libs/ReportUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report} from '@src/types/onyx';

type WithWritableReportOrNotFoundOnyxProps = {
    /** The report corresponding to the reportID in the route params */
    report: OnyxEntry<Report>;
};

type WithWritableReportOrNotFoundProps = WithWritableReportOrNotFoundOnyxProps & {
    route: RouteProp<Record<string, {iouType: string; reportID: string} | undefined>>;
};

export default function <TRef, TProps extends WithWritableReportOrNotFoundProps>(WrappedComponent: ComponentType<TProps>) {
    // eslint-disable-next-line rulesdir/no-negated-variables
    function WithWritableReportOrNotFound(props: TProps, ref: ForwardedRef<TRef>) {
        const {report = {reportID: ''}, route} = props;
        const iouTypeParamIsInvalid = !Object.values<string>(CONST.IOU.TYPE).includes(route.params?.iouType ?? '');
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

    return withOnyx<TProps, WithWritableReportOrNotFoundOnyxProps>({
        report: {
            key: ({route}) => `${ONYXKEYS.COLLECTION.REPORT}${route.params?.reportID ?? '0'}`,
        },
    })(forwardRef(WithWritableReportOrNotFound));
}

export type {WithWritableReportOrNotFoundProps};
