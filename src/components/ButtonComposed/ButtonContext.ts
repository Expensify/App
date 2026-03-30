import {createContext, useContext} from 'react';
import type {ValueOf} from 'type-fest';
import CONST from '@src/CONST';

type ButtonVariant = 'success' | 'danger' | 'link';

type ButtonAppearanceProps = {
    size?: ValueOf<typeof CONST.DROPDOWN_BUTTON_SIZE>;
    variant?: ButtonVariant;
};

type ButtonContextValue = ButtonAppearanceProps & {
    isHovered: boolean;
    isLoading: boolean;
    iconFill?: string;
    iconHoverFill?: string;
    hasIconLeft: boolean;
};

const defaultButtonContextValue: ButtonContextValue = {
    isHovered: false,
    isLoading: false,
    variant: undefined,
    size: CONST.DROPDOWN_BUTTON_SIZE.MEDIUM,
    iconFill: undefined,
    iconHoverFill: undefined,
    hasIconLeft: false,
};

const ButtonContext = createContext<ButtonContextValue>(defaultButtonContextValue);

function useButtonContext(): ButtonContextValue {
    return useContext(ButtonContext);
}

export default ButtonContext;
export {useButtonContext};
export type {ButtonAppearanceProps, ButtonContextValue, ButtonVariant};
