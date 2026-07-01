import React from 'react';
import {View} from 'react-native';
import type {OnyxCollection} from 'react-native-onyx';
import ActivityIndicator from '@components/ActivityIndicator';
import type {SearchFilterCommonProps} from '@components/Search/types';
import SelectionList from '@components/SelectionList';
import MultiSelectListItem from '@components/SelectionList/ListItem/MultiSelectListItem';
import type {ListItem, TextInputOptions} from '@components/SelectionList/types';
import {advancedSearchPoliciesSelector, useAdvancedSearchFiltersWorkspaces} from '@hooks/useAdvancedSearchFilters';
import useDebouncedState from '@hooks/useDebouncedState';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import type {SkeletonSpanReasonAttributes} from '@libs/telemetry/useSkeletonSpan';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy} from '@src/types/onyx';
import type {Icon} from '@src/types/onyx/OnyxCommon';
import {getEmptyObject} from '@src/types/utils/EmptyObject';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';
import ListFilterView from './ListFilterViewWrapper';
import type {MultiSelectItem} from './MultiSelect';

type WorkspaceSelectorProps = SearchFilterCommonProps<string[] | undefined>;

function WorkspaceSelector({value, selectionListTextInputStyle, selectionListStyle, autoFocus, ready = true, footer, onChange}: WorkspaceSelectorProps) {
    const {isOffline} = useNetwork();
    const {translate} = useLocalize();
    const theme = useTheme();
    const styles = useThemeStyles();
    const [isLoadingApp] = useOnyx(ONYXKEYS.IS_LOADING_APP);
    const [policies = getEmptyObject<NonNullable<OnyxCollection<Policy>>>(), policiesResult] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {selector: advancedSearchPoliciesSelector});
    const [searchTerm, debouncedSearchTerm, setSearchTerm] = useDebouncedState('');
    const {workspaces, shouldShowWorkspaceSearchInput} = useAdvancedSearchFiltersWorkspaces(policies, debouncedSearchTerm);
    const workspaceOptions: Array<MultiSelectItem<string>> = workspaces
        .flatMap((section) => section.data)
        .filter((workspace): workspace is typeof workspace & {policyID: string; icons: Icon[]} => !!workspace.policyID && !!workspace.icons)
        .map((workspace) => ({
            text: workspace.text,
            value: workspace.policyID,
            icons: workspace.icons,
        }));

    const policyID = value ?? [];

    const updateSelectedItems = (item: ListItem) => {
        let newValue;
        if (item.isSelected) {
            newValue = policyID.filter((i) => i !== item.keyForList);
        } else {
            newValue = [...policyID, item.keyForList];
        }
        onChange(newValue);
    };

    const listData: ListItem[] = workspaceOptions.map((item) => ({
        text: item.text,
        keyForList: item.value,
        isSelected: policyID.includes(item.value),
        icons: item.icons,
    }));

    const textInputOptions: TextInputOptions = {
        value: searchTerm,
        label: shouldShowWorkspaceSearchInput ? translate('common.search') : undefined,
        onChangeText: setSearchTerm,
        headerMessage: shouldShowWorkspaceSearchInput && listData.length === 0 ? translate('common.noResultsFound') : undefined,
        style: {
            containerStyle: selectionListTextInputStyle,
        },
        disableAutoFocus: !autoFocus,
    };

    const reasonAttributes: SkeletonSpanReasonAttributes = {context: 'MultiSelectDataLoading'};

    return (
        <ListFilterView
            itemCount={listData.length}
            isSearchable={shouldShowWorkspaceSearchInput}
        >
            {isLoadingApp && !isOffline ? (
                <View style={[styles.flex1, styles.justifyContentCenter, styles.alignItemsCenter]}>
                    <ActivityIndicator
                        size={CONST.ACTIVITY_INDICATOR_SIZE.SMALL}
                        color={theme.spinner}
                        reasonAttributes={reasonAttributes}
                    />
                </View>
            ) : (
                <SelectionList
                    shouldSingleExecuteRowSelect
                    shouldShowLoadingPlaceholder={isLoadingOnyxValue(policiesResult) || !ready}
                    data={listData}
                    ListItem={MultiSelectListItem}
                    onSelectRow={updateSelectedItems}
                    textInputOptions={textInputOptions}
                    style={{contentContainerStyle: [styles.pb0], ...selectionListStyle}}
                    footerContent={footer}
                />
            )}
        </ListFilterView>
    );
}

export default WorkspaceSelector;
