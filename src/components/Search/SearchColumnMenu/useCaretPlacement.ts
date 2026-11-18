import type {SortableHeaderLabelProps} from '@components/Search/SortableHeaderText';

import useThemeStyles from '@hooks/useThemeStyles';

import {measureSearchHeaderLabelWidth} from '@libs/getSearchColumnContentToMeasure';

import type {SearchColumnAlignment} from '@styles/utils';
import variables from '@styles/variables';

import CONST from '@src/CONST';

import type {LayoutChangeEvent} from 'react-native';
import type {ValueOf} from 'type-fest';

import {useState} from 'react';

/** Where the hover caret goes: beside the label on either side, or in place of an icon-only heading's icon. */
const CARET_PLACEMENT = {
    BEFORE_LABEL: 'beforeLabel',
    AFTER_LABEL: 'afterLabel',
    REPLACES_ICON: 'replacesIcon',
} as const;

type CaretPlacement = ValueOf<typeof CARET_PLACEMENT>;

type CaretPlacementResult = {
    placement: CaretPlacement;
    isCentered: boolean;

    /** Measures the heading's cell, to check that an end-aligned label has room for the caret before it. `undefined` when no check is needed. */
    onLayout: ((event: LayoutChangeEvent) => void) | undefined;
};

/** Picks where a heading's hover caret goes, so revealing it never moves the heading. */
function useCaretPlacement(alignment: SearchColumnAlignment, label: string, labelProps: SortableHeaderLabelProps): CaretPlacementResult {
    const styles = useThemeStyles();

    // An end-aligned label with no room for the caret before it is laid out as start-aligned, so hovering never moves it.
    const [hasRoomForCaretBeforeLabel, setHasRoomForCaretBeforeLabel] = useState(true);
    // Reserves the sort arrow, so sorting never flips the layout. `null` on native, which can't measure text.
    const labelWidth = alignment === CONST.SEARCH.TABLE_COLUMN_ALIGNMENT.END ? measureSearchHeaderLabelWidth(label, styles.gap1.gap) : null;
    const onLayout =
        labelWidth === null
            ? undefined
            : (event: LayoutChangeEvent) => {
                  const caretWidth = variables.iconSizeExtraSmall + styles.mr1.marginRight;
                  setHasRoomForCaretBeforeLabel(event.nativeEvent.layout.width >= labelWidth + caretWidth);
              };
    const layoutAlignment = alignment === CONST.SEARCH.TABLE_COLUMN_ALIGNMENT.END && !hasRoomForCaretBeforeLabel ? CONST.SEARCH.TABLE_COLUMN_ALIGNMENT.START : alignment;

    let placement: CaretPlacement = layoutAlignment === CONST.SEARCH.TABLE_COLUMN_ALIGNMENT.END ? CARET_PLACEMENT.BEFORE_LABEL : CARET_PLACEMENT.AFTER_LABEL;
    if (!labelProps.text && !!labelProps.icon) {
        placement = CARET_PLACEMENT.REPLACES_ICON;
    }

    return {placement, isCentered: layoutAlignment === CONST.SEARCH.TABLE_COLUMN_ALIGNMENT.CENTER, onLayout};
}

export default useCaretPlacement;
export {CARET_PLACEMENT};
export type {CaretPlacement};
