import React, {useCallback, useContext, useState} from 'react';
import type {ReactNode} from 'react';

/**
 * Context for managing inline editable cell state across the component tree.
 * Tracks whether a cell is currently being edited and which cell has keyboard focus.
 */

type EditingCellStateContextType = {
    isEditingCell: boolean;
    wasRecentlyEditingCell: boolean;
    focusedCellId: string | null;
};

type EditingCellActionsContextType = {
    setIsEditingCell: (value: boolean) => void;
    setFocusedCellId: (cellId: string | null) => void;
};

const defaultEditingCellActionsContextValue: EditingCellActionsContextType = {
    setIsEditingCell: () => {},
    setFocusedCellId: () => {},
};

const EditingCellStateContext = React.createContext<EditingCellStateContextType>({
    isEditingCell: false,
    wasRecentlyEditingCell: false,
    focusedCellId: null,
});

const EditingCellActionsContext = React.createContext<EditingCellActionsContextType>(defaultEditingCellActionsContextValue);

type EditingCellProviderProps = {
    children: ReactNode;
};

function EditingCellProvider({children}: EditingCellProviderProps) {
    const [isEditingCell, setIsEditingCellState] = useState(false);
    const [wasRecentlyEditingCell, setWasRecentlyEditingCell] = useState(false);
    const [focusedCellId, setFocusedCellId] = useState<string | null>(null);

    const setIsEditingCell = useCallback((value: boolean) => {
        setIsEditingCellState(value);

        if (!value) {
            setWasRecentlyEditingCell(true);

            // Clear the flag after one frame (after focus effects have run)
            requestAnimationFrame(() => {
                setWasRecentlyEditingCell(false);
            });
        }
    }, []);

    const stateValue = {
        isEditingCell,
        wasRecentlyEditingCell,
        focusedCellId,
    };

    const actionsValue = {
        setIsEditingCell,
        setFocusedCellId,
    };

    return (
        <EditingCellActionsContext.Provider value={actionsValue}>
            <EditingCellStateContext.Provider value={stateValue}>{children}</EditingCellStateContext.Provider>
        </EditingCellActionsContext.Provider>
    );
}

function useEditingCellState(): EditingCellStateContextType {
    return useContext(EditingCellStateContext);
}

function useEditingCellActions(): EditingCellActionsContextType {
    return useContext(EditingCellActionsContext);
}

export default EditingCellProvider;
export {EditingCellActionsContext, EditingCellStateContext, useEditingCellActions, useEditingCellState};
export type {EditingCellActionsContextType, EditingCellStateContextType};
