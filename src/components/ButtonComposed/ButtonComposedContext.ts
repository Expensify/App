import {createContext, useContext} from 'react';
import type {ValueOf} from 'type-fest';
import CONST from '@src/CONST';

type ButtonComposedVariant = 'success' | 'danger' | 'link';

type ButtonComposedAppearanceProps = {
    size?: ValueOf<typeof CONST.DROPDOWN_BUTTON_SIZE>;
    variant?: ButtonComposedVariant;
};

type ButtonComposedContextValue = ButtonComposedAppearanceProps & {
    isHovered: boolean;
    isLoading: boolean;
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
export type {ButtonComposedAppearanceProps, ButtonComposedContextValue, ButtonComposedVariant};
