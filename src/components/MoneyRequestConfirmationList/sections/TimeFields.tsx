import React from 'react';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import {useCurrencyListActions} from '@hooks/useCurrencyList';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import CONST from '@src/CONST';
import type {IOUAction, IOUType} from '@src/CONST';
import ROUTES from '@src/ROUTES';
import {timeStateSelector} from './selectors';
import useTransactionSelector from './useTransactionSelector';

type TimeFieldsProps = {
    isReadOnly: boolean;
    didConfirm: boolean;
    transactionID: string | undefined;
    action: IOUAction;
    iouType: Exclude<IOUType, typeof CONST.IOU.TYPE.REQUEST | typeof CONST.IOU.TYPE.SEND>;
    reportID: string;
    reportActionID: string | undefined;
};

function TimeFields({isReadOnly, didConfirm, transactionID, action, iouType, reportID, reportActionID}: TimeFieldsProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {convertToDisplayString} = useCurrencyListActions();

    const timeState = useTransactionSelector(transactionID, timeStateSelector);

    const iouTimeCount = timeState?.count;
    const iouTimeRate = timeState?.rate;
    const iouCurrencyCode = timeState?.currency ?? CONST.CURRENCY.USD;

    return (
        <>
            <MenuItemWithTopDescription
                key={translate('iou.timeTracking.hours')}
                shouldShowRightIcon={!isReadOnly}
                title={`${iouTimeCount}`}
                description={translate('iou.timeTracking.hours')}
                style={styles.moneyRequestMenuItem}
                titleStyle={styles.flex1}
                onPress={() => {
                    if (!transactionID) {
                        return;
                    }
                    Navigation.navigate(ROUTES.MONEY_REQUEST_STEP_HOURS_EDIT.getRoute(action, iouType, transactionID, reportID, reportActionID));
                }}
                disabled={didConfirm}
                interactive={!isReadOnly}
                sentryLabel={CONST.SENTRY_LABEL.REQUEST_CONFIRMATION_LIST.HOURS_FIELD}
            />
            <MenuItemWithTopDescription
                key={`time_${translate('common.rate')}`}
                shouldShowRightIcon={!isReadOnly}
                title={translate('iou.timeTracking.ratePreview', convertToDisplayString(iouTimeRate, iouCurrencyCode))}
                description={translate('common.rate')}
                style={styles.moneyRequestMenuItem}
                titleStyle={styles.flex1}
                onPress={() => {
                    if (!transactionID) {
                        return;
                    }
                    Navigation.navigate(ROUTES.MONEY_REQUEST_STEP_TIME_RATE.getRoute(action, iouType, transactionID, reportID, reportActionID));
                }}
                disabled={didConfirm}
                interactive={!isReadOnly}
                sentryLabel={CONST.SENTRY_LABEL.REQUEST_CONFIRMATION_LIST.TIME_RATE_FIELD}
            />
        </>
    );
}

export default TimeFields;
