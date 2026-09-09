/**
 * Renders a single report field in the report view as an editable input instead of a row that navigates to the
 * report field editor page. Text and formula fields are typed into directly, dates open the calendar in place, and
 * list fields open the option list in a modal, so changing a value never takes the user off the report.
 */

import DatePicker from '@components/DatePicker';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import Modal from '@components/Modal';
import ScreenWrapper from '@components/ScreenWrapper';
import TextInput from '@components/TextInput';

import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import {hasCircularReferences} from '@libs/Formula';
import type {FieldList} from '@libs/Formula';
import StringUtils from '@libs/StringUtils';

import EditReportFieldDropdown from '@pages/EditReportFieldDropdown';

import CONST from '@src/CONST';
import type {PolicyReportField} from '@src/types/onyx';

import {Str} from 'expensify-common';
import React, {useState} from 'react';

type ReportFieldInlineInputProps = {
    reportField: PolicyReportField;

    /** Key the field is stored under, used as the input ID */
    fieldKey: string;

    /** Value currently shown for the field */
    value: string;

    /** Whether the current user is allowed to change the value */
    isDisabled: boolean;

    /** Message shown under the input, for example a field violation */
    errorText?: string;

    /** Policy field list, used to reject values that make a formula refer to itself */
    fieldList?: FieldList;

    onSaveValue: (value: string) => void;
};

function ReportFieldInlineInput({reportField, fieldKey, value, isDisabled, errorText, fieldList, onSaveValue}: ReportFieldInlineInputProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const [draftValue, setDraftValue] = useState(value);
    const [previousValue, setPreviousValue] = useState(value);
    const [validationError, setValidationError] = useState('');
    const [isOptionListVisible, setIsOptionListVisible] = useState(false);

    // Tracks the value that was last sent to the server so a second save attempt for the same value, for example when
    // the input is blurred right after it was submitted, is skipped while the update is still in flight.
    const [lastSavedValue, setLastSavedValue] = useState(value);

    // The saved value changes while this input is mounted whenever the field is updated elsewhere, for example from
    // another device or by an optimistic update, so the draft follows it.
    if (value !== previousValue) {
        setPreviousValue(value);
        setDraftValue(value);
        setValidationError('');
        setLastSavedValue(value);
    }

    const label = Str.UCFirst(reportField.name);
    const isRequired = !reportField.deletable;
    const isReadOnly = isDisabled || reportField.type === CONST.REPORT_FIELD_TYPES.FORMULA;

    const saveDraftValue = () => {
        const valueToSave = StringUtils.lineBreaksToSpaces(draftValue);
        const trimmedValue = valueToSave.trim();

        if (trimmedValue === lastSavedValue.trim()) {
            setValidationError('');
            return;
        }

        if (trimmedValue === '') {
            if (isRequired) {
                setValidationError(translate('common.error.fieldRequired'));
                return;
            }
            // An empty value is never saved, so the input goes back to showing what is stored.
            setDraftValue(lastSavedValue);
            setValidationError('');
            return;
        }

        if (hasCircularReferences(trimmedValue, reportField.name, fieldList)) {
            setValidationError(translate('workspace.reportFields.circularReferenceError'));
            return;
        }

        setValidationError('');
        setLastSavedValue(valueToSave);
        onSaveValue(valueToSave);
    };

    const saveSelectedOption = (selectedValue: string) => {
        setIsOptionListVisible(false);
        if (selectedValue === lastSavedValue) {
            return;
        }
        setLastSavedValue(selectedValue);
        onSaveValue(selectedValue);
    };

    if (reportField.type === CONST.REPORT_FIELD_TYPES.DATE && !isReadOnly) {
        return (
            <DatePicker
                inputID={fieldKey}
                label={label}
                accessibilityLabel={label}
                value={value}
                errorText={errorText}
                onInputChange={(selectedDate) => onSaveValue(selectedDate)}
                shouldDeferShowUntilPositioned
                shouldHideClearButton
            />
        );
    }

    if (reportField.type === CONST.REPORT_FIELD_TYPES.LIST && !isReadOnly) {
        const enabledOptions = reportField.values.filter((_option: string, index: number) => !reportField.disabledOptions.at(index));

        return (
            <>
                <TextInput
                    inputID={fieldKey}
                    label={label}
                    accessibilityLabel={label}
                    role={CONST.ROLE.COMBOBOX}
                    accessibilityState={{expanded: isOptionListVisible}}
                    value={value}
                    errorText={errorText}
                    inputStyle={styles.pointerEventsNone}
                    onPress={() => setIsOptionListVisible(true)}
                    onSubmitEditing={() => setIsOptionListVisible(true)}
                    disableKeyboard
                />
                <Modal
                    type={CONST.MODAL.MODAL_TYPE.RIGHT_DOCKED}
                    isVisible={isOptionListVisible}
                    onClose={() => setIsOptionListVisible(false)}
                    onBackdropPress={() => setIsOptionListVisible(false)}
                    shouldHandleNavigationBack
                    enableEdgeToEdgeBottomSafeAreaPadding
                >
                    <ScreenWrapper
                        includePaddingTop={false}
                        enableEdgeToEdgeBottomSafeAreaPadding
                        testID="ReportFieldOptionListModal"
                    >
                        <HeaderWithBackButton
                            title={label}
                            onBackButtonPress={() => setIsOptionListVisible(false)}
                        />
                        <EditReportFieldDropdown
                            fieldKey={fieldKey}
                            fieldValue={value}
                            fieldOptions={enabledOptions}
                            onSubmit={(form) => saveSelectedOption(form[fieldKey] ?? '')}
                        />
                    </ScreenWrapper>
                </Modal>
            </>
        );
    }

    return (
        <TextInput
            inputID={fieldKey}
            label={label}
            accessibilityLabel={label}
            role={CONST.ROLE.PRESENTATION}
            value={isReadOnly ? value : draftValue}
            errorText={validationError || errorText}
            disabled={isReadOnly}
            onChangeText={setDraftValue}
            onBlur={saveDraftValue}
            onSubmitEditing={saveDraftValue}
        />
    );
}

export default ReportFieldInlineInput;
