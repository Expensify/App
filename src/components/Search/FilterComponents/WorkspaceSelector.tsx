import React from 'react';
import type {OnyxCollection} from 'react-native-onyx';
import type {SearchFilterCommonProps} from '@components/Search/types';
import {advancedSearchPoliciesSelector, useAdvancedSearchFiltersWorkspaces} from '@hooks/useAdvancedSearchFilters';
import useDebouncedState from '@hooks/useDebouncedState';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy} from '@src/types/onyx';
import type {Icon} from '@src/types/onyx/OnyxCommon';
import {getEmptyObject} from '@src/types/utils/EmptyObject';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';
import type {MultiSelectItem} from './MultiSelect';
import MultiSelect from './MultiSelect';

type WorkspaceSelectorProps = SearchFilterCommonProps & {
    policyIDQuery: string[] | undefined;
    value: string[] | undefined;
    onChange: (item: string[]) => void;
};

function WorkspaceSelector({policyIDQuery, value, selectionListTextInputStyle, selectionListStyle, autoFocus, ready = true, footer, onChange}: WorkspaceSelectorProps) {
    const {isOffline} = useNetwork();
    const [isLoadingApp] = useOnyx(ONYXKEYS.IS_LOADING_APP);
    const [policies = getEmptyObject<NonNullable<OnyxCollection<Policy>>>(), policiesResult] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {selector: advancedSearchPoliciesSelector});
    const [, debouncedSearchTerm, setSearchTerm] = useDebouncedState('');
    const {workspaces, shouldShowWorkspaceSearchInput} = useAdvancedSearchFiltersWorkspaces(policies, debouncedSearchTerm);
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
            isSearchable={shouldShowWorkspaceSearchInput}
            selectionListTextInputStyle={selectionListTextInputStyle}
            selectionListStyle={selectionListStyle}
            footer={footer}
            loading={isLoadingApp && !isOffline}
            shouldShowLoadingPlaceholder={isLoadingOnyxValue(policiesResult) || !ready}
            onChange={(policyIDs) => onChange(policyIDs.map((id) => id.value))}
            onSearch={setSearchTerm}
        />
    );
}

export default WorkspaceSelector;
