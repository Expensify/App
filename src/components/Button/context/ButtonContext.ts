import CONST from '@src/CONST';

import {createContext, useContext} from 'react';

import type {ButtonActionsContextValue, ButtonStateContextValue} from './types';

/** Fallback used when a Button primitive is rendered outside a `<Button>` wrapper — keeps consumers safe from `undefined` reads. */
const defaultButtonStateContextValue: ButtonStateContextValue = {
    isHovered: false,
    variant: undefined,
    size: CONST.BUTTON_SIZE.MEDIUM,
    isDisabled: false,
    isLoading: false,
};

const defaultButtonActionsContextValue: ButtonActionsContextValue = {
    onPress: () => {},
};

// State (data) and actions (functions) live in separate contexts so neither provider mixes the two (rulesdir/context-provider-split-values).
const ButtonStateContext = createContext<ButtonStateContextValue>(defaultButtonStateContextValue);
const ButtonActionsContext = createContext<ButtonActionsContextValue>(defaultButtonActionsContextValue);

function useButtonState(): ButtonStateContextValue {
    return useContext(ButtonStateContext);
}

function useButtonActions(): ButtonActionsContextValue {
    return useContext(ButtonActionsContext);
}

export {ButtonStateContext, ButtonActionsContext, useButtonState, useButtonActions};
