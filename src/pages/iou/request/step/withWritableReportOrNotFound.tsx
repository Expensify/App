import type {RouteProp} from '@react-navigation/core';
import type {ComponentType, ForwardedRef, RefAttributes} from 'react';
import React, {forwardRef, useEffect} from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import {withOnyx} from 'react-native-onyx';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import getComponentDisplayName from '@libs/getComponentDisplayName';
import type {MoneyRequestNavigatorParamList} from '@libs/Navigation/types';
import * as ReportUtils from '@libs/ReportUtils';
import * as ReportActions from '@userActions/Report';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import type {Report} from '@src/types/onyx';

type WithWritableReportOrNotFoundOnyxProps = {
    /** The report corresponding to the reportID in the route params */
    report: OnyxEntry<Report>;

    /** Whether the reports are loading. When false it means they are ready to be used. */
    isLoadingApp: OnyxEntry<boolean>;

    /** The draft report corresponding to the reportID in the route params */
    reportDraft: OnyxEntry<Report>;
};

type MoneyRequestRouteName =
    | typeof SCREENS.MONEY_REQUEST.STEP_WAYPOINT
    | typeof SCREENS.MONEY_REQUEST.STEP_DESCRIPTION
    | typeof SCREENS.MONEY_REQUEST.STEP_DATE
    | typeof SCREENS.MONEY_REQUEST.STEP_CATEGORY
    | typeof SCREENS.MONEY_REQUEST.STEP_DISTANCE_RATE
    | typeof SCREENS.MONEY_REQUEST.STEP_CONFIRMATION
    | typeof SCREENS.MONEY_REQUEST.STEP_TAX_RATE
    | typeof SCREENS.MONEY_REQUEST.STEP_AMOUNT
    | typeof SCREENS.MONEY_REQUEST.STEP_DISTANCE
    | typeof SCREENS.MONEY_REQUEST.CREATE
    | typeof SCREENS.MONEY_REQUEST.START
    | typeof SCREENS.MONEY_REQUEST.STEP_TAG
    | typeof SCREENS.MONEY_REQUEST.STEP_PARTICIPANTS
    | typeof SCREENS.MONEY_REQUEST.STEP_MERCHANT
    | typeof SCREENS.MONEY_REQUEST.STEP_TAX_AMOUNT
    | typeof SCREENS.MONEY_REQUEST.STEP_SCAN
    | typeof SCREENS.MONEY_REQUEST.STEP_SEND_FROM;

type Route<T extends MoneyRequestRouteName> = RouteProp<MoneyRequestNavigatorParamList, T>;

type WithWritableReportOrNotFoundProps<T extends MoneyRequestRouteName> = WithWritableReportOrNotFoundOnyxProps & {route: Route<T>};

export default function <TProps extends WithWritableReportOrNotFoundProps<MoneyRequestRouteName>, TRef>(
    WrappedComponent: ComponentType<TProps & RefAttributes<TRef>>,
    shouldIncludeDeprecatedIOUType = false,
): React.ComponentType<Omit<TProps & RefAttributes<TRef>, keyof WithWritableReportOrNotFoundOnyxProps>> {
    // eslint-disable-next-line rulesdir/no-negated-variables
    function WithWritableReportOrNotFound(props: TProps, ref: ForwardedRef<TRef>) {
        const {report = {reportID: ''}, route, isLoadingApp = true, reportDraft} = props;
        const iouTypeParamIsInvalid = !Object.values(CONST.IOU.TYPE)
            .filter((type) => shouldIncludeDeprecatedIOUType || (type !== CONST.IOU.TYPE.REQUEST && type !== CONST.IOU.TYPE.SEND))
            .includes(route.params?.iouType);
        const isEditing = 'action' in route.params && route.params?.action === CONST.IOU.ACTION.EDIT;
        const canUserPerformWriteAction = ReportUtils.canUserPerformWriteAction(report);

        useEffect(() => {
            if (!!report?.reportID || !route.params.reportID || !!reportDraft) {
                return;
            }

            ReportActions.openReport(route.params.reportID);

            // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
        }, []);

        if (isEditing && isLoadingApp) {
            return <FullScreenLoadingIndicator />;
        }

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
            key: ({route}) => `${ONYXKEYS.COLLECTION.REPORT}${route.params.reportID ?? '-1'}`,
        },
        isLoadingApp: {
            key: ONYXKEYS.IS_LOADING_APP,
        },
        reportDraft: {
            key: ({route}) => `${ONYXKEYS.COLLECTION.REPORT_DRAFT}${route.params.reportID ?? '-1'}`,
        },
    })(forwardRef(WithWritableReportOrNotFound));
}

export type {WithWritableReportOrNotFoundProps};
