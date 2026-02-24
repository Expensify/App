import {createContext, useContext} from 'react';
import type {ValueOf} from 'type-fest';
import CONST from '@src/CONST';

type ButtonComposedContextValue = {
    isHovered: boolean;
    isLoading: boolean;
    success: boolean;
    danger: boolean;
    size: ValueOf<typeof CONST.DROPDOWN_BUTTON_SIZE>;
    link: boolean;
    iconFill?: string;
    iconHoverFill?: string;
};

const defaultButtonComposedContextValue: ButtonComposedContextValue = {
    isHovered: false,
    isLoading: false,
    success: false,
    danger: false,
    size: CONST.DROPDOWN_BUTTON_SIZE.MEDIUM,
    link: false,
    iconFill: undefined,
    iconHoverFill: undefined,
};

const ButtonComposedContext = createContext<ButtonComposedContextValue>(defaultButtonComposedContextValue);

function useButtonComposedContext(): ButtonComposedContextValue {
    return useContext(ButtonComposedContext);
}

export default ButtonComposedContext;
export {useButtonComposedContext};
export type {ButtonComposedContextValue};
