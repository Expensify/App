import {format} from 'date-fns';
import React from 'react';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import CONST from '@src/CONST';
import type {IOUAction, IOUType} from '@src/CONST';
import ROUTES from '@src/ROUTES';
import {dateStateSelector} from './selectors';
import useTransactionSelector from './useTransactionSelector';

type DateFieldProps = {
    shouldDisplayFieldError: boolean;
    didConfirm: boolean;
    isReadOnly: boolean;
    transactionID: string | undefined;
    action: IOUAction;
    iouType: Exclude<IOUType, typeof CONST.IOU.TYPE.REQUEST | typeof CONST.IOU.TYPE.SEND>;
    reportID: string;
    reportActionID: string | undefined;
};

function DateField({shouldDisplayFieldError, didConfirm, isReadOnly, transactionID, action, iouType, reportID, reportActionID}: DateFieldProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const dateState = useTransactionSelector(transactionID, dateStateSelector);

    const iouCreated = dateState?.iouCreated ?? '';
    const createdMissing = dateState?.isMissing ?? true;

    return (
        <MenuItemWithTopDescription
            shouldShowRightIcon={!isReadOnly}
            title={iouCreated || format(new Date(), CONST.DATE.FNS_FORMAT_STRING)}
            description={translate('common.date')}
            style={[styles.moneyRequestMenuItem]}
            titleStyle={styles.flex1}
            onPress={() => {
                if (!transactionID) {
                    return;
                }

                Navigation.navigate(ROUTES.MONEY_REQUEST_STEP_DATE.getRoute(action, iouType, transactionID, reportID, Navigation.getActiveRoute(), reportActionID));
            }}
            disabled={didConfirm}
            interactive={!isReadOnly}
            brickRoadIndicator={shouldDisplayFieldError && createdMissing ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}
            errorText={shouldDisplayFieldError && createdMissing ? translate('common.error.enterDate') : ''}
            sentryLabel={CONST.SENTRY_LABEL.REQUEST_CONFIRMATION_LIST.DATE_FIELD}
        />
    );
}

export default DateField;
