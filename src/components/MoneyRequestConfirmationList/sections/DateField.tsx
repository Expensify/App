import {format} from 'date-fns';
import React from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import {getCreated, isCreatedMissing} from '@libs/TransactionUtils';
import CONST from '@src/CONST';
import type {IOUAction, IOUType} from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type * as OnyxTypes from '@src/types/onyx';

type DateFieldProps = {
    shouldDisplayFieldError: boolean;
    didConfirm: boolean;
    isReadOnly: boolean;
    transactionID: string | undefined;
    action: IOUAction;
    iouType: Exclude<IOUType, typeof CONST.IOU.TYPE.REQUEST | typeof CONST.IOU.TYPE.SEND>;
    reportID: string;
    reportActionID: string | undefined;
    transaction: OnyxEntry<OnyxTypes.Transaction>;
};

function DateField({shouldDisplayFieldError, didConfirm, isReadOnly, transactionID, action, iouType, reportID, reportActionID, transaction}: DateFieldProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const iouCreated = getCreated(transaction);

    return (
        <MenuItemWithTopDescription
            shouldShowRightIcon={!isReadOnly}
            // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing -- iouCreated can be an empty string which is falsy; nullish coalescing would not fall through to the default date
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
            brickRoadIndicator={shouldDisplayFieldError && isCreatedMissing(transaction) ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}
            errorText={shouldDisplayFieldError && isCreatedMissing(transaction) ? translate('common.error.enterDate') : ''}
            sentryLabel={CONST.SENTRY_LABEL.REQUEST_CONFIRMATION_LIST.DATE_FIELD}
        />
    );
}

export default DateField;
