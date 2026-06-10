import React from 'react';
import useAdvancedSearchFilters from '@hooks/useAdvancedSearchFilters';
import type {Icon} from '@src/types/onyx/OnyxCommon';
import type {MultiSelectItem} from './MultiSelect';
import MultiSelect from './MultiSelect';

type WorkspaceSelectorProps = {
    policyIDQuery: string[] | undefined;
    value: string[] | undefined;
    onChange: (item: string[]) => void;
};

function WorkspaceSelector({policyIDQuery, value, onChange}: WorkspaceSelectorProps) {
    const {workspaces, shouldShowWorkspaceSearchInput} = useAdvancedSearchFilters();
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
            onChange={(policyIDs) => onChange(policyIDs.map((id) => id.value))}
            isSearchable={shouldShowWorkspaceSearchInput}
        />
    );
}

export default WorkspaceSelector;
