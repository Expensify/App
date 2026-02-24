import {createContext, useContext} from 'react';
import type {ValueOf} from 'type-fest';
import CONST from '@src/CONST';

type ButtonComposedVariant = 'success' | 'danger' | 'link';

type ButtonComposedContextValue = {
    isHovered: boolean;
    isLoading: boolean;
    variant?: ButtonComposedVariant;
    size: ValueOf<typeof CONST.DROPDOWN_BUTTON_SIZE>;
    iconFill?: string;
    iconHoverFill?: string;
};

const defaultButtonComposedContextValue: ButtonComposedContextValue = {
    isHovered: false,
    isLoading: false,
    variant: undefined,
    size: CONST.DROPDOWN_BUTTON_SIZE.MEDIUM,
    iconFill: undefined,
    iconHoverFill: undefined,
};

const ButtonComposedContext = createContext<ButtonComposedContextValue>(defaultButtonComposedContextValue);

function useButtonComposedContext(): ButtonComposedContextValue {
    return useContext(ButtonComposedContext);
}

export default ButtonComposedContext;
export {useButtonComposedContext};
export type {ButtonComposedContextValue, ButtonComposedVariant};
