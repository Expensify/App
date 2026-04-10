import React from 'react';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import CONST from '@src/CONST';
import type {IOUAction, IOUType} from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ROUTES from '@src/ROUTES';
import type * as OnyxTypes from '@src/types/onyx';

type TaxFieldsProps = {
    taxRateTitle: string;
    taxRates: OnyxTypes.TaxRatesWithDefault | undefined | null;
    formattedTaxAmount: string;
    canModifyTaxFields: boolean;
    didConfirm: boolean;
    transactionID: string | undefined;
    action: IOUAction;
    iouType: Exclude<IOUType, typeof CONST.IOU.TYPE.REQUEST | typeof CONST.IOU.TYPE.SEND>;
    reportID: string;
    shouldDisplayTaxRateError: boolean;
    formError: string;
};

function TaxFields({
    taxRateTitle,
    taxRates,
    formattedTaxAmount,
    canModifyTaxFields,
    didConfirm,
    transactionID,
    action,
    iouType,
    reportID,
    shouldDisplayTaxRateError,
    formError,
}: TaxFieldsProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    return (
        <>
            <MenuItemWithTopDescription
                key={`${taxRates?.name}${taxRateTitle}`}
                shouldShowRightIcon={canModifyTaxFields}
                title={taxRateTitle}
                description={taxRates?.name}
                style={[styles.moneyRequestMenuItem]}
                titleStyle={styles.flex1}
                onPress={() => {
                    if (!transactionID) {
                        return;
                    }

                    Navigation.navigate(ROUTES.MONEY_REQUEST_STEP_TAX_RATE.getRoute(action, iouType, transactionID, reportID, Navigation.getActiveRoute()));
                }}
                disabled={didConfirm}
                interactive={canModifyTaxFields}
                brickRoadIndicator={shouldDisplayTaxRateError ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}
                errorText={shouldDisplayTaxRateError ? translate(formError as TranslationPaths) : ''}
                sentryLabel={CONST.SENTRY_LABEL.REQUEST_CONFIRMATION_LIST.TAX_RATE_FIELD}
            />
            <MenuItemWithTopDescription
                key={`${taxRates?.name}${formattedTaxAmount}`}
                shouldShowRightIcon={canModifyTaxFields}
                title={formattedTaxAmount}
                description={translate('iou.taxAmount')}
                style={[styles.moneyRequestMenuItem]}
                titleStyle={styles.flex1}
                onPress={() => {
                    if (!transactionID) {
                        return;
                    }

                    Navigation.navigate(ROUTES.MONEY_REQUEST_STEP_TAX_AMOUNT.getRoute(action, iouType, transactionID, reportID, Navigation.getActiveRoute()));
                }}
                disabled={didConfirm}
                interactive={canModifyTaxFields}
                sentryLabel={CONST.SENTRY_LABEL.REQUEST_CONFIRMATION_LIST.TAX_AMOUNT_FIELD}
            />
        </>
    );
}

export default TaxFields;
