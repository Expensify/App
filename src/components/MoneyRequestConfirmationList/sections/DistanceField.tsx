import React from 'react';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import DistanceRequestUtils from '@libs/DistanceRequestUtils';
import Navigation from '@libs/Navigation/Navigation';
import CONST from '@src/CONST';
import type {IOUAction, IOUType} from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type {Unit} from '@src/types/onyx/Policy';

type DistanceFieldProps = {
    hasRoute: boolean;
    distance: number;
    unit: Unit | undefined;
    rate: number | undefined;
    isManualDistanceRequest: boolean;
    isOdometerDistanceRequest: boolean;
    isGPSDistanceRequest: boolean;
    isReadOnly: boolean;
    didConfirm: boolean;
    transactionID: string | undefined;
    action: IOUAction;
    iouType: Exclude<IOUType, typeof CONST.IOU.TYPE.REQUEST | typeof CONST.IOU.TYPE.SEND>;
    reportID: string;
    reportActionID: string | undefined;
};

function DistanceField({
    hasRoute,
    distance,
    unit,
    rate,
    isManualDistanceRequest,
    isOdometerDistanceRequest,
    isGPSDistanceRequest,
    isReadOnly,
    didConfirm,
    transactionID,
    action,
    iouType,
    reportID,
    reportActionID,
}: DistanceFieldProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    return (
        <MenuItemWithTopDescription
            shouldShowRightIcon={!isReadOnly && !isGPSDistanceRequest}
            title={DistanceRequestUtils.getDistanceForDisplay(hasRoute, distance, unit, rate, translate, undefined, isManualDistanceRequest)}
            description={translate('common.distance')}
            style={[styles.moneyRequestMenuItem]}
            titleStyle={styles.flex1}
            onPress={() => {
                if (!transactionID) {
                    return;
                }

                if (isManualDistanceRequest) {
                    Navigation.navigate(ROUTES.MONEY_REQUEST_STEP_DISTANCE_MANUAL.getRoute(action, iouType, transactionID, reportID, Navigation.getActiveRoute(), reportActionID));
                    return;
                }

                if (isOdometerDistanceRequest) {
                    Navigation.navigate(ROUTES.MONEY_REQUEST_STEP_DISTANCE_ODOMETER.getRoute(action, iouType, transactionID, reportID));
                    return;
                }

                Navigation.navigate(ROUTES.MONEY_REQUEST_STEP_DISTANCE.getRoute(action, iouType, transactionID, reportID, Navigation.getActiveRoute(), reportActionID));
            }}
            disabled={didConfirm}
            interactive={!isReadOnly && !isGPSDistanceRequest}
            sentryLabel={CONST.SENTRY_LABEL.REQUEST_CONFIRMATION_LIST.DISTANCE_FIELD}
        />
    );
}

export default DistanceField;
