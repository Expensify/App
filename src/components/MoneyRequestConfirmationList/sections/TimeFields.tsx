import MenuItemField from '@components/MenuItem/presets/MenuItemField';
import {useConfirmationFields} from '@components/MoneyRequestConfirmationFields/context';

import {useCurrencyListActions} from '@hooks/useCurrencyList';
import useLocalize from '@hooks/useLocalize';

import Navigation from '@libs/Navigation/Navigation';

import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

import React from 'react';

import {timeStateSelector} from './selectors';
import useTransactionSelector from './useTransactionSelector';

function TimeFields() {
    const {isReadOnly, didConfirm, transactionID, action, iouType, reportID, reportActionID} = useConfirmationFields();
    const {translate} = useLocalize();
    const {convertToDisplayString} = useCurrencyListActions();

    const timeState = useTransactionSelector(transactionID, timeStateSelector);

    const iouTimeCount = timeState?.count;
    const iouTimeRate = timeState?.rate;
    const iouCurrencyCode = timeState?.currency ?? CONST.CURRENCY.USD;

    return (
        <>
            <MenuItemField
                key={translate('iou.timeTracking.hours')}
                value={`${iouTimeCount}`}
                name={translate('iou.timeTracking.hours')}
                onPress={
                    !isReadOnly
                        ? () => {
                              if (!transactionID) {
                                  return;
                              }
                              Navigation.navigate(ROUTES.MONEY_REQUEST_STEP_HOURS_EDIT.getRoute(action, iouType, transactionID, reportID, reportActionID));
                          }
                        : undefined
                }
                isDisabled={didConfirm}
                sentryLabel={CONST.SENTRY_LABEL.REQUEST_CONFIRMATION_LIST.HOURS_FIELD}
            />
            <MenuItemField
                key={`time_${translate('common.rate')}`}
                value={translate('iou.timeTracking.ratePreview', convertToDisplayString(iouTimeRate, iouCurrencyCode))}
                name={translate('common.rate')}
                onPress={
                    !isReadOnly
                        ? () => {
                              if (!transactionID) {
                                  return;
                              }
                              Navigation.navigate(ROUTES.MONEY_REQUEST_STEP_TIME_RATE.getRoute(action, iouType, transactionID, reportID, reportActionID));
                          }
                        : undefined
                }
                isDisabled={didConfirm}
                sentryLabel={CONST.SENTRY_LABEL.REQUEST_CONFIRMATION_LIST.TIME_RATE_FIELD}
            />
        </>
    );
}

export default TimeFields;
