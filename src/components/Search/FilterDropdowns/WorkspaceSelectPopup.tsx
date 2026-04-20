import React from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import useAdvancedSearchFilters from '@hooks/useAdvancedSearchFilters';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import ONYXKEYS from '@src/ONYXKEYS';
import type {SearchAdvancedFiltersForm} from '@src/types/form';
import type {Icon} from '@src/types/onyx/OnyxCommon';
import type {MultiSelectItem} from './MultiSelectPopup';
import MultiSelectPopup from './MultiSelectPopup';

type WorkspaceSelectPopupProps = {
    policyIDQuery: string[] | undefined;
    updateFilterForm: (values: Partial<SearchAdvancedFiltersForm>) => void;
    closeOverlay: () => void;
};

function filterPolicyIDSelector(searchAdvancedFiltersForm: OnyxEntry<SearchAdvancedFiltersForm>) {
    return searchAdvancedFiltersForm?.policyID;
}

function WorkspaceSelectPopup({policyIDQuery, updateFilterForm, closeOverlay}: WorkspaceSelectPopupProps) {
    const {translate} = useLocalize();
    const {workspaces, shouldShowWorkspaceSearchInput} = useAdvancedSearchFilters();
    const [policyID] = useOnyx(ONYXKEYS.FORMS.SEARCH_ADVANCED_FILTERS_FORM, {selector: filterPolicyIDSelector});
    const workspaceOptions: Array<MultiSelectItem<string>> = workspaces
        .flatMap((section) => section.data)
        .filter((workspace): workspace is typeof workspace & {policyID: string; icons: Icon[]} => !!workspace.policyID && !!workspace.icons)
        .map((workspace) => ({
            text: workspace.text,
            value: workspace.policyID,
            icons: workspace.icons,
        }));

    const policyIDs = policyID ?? policyIDQuery;
    const selectedWorkspaceOptions = policyIDs ? workspaceOptions.filter((option) => (Array.isArray(policyIDs) ? policyIDs : [policyIDs]).includes(option.value)) : [];

    const handleWorkspaceChange = (items: Array<MultiSelectItem<string>>) => {
        updateFilterForm({policyID: items.map((item) => item.value)});
    };

    return (
        <MultiSelectPopup
            label={translate('workspace.common.workspace')}
            items={workspaceOptions}
            value={selectedWorkspaceOptions}
            closeOverlay={closeOverlay}
            onChange={handleWorkspaceChange}
            isSearchable={shouldShowWorkspaceSearchInput}
        />
    );
}

export default WorkspaceSelectPopup;
