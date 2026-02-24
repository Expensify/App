import {createContext, useContext} from 'react';

type ButtonComposedContextValue = {
    isHovered: boolean;
    isLoading: boolean;
    success: boolean;
    danger: boolean;
    extraSmall: boolean;
    small: boolean;
    medium: boolean;
    large: boolean;
    link: boolean;
    iconFill?: string;
    iconHoverFill?: string;
};

const defaultButtonComposedContextValue: ButtonComposedContextValue = {
    isHovered: false,
    isLoading: false,
    success: false,
    danger: false,
    extraSmall: false,
    small: false,
    medium: true,
    large: false,
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
