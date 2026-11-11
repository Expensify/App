import AnchoredSelectionListPopover from '@components/AnchoredSelectionListPopover';
import type {ExpenseFieldDropdownRenderProps} from '@components/MoneyRequestConfirmationList/sections/ExpenseFieldDropdown';
import SelectionList from '@components/SelectionList';
import SingleSelectListItem from '@components/SelectionList/ListItem/SingleSelectListItem';
import type {ListItem} from '@components/SelectionList/ListItem/types';

import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';

import CONST from '@src/CONST';

import React from 'react';

/** The option that leaves each expense's own value alone */
const UNCHANGED_OPTION_KEY = 'dontChange';

type BooleanOption = ListItem & {
    /** What a pick records on the draft. `null` drops the pending change, so each expense keeps its own value. */
    value: boolean | null;
};

type SearchEditMultipleBooleanDropdownProps = ExpenseFieldDropdownRenderProps & {
    /** Name of the field, which heads the bottom sheet */
    title: string;

    /** Value the draft records for every expense, `undefined` or `null` while each keeps its own */
    selectedValue: boolean | null | undefined;

    /** Records the pick on the draft */
    onSelected: (value: boolean | null) => void;
};

/**
 * A yes/no field of the bulk edit form, in the container anchored to its row. A switch can't tell "leave each expense
 * as it is" apart from "set every expense to No", so the list offers both, with "Don't change" picked until the user
 * chooses a value.
 */
function SearchEditMultipleBooleanDropdown({title, selectedValue, onSelected, onClose, ...popoverProps}: SearchEditMultipleBooleanDropdownProps) {
    const {translate} = useLocalize();
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth -- must match PopoverWithMeasuredContent's dock decision (bottom-docked only when isSmallScreenWidth)
    const {isSmallScreenWidth} = useResponsiveLayout();
    const pendingValue = selectedValue ?? null;

    const options: BooleanOption[] = [
        {value: null, keyForList: UNCHANGED_OPTION_KEY, text: translate('common.dontChange'), isSelected: pendingValue === null},
        {value: true, keyForList: CONST.SEARCH.BOOLEAN.YES, text: translate('common.yes'), isSelected: pendingValue === true},
        {value: false, keyForList: CONST.SEARCH.BOOLEAN.NO, text: translate('common.no'), isSelected: pendingValue === false},
    ];

    const selectOption = (option: BooleanOption) => {
        onSelected(option.value);
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
