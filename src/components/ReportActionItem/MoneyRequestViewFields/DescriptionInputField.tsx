/**
 * The description of a saved expense, edited in place as markdown on the expense view. The value is saved when the
 * input loses focus, through the same write the description page uses.
 */
import TextInput from '@components/TextInput';

import useLocalize from '@hooks/useLocalize';
import useMirroredInputValue from '@hooks/useMirroredInputValue';
import useThemeStyles from '@hooks/useThemeStyles';
import useUpdateTransactionDescription from '@hooks/useUpdateTransactionDescription';

import Parser from '@libs/Parser';
import StringUtils from '@libs/StringUtils';
import {getDescription} from '@libs/TransactionUtils';
import {getInlineDescriptionErrorMessage} from '@libs/ValidationUtils';

import variables from '@styles/variables';

import CONST from '@src/CONST';
import type * as OnyxTypes from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import React, {useState} from 'react';
import {View} from 'react-native';

type DescriptionInputFieldProps = {
    /** Expense whose description is edited */
    transaction: OnyxEntry<OnyxTypes.Transaction>;

    transactionThreadReport: OnyxEntry<OnyxTypes.Report>;

    /** Whether the expense is on a group workspace, where a description can mention a room */
    isReportInGroupPolicy: boolean;

    /** What the expense's category asks the description to say */
    hint?: string;

    /** Violation message for the description, shown while the typed value has no error of its own */
    errorText?: string;
};

function DescriptionInputField({transaction, transactionThreadReport, isReportInGroupPolicy, hint, errorText = ''}: DescriptionInputFieldProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {updateDescription} = useUpdateTransactionDescription({transaction, transactionThreadReport});

    // The saved description is HTML, so it is compared and edited as markdown.
    const savedDescription = Parser.htmlToMarkdown(getDescription(transaction));
    const {inputValue, setInputValue, startEditing, finishEditing} = useMirroredInputValue(savedDescription);
    const [inputError, setInputError] = useState('');

    const saveDescription = () => {
        const typedDescription = finishEditing();
        // Leaving the input untouched is not an edit. Comparing against the saved markdown instead would save a
        // description that only differs by the whitespace the conversion from HTML leaves at its end.
        if (typedDescription === undefined) {
            setInputError('');
            return;
        }
        // The description page saves the value after its form strips invisible characters and trims it.
        const newDescription = StringUtils.removeInvisibleCharacters(typedDescription).trim();
        const descriptionError = getInlineDescriptionErrorMessage(translate, newDescription);
        if (descriptionError) {
            setInputError(descriptionError);
            return;
        }
        setInputError('');
        setInputValue(newDescription);
        if (newDescription === savedDescription) {
            return;
        }
        updateDescription(newDescription);
    };

    return (
        <View style={[styles.mh4, styles.mv2]}>
            <TextInput
                value={inputValue}
                onChangeText={setInputValue}
                onFocus={startEditing}
                onBlur={saveDescription}
                label={translate('common.description')}
                accessibilityLabel={translate('common.description')}
                autoGrowHeight
                maxAutoGrowHeight={variables.textInputAutoGrowMaxHeight}
                type="markdown"
                excludedMarkdownStyles={!isReportInGroupPolicy ? ['mentionReport'] : []}
                hint={hint}
                errorText={inputError || errorText}
                sentryLabel={CONST.SENTRY_LABEL.MONEY_REQUEST.DESCRIPTION_INPUT}
            />
        </View>
    );
}

export default DescriptionInputField;
