import type {ComponentType} from 'react';
import React, {useEffect} from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import useOnyx from '@hooks/useOnyx';
import useReportIsArchived from '@hooks/useReportIsArchived';
import getComponentDisplayName from '@libs/getComponentDisplayName';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {MoneyRequestNavigatorParamList} from '@libs/Navigation/types';
import {canUserPerformWriteAction} from '@libs/ReportUtils';
import {openReport} from '@userActions/Report';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import type {Report} from '@src/types/onyx';

type WithWritableReportOrNotFoundOnyxProps = {
    /** The report corresponding to the reportID in the route params */
    report: OnyxEntry<Report>;

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
    | typeof SCREENS.MONEY_REQUEST.STEP_SEND_FROM
    | typeof SCREENS.MONEY_REQUEST.STEP_REPORT
    | typeof SCREENS.MONEY_REQUEST.STEP_COMPANY_INFO
    | typeof SCREENS.MONEY_REQUEST.STEP_ATTENDEES
    | typeof SCREENS.MONEY_REQUEST.STEP_ACCOUNTANT
    | typeof SCREENS.MONEY_REQUEST.STEP_UPGRADE
    | typeof SCREENS.MONEY_REQUEST.STEP_DESTINATION
    | typeof SCREENS.MONEY_REQUEST.STEP_TIME
    | typeof SCREENS.MONEY_REQUEST.STEP_TIME_EDIT
    | typeof SCREENS.MONEY_REQUEST.STEP_SUBRATE
    | typeof SCREENS.MONEY_REQUEST.EDIT_REPORT
    | typeof SCREENS.MONEY_REQUEST.DISTANCE_CREATE
    | typeof SCREENS.MONEY_REQUEST.STEP_DISTANCE_MAP
    | typeof SCREENS.MONEY_REQUEST.STEP_DISTANCE_GPS
    | typeof SCREENS.MONEY_REQUEST.STEP_DISTANCE_ODOMETER
    | typeof SCREENS.MONEY_REQUEST.STEP_DISTANCE_MANUAL;

type WithWritableReportOrNotFoundProps<RouteName extends MoneyRequestRouteName> = WithWritableReportOrNotFoundOnyxProps & PlatformStackScreenProps<MoneyRequestNavigatorParamList, RouteName>;

export default function <TProps extends WithWritableReportOrNotFoundProps<MoneyRequestRouteName>>(
    WrappedComponent: ComponentType<TProps>,
    shouldIncludeDeprecatedIOUType = false,
): React.ComponentType<Omit<TProps, keyof WithWritableReportOrNotFoundOnyxProps>> {
    // eslint-disable-next-line rulesdir/no-negated-variables
    function WithWritableReportOrNotFound(props: Omit<TProps, keyof WithWritableReportOrNotFoundOnyxProps>) {
        const {route} = props;
        const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${route.params.reportID}`, {canBeMissing: true});
        const [isLoadingApp = true] = useOnyx(ONYXKEYS.IS_LOADING_APP, {canBeMissing: true});
        const [reportDraft] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_DRAFT}${route.params.reportID}`, {canBeMissing: true});
        const isReportArchived = useReportIsArchived(report?.reportID);

        const iouTypeParamIsInvalid = !Object.values(CONST.IOU.TYPE)
            .filter((type) => shouldIncludeDeprecatedIOUType || (type !== CONST.IOU.TYPE.REQUEST && type !== CONST.IOU.TYPE.SEND))
            .includes(route.params?.iouType);
        const isEditing = 'action' in route.params && route.params?.action === CONST.IOU.ACTION.EDIT;

        useEffect(() => {
            if (!!report?.reportID || !route.params.reportID || !!reportDraft || !isEditing) {
                return;
            }
            openReport(route.params.reportID);
            // eslint-disable-next-line react-hooks/exhaustive-deps
        }, []);

        if (isEditing && isLoadingApp) {
            return <FullScreenLoadingIndicator />;
        }

        if (iouTypeParamIsInvalid || !canUserPerformWriteAction(report ?? {reportID: ''}, isReportArchived)) {
            return <FullPageNotFoundView shouldShow />;
        }

        return (
            <WrappedComponent
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...(props as TProps)}
                report={report}
                reportDraft={reportDraft}
            />
        );
    }

    WithWritableReportOrNotFound.displayName = `withWritableReportOrNotFound(${getComponentDisplayName(WrappedComponent)})`;

    return WithWritableReportOrNotFound;
}

export type {WithWritableReportOrNotFoundProps};
