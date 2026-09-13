import SingleSelectListItem from '@components/SelectionList/ListItem/SingleSelectListItem';
import SelectionListWithSections from '@components/SelectionList/SelectionListWithSections';

import useDebouncedState from '@hooks/useDebouncedState';
import useInitialSelection from '@hooks/useInitialSelection';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';

import {getHeaderMessageForNonUserList} from '@libs/OptionsListUtils';
import {getReportFieldOptionsSection} from '@libs/ReportFieldOptionsListUtils';

import variables from '@styles/variables';

import ONYXKEYS from '@src/ONYXKEYS';

import React from 'react';

type EditReportFieldDropdownPageProps = {
    /** Value of the policy report field */
    fieldValue: string;

    /** Key of the policy report field */
    fieldKey: string;

    /** Options of the policy report field */
    fieldOptions: string[];

    /** Callback to fire when the Save button is pressed  */
    onSubmit: (form: Record<string, string>) => void;

    /** Whether the search input is shown. Callers with a short list hide it, since there is little to search through. */
    shouldShowTextInput?: boolean;

    /** Whether the "Recent" section is shown above the full option list */
    shouldShowRecentlyUsedOptions?: boolean;

    /** Whether the selected value is lifted to the top of the list. Callers with a short list leave it in place, so the order doesn't change as the value does. */
    shouldPinSelectedOption?: boolean;

    /** Whether the "Recent" and "All" section titles are rendered */
    shouldShowSectionTitles?: boolean;

    /** Whether options use the shorter 52px row the Spend dropdowns use, instead of the default 64px page row */
    shouldUseCompactRows?: boolean;
};

function EditReportFieldDropdown({
    onSubmit,
    fieldKey,
    fieldValue,
    fieldOptions,
    shouldShowTextInput = true,
    shouldShowRecentlyUsedOptions = true,
    shouldPinSelectedOption = true,
    shouldShowSectionTitles = true,
    shouldUseCompactRows = false,
}: EditReportFieldDropdownPageProps) {
    const styles = useThemeStyles();
    const [recentlyUsedReportFields] = useOnyx(ONYXKEYS.RECENTLY_USED_REPORT_FIELDS);
    const [searchValue, debouncedSearchValue, setSearchValue] = useDebouncedState('');
    const {translate, localeCompare} = useLocalize();
    const recentlyUsedOptions = shouldShowRecentlyUsedOptions ? (recentlyUsedReportFields?.[fieldKey]?.sort(localeCompare) ?? []) : [];

    const validFieldOptions = fieldOptions?.filter((option) => !!option)?.sort(localeCompare);

    // Freeze the value selected when the picker opened so it drives the pinned "Selected" section for the whole open/focus cycle.
    // The live value still drives the checkmark, so tapping a row marks it without reordering the list. The reorder happens only on reopen.
    const initialFieldValue = useInitialSelection(fieldValue, {resetOnFocus: true});

    const sections = getReportFieldOptionsSection({
        searchValue: debouncedSearchValue,
        // Live value drives the checkmark, so tapping a row marks it immediately.
        selectedOptions: [
            {
                keyForList: fieldValue,
                searchText: fieldValue,
                text: fieldValue,
            },
        ],
        // Frozen value drives the pinned section, so the list doesn't reorder while selecting.
        initiallySelectedValue: initialFieldValue,
        options: validFieldOptions,
        recentlyUsedOptions,
        translate,
        shouldPinSelectedOption,
        shouldShowSectionTitles,
    });

    const policyReportFieldData = sections.at(0)?.data ?? [];

    const textInputOptions = {
        value: searchValue,
        label: translate('common.search'),
        onChangeText: setSearchValue,
        headerMessage: getHeaderMessageForNonUserList(policyReportFieldData.length > 0, debouncedSearchValue),
        // Nothing is rendered above the search input here, so it needs the top padding the surrounding page or popover doesn't provide.
        style: {containerStyle: styles.pt3},
    };

    return (
        <SelectionListWithSections
            sections={sections ?? []}
            ListItem={SingleSelectListItem}
            // Same override the Spend single-select dropdowns use to shorten the default 64px option row. It also makes
            // the rows match the 52px `getSelectionListPopoverHeight` already assumes, so the popover stops being sized
            // for less content than it holds.
            style={shouldUseCompactRows ? {listItemWrapperStyle: {minHeight: variables.optionRowHeightCompact}} : undefined}
            shouldShowTextInput={shouldShowTextInput}
            textInputOptions={textInputOptions}
            // Re-selecting the value the field already holds submits that same value rather than an empty string.
            // Both call sites compare the submitted value against the stored one and skip the save themselves, so
            // signalling "no change" this way is no longer needed and leaves '' free to mean "cleared".
            onSelectRow={(option) => onSubmit({[fieldKey]: option?.text ?? ''})}
            initiallyFocusedItemKey={initialFieldValue}
            shouldUpdateFocusedIndex
        />
    );
}

export default EditReportFieldDropdown;
