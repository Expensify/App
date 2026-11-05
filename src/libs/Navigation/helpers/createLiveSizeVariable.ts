/** A pane size that a drag paints straight onto the DOM, ahead of React, as a CSS variable that styles fall back from. Web only. */
import type {DimensionValue} from 'react-native';

type LiveSizeVariable = {
    /** On the document root, so modals portaled over a pane follow the drag along with the pane. */
    write: (size: number) => void;

    clear: () => void;

    /** The live size mid-drag, the committed `size` otherwise, plus `offset`. */
    getStyleValue: (size: number, offset?: number) => DimensionValue;
};

function createLiveSizeVariable(name: `--${string}`): LiveSizeVariable {
    return {
        write: (size) => document.documentElement.style.setProperty(name, `${size}px`),
        clear: () => document.documentElement.style.removeProperty(name),
        getStyleValue: (size, offset = 0) => {
            const value = offset === 0 ? `var(${name}, ${size}px)` : `calc(var(${name}, ${size}px) + ${offset}px)`;

            // DimensionValue has no member for CSS functions, which react-native-web still renders as written.
            // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
            return value as DimensionValue;
        },
    };
}

export default createLiveSizeVariable;
export type {LiveSizeVariable};
