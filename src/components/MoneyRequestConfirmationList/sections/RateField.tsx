import React, {useMemo} from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import {useProductTrainingContext} from '@components/ProductTrainingContext';
import {useCurrencyListActions} from '@hooks/useCurrencyList';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useThemeStyles from '@hooks/useThemeStyles';
import DistanceRequestUtils, {type MileageRate} from '@libs/DistanceRequestUtils';
import Navigation from '@libs/Navigation/Navigation';
import ViolationsUtils from '@libs/Violations/ViolationsUtils';
import variables from '@styles/variables';
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
    mileageRate: MileageRate;
    expenseDate: string | undefined;
    customUnitRateID: string | undefined;
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
    shouldShowRateAutoUpdatedTooltip?: boolean;
};

function isRateOutOfDateRangeForConfirmation({
    customUnitRateID,
    policy,
    mileageRate,
    expenseDate,
}: {
    customUnitRateID: string | undefined;
    policy: OnyxEntry<OnyxTypes.Policy>;
    mileageRate: MileageRate;
    expenseDate: string | undefined;
}): boolean {
    if (!expenseDate || !policy?.id) {
        return false;
    }

    if (!customUnitRateID || ['-1', CONST.CUSTOM_UNITS.FAKE_P2P_ID].includes(customUnitRateID)) {
        return false;
    }

    const policyRates = DistanceRequestUtils.getMileageRates(policy);
    const isRateValidForPolicy = customUnitRateID in policyRates && policyRates[customUnitRateID].enabled !== false;

    if (!isRateValidForPolicy) {
        return false;
    }

    return !DistanceRequestUtils.isRateEligibleForDate(mileageRate, expenseDate);
}

function RateField({
    distanceRateName,
    distanceRateCurrency,
    unit,
    rate,
    mileageRate,
    expenseDate,
    customUnitRateID,
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
    shouldShowRateAutoUpdatedTooltip,
}: RateFieldProps) {
    const styles = useThemeStyles();
    const {translate, toLocaleDigit} = useLocalize();
    const {getCurrencySymbol, convertToDisplayString} = useCurrencyListActions();
    const shouldDisplayDistanceRateError = formError === 'iou.error.invalidRate';
    const {isOffline} = useNetwork();

    const isRateOutOfDateRange = isRateOutOfDateRangeForConfirmation({customUnitRateID, policy, mileageRate, expenseDate});
    const rateOutOfDateRangeErrorText = useMemo(() => {
        if (!isRateOutOfDateRange) {
            return '';
        }

        return ViolationsUtils.getViolationTranslation({
            violation: {
                name: CONST.VIOLATIONS.CUSTOM_UNIT_RATE_OUT_OF_DATE_RANGE,
                type: CONST.VIOLATION_TYPES.WARNING,
                showInReview: true,
                data: {
                    startDate: mileageRate.startDate,
                    endDate: mileageRate.endDate,
                },
            },
            translate,
            convertToDisplayString,
        });
    }, [convertToDisplayString, isRateOutOfDateRange, mileageRate.endDate, mileageRate.startDate, translate]);

    const isTrackExpense = iouType === CONST.IOU.TYPE.TRACK;
    const isRateInteractive = !!rate && !isReadOnly && iouType !== CONST.IOU.TYPE.SPLIT;

    const {renderProductTrainingTooltip, shouldShowProductTrainingTooltip, hideProductTrainingTooltip} = useProductTrainingContext(
        CONST.PRODUCT_TRAINING_TOOLTIP_NAMES.MILEAGE_RATE_AUTO_UPDATED,
        !!shouldShowRateAutoUpdatedTooltip && !isRateOutOfDateRange,
    );

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
            brickRoadIndicator={shouldDisplayDistanceRateError || isRateOutOfDateRange ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}
            errorText={shouldDisplayDistanceRateError ? translate('iou.error.invalidRate') : rateOutOfDateRangeErrorText}
            disabled={didConfirm}
            interactive={isRateInteractive}
            sentryLabel={CONST.SENTRY_LABEL.REQUEST_CONFIRMATION_LIST.RATE_FIELD}
            shouldRenderTooltip={shouldShowProductTrainingTooltip}
            renderTooltipContent={renderProductTrainingTooltip}
            tooltipWrapperStyle={styles.productTrainingTooltipWrapper}
            tooltipAnchorAlignment={{horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.LEFT, vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.BOTTOM}}
            tooltipShiftHorizontal={variables.mileageRateTooltipShiftHorizontal}
            tooltipShiftVertical={variables.mileageRateTooltipShiftVertical}
            onEducationTooltipPress={hideProductTrainingTooltip}
            shouldHideOnScroll
        />
    );
}

export default RateField;
