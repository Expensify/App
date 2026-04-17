import React from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import TextInput from '@components/TextInput';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import {setMoneyRequestMerchant} from '@libs/actions/IOU';
import Navigation from '@libs/Navigation/Navigation';
import {getMerchant, hasReceipt, isMerchantMissing} from '@libs/TransactionUtils';
import {isValidInputLength} from '@libs/ValidationUtils';
import {setDraftSplitTransaction} from '@userActions/IOU/Split';
import CONST from '@src/CONST';
import type {IOUAction, IOUType} from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type * as OnyxTypes from '@src/types/onyx';

type MerchantFieldProps = {
    isMerchantRequired: boolean | undefined;
    isNewManualExpenseFlowEnabled: boolean;
    isReadOnly: boolean;
    didConfirm: boolean;
    shouldDisplayFieldError: boolean;
    formError: string;
    transactionID: string | undefined;
    action: IOUAction;
    iouType: Exclude<IOUType, typeof CONST.IOU.TYPE.REQUEST | typeof CONST.IOU.TYPE.SEND>;
    reportID: string;
    reportActionID: string | undefined;
    transaction: OnyxEntry<OnyxTypes.Transaction>;
    isEditingSplitBill: boolean;
};

function MerchantField({
    isMerchantRequired,
    isNewManualExpenseFlowEnabled,
    isReadOnly,
    didConfirm,
    shouldDisplayFieldError,
    formError,
    transactionID,
    action,
    iouType,
    reportID,
    reportActionID,
    transaction,
    isEditingSplitBill,
}: MerchantFieldProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const [splitDraftTransaction] = useOnyx(`${ONYXKEYS.COLLECTION.SPLIT_TRANSACTION_DRAFT}${transactionID}`);

    const iouMerchant = getMerchant(transaction);
    const isMerchantEmpty = !iouMerchant || isMerchantMissing(transaction);

    // Determine if the merchant error should be displayed
    const merchantErrorText = (() => {
        const merchantValue = iouMerchant ?? '';
        const {isValid, byteLength} = isValidInputLength(merchantValue, CONST.MERCHANT_NAME_MAX_BYTES);

        if (!isValid) {
            return translate('common.error.characterLimitExceedCounter', byteLength, CONST.MERCHANT_NAME_MAX_BYTES);
        }

        if ((shouldDisplayFieldError || formError === 'iou.error.invalidMerchant') && isMerchantRequired && isMerchantEmpty) {
            return translate('common.error.fieldRequired');
        }

        return '';
    })();

    const shouldDisplayMerchantError = !!merchantErrorText;

    const handleMerchantInputChange = (newMerchant: string) => {
        if (!transactionID) {
            return;
        }

        // When editing a split expense, persist directly to the split draft so that
        // SplitBillDetailsPage and completeSplitBill read the latest value.
        if (isEditingSplitBill) {
            setDraftSplitTransaction(transactionID, splitDraftTransaction, {merchant: newMerchant});
            return;
        }

        setMoneyRequestMerchant(transactionID, newMerchant, true, hasReceipt(transaction));
    };

    if (isNewManualExpenseFlowEnabled && !isReadOnly) {
        return (
            <View style={[styles.mh4, styles.mv2]}>
                <TextInput
                    value={isMerchantEmpty ? '' : (iouMerchant ?? '')}
                    readOnly={didConfirm}
                    onChangeText={handleMerchantInputChange}
                    label={translate('common.merchant')}
                    accessibilityLabel={translate('common.merchant')}
                    errorText={merchantErrorText}
                />
            </View>
        );
    }

    return (
        <MenuItemWithTopDescription
            shouldShowRightIcon={!isReadOnly}
            title={isMerchantEmpty ? '' : iouMerchant}
            description={translate('common.merchant')}
            style={[styles.moneyRequestMenuItem]}
            titleStyle={styles.flex1}
            onPress={() => {
                if (!transactionID) {
                    return;
                }

                Navigation.navigate(ROUTES.MONEY_REQUEST_STEP_MERCHANT.getRoute(action, iouType, transactionID, reportID, Navigation.getActiveRoute(), reportActionID));
            }}
            disabled={didConfirm}
            interactive={!isReadOnly}
            brickRoadIndicator={shouldDisplayMerchantError ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}
            errorText={shouldDisplayMerchantError ? translate('common.error.fieldRequired') : ''}
            rightLabel={isMerchantRequired && !shouldDisplayMerchantError ? translate('common.required') : ''}
            numberOfLinesTitle={2}
            sentryLabel={CONST.SENTRY_LABEL.REQUEST_CONFIRMATION_LIST.MERCHANT_FIELD}
        />
    );
}

export default MerchantField;
