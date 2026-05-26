import React from 'react';
import type {OnyxCollection} from 'react-native-onyx';
import type {SearchFilterSelectionListProps} from '@components/Search/types';
import {advancedSearchPoliciesSelector, useAdvancedSearchFiltersWorkspaces} from '@hooks/useAdvancedSearchFilters';
import useOnyx from '@hooks/useOnyx';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy} from '@src/types/onyx';
import type {Icon} from '@src/types/onyx/OnyxCommon';
import {getEmptyObject} from '@src/types/utils/EmptyObject';
import type {MultiSelectItem} from './MultiSelect';
import MultiSelect from './MultiSelect';

type WorkspaceSelectorProps = SearchFilterSelectionListProps & {
    policyIDQuery: string[] | undefined;
    value: string[] | undefined;
    autoFocus?: boolean;
    onChange: (item: string[]) => void;
};

function WorkspaceSelector({policyIDQuery, value, selectionListTextInputStyle, selectionListStyle, autoFocus, footer, onChange}: WorkspaceSelectorProps) {
    const [policies = getEmptyObject<NonNullable<OnyxCollection<Policy>>>()] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {selector: advancedSearchPoliciesSelector});
    const {workspaces, shouldShowWorkspaceSearchInput} = useAdvancedSearchFiltersWorkspaces(policies);
    const workspaceOptions: Array<MultiSelectItem<string>> = workspaces
        .flatMap((section) => section.data)
        .filter((workspace): workspace is typeof workspace & {policyID: string; icons: Icon[]} => !!workspace.policyID && !!workspace.icons)
        .map((workspace) => ({
            text: workspace.text,
            value: workspace.policyID,
            icons: workspace.icons,
        }));

    const policyID = value ?? policyIDQuery ?? [];
    const selectedWorkspaceOptions = workspaceOptions.filter((option) => (Array.isArray(policyID) ? policyID : [policyID]).includes(option.value));

    return (
        <MultiSelect
            items={workspaceOptions}
            value={selectedWorkspaceOptions}
            autoFocus={autoFocus}
            onChange={(policyIDs) => onChange(policyIDs.map((id) => id.value))}
            isSearchable={shouldShowWorkspaceSearchInput}
            selectionListTextInputStyle={selectionListTextInputStyle}
            selectionListStyle={selectionListStyle}
            footer={footer}
        />
    );
}

export default WorkspaceSelector;
