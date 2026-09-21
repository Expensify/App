import DropdownButton from '@components/Search/FilterDropdowns/DropdownButton';
import type {PopoverComponentProps} from '@components/Search/FilterDropdowns/FilterPopupButton';

import CONST from '@src/CONST';

import type {ReactNode} from 'react';

import React from 'react';

/** The row is right-aligned, so every popover opens inward from the pill's right edge. */
const INSIGHTS_CONTROL_ANCHOR_ALIGNMENT = {
    horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.RIGHT,
    vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.TOP,
} as const;

type InsightsControlDropdownProps = {
    /** What the control narrows, shown on its own until a selection is made */
    label: string;

    /** The current selection, shown after the label */
    value: string | null;

    sentryLabel: string;
    PopoverComponent: (props: PopoverComponentProps) => ReactNode;
};

/** A page-level Insights control: one pill, one popover, styled the same for every control the page offers. */
function InsightsControlDropdown({label, value, sentryLabel, PopoverComponent}: InsightsControlDropdownProps) {
    return (
        <DropdownButton
            medium
            label={label}
            value={value}
            sentryLabel={sentryLabel}
            popoverAnchorAlignment={INSIGHTS_CONTROL_ANCHOR_ALIGNMENT}
            PopoverComponent={PopoverComponent}
        />
    );
}

export default InsightsControlDropdown;
