import ActivityIndicator from '@components/ActivityIndicator';
import Checkbox from '@components/Checkbox';
import {PressableWithoutFeedback} from '@components/Pressable';
import type {SearchFilterCommonProps} from '@components/Search/types';
import MultiSelectListItem from '@components/SelectionList/ListItem/MultiSelectListItem';
import type {ListItem} from '@components/SelectionList/ListItem/types';
import SelectionListWithSections from '@components/SelectionList/SelectionListWithSections';
import type {Section} from '@components/SelectionList/SelectionListWithSections/types';
import type {TextInputOptions} from '@components/SelectionList/types';
import Text from '@components/Text';

import {advancedSearchPoliciesSelector, useAdvancedSearchFiltersWorkspaces} from '@hooks/useAdvancedSearchFilters';
import useDebouncedState from '@hooks/useDebouncedState';
import {useIsAppLoadPending} from '@hooks/useInFlightRequests';
import useInitialValue from '@hooks/useInitialValue';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import moveInitialSelectionToTop from '@libs/SelectionListOrderUtils';
import tokenizedSearch from '@libs/tokenizedSearch';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy} from '@src/types/onyx';
import type {Icon} from '@src/types/onyx/OnyxCommon';
import {getEmptyObject} from '@src/types/utils/EmptyObject';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';

import type {OnyxCollection} from 'react-native-onyx';

import React from 'react';
import {View} from 'react-native';

import type {MultiSelectItem} from './MultiSelect';

import ListFilterView from './ListFilterViewWrapper';

type WorkspaceFilterItem = ListItem & {
    value: string;
};

type WorkspaceOption = MultiSelectItem<string> & {isArchived: boolean};

type WorkspaceSelectorProps = SearchFilterCommonProps<string[] | undefined>;

const SECTION_HEADER_HEIGHT = 60;

function SectionHeader({
    title,
    selectAllLabel,
    items,
    selectedValues,
    onToggle,
}: {
    title: string;
    selectAllLabel: string;
    items: WorkspaceFilterItem[];
    selectedValues: string[];
    onToggle: (values: string[]) => void;
}) {
    const styles = useThemeStyles();
    const selectedCount = items.filter((item) => selectedValues.includes(item.value)).length;
    const isAllSelected = items.length > 0 && selectedCount === items.length;
    const isIndeterminate = selectedCount > 0 && selectedCount < items.length;

    const toggleSection = () => {
        if (isAllSelected) {
            const sectionValues = new Set(items.map((item) => item.value));
            onToggle(selectedValues.filter((v) => !sectionValues.has(v)));
        } else {
            const sectionValues = items.map((item) => item.value);
            const merged = new Set([...selectedValues, ...sectionValues]);
            onToggle([...merged]);
        }
    };

    return (
        <View>
            <View style={[styles.optionsListSectionHeader, styles.justifyContentCenter, styles.ph5]}>
                <Text style={[styles.textLabelSupporting]}>{title}</Text>
            </View>
            <PressableWithoutFeedback
                sentryLabel={CONST.SENTRY_LABEL.SEARCH.WORKSPACE_SELECTOR_SELECT_ALL}
                style={[styles.flexRow, styles.alignItemsCenter, styles.justifyContentBetween, styles.ph5, styles.pv2]}
                onPress={toggleSection}
                accessibilityRole={CONST.ROLE.BUTTON}
                accessibilityLabel={`${selectAllLabel} ${title}`}
            >
                <Text style={[styles.textStrong]}>{selectAllLabel}</Text>
                <Checkbox
                    isChecked={isAllSelected}
                    isIndeterminate={isIndeterminate}
                    onPress={toggleSection}
                    accessibilityLabel={`${selectAllLabel} ${title}`}
                />
            </PressableWithoutFeedback>
        </View>
    );
}

function WorkspaceSelector({value = [], selectionListTextInputStyle, selectionListStyle, autoFocus, ready = true, footer, onChange}: WorkspaceSelectorProps) {
    const {isOffline} = useNetwork();
    const {translate} = useLocalize();
    const theme = useTheme();
    const styles = useThemeStyles();
    const isAppLoadPending = useIsAppLoadPending();
    const [policies = getEmptyObject<NonNullable<OnyxCollection<Policy>>>(), policiesResult] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {selector: advancedSearchPoliciesSelector});
    const [searchTerm, debouncedSearchTerm, setSearchTerm] = useDebouncedState('');
    // Fetch the full (unfiltered) workspace list and apply the search filter locally, so pinning is decided from the
    // full list length rather than the filtered result count (see reordering below).
    const {workspaces, shouldShowWorkspaceSearchInput} = useAdvancedSearchFiltersWorkspaces(policies);
    const workspaceOptions: WorkspaceOption[] = workspaces
        .flatMap((section) => section.data)
        .filter((workspace): workspace is typeof workspace & {policyID: string; icons: Icon[]} => !!workspace.policyID && !!workspace.icons)
        .map((workspace) => ({
            text: workspace.text,
            value: workspace.policyID,
            icons: workspace.icons,
            isArchived: !!workspace.isArchived,
        }));

    // Snapshot the workspaces selected when the filter first opened so they can be floated to the top of a long list on
    // first render without repinning rows that are toggled afterwards. moveInitialSelectionToTop gates on the *unfiltered*
    // list length so the decision doesn't flip as the user types, and reordering before filtering keeps the pinned items
    // on top among the results that still match.
    const initialSelectedValues = useInitialValue(() => value);
    const orderedOptions = moveInitialSelectionToTop(workspaceOptions, initialSelectedValues);
    const filteredOptions = tokenizedSearch(orderedOptions, debouncedSearchTerm, (option) => [option.text]);

    const updateSelectedItems = (item: ListItem) => {
        let newValue;
        if (item.isSelected) {
            newValue = value.filter((i) => i !== item.keyForList);
        } else {
            newValue = [...value, item.keyForList];
        }
        onChange(newValue);
    };

    const toFilterItem = (item: WorkspaceOption): WorkspaceFilterItem => ({
        text: item.text,
        keyForList: item.value,
        isSelected: value.includes(item.value),
        icons: item.icons,
        value: item.value,
    });

    const activeItems = filteredOptions.filter((item) => !item.isArchived).map(toFilterItem);
    const archivedItems = filteredOptions.filter((item) => item.isArchived).map(toFilterItem);
    const hasArchived = archivedItems.length > 0;
    const selectAllLabel = translate('search.filters.workspace.selectAll');

    const sections: Array<Section<WorkspaceFilterItem>> = [
        {
            data: activeItems,
            sectionIndex: 0,
            customHeader:
                activeItems.length > 0 ? (
                    <SectionHeader
                        title={translate('search.filters.workspace.active')}
                        selectAllLabel={selectAllLabel}
                        items={activeItems}
                        selectedValues={value}
                        onToggle={onChange}
                    />
                ) : undefined,
        },
    ];

    if (hasArchived) {
        sections.push({
            data: archivedItems,
            sectionIndex: 1,
            customHeader: (
                <SectionHeader
                    title={translate('search.filters.workspace.archived')}
                    selectAllLabel={selectAllLabel}
                    items={archivedItems}
                    selectedValues={value}
                    onToggle={onChange}
                />
            ),
        });
    }

    const itemCount = activeItems.length + archivedItems.length;
    const headerExtraHeight = (activeItems.length > 0 ? SECTION_HEADER_HEIGHT : 0) + (hasArchived ? SECTION_HEADER_HEIGHT : 0);

    const textInputOptions: TextInputOptions = {
        value: searchTerm,
        label: shouldShowWorkspaceSearchInput ? translate('common.search') : undefined,
        onChangeText: setSearchTerm,
        headerMessage: shouldShowWorkspaceSearchInput && itemCount === 0 ? translate('common.noResultsFound') : undefined,
        style: {
            containerStyle: selectionListTextInputStyle,
        },
        disableAutoFocus: !autoFocus,
    };

    return (
        <ListFilterView
            itemCount={itemCount}
            isSearchable={shouldShowWorkspaceSearchInput}
            isNegatable
            extraHeight={headerExtraHeight}
        >
            {isAppLoadPending && !isOffline ? (
                <View style={[styles.flex1, styles.justifyContentCenter, styles.alignItemsCenter]}>
                    <ActivityIndicator
                        size={CONST.ACTIVITY_INDICATOR_SIZE.SMALL}
                        color={theme.spinner}
                    />
                </View>
            ) : (
                <SelectionListWithSections<WorkspaceFilterItem>
                    sections={sections}
                    ListItem={MultiSelectListItem}
                    onSelectRow={updateSelectedItems}
                    shouldPreventDefaultFocusOnSelectRow={false}
                    shouldShowTextInput={shouldShowWorkspaceSearchInput}
                    shouldShowLoadingPlaceholder={isLoadingOnyxValue(policiesResult) || !ready}
                    textInputOptions={textInputOptions}
                    shouldStopPropagation
                    canSelectMultiple
                    shouldSingleExecuteRowSelect
                    shouldClearInputOnSelect={false}
                    shouldUpdateFocusedIndex
                    shouldPreventAutoScrollOnSelect
                    style={selectionListStyle}
                    footerContent={footer}
                />
            )}
        </ListFilterView>
    );
}

export default WorkspaceSelector;
