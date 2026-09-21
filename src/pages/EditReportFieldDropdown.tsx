import SingleSelectListItem from '@components/SelectionList/ListItem/SingleSelectListItem';
import SelectionListWithSections from '@components/SelectionList/SelectionListWithSections';

import useDebouncedState from '@hooks/useDebouncedState';
import useInitialSelection from '@hooks/useInitialSelection';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';

import {getHeaderMessageForNonUserList} from '@libs/OptionsListUtils';
import {getReportFieldOptionsSection} from '@libs/ReportFieldOptionsListUtils';

import ONYXKEYS from '@src/ONYXKEYS';

import React, {useState} from 'react';

type EditReportFieldDropdownPageProps = {
    /** Value of the policy report field */
    fieldValue: string;

    /** Key of the policy report field */
    fieldKey: string;

    /** Options of the policy report field */
    fieldOptions: string[];

    /** Callback to fire when the Save button is pressed  */
    onSubmit: (form: Record<string, string>) => void;
};

function EditReportFieldDropdown({onSubmit, fieldKey, fieldValue, fieldOptions}: EditReportFieldDropdownPageProps) {
    const [recentlyUsedReportFields] = useOnyx(ONYXKEYS.RECENTLY_USED_REPORT_FIELDS);
    const [searchValue, debouncedSearchValue, setSearchValue] = useDebouncedState('');
    const {translate, localeCompare} = useLocalize();
    const recentlyUsedOptions = recentlyUsedReportFields?.[fieldKey]?.sort(localeCompare) ?? [];

    const validFieldOptions = fieldOptions?.filter((option) => !!option)?.sort(localeCompare);

    // Tapping a row used to call `onSubmit` straight away, which closed the page on input (WCAG 3.2.2 On Input).
    // The tap now only stages the value, and `onSubmit` runs from an explicit Save.
    // An empty string is a meaningful staged value (it clears the field), so `undefined` means "nothing staged yet".
    const [draftValue, setDraftValue] = useState<string>();
    const currentValue = draftValue ?? fieldValue;

    // Freeze the value selected when the picker opened so it drives the pinned "Selected" section for the whole open/focus cycle.
    // The live value still drives the checkmark, so tapping a row marks it without reordering the list. The reorder happens only on reopen.
    const initialFieldValue = useInitialSelection(fieldValue, {resetOnFocus: true});

    const sections = getReportFieldOptionsSection({
        searchValue: debouncedSearchValue,
        // Staged value drives the checkmark, so tapping a row marks it immediately.
        selectedOptions: [
            {
                keyForList: currentValue,
                searchText: currentValue,
                text: currentValue,
            },
        ],
        // Frozen value drives the pinned section, so the list doesn't reorder while selecting.
        initiallySelectedValue: initialFieldValue,
        options: validFieldOptions,
        recentlyUsedOptions,
        translate,
    });

    const policyReportFieldData = sections.at(0)?.data ?? [];

    const textInputOptions = {
        value: searchValue,
        label: translate('common.search'),
        onChangeText: setSearchValue,
        headerMessage: getHeaderMessageForNonUserList(policyReportFieldData.length > 0, debouncedSearchValue),
    };

    return (
        <SelectionListWithSections
            sections={sections ?? []}
            ListItem={SingleSelectListItem}
            shouldShowTextInput
            textInputOptions={textInputOptions}
            // Tapping the already-selected row clears the field, matching the previous behavior of this picker.
            onSelectRow={(option) => setDraftValue(!option?.text || currentValue === option.text ? '' : option.text)}
            confirmButtonOptions={{
                showButton: true,
                text: translate('common.save'),
                onConfirm: () => onSubmit({[fieldKey]: currentValue}),
                isDisabled: draftValue === undefined || draftValue === fieldValue,
            }}
            initiallyFocusedItemKey={initialFieldValue}
            shouldUpdateFocusedIndex
        />
    );
}

export default EditReportFieldDropdown;
