import TextInput from '@components/TextInput';

import useLocalize from '@hooks/useLocalize';
import useMirroredInputValue from '@hooks/useMirroredInputValue';
import useThemeStyles from '@hooks/useThemeStyles';
import useUpdateTransactionMerchant from '@hooks/useUpdateTransactionMerchant';

import {isMerchantRequired} from '@libs/MoneyRequestUtils';
import {getTransactionDetails} from '@libs/ReportUtils';
import {getInlineMerchantErrorMessage, isInvalidMerchantValue} from '@libs/ValidationUtils';

import CONST from '@src/CONST';
import type * as OnyxTypes from '@src/types/onyx';

import type {ReactNode} from 'react';
import type {OnyxEntry} from 'react-native-onyx';

import React, {useState} from 'react';
import {View} from 'react-native';

type MerchantInputFieldProps = {
    /** Expense whose merchant is edited */
    transaction: OnyxEntry<OnyxTypes.Transaction>;

    /** Transaction thread report of the expense */
    transactionThreadReport: OnyxEntry<OnyxTypes.Report>;

    /** Violation message for the merchant, shown while the typed value has no error of its own */
    errorText?: string;

    /** Rendered below the input, e.g. the Google search link for a card merchant */
    footer?: ReactNode;
};

/**
 * The merchant of a saved expense, edited in place. The value is saved when the input loses focus, through the same
 * write the merchant page uses.
 */
function MerchantInputField({transaction, transactionThreadReport, errorText = '', footer}: MerchantInputFieldProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {updateMerchant} = useUpdateTransactionMerchant({transactionID: transaction?.transactionID, transactionThreadReport});

    const merchant = getTransactionDetails(transaction)?.merchant;
    const savedMerchant = isInvalidMerchantValue(merchant) ? '' : (merchant ?? '');
    const {inputValue, setInputValue, markFocused, markBlurred} = useMirroredInputValue(savedMerchant);
    const [inputError, setInputError] = useState('');

    const saveMerchant = () => {
        markBlurred();
        const newMerchant = inputValue.trim();
        const merchantError = getInlineMerchantErrorMessage(translate, newMerchant, isMerchantRequired(transactionThreadReport, transaction));
        if (merchantError) {
            setInputError(merchantError);
            return;
        }
        setInputError('');
        setInputValue(newMerchant);
        if (newMerchant === savedMerchant) {
            return;
        }
        updateMerchant(newMerchant);
    };

    return (
        <View style={[styles.mh5, styles.mv2]}>
            <TextInput
                value={inputValue}
                onChangeText={setInputValue}
                onFocus={markFocused}
                onBlur={saveMerchant}
                label={translate('common.merchant')}
                accessibilityLabel={translate('common.merchant')}
                errorText={inputError || errorText}
                sentryLabel={CONST.SENTRY_LABEL.MONEY_REQUEST.MERCHANT_INPUT}
            />
            {!!footer && <View style={styles.mt2}>{footer}</View>}
        </View>
    );
}

export default MerchantInputField;
