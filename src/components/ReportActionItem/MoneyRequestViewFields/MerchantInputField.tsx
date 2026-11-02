import TextInput from '@components/TextInput';

import useAllTransactionViolations from '@hooks/useAllTransactionViolations';
import {useCurrencyListActions} from '@hooks/useCurrencyList';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useDelegateAccountID from '@hooks/useDelegateAccountID';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import {usePersonalDetail} from '@hooks/usePersonalDetails';
import usePolicy from '@hooks/usePolicy';
import useThemeStyles from '@hooks/useThemeStyles';

import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import {isMerchantRequired} from '@libs/MoneyRequestUtils';
import {getTransactionDetails} from '@libs/ReportUtils';
import {getMerchantError, getMerchantErrorMessage, isInvalidMerchantValue} from '@libs/ValidationUtils';

import {updateMoneyRequestMerchant} from '@userActions/IOU/UpdateMoneyRequest';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type * as OnyxTypes from '@src/types/onyx';

import type {ReactNode} from 'react';
import type {OnyxEntry} from 'react-native-onyx';

import {isTrackIntentUserSelector} from '@selectors/Onboarding';
import {loginSelector} from '@selectors/PersonalDetails';
import React, {useState} from 'react';
import {View} from 'react-native';

type MerchantInputFieldProps = {
    /** Expense whose merchant is edited */
    transaction: OnyxEntry<OnyxTypes.Transaction>;

    /** Transaction thread report of the expense */
    transactionThreadReport: OnyxEntry<OnyxTypes.Report>;

    /** Violation message for the merchant, shown while the user has no input error of their own */
    errorText?: string;

    /** Rendered below the input, e.g. the Google search link for a card merchant */
    footer?: ReactNode;
};

/**
 * The merchant of a saved expense, edited in place. The value is saved when the input loses focus, through the same
 * action the merchant page uses.
 */
function MerchantInputField({transaction, transactionThreadReport, errorText = '', footer}: MerchantInputFieldProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {isOffline} = useNetwork();
    const {getCurrencyDecimals, getCurrencySymbol} = useCurrencyListActions();
    const {isBetaEnabled, isBetaEnabledOrUnknown} = usePermissions();
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const delegateAccountID = useDelegateAccountID();
    const policy = usePolicy(transactionThreadReport?.policyID);
    const allTransactionViolations = useAllTransactionViolations(transaction?.transactionID);
    const [policyCategories] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${getNonEmptyStringOnyxID(transactionThreadReport?.policyID)}`);
    const [policyTags] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${getNonEmptyStringOnyxID(transactionThreadReport?.policyID)}`);
    const [parentReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${getNonEmptyStringOnyxID(transactionThreadReport?.parentReportID)}`);
    const [reportPolicyTags] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${getNonEmptyStringOnyxID(parentReport?.policyID)}`);
    const [iouReportOwnerLogin] = usePersonalDetail(parentReport?.ownerAccountID, loginSelector);
    const [isTrackIntentUser] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED, {selector: isTrackIntentUserSelector});
    const [rules] = useOnyx(ONYXKEYS.COLLECTION.RULE);

    const merchant = getTransactionDetails(transaction)?.merchant;
    const savedMerchant = isInvalidMerchantValue(merchant) ? '' : (merchant ?? '');
    const isMerchantFieldRequired = isMerchantRequired(transactionThreadReport, transaction);

    // Mirror the saved merchant locally so typing isn't overwritten by Onyx, and pick up outside changes only while
    // the input is not being edited.
    const [isFocused, setIsFocused] = useState(false);
    const [inputValue, setInputValue] = useState(savedMerchant);
    const [prevSavedMerchant, setPrevSavedMerchant] = useState(savedMerchant);
    const [inputError, setInputError] = useState('');
    if (savedMerchant !== prevSavedMerchant) {
        setPrevSavedMerchant(savedMerchant);
        if (!isFocused) {
            setInputValue(savedMerchant);
        }
    }

    const saveMerchant = () => {
        setIsFocused(false);
        const newMerchant = inputValue.trim();
        const merchantError = getMerchantError(newMerchant, isMerchantFieldRequired);
        if (merchantError) {
            setInputError(getMerchantErrorMessage(translate, merchantError));
            return;
        }
        setInputError('');
        setInputValue(newMerchant);

        if (!transaction?.transactionID || newMerchant === savedMerchant) {
            return;
        }

        updateMoneyRequestMerchant({
            isVendorMatchingBetaEnabled: isBetaEnabledOrUnknown(CONST.BETAS.VENDOR_MATCHING),
            transactionID: transaction.transactionID,
            transactionThreadReport,
            parentReport,
            iouReportOwnerLogin,
            value: newMerchant || CONST.TRANSACTION.PARTIAL_TRANSACTION_MERCHANT,
            policy,
            policyTagList: policyTags,
            policyCategories,
            currentUserAccountIDParam: currentUserPersonalDetails.accountID,
            currentUserEmailParam: currentUserPersonalDetails.login ?? '',
            isASAPSubmitBetaEnabled: isBetaEnabled(CONST.BETAS.ASAP_SUBMIT),
            isOffline,
            delegateAccountID,
            reportPolicyTags,
            isTrackIntentUser,
            violations: allTransactionViolations,
            getCurrencyDecimals,
            getCurrencySymbol,
            rules,
        });
    };

    return (
        <View style={[styles.mh5, styles.mv2]}>
            <TextInput
                value={inputValue}
                onChangeText={setInputValue}
                onFocus={() => setIsFocused(true)}
                onBlur={saveMerchant}
                label={translate('common.merchant')}
                accessibilityLabel={translate('common.merchant')}
                errorText={inputError || errorText}
            />
            {!!footer && <View style={styles.mt2}>{footer}</View>}
        </View>
    );
}

export default MerchantInputField;
