import CONST from '@src/CONST';

import React, {createContext, useContext, useState} from 'react';

import type {SearchColumnType, SearchQueryJSON} from './types';

/** Only the first few displayed columns can be frozen, so the frozen area never grows wider than the table can show. */
const MAX_FREEZABLE_COLUMNS = 10;

type FrozenColumnState = {
    /** The rightmost frozen column. It and every column to its left stay pinned while the table scrolls horizontally. */
    frozenColumn: SearchColumnType | null;

    /** Whether the current search shows the table that supports freezing columns. */
    canFreezeColumns: boolean;
};

type FrozenColumnActions = {
    /** Freezes the table up to the given column, or unfreezes it when given null. */
    setFrozenColumn: (column: SearchColumnType | null) => void;
};

/**
 * Defaults to nothing frozen, because the rows and headers that read this also render outside the Search page, where no
 * provider is mounted.
 */
const FrozenColumnStateContext = createContext<FrozenColumnState>({frozenColumn: null, canFreezeColumns: false});

const FrozenColumnActionsContext = createContext<FrozenColumnActions>({setFrozenColumn: () => {}});

type FrozenColumnProviderProps = React.PropsWithChildren<{
    /** The current search, which decides whether freezing applies. Only the flat expense table supports it. */
    queryJSON: SearchQueryJSON | undefined;
}>;

/** Holds the frozen column in memory only, so it resets on reload and never leaves the client. */
function FrozenColumnProvider({queryJSON, children}: FrozenColumnProviderProps) {
    const [frozenColumn, setFrozenColumn] = useState<SearchColumnType | null>(null);
    const canFreezeColumns = queryJSON?.type === CONST.SEARCH.DATA_TYPES.EXPENSE && !queryJSON?.groupBy;

    return (
        <FrozenColumnActionsContext.Provider value={{setFrozenColumn}}>
            <FrozenColumnStateContext.Provider value={{frozenColumn: canFreezeColumns ? frozenColumn : null, canFreezeColumns}}>{children}</FrozenColumnStateContext.Provider>
        </FrozenColumnActionsContext.Provider>
    );
}

function useFrozenColumnState() {
    return useContext(FrozenColumnStateContext);
}

function useFrozenColumnActions() {
    return useContext(FrozenColumnActionsContext);
}

export {MAX_FREEZABLE_COLUMNS, FrozenColumnProvider, useFrozenColumnState, useFrozenColumnActions};
