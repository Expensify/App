import {createContext, useContext} from 'react';
import CONST from '@src/CONST';
import type {ButtonContextValue} from './types';

const defaultButtonContextValue: ButtonContextValue = {
    isHovered: false,
    isLoading: false,
    variant: undefined,
    size: CONST.DROPDOWN_BUTTON_SIZE.MEDIUM,
    iconFill: undefined,
    iconHoverFill: undefined,
};

const ButtonContext = createContext<ButtonContextValue>(defaultButtonContextValue);

function useButtonContext(): ButtonContextValue {
    return useContext(ButtonContext);
}

export default ButtonContext;
export {useButtonContext};
