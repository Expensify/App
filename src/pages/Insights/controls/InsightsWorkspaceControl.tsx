import {ListFilterHeightContextProvider} from '@components/Search/FilterComponents/ListFilterHeightContext';
import WorkspaceSelector from '@components/Search/FilterComponents/WorkspaceSelector';
import BasePopup from '@components/Search/FilterDropdowns/BasePopup';
import DropdownButton from '@components/Search/FilterDropdowns/DropdownButton';
import type {PopoverComponentProps} from '@components/Search/FilterDropdowns/FilterPopupButton';
import useFilterWorkspaceValue from '@components/Search/hooks/useFilterWorkspaceValue';

import useLocalize from '@hooks/useLocalize';

import CONST from '@src/CONST';

import React, {useState} from 'react';

import type {InsightsControlProps} from './insightsControls';

import INSIGHTS_CONTROL_ANCHOR_ALIGNMENT from './insightsControls';

type InsightsWorkspacePopupProps = {
    label: string;

    /** Workspaces the dashboard is scoped to, empty for all of them */
    value: string[];

    onChange: (policyIDs: string[]) => void;
    closeOverlay: () => void;
};

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

function InsightsWorkspaceControl({value, onChange}: InsightsControlProps<string[]>) {
    const {translate} = useLocalize();
    const workspaceNames = useFilterWorkspaceValue(value);
    const label = translate('workspace.common.workspace');

    const workspacePopover = ({closeOverlay}: PopoverComponentProps) => (
        <InsightsWorkspacePopup
            label={label}
            value={value}
            onChange={onChange}
            closeOverlay={closeOverlay}
        />
    );

    return (
        <DropdownButton
            label={label}
            value={workspaceNames || null}
            sentryLabel={CONST.SENTRY_LABEL.INSIGHTS.CONTROL_WORKSPACE}
            popoverAnchorAlignment={INSIGHTS_CONTROL_ANCHOR_ALIGNMENT}
            PopoverComponent={workspacePopover}
        />
    );
}

export default InsightsWorkspaceControl;
