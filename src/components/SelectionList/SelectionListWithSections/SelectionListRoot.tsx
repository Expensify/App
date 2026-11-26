/** Keeps search and viewport coordination scoped to one list without storing either's state. */
import type {BaseTextInputRef} from '@components/TextInput/BaseTextInput/types';

import useThemeStyles from '@hooks/useThemeStyles';

import type ChildrenProps from '@src/types/utils/ChildrenProps';

import type {RefObject} from 'react';
import type {TextInputKeyPressEvent} from 'react-native';

import React, {createContext, useContext, useRef} from 'react';
import {View} from 'react-native';

type SelectionListViewportHandle = {
    hasItems: () => boolean;
    submitFocusedRow: () => void;
    handleSearchKeyPress: (event: TextInputKeyPressEvent) => void;
};

type SelectionListInteractionRefs = {
    rootRef: RefObject<View | null>;
    inputRef: RefObject<BaseTextInputRef | null>;
    isTextInputFocusedRef: RefObject<boolean>;
    viewportRef: RefObject<SelectionListViewportHandle | null>;
};

const SelectionListContext = createContext<SelectionListInteractionRefs | null>(null);

// Only the composed Viewport wires the legacy list renderer to the sibling input.
const SelectionListViewportContext = createContext<SelectionListInteractionRefs | null>(null);

function SelectionListRoot({children}: ChildrenProps) {
    const styles = useThemeStyles();
    const rootRef = useRef<View>(null);
    const inputRef = useRef<BaseTextInputRef>(null);
    const isTextInputFocusedRef = useRef(false);
    const viewportRef = useRef<SelectionListViewportHandle>(null);

    return (
        <SelectionListContext.Provider value={{rootRef, inputRef, isTextInputFocusedRef, viewportRef}}>
            <View
                ref={rootRef}
                style={styles.flex1}
            >
                {children}
            </View>
        </SelectionListContext.Provider>
    );
}

function useSelectionListInteractionRefs() {
    const interactionRefs = useContext(SelectionListContext);
    if (!interactionRefs) {
        throw new Error('Selection list parts must be rendered inside SelectionListWithSections.Root');
    }
    return interactionRefs;
}

export default SelectionListRoot;
export {SelectionListViewportContext, useSelectionListInteractionRefs};
