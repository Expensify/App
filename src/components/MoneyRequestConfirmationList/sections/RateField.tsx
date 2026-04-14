import React from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import {useCurrencyListActions} from '@hooks/useCurrencyList';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useThemeStyles from '@hooks/useThemeStyles';
import DistanceRequestUtils from '@libs/DistanceRequestUtils';
import Navigation from '@libs/Navigation/Navigation';
import CONST from '@src/CONST';
import type {IOUAction, IOUType} from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type * as OnyxTypes from '@src/types/onyx';
import type {Unit} from '@src/types/onyx/Policy';

type RateFieldProps = {
    distanceRateName: string | undefined;
    distanceRateCurrency: string;
    unit: Unit | undefined;
    rate: number | undefined;
    didConfirm: boolean;
    isReadOnly: boolean;
    isPolicyExpenseChat: boolean;
    policy: OnyxEntry<OnyxTypes.Policy>;
    transactionID: string | undefined;
    action: IOUAction;
    iouType: Exclude<IOUType, typeof CONST.IOU.TYPE.REQUEST | typeof CONST.IOU.TYPE.SEND>;
    reportID: string;
    reportActionID: string | undefined;
    formError: string;
    shouldNavigateToUpgradePath: boolean;
    shouldSelectPolicy: boolean;
};

function RateField({
    distanceRateName,
    distanceRateCurrency,
    unit,
    rate,
    didConfirm,
    isReadOnly,
    isPolicyExpenseChat,
    policy,
    transactionID,
    action,
    iouType,
    reportID,
    reportActionID,
    formError,
    shouldNavigateToUpgradePath,
    shouldSelectPolicy,
}: RateFieldProps) {
    const styles = useThemeStyles();
    const {translate, toLocaleDigit} = useLocalize();
    const {getCurrencySymbol} = useCurrencyListActions();
    const shouldDisplayDistanceRateError = formError === 'iou.error.invalidRate';
    const {isOffline} = useNetwork();

    const isTrackExpense = iouType === CONST.IOU.TYPE.TRACK;
    const isRateInteractive = !!rate && !isReadOnly && iouType !== CONST.IOU.TYPE.SPLIT;

    return (
        <MenuItemWithTopDescription
            shouldShowRightIcon={isRateInteractive}
            // Pass false for isCustomUnitOutOfPolicy because this is the expense creation/edit
            // confirmation screen where a rate violation is not applicable yet.
            title={DistanceRequestUtils.getRateForExpenseDisplay(distanceRateName, false, unit, rate, distanceRateCurrency, translate, toLocaleDigit, getCurrencySymbol, isOffline)}
            description={translate('common.rate')}
            style={[styles.moneyRequestMenuItem]}
            titleStyle={styles.flex1}
            onPress={() => {
                if (!transactionID) {
                    return;
                }

                if ((!isPolicyExpenseChat && !isTrackExpense) || (shouldNavigateToUpgradePath && isTrackExpense)) {
                    Navigation.navigate(
                        ROUTES.MONEY_REQUEST_UPGRADE.getRoute({
                            action,
                            iouType,
                            transactionID,
                            reportID,
                            upgradePath: CONST.UPGRADE_PATHS.DISTANCE_RATES,
                            backTo: Navigation.getActiveRoute(),
                            shouldSubmitExpense: !isTrackExpense,
                        }),
                    );
                } else if (!policy && shouldSelectPolicy && isTrackExpense) {
                    Navigation.navigate(
                        ROUTES.SET_DEFAULT_WORKSPACE.getRoute(
                            ROUTES.MONEY_REQUEST_STEP_DISTANCE_RATE.getRoute(action, iouType, transactionID, reportID, Navigation.getActiveRoute(), reportActionID),
                        ),
                    );
                } else {
                    Navigation.navigate(ROUTES.MONEY_REQUEST_STEP_DISTANCE_RATE.getRoute(action, iouType, transactionID, reportID, Navigation.getActiveRoute(), reportActionID));
                }
            }}
            brickRoadIndicator={shouldDisplayDistanceRateError ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}
            disabled={didConfirm}
            interactive={isRateInteractive}
            sentryLabel={CONST.SENTRY_LABEL.REQUEST_CONFIRMATION_LIST.RATE_FIELD}
        />
    );
}

export default RateField;
