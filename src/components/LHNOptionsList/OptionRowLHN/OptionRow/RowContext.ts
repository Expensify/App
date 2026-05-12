import {createContext, useContext} from 'react';
import type {LayoutChangeEvent, MutableRefObject, View} from 'react-native';
import type {ValueOf} from 'type-fest';
import type {OptionData} from '@libs/ReportUtils';
import CONST from '@src/CONST';

type OptionMode = ValueOf<typeof CONST.OPTION_MODE>;

type RowState = {
    /** Whether the row is the currently focused/active option. */
    isOptionFocused: boolean;

    /** Whether the row is currently hovered (web/desktop). */
    hovered: boolean;

    /** Display density mode (default vs compact). */
    viewMode: OptionMode;

    /** Brick road status (error/info) for the row. */
    brickRoadIndicator: OptionData['brickRoadIndicator'];
};

type RowActions = {
    /** Press handler for the row. */
    onSelectRow: () => void;

    /** Layout handler for the row's outer pressable. */
    onLayout: (event: LayoutChangeEvent) => void;
};

type RowMeta = {
    /** Underlying option data for this row. */
    optionItem: OptionData;

    /** Whether the user has a draft comment for the report. */
    hasDraftComment: boolean;

    /** Numeric testID for the row (mirrors `reportID`). */
    testID: number;

    /** Whether the parent screen is currently focused. */
    isScreenFocused: boolean;

    /** Anchor ref used by popover/context-menu actions. */
    popoverAnchor: MutableRefObject<View | null>;
};

type RowContextValue = {
    state: RowState;
    actions: RowActions;
    meta: RowMeta;
};

const RowContext = createContext<RowContextValue | null>(null);

function useRowContext(): RowContextValue {
    const value = useContext(RowContext);
    if (!value) {
        throw new Error('useRowContext must be used inside <OptionRow.Provider>');
    }
    return value;
}

export default RowContext;
export {useRowContext};
export type {RowContextValue, RowState, RowActions, RowMeta};
