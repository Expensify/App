/**
 * The checklist of a workspace's enabled categories that sets which ones a member can use, with search, select all and
 * a Save button. A member needs at least one category, so saving with none checked shows a modal instead.
 */
import BlockingView from '@components/BlockingViews/BlockingView';
import FormAlertWithSubmitButton from '@components/FormAlertWithSubmitButton';
import ScrollView from '@components/ScrollView';
import SelectionList from '@components/SelectionList';
import MultiSelectListItem from '@components/SelectionList/ListItem/MultiSelectListItem';
import type {ListItem} from '@components/SelectionList/types';

import useConfirmModal from '@hooks/useConfirmModal';
import useInitialSelection from '@hooks/useInitialSelection';
import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOverridableSelection from '@hooks/useOverridableSelection';
import useSearchResults from '@hooks/useSearchResults';
import useThemeStyles from '@hooks/useThemeStyles';

import {getDecodedCategoryName} from '@libs/CategoryUtils';
import {canUseTouchScreen} from '@libs/DeviceCapabilities';
import moveInitialSelectionToTop from '@libs/SelectionListOrderUtils';
import tokenizedSearch from '@libs/tokenizedSearch';

import variables from '@styles/variables';

import type {PolicyCategory} from '@src/types/onyx';
import type {WithRequiredSentryLabel} from '@src/types/utils/SentryLabel';

import React from 'react';

type CategoryVisibilitySelectionListProps = WithRequiredSentryLabel & {
    /** The enabled categories the member can be given */
    categories: PolicyCategory[];

    /** The categories to check. The list follows changes to this until the user checks or unchecks something, so it can be passed before the categories load */
    initialSelectedCategoryNames: string[];

    /** Called with the checked categories that are still on the list, which is never empty */
    onSave: (categoryNames: string[]) => void;
};

type CategoryListItem = ListItem & {
    value: string;
};

function CategoryVisibilitySelectionList({categories, initialSelectedCategoryNames, onSave, sentryLabel}: CategoryVisibilitySelectionListProps) {
    const styles = useThemeStyles();
    const {translate, localeCompare} = useLocalize();
    const illustrations = useMemoizedLazyIllustrations(['Telescope']);
    const {showConfirmModal} = useConfirmModal();

    const {selectedKeys: selectedCategories, toggleKey: toggleCategoryName, toggleVisibleKeys} = useOverridableSelection(initialSelectedCategoryNames);
    const initialSelectedCategories = useInitialSelection(initialSelectedCategoryNames, {resetOnFocus: true});

    const categoryItems: CategoryListItem[] = categories.map((category) => ({
        keyForList: category.name,
        text: getDecodedCategoryName(category.name),
        value: category.name,
        isSelected: selectedCategories.includes(category.name),
    }));

    const filterCategory = (item: CategoryListItem, searchInput: string) => tokenizedSearch([item], searchInput, (category) => [category.text ?? '']).length > 0;

    const sortedCategoryItems = moveInitialSelectionToTop(
        [...categoryItems].sort((a, b) => localeCompare(a.text ?? '', b.text ?? '')),
        initialSelectedCategories,
    );

    const [inputValue, setInputValue, filteredCategoryItems] = useSearchResults(sortedCategoryItems, filterCategory);

    const toggleCategory = (item: CategoryListItem) => toggleCategoryName(item.value);

    const toggleSelectAll = () => toggleVisibleKeys(filteredCategoryItems.map((item) => item.value));

    const saveSelection = () => {
        // Only categories still on the list count, so one deleted or disabled since the list opened isn't saved.
        const categoryNames = categories.filter((category) => selectedCategories.includes(category.name)).map((category) => category.name);
        if (categoryNames.length === 0) {
            showConfirmModal({
                title: translate('workspace.people.categoryVisibilityRequiredModal.title'),
                prompt: translate('workspace.people.categoryVisibilityRequiredModal.description'),
                confirmText: translate('common.buttonConfirm'),
                shouldShowCancelButton: false,
            });
            return;
        }
        onSave(categoryNames);
    };

    return (
        <SelectionList
            canSelectMultiple
            shouldUpdateFocusedIndex
            ListItem={MultiSelectListItem}
            data={filteredCategoryItems}
            selectedItems={selectedCategories}
            shouldPreventDefaultFocusOnSelectRow={!canUseTouchScreen()}
            onSelectRow={toggleCategory}
            onSelectionButtonPress={toggleCategory}
            onSelectAll={filteredCategoryItems.length > 0 ? toggleSelectAll : undefined}
            textInputOptions={{
                value: inputValue,
                label: translate('common.search'),
                onChangeText: setInputValue,
            }}
            style={{
                listHeaderWrapperStyle: [styles.pt5, styles.pb2],
                listHeaderSelectAllTextStyle: [styles.textLabelSupporting],
            }}
            listEmptyContent={
                <ScrollView contentContainerStyle={[styles.flexGrow1]}>
                    <BlockingView
                        icon={illustrations.Telescope}
                        iconWidth={variables.emptyListIconWidth}
                        iconHeight={variables.emptyListIconHeight}
                        title={translate('common.noResultsFound')}
                    />
                </ScrollView>
            }
            footerContent={
                <FormAlertWithSubmitButton
                    sentryLabel={sentryLabel}
                    buttonText={translate('common.save')}
                    isAlertVisible={false}
                    onSubmit={saveSelection}
                    enabledWhenOffline
                    containerStyles={[styles.flexReset, styles.flexGrow0, styles.flexShrink0, styles.flexBasisAuto]}
                />
            }
        />
    );
}

export default CategoryVisibilitySelectionList;
