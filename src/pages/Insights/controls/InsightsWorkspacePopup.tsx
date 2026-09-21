import {ListFilterHeightContextProvider} from '@components/Search/FilterComponents/ListFilterHeightContext';
import WorkspaceSelector from '@components/Search/FilterComponents/WorkspaceSelector';
import BasePopup from '@components/Search/FilterDropdowns/BasePopup';

import CONST from '@src/CONST';

import React, {useState} from 'react';

type InsightsWorkspacePopupProps = {
    label: string;

    /** Workspaces the dashboard is scoped to, empty for all of them */
    value: string[];

    onChange: (policyIDs: string[]) => void;
    closeOverlay: () => void;
};

/** The Workspace control's popover, built on the same selector the Spend page's workspace filter uses. */
function InsightsWorkspacePopup({label, value, onChange, closeOverlay}: InsightsWorkspacePopupProps) {
    const [selectedPolicyIDs, setSelectedPolicyIDs] = useState(value);

    const applyChanges = () => {
        onChange(selectedPolicyIDs);
        closeOverlay();
    };

    const resetChanges = () => {
        onChange([]);
        closeOverlay();
    };

    return (
        <BasePopup
            label={label}
            onApply={applyChanges}
            onReset={resetChanges}
            applySentryLabel={CONST.SENTRY_LABEL.SEARCH.FILTER_POPUP_APPLY_MULTI_SELECT}
            resetSentryLabel={CONST.SENTRY_LABEL.SEARCH.FILTER_POPUP_RESET_MULTI_SELECT}
        >
            <ListFilterHeightContextProvider>
                <WorkspaceSelector
                    value={selectedPolicyIDs}
                    onChange={(policyIDs) => setSelectedPolicyIDs(policyIDs ?? [])}
                />
            </ListFilterHeightContextProvider>
        </BasePopup>
    );
}

export default InsightsWorkspacePopup;
