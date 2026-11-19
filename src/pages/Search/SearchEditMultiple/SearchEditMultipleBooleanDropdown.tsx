import AnchoredSelectionListPopover from '@components/AnchoredSelectionListPopover';
import type {ExpenseFieldDropdownRenderProps} from '@components/MoneyRequestConfirmationList/sections/ExpenseFieldDropdown';
import SelectionList from '@components/SelectionList';
import SingleSelectListItem from '@components/SelectionList/ListItem/SingleSelectListItem';
import type {ListItem} from '@components/SelectionList/ListItem/types';

import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';

import CONST from '@src/CONST';

import React from 'react';

type BooleanOption = ListItem & {
    /** The value picking this option records for every expense */
    value: boolean;
};

type SearchEditMultipleBooleanDropdownProps = ExpenseFieldDropdownRenderProps & {
    /** Name of the field, which heads the bottom sheet */
    title: string;

    /** Value the draft records for every expense, `undefined` or `null` while each keeps its own */
    selectedValue: boolean | null | undefined;

    /** Records the pick on the draft. `null` drops the pending change, so each expense keeps its own value. */
    onSelected: (value: boolean | null) => void;
};

/**
 * A yes/no field of the bulk edit form, in the container anchored to its row. Nothing is picked until the user chooses
 * a value, which leaves each expense as it is. Tapping the picked value again unpicks it, as the full-page list did.
 */
function SearchEditMultipleBooleanDropdown({title, selectedValue, onSelected, onClose, ...popoverProps}: SearchEditMultipleBooleanDropdownProps) {
    const {translate} = useLocalize();
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth -- must match PopoverWithMeasuredContent's dock decision (bottom-docked only when isSmallScreenWidth)
    const {isSmallScreenWidth} = useResponsiveLayout();

    const options: BooleanOption[] = [
        {value: true, keyForList: CONST.SEARCH.BOOLEAN.YES, text: translate('common.yes'), isSelected: selectedValue === true},
        {value: false, keyForList: CONST.SEARCH.BOOLEAN.NO, text: translate('common.no'), isSelected: selectedValue === false},
    ];

    const selectOption = (option: BooleanOption) => {
        onSelected(option.value === selectedValue ? null : option.value);
        onClose();
    };

    return (
        <AnchoredSelectionListPopover
            {...popoverProps}
            onClose={onClose}
            shouldFitContentHeight
            optionCount={options.length}
            isSearchable={false}
            title={title}
            backButtonSentryLabel={CONST.SENTRY_LABEL.SEARCH_EDIT_MULTIPLE.BOOLEAN_DROPDOWN_BACK_BUTTON}
            // The field's name only heads the bottom sheet; a pop-over sits on its field, which already names it.
            shouldShowHeader={isSmallScreenWidth}
        >
            <SelectionList
                data={options}
                ListItem={SingleSelectListItem}
                onSelectRow={selectOption}
                initiallyFocusedItemKey={options.find((option) => option.isSelected)?.keyForList}
                shouldSingleExecuteRowSelect
            />
        </AnchoredSelectionListPopover>
    );
}

export default SearchEditMultipleBooleanDropdown;
export type {BooleanOption};
