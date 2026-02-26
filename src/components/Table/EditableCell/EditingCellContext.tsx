import React, {createContext, useContext, useState} from 'react';
import type {Dispatch, ReactNode, SetStateAction} from 'react';

type EditingCellContextType = {
    isEditingCell: boolean;
    setEditingCellCount: Dispatch<SetStateAction<number>>;
};

const EditingCellContext = createContext<EditingCellContextType | undefined>(undefined);

function useEditingCellContext(): EditingCellContextType {
    const context = useContext(EditingCellContext);

    if (!context) {
        throw new Error('useEditingCellContext must be used within an EditingCellProvider');
    }

    return context;
}

/**
 * Provides a global flag for whether any inline editable cell is open.
 * Useful for cases like preventing row selection when tapping in the gaps between editable fields.
 */
function EditingCellProvider({children}: {children: ReactNode}) {
    const [editingCellCount, setEditingCellCount] = useState(0);

    return <EditingCellContext.Provider value={{isEditingCell: editingCellCount > 0, setEditingCellCount}}>{children}</EditingCellContext.Provider>;
}

export {useEditingCellContext, EditingCellProvider};
export default EditingCellContext;
