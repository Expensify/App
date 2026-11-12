import NumberWithSymbolForm from '@components/NumberWithSymbolForm';

import {useCurrencyListActions} from '@hooks/useCurrencyList';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useDelegateAccountID from '@hooks/useDelegateAccountID';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import {usePersonalDetail} from '@hooks/usePersonalDetails';
import useThemeStyles from '@hooks/useThemeStyles';

import {convertToBackendAmount, convertToFrontendAmountAsString, getLocalizedCurrencySymbol} from '@libs/CurrencyUtils';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import {isTaxAmountInvalid} from '@libs/MoneyRequestUtils';

import {getTaxAmount} from '@pages/iou/request/step/DynamicIOURequestStepTaxAmountPage';

import {updateMoneyRequestTaxAmount} from '@userActions/IOU/UpdateMoneyRequest';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type * as OnyxTypes from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import {isTrackIntentUserSelector} from '@selectors/Onboarding';
import {loginSelector} from '@selectors/PersonalDetails';
import React, {useState} from 'react';
import {View} from 'react-native';

type TaxAmountInputFieldProps = {
    /** Expense whose tax amount is edited */
    transaction: OnyxEntry<OnyxTypes.Transaction>;

    /** Transaction thread report of the expense */
    transactionThreadReport: OnyxEntry<OnyxTypes.Report>;

    /** Policy the expense's tax rates come from */
    policy: OnyxEntry<OnyxTypes.Policy>;

    /** Saved tax amount, unsigned and in the smallest currency unit */
    taxAmount: number;

    /** Currency of the expense */
    currency: string;

    /** Label of the input, e.g. the tax amount with its converted value */
    label: string;
};

/**
 * The tax amount of a saved expense, edited in place with the same input as the amount. The tax amount is saved when
 * the input loses focus, and can't be more than the expense's tax rate allows.
 */
function TaxAmountInputField({transaction, transactionThreadReport, policy, taxAmount, currency, label}: TaxAmountInputFieldProps) {
    const styles = useThemeStyles();
    const {translate, preferredLocale} = useLocalize();
    const {getCurrencyDecimals, getCurrencySymbol, convertToDisplayString} = useCurrencyListActions();
    const {isBetaEnabled, isBetaEnabledOrUnknown} = usePermissions();
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const delegateAccountID = useDelegateAccountID();
    const [policyCategories] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${getNonEmptyStringOnyxID(policy?.id)}`);
    const [policyTags] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${getNonEmptyStringOnyxID(policy?.id)}`);
    const [parentReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${getNonEmptyStringOnyxID(transactionThreadReport?.parentReportID)}`);
    const [reportPolicyTags] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${getNonEmptyStringOnyxID(parentReport?.policyID)}`);
    const [iouReportOwnerLogin] = usePersonalDetail(parentReport?.ownerAccountID, loginSelector);
    const [isTrackIntentUser] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED, {selector: isTrackIntentUserSelector});
    const [rules] = useOnyx(ONYXKEYS.COLLECTION.RULE);

    const decimals = getCurrencyDecimals(currency);
    const savedValue = convertToFrontendAmountAsString(taxAmount, decimals);
    const maxTaxAmount = getTaxAmount(transaction, policy, currency, decimals, true) ?? 0;

    const [inputValue, setInputValue] = useState(savedValue);
    const [inputError, setInputError] = useState('');
    // The input keeps what is typed in its own state, so it is remounted to show a saved value it didn't type
    const [resetCount, setResetCount] = useState(0);
    const [prevSavedValue, setPrevSavedValue] = useState(savedValue);
    if (savedValue !== prevSavedValue) {
        setPrevSavedValue(savedValue);
        setInputValue(savedValue);
    }

    const revert = () => {
        setInputValue(savedValue);
        setInputError('');
        setResetCount((count) => count + 1);
    };

    const saveTaxAmount = () => {
        const cleanAmount = inputValue.trim();
        const numericAmount = Number.parseFloat(cleanAmount);
        // A cleared input has no tax amount to save, so it goes back to the saved one
        if (!cleanAmount || Number.isNaN(numericAmount)) {
            revert();
            return;
        }
        if (isTaxAmountInvalid(cleanAmount, maxTaxAmount, decimals)) {
            setInputError(translate('iou.error.invalidTaxAmount', convertToDisplayString(maxTaxAmount, currency)));
            return;
        }
        const newTaxAmount = convertToBackendAmount(numericAmount);
        if (newTaxAmount === taxAmount || !transaction?.transactionID) {
            return;
        }

        updateMoneyRequestTaxAmount({
            isVendorMatchingBetaEnabled: isBetaEnabledOrUnknown(CONST.BETAS.VENDOR_MATCHING),
            transactionID: transaction.transactionID,
            transactionThreadReport,
            parentReport,
            iouReportOwnerLogin,
            taxAmount: newTaxAmount,
            policy,
            policyTagList: policyTags,
            policyCategories,
            currentUserAccountIDParam: currentUserPersonalDetails.accountID,
            currentUserEmailParam: currentUserPersonalDetails.login ?? '',
            isASAPSubmitBetaEnabled: isBetaEnabled(CONST.BETAS.ASAP_SUBMIT),
            delegateAccountID,
            reportPolicyTags,
            isTrackIntentUser,
            getCurrencyDecimals,
            getCurrencySymbol,
            rules,
        });
    };

    return (
        <View style={[styles.mh5, styles.mv2]}>
            <NumberWithSymbolForm
                key={`${savedValue}-${currency}-${resetCount}`}
                displayAsTextInput
                autoFocus={false}
                value={inputValue}
                decimals={decimals}
                currency={currency}
                symbol={getLocalizedCurrencySymbol(preferredLocale, currency) ?? ''}
                label={label}
                errorText={inputError}
                onInputChange={(value) => {
                    setInputValue(value);
                    setInputError('');
                }}
                onBlur={saveTaxAmount}
                shouldShowBigNumberPad={false}
            />
        </View>
    );
}

export default TaxAmountInputField;
