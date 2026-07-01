import {createContext, useContext} from 'react';
import CONST from '@src/CONST';
import type {ButtonContextValue} from './types';

/** Fallback used when a Button primitive is rendered outside a `<Button>` wrapper — keeps consumers safe from `undefined` reads. */
const defaultButtonContextValue: ButtonContextValue = {
    isHovered: false,
    variant: undefined,
    size: CONST.BUTTON_SIZE.MEDIUM,
};

const ButtonContext = createContext<ButtonContextValue>(defaultButtonContextValue);

function useButtonContext(): ButtonContextValue {
    return useContext(ButtonContext);
}

export default ButtonContext;
export {useButtonContext};
