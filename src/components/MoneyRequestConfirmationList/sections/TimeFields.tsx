import MenuItemField from '@components/MenuItem/presets/MenuItemField';
import {useConfirmationFields} from '@components/MoneyRequestConfirmationFields/context';

import {useCurrencyListActions} from '@hooks/useCurrencyList';
import useLocalize from '@hooks/useLocalize';

import Navigation from '@libs/Navigation/Navigation';

import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

import React from 'react';

import ExpenseFieldRow from './ExpenseFieldRow';
import {useExpenseFormLayout} from './ExpenseFormLayoutContext';
import {timeStateSelector} from './selectors';
import useTransactionSelector from './useTransactionSelector';

function TimeFields() {
    const {shouldUseDropdownRows} = useExpenseFormLayout();
    const {isReadOnly, didConfirm, transactionID, action, iouType, reportID, reportActionID} = useConfirmationFields();
    const {translate} = useLocalize();
    const {convertToDisplayString} = useCurrencyListActions();

    const timeState = useTransactionSelector(transactionID, timeStateSelector);

    const iouTimeCount = timeState?.count;
    const iouTimeRate = timeState?.rate;
    const iouCurrencyCode = timeState?.currency ?? CONST.CURRENCY.USD;

    const hoursValue = `${iouTimeCount}`;
    const rateValue = translate('iou.timeTracking.ratePreview', convertToDisplayString(iouTimeRate, iouCurrencyCode));

    const openHoursPage = () => {
        if (!transactionID) {
            return;
        }
        Navigation.navigate(ROUTES.MONEY_REQUEST_STEP_HOURS_EDIT.getRoute(action, iouType, transactionID, reportID, reportActionID));
    };

    const openTimeRatePage = () => {
        if (!transactionID) {
            return;
        }
        Navigation.navigate(ROUTES.MONEY_REQUEST_STEP_TIME_RATE.getRoute(action, iouType, transactionID, reportID, reportActionID));
    };

    if (shouldUseDropdownRows) {
        return (
            <>
                <ExpenseFieldRow
                    name={translate('iou.timeTracking.hours')}
                    value={hoursValue}
                    onPress={openHoursPage}
                    isDisabled={didConfirm}
                    isInteractive={!isReadOnly}
                    sentryLabel={CONST.SENTRY_LABEL.REQUEST_CONFIRMATION_LIST.HOURS_FIELD}
                />
                <ExpenseFieldRow
                    name={translate('common.rate')}
                    value={rateValue}
                    onPress={openTimeRatePage}
                    isDisabled={didConfirm}
                    isInteractive={!isReadOnly}
                    sentryLabel={CONST.SENTRY_LABEL.REQUEST_CONFIRMATION_LIST.TIME_RATE_FIELD}
                />
            </>
        );
    }

    return (
        <>
            <MenuItemField
                key={translate('iou.timeTracking.hours')}
                value={hoursValue}
                name={translate('iou.timeTracking.hours')}
                onPress={!isReadOnly ? openHoursPage : undefined}
                isDisabled={didConfirm}
                sentryLabel={CONST.SENTRY_LABEL.REQUEST_CONFIRMATION_LIST.HOURS_FIELD}
            />
            <MenuItemField
                key={`time_${translate('common.rate')}`}
                value={rateValue}
                name={translate('common.rate')}
                onPress={!isReadOnly ? openTimeRatePage : undefined}
                isDisabled={didConfirm}
                sentryLabel={CONST.SENTRY_LABEL.REQUEST_CONFIRMATION_LIST.TIME_RATE_FIELD}
            />
        </>
    );
}

export default TimeFields;
