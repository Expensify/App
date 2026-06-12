import type {ValueOf} from 'type-fest';
import type {ButtonVariant} from '@styles/utils/types';
import type CONST from '@src/CONST';

type ButtonContextValue = {
    size: ValueOf<typeof CONST.BUTTON_SIZE>;
    variant: ButtonVariant | undefined;
    isHovered: boolean;
    iconFill?: string;
    iconHoverFill?: string;
};

export type {ButtonContextValue, ButtonVariant};
