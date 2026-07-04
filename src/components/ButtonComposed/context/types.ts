import type {ButtonVariant} from '@styles/utils/types';

import type CONST from '@src/CONST';

import type {ValueOf} from 'type-fest';

/** Values published by the parent `Button` for its child primitives (Text/Icon/...) to consume via `useButtonContext`. */
type ButtonContextValue = {
    /** Button size — primitives use it to pick matching paddings/icon dimensions/font sizes. */
    size: ValueOf<typeof CONST.BUTTON_SIZE>;

    /** Visual variant of the Button (e.g. success/danger). `undefined` means the default theme. */
    variant: ButtonVariant | undefined;

    /** True while the cursor is over the Button — primitives swap to hover-state colors/styles when set. */
    isHovered: boolean;
};

export type {ButtonContextValue, ButtonVariant};
