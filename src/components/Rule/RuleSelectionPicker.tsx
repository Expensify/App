import React, {useCallback} from 'react';
import SingleSelectListItem from '@components/SelectionList/ListItem/SingleSelectListItem';
import SelectionListWithSections from '@components/SelectionList/SelectionListWithSections';
import useLocalize from '@hooks/useLocalize';
import Navigation from '@libs/Navigation/Navigation';
import type {Route} from '@src/ROUTES';
import type {RuleSelectionListItem, SelectionItem} from './hooks/useRuleSelectionList';
import useRuleSelectionList from './hooks/useRuleSelectionList';

type RuleSelectionPickerProps = {
    items: SelectionItem[];
    initiallySelectedItem?: SelectionItem;
    onSaveSelection: (value?: string) => void;
    backToRoute: Route;
};

function RuleSelectionPicker({items, initiallySelectedItem, onSaveSelection, backToRoute}: RuleSelectionPickerProps) {
    const {translate} = useLocalize();
    const {sections, noResultsFound, searchTerm, setSearchTerm, setSelectedItem, initiallyFocusedItemKey} = useRuleSelectionList({
        items,
        initiallySelectedItem,
    });

    const onSelectRow = useCallback(
        (item: {text?: string; keyForList?: string; value?: string; isSelected?: boolean}) => {
            if (!item.text || !item.keyForList || !item.value) {
                return;
            }

            const isRemovingSelection = !!item.isSelected;
            const newValue = isRemovingSelection ? '' : item.value;

            onSaveSelection(newValue);
            Navigation.goBack(backToRoute);

            // Keep local state in sync when the user stays on the screen (e.g., web focus scenarios)
            setSelectedItem(isRemovingSelection ? undefined : {name: item.text, value: item.value});
        },
        [backToRoute, onSaveSelection, setSelectedItem],
    );

    const textInputOptions = {
        value: searchTerm,
        label: translate('common.search'),
        onChangeText: setSearchTerm,
        headerMessage: noResultsFound ? translate('common.noResultsFound') : undefined,
    };

    return (
        <SelectionListWithSections<RuleSelectionListItem>
            sections={sections}
            ListItem={SingleSelectListItem}
            onSelectRow={onSelectRow}
            shouldShowTextInput
            textInputOptions={textInputOptions}
            shouldShowLoadingPlaceholder={!noResultsFound}
            initiallyFocusedItemKey={initiallyFocusedItemKey}
            shouldUpdateFocusedIndex
            shouldStopPropagation
            shouldScrollToTopOnSelect={false}
        />
    );
}

export default RuleSelectionPicker;
