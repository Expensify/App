/**
 * Renders a single report field in the report view as an editable input instead of a row that navigates to the
 * report field editor page. Text and formula fields are typed into directly, dates open the calendar in place, and
 * list fields open the option list in a dropdown anchored under the input, so changing a value never takes the user
 * off the report.
 */

import DatePicker from '@components/DatePicker';
import FilterPopupButton from '@components/Search/FilterDropdowns/FilterPopupButton';
import type {FilterPopupButtonProps} from '@components/Search/FilterDropdowns/FilterPopupButton';
import TextInput from '@components/TextInput';

import useIsInLandscapeMode from '@hooks/useIsInLandscapeMode';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';

import {hasCircularReferences} from '@libs/Formula';
import type {FieldList} from '@libs/Formula';
import StringUtils from '@libs/StringUtils';

import EditReportFieldDropdown from '@pages/EditReportFieldDropdown';

import CONST from '@src/CONST';
import type {PolicyReportField} from '@src/types/onyx';

import {Str} from 'expensify-common';
import React, {useState} from 'react';
import {View} from 'react-native';

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
    const {windowHeight} = useWindowDimensions();
    const isInLandscapeMode = useIsInLandscapeMode();
    const icons = useMemoizedLazyExpensifyIcons(['DownArrow']);

    const [draftValue, setDraftValue] = useState(value);
    const [previousValue, setPreviousValue] = useState(value);
    const [validationError, setValidationError] = useState('');

    // A field violation such as "Field is required" is derived from the value being empty, so it is already true when
    // the report opens. Holding it back until the user has left the field keeps a report full of empty fields from
    // opening as a wall of red.
    const [hasBeenBlurred, setHasBeenBlurred] = useState(false);

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
        setHasBeenBlurred(false);
    }

    const label = Str.UCFirst(reportField.name);
    const isRequired = !reportField.deletable;
    const isReadOnly = isDisabled || reportField.type === CONST.REPORT_FIELD_TYPES.FORMULA;
    const violationError = hasBeenBlurred ? errorText : undefined;

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
            // Clearing an optional field is a real change, so the empty value is saved. Any whitespace the user
            // left behind is normalized away first so the stored value is empty rather than blank.
            setValidationError('');
            setDraftValue('');
            setLastSavedValue('');
            onSaveValue('');
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
                errorText={violationError}
                minDate={CONST.CALENDAR_PICKER.MIN_DATE}
                maxDate={CONST.CALENDAR_PICKER.MAX_DATE}
                onInputChange={(selectedDate) => saveSelectedOption(selectedDate)}
                onBlur={() => setHasBeenBlurred(true)}
                // The grid puts its own gap between the fields, so the default vertical margin would push a date
                // input below the plain text inputs sharing its row.
                wrapperStyle={styles.mv0}
                shouldDeferShowUntilPositioned
                shouldHideClearButton
            />
        );
    }

    if (reportField.type === CONST.REPORT_FIELD_TYPES.LIST && !isReadOnly) {
        const enabledOptions = reportField.values.filter((_option: string, index: number) => !reportField.disabledOptions.at(index));

        // A short list is quicker to scan than to search, so the search input is dropped and its height is not reserved.
        const shouldShowSearchInput = enabledOptions.length >= CONST.REPORT_FIELD_LIST_SEARCH_THRESHOLD;

        // A short list is easier to read in a stable alphabetical order than one that moves the current value to the
        // top, so only a long list is worth reordering to save scrolling.
        const shouldPinSelectedOption = enabledOptions.length >= CONST.STANDARD_LIST_ITEM_LIMIT;

        // FilterPopupButton calls this as a plain function during its own render, so it must not use hooks. Everything
        // it needs is read from this component's scope.
        const renderOptionsPopup: FilterPopupButtonProps['PopoverComponent'] = ({closeOverlay}) => (
            <View
                // The option list is `flex1`, so the popover needs a definite height. This is the same helper every
                // other SelectionList-in-a-popover uses, and it caps at the same window ratio and
                // `POPOVER_DROPDOWN_MAX_HEIGHT` that `getPopoverMaxHeight` does.
                style={styles.getSelectionListPopoverHeight({
                    itemCount: enabledOptions.length,
                    windowHeight,
                    isInLandscapeMode,
                    isSearchable: shouldShowSearchInput,
                    // Selecting an option submits straight away, so there is no apply button to leave room for.
                    hasButton: false,
                })}
            >
                <EditReportFieldDropdown
                    fieldKey={fieldKey}
                    fieldValue={value}
                    fieldOptions={enabledOptions}
                    shouldShowTextInput={shouldShowSearchInput}
                    // The popover is small and opens right under the field, so a "Recent" section on top of the full
                    // list is more noise than help, and a section title above a single list of values says nothing.
                    shouldShowRecentlyUsedOptions={false}
                    shouldShowSectionTitles={false}
                    shouldPinSelectedOption={shouldPinSelectedOption}
                    shouldUseCompactRows
                    onSubmit={(form) => {
                        closeOverlay();
                        saveSelectedOption(form[fieldKey] ?? '');
                    }}
                />
            </View>
        );

        return (
            // No `popoverWidth`, so the dropdown falls back to `CONST.POPOVER_DROPDOWN_WIDTH` — the same width every
            // Spend filter dropdown uses. Matching the field's own width instead made narrow fields open odd, cramped
            // popovers and wide ones open oversized.
            <FilterPopupButton
                PopoverComponent={renderOptionsPopup}
                renderButton={({onPress, ref, isExpanded}) => (
                    <View ref={ref}>
                        <TextInput
                            inputID={fieldKey}
                            label={label}
                            accessibilityLabel={label}
                            role={CONST.ROLE.COMBOBOX}
                            accessibilityState={{expanded: isExpanded}}
                            value={value}
                            errorText={violationError}
                            inputStyle={styles.pointerEventsNone}
                            icon={icons.DownArrow}
                            iconContainerStyle={[styles.pr0, isExpanded && styles.flipUpsideDown]}
                            onPress={onPress}
                            onBlur={() => setHasBeenBlurred(true)}
                            onSubmitEditing={onPress}
                            disableKeyboard
                        />
                    </View>
                )}
            />
        );
    }

    return (
        <TextInput
            inputID={fieldKey}
            label={label}
            accessibilityLabel={label}
            role={CONST.ROLE.PRESENTATION}
            value={isReadOnly ? value : draftValue}
            errorText={validationError || violationError}
            disabled={isReadOnly}
            onChangeText={setDraftValue}
            onBlur={() => {
                setHasBeenBlurred(true);
                saveDraftValue();
            }}
            onSubmitEditing={saveDraftValue}
        />
    );
}

export default ReportFieldInlineInput;
