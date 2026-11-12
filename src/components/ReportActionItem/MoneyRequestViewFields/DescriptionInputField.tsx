import MenuItem from '@components/MenuItem';
import ExpenseFieldRow from '@components/MoneyRequestConfirmationList/sections/ExpenseFieldRow';
import TextInput from '@components/TextInput';

import useAllTransactionViolations from '@hooks/useAllTransactionViolations';
import {useCurrencyListActions} from '@hooks/useCurrencyList';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useDelegateAccountID from '@hooks/useDelegateAccountID';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import {usePersonalDetail} from '@hooks/usePersonalDetails';
import usePolicy from '@hooks/usePolicy';
import useThemeStyles from '@hooks/useThemeStyles';

import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import Parser from '@libs/Parser';
import {getDescription} from '@libs/TransactionUtils';

import variables from '@styles/variables';

import {updateMoneyRequestDescription} from '@userActions/IOU/UpdateMoneyRequest';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type * as OnyxTypes from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import {isTrackIntentUserSelector} from '@selectors/Onboarding';
import {loginSelector} from '@selectors/PersonalDetails';
import React, {useState} from 'react';
import {View} from 'react-native';

type DescriptionInputFieldProps = {
    /** Expense whose description is edited */
    transaction: OnyxEntry<OnyxTypes.Transaction>;

    /** Transaction thread report of the expense */
    transactionThreadReport: OnyxEntry<OnyxTypes.Report>;

    /** Violation message for the description */
    errorText?: string;
};

/** Whether the markdown renders as more than plain text and line breaks, e.g. bold text, a link or a list */
function hasRenderedMarkdown(html: string): boolean {
    return /<(?!br\s*\/?>)[a-z]/i.test(html);
}

/**
 * The description of a saved expense, edited in place as markdown. While the input is not focused, a description that
 * uses markdown shows it rendered, and pressing it brings the input back. The value is saved when the input loses focus,
 * through the same action the description page uses.
 */
function DescriptionInputField({transaction, transactionThreadReport, errorText = ''}: DescriptionInputFieldProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {getCurrencyDecimals, getCurrencySymbol} = useCurrencyListActions();
    const {isBetaEnabled, isBetaEnabledOrUnknown} = usePermissions();
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const delegateAccountID = useDelegateAccountID();
    const policy = usePolicy(transactionThreadReport?.policyID);
    const allTransactionViolations = useAllTransactionViolations(transaction?.transactionID);
    const [policyCategories] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${getNonEmptyStringOnyxID(transactionThreadReport?.policyID)}`);
    const [policyTags] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${getNonEmptyStringOnyxID(transactionThreadReport?.policyID)}`);
    const [policyVendors] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_VENDORS}${getNonEmptyStringOnyxID(transactionThreadReport?.policyID)}`);
    const [parentReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${getNonEmptyStringOnyxID(transactionThreadReport?.parentReportID)}`);
    const [reportPolicyTags] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${getNonEmptyStringOnyxID(parentReport?.policyID)}`);
    const [iouReportOwnerLogin] = usePersonalDetail(parentReport?.ownerAccountID, loginSelector);
    const [isTrackIntentUser] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED, {selector: isTrackIntentUserSelector});
    const [rules] = useOnyx(ONYXKEYS.COLLECTION.RULE);

    // The saved description can be HTML, so it is compared and edited as markdown
    const savedDescription = Parser.htmlToMarkdown(getDescription(transaction));

    // Mirror the saved description locally so typing isn't overwritten by Onyx, and pick up outside changes only
    // while the input is not being edited.
    const [isFocused, setIsFocused] = useState(false);
    // Set by pressing the rendered description, until the input it mounts takes focus
    const [isOpeningInput, setIsOpeningInput] = useState(false);
    const [inputValue, setInputValue] = useState(savedDescription);
    const [prevSavedDescription, setPrevSavedDescription] = useState(savedDescription);
    if (savedDescription !== prevSavedDescription) {
        setPrevSavedDescription(savedDescription);
        if (!isFocused) {
            setInputValue(savedDescription);
        }
    }

    const saveDescription = () => {
        setIsFocused(false);
        const newComment = inputValue.trim();
        setInputValue(newComment);

        if (!transaction?.transactionID || newComment === savedDescription) {
            return;
        }

        updateMoneyRequestDescription({
            isVendorMatchingBetaEnabled: isBetaEnabledOrUnknown(CONST.BETAS.VENDOR_MATCHING),
            transactionID: transaction.transactionID,
            transaction,
            transactionThreadReport,
            parentReport,
            iouReportOwnerLogin,
            comment: newComment,
            policy,
            policyTagList: policyTags,
            policyCategories,
            policyVendors,
            currentUserAccountIDParam: currentUserPersonalDetails.accountID,
            currentUserEmailParam: currentUserPersonalDetails.login ?? '',
            isASAPSubmitBetaEnabled: isBetaEnabled(CONST.BETAS.ASAP_SUBMIT),
            delegateAccountID,
            reportPolicyTags,
            isTrackIntentUser,
            violations: allTransactionViolations,
            getCurrencyDecimals,
            getCurrencySymbol,
            rules,
        });
    };

    const renderedDescription = Parser.replace(inputValue);
    if (!isFocused && !isOpeningInput && hasRenderedMarkdown(renderedDescription)) {
        const descriptionText = Parser.htmlToText(renderedDescription);
        return (
            <ExpenseFieldRow
                name={translate('common.description')}
                sentryLabel={CONST.SENTRY_LABEL.MONEY_REQUEST_VIEW.DESCRIPTION_FIELD}
                valueComponent={<MenuItem.FieldValueHTML>{renderedDescription}</MenuItem.FieldValueHTML>}
                hasValueComponent
                accessibilityLabel={`${translate('common.description')}, ${descriptionText}`}
                errorText={errorText}
                onPress={() => setIsOpeningInput(true)}
                shouldShowDownCaret={false}
            />
        );
    }

    return (
        <View style={[styles.mh5, styles.mv2]}>
            <TextInput
                value={inputValue}
                onChangeText={setInputValue}
                // Mounted by pressing the rendered description, which the user pressed to type in
                autoFocus={isOpeningInput}
                onFocus={() => {
                    setIsFocused(true);
                    setIsOpeningInput(false);
                }}
                onBlur={saveDescription}
                label={translate('common.description')}
                accessibilityLabel={translate('common.description')}
                autoGrowHeight
                maxAutoGrowHeight={variables.textInputAutoGrowMaxHeight}
                type="markdown"
                excludedMarkdownStyles={!policy ? ['mentionReport'] : []}
                errorText={errorText}
            />
        </View>
    );
}

export default DescriptionInputField;
