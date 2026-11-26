import DropdownFieldRow from '@components/DropdownFieldRow';
import {useConfirmationFields} from '@components/MoneyRequestConfirmationFields/context';
import {useProductTrainingContext} from '@components/ProductTrainingContext';
import {useSearchRouterState} from '@components/Search/SearchRouter/SearchRouterContext';
import EducationalTooltip from '@components/Tooltip/EducationalTooltip';

import {useCurrencyListActions} from '@hooks/useCurrencyList';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useThemeStyles from '@hooks/useThemeStyles';

import DistanceRequestUtils from '@libs/DistanceRequestUtils';
import type {MileageRate} from '@libs/DistanceRequestUtils';
import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import Navigation from '@libs/Navigation/Navigation';
import ViolationsUtils from '@libs/Violations/ViolationsUtils';

import variables from '@styles/variables';

import CONST from '@src/CONST';
import ROUTES, {DYNAMIC_ROUTES} from '@src/ROUTES';
import type * as OnyxTypes from '@src/types/onyx';
import type {Unit} from '@src/types/onyx/Policy';

import type {OnyxEntry} from 'react-native-onyx';

import React from 'react';

import ExpenseFieldContainer from './ExpenseFieldContainer';

type RateFieldProps = {
    distanceRateName: string | undefined;
    distanceRateCurrency: string;
    unit: Unit | undefined;
    mileageRate: MileageRate;
    expenseDate: string | undefined;
    customUnitRateID: string | undefined;
    policy: OnyxEntry<OnyxTypes.Policy>;
    formError: string;
    shouldNavigateToUpgradePath: boolean;
    shouldSelectPolicy: boolean;
    shouldShowRateAutoUpdatedTooltip?: boolean;
};

function RateField({
    distanceRateName,
    distanceRateCurrency,
    unit,
    mileageRate,
    expenseDate,
    customUnitRateID,
    policy,
    formError,
    shouldNavigateToUpgradePath,
    shouldSelectPolicy,
    shouldShowRateAutoUpdatedTooltip,
}: RateFieldProps) {
    const {action, iouType, transactionID, reportID, reportActionID, isReadOnly, didConfirm, isPolicyExpenseChat} = useConfirmationFields();
    const styles = useThemeStyles();
    const {translate, toLocaleDigit, dateFnsLocale} = useLocalize();
    const {getCurrencySymbol, convertToDisplayString} = useCurrencyListActions();
    const shouldDisplayDistanceRateError = formError === 'iou.error.invalidRate';
    const {isOffline} = useNetwork();

    const isRateOutOfDateRange = DistanceRequestUtils.isCustomUnitRateOutOfDateRange({customUnitRateID, policy, expenseDate});
    const policyRate = customUnitRateID && policy ? DistanceRequestUtils.getRateByCustomUnitRateID({customUnitRateID, policy}) : undefined;
    const rateOutOfDateRangeErrorText = isRateOutOfDateRange
        ? ViolationsUtils.getViolationTranslation({
              dateFnsLocale,
              violation: {
                  name: CONST.VIOLATIONS.CUSTOM_UNIT_RATE_OUT_OF_DATE_RANGE,
                  type: CONST.VIOLATION_TYPES.WARNING,
                  showInReview: true,
                  data: {
                      startDate: policyRate?.startDate ?? mileageRate.startDate ?? undefined,
                      endDate: policyRate?.endDate ?? mileageRate.endDate ?? undefined,
                  },
              },
              translate,
              convertToDisplayString,
          })
        : '';

    const isTrackExpense = iouType === CONST.IOU.TYPE.TRACK;
    const rate = mileageRate.rate;
    const isRateInteractive = rate !== undefined && !isReadOnly && iouType !== CONST.IOU.TYPE.SPLIT;

    const {isSearchRouterDisplayed} = useSearchRouterState();

    const shouldMountMileageRateTooltip = !!shouldShowRateAutoUpdatedTooltip && !isRateOutOfDateRange && !isSearchRouterDisplayed && !shouldDisplayDistanceRateError;
    const {renderProductTrainingTooltip, shouldShowProductTrainingTooltip, hideProductTrainingTooltip} = useProductTrainingContext(
        CONST.PRODUCT_TRAINING_TOOLTIP_NAMES.MILEAGE_RATE_AUTO_UPDATED,
        shouldMountMileageRateTooltip,
    );

    // The bordered row has no tooltip of its own, so its wrapper owns the rate-change hint and anchor offsets.
    const mileageRateTooltip = {
        shouldRender: shouldMountMileageRateTooltip,
        shouldDisplayTooltip: shouldShowProductTrainingTooltip,
        anchorAlignment: {horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.LEFT, vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.BOTTOM},
        renderTooltipContent: renderProductTrainingTooltip,
        wrapperStyle: styles.productTrainingTooltipWrapper,
        shiftHorizontal: variables.mileageRateTooltipShiftHorizontal,
        shiftVertical: variables.mileageRateTooltipShiftVertical,
        onTooltipPress: hideProductTrainingTooltip,
        shouldHideOnScroll: true,
    } as const;

    // Pass false for isCustomUnitOutOfPolicy because this is the expense creation/edit
    // confirmation screen where a rate violation is not applicable yet.
    const rateTitle = DistanceRequestUtils.getRateForExpenseDisplay(distanceRateName, false, unit, rate, distanceRateCurrency, translate, toLocaleDigit, getCurrencySymbol, isOffline);
    const rateErrorText = shouldDisplayDistanceRateError ? translate('iou.error.invalidRate') : rateOutOfDateRangeErrorText;

    const openRatePage = () => {
        if (!transactionID) {
            return;
        }

        if ((!isPolicyExpenseChat && !isTrackExpense) || (shouldNavigateToUpgradePath && isTrackExpense)) {
            Navigation.navigate(
                createDynamicRoute(
                    DYNAMIC_ROUTES.MONEY_REQUEST_UPGRADE.getRoute({
                        action,
                        iouType,
                        transactionID,
                        reportID,
                        upgradePath: CONST.UPGRADE_PATHS.DISTANCE_RATES,
                        upgradeBackTo: Navigation.getActiveRoute(),
                        shouldSubmitExpense: !isTrackExpense,
                    }),
                ),
            );
        } else if (!policy && shouldSelectPolicy && isTrackExpense) {
            Navigation.navigate(
                ROUTES.SET_DEFAULT_WORKSPACE.getRoute(createDynamicRoute(DYNAMIC_ROUTES.MONEY_REQUEST_STEP_DISTANCE_RATE.getRoute(action, iouType, transactionID, reportID, reportActionID))),
            );
        } else {
            Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.MONEY_REQUEST_STEP_DISTANCE_RATE.getRoute(action, iouType, transactionID, reportID, reportActionID)));
        }
    };

    return (
        <ExpenseFieldContainer>
            <EducationalTooltip
                shouldRender={mileageRateTooltip.shouldRender}
                shouldDisplayTooltip={mileageRateTooltip.shouldDisplayTooltip}
                anchorAlignment={mileageRateTooltip.anchorAlignment}
                renderTooltipContent={mileageRateTooltip.renderTooltipContent}
                wrapperStyle={mileageRateTooltip.wrapperStyle}
                shiftHorizontal={mileageRateTooltip.shiftHorizontal}
                shiftVertical={mileageRateTooltip.shiftVertical}
                onTooltipPress={mileageRateTooltip.onTooltipPress}
                shouldHideOnScroll={mileageRateTooltip.shouldHideOnScroll}
            >
                <DropdownFieldRow
                    name={translate('common.rate')}
                    value={rateTitle}
                    errorText={rateErrorText}
                    onPress={openRatePage}
                    isDisabled={didConfirm}
                    isInteractive={isRateInteractive}
                    sentryLabel={CONST.SENTRY_LABEL.REQUEST_CONFIRMATION_LIST.RATE_FIELD}
                />
            </EducationalTooltip>
        </ExpenseFieldContainer>
    );
}

export default RateField;
