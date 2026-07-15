import CONST from '@src/CONST';

import {createContext, useContext} from 'react';

import type {ButtonContextValue} from './types';

/** Fallback used when a Button primitive is rendered outside a `<Button>` wrapper — keeps consumers safe from `undefined` reads. */
const defaultButtonContextValue: ButtonContextValue = {
    isHovered: false,
    variant: undefined,
    size: CONST.BUTTON_SIZE.MEDIUM,
    onPress: () => {},
    isDisabled: false,
    isLoading: false,
};

const ButtonContext = createContext<ButtonContextValue>(defaultButtonContextValue);

function useButtonContext(): ButtonContextValue {
    return useContext(ButtonContext);
}

export default ButtonContext;
export {useButtonContext};
