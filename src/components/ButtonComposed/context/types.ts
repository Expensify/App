import type {ValueOf} from 'type-fest';
import type CONST from '@src/CONST';

type ButtonVariant = 'success' | 'danger' | 'link';

type ButtonContextValue = {
    size?: ValueOf<typeof CONST.DROPDOWN_BUTTON_SIZE>;
    variant?: ButtonVariant;
    isHovered: boolean;
    isLoading: boolean;
    iconFill?: string;
    iconHoverFill?: string;
};

export type {ButtonContextValue, ButtonVariant};
