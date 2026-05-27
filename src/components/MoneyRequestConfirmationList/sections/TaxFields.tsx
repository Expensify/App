import React from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import {useCurrencyListActions} from '@hooks/useCurrencyList';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {isMovingTransactionFromTrackExpense} from '@libs/IOUUtils';
import Navigation from '@libs/Navigation/Navigation';
import {getTaxAmount, getTaxRateTitle} from '@libs/TransactionUtils';
import CONST from '@src/CONST';
import type {IOUAction, IOUType} from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ROUTES from '@src/ROUTES';
import type * as OnyxTypes from '@src/types/onyx';
import {taxSliceSelector} from './selectors';
import useTransactionSelector from './useTransactionSelector';

type TaxFieldsProps = {
    policy: OnyxEntry<OnyxTypes.Policy>;
    policyForMovingExpenses: OnyxEntry<OnyxTypes.Policy>;
    iouCurrencyCode: string | undefined;
    canModifyTaxFields: boolean;
    didConfirm: boolean;
    transactionID: string | undefined;
    action: IOUAction;
    iouType: Exclude<IOUType, typeof CONST.IOU.TYPE.REQUEST | typeof CONST.IOU.TYPE.SEND>;
    reportID: string;
    formError: string;
};

function TaxFields({policy, policyForMovingExpenses, iouCurrencyCode, canModifyTaxFields, didConfirm, transactionID, action, iouType, reportID, formError}: TaxFieldsProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {convertToDisplayString} = useCurrencyListActions();

    const taxSlice = useTransactionSelector(transactionID, taxSliceSelector);

    const transactionForHelpers = taxSlice as OnyxEntry<OnyxTypes.Transaction>;

    const shouldDisplayTaxRateError = formError === 'violations.taxOutOfPolicy';
    const isMovingCurrentTransactionFromTrackExpense = isMovingTransactionFromTrackExpense(action);
    const taxRates = policy?.taxRates ?? (isMovingCurrentTransactionFromTrackExpense ? policyForMovingExpenses?.taxRates : null);
    const taxAmount = getTaxAmount(transactionForHelpers, false);
    const formattedTaxAmount = convertToDisplayString(taxAmount, iouCurrencyCode);
    const taxRateTitle = getTaxRateTitle(policy, transactionForHelpers, isMovingCurrentTransactionFromTrackExpense, policyForMovingExpenses);

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
