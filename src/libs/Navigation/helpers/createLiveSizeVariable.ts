/** A pane size that a drag paints straight onto the DOM, ahead of React, as a CSS variable that styles fall back from. Web only. */
import type {DimensionValue} from 'react-native';

type LiveSizeVariable = {
    /** On the document root, so modals portaled over a pane follow the drag along with the pane. */
    write: (size: number) => void;

    clear: () => void;

    /** A CSS reference to the live size mid-drag and to the committed `size` otherwise, for composing into a larger CSS expression. */
    getReference: (size: number) => string;

    /** The live size mid-drag, the committed `size` otherwise, plus `offset`. */
    getStyleValue: (size: number, offset?: number) => DimensionValue;
};

/** Hands a CSS expression to a style. */
function toDimensionValue(cssValue: string): DimensionValue {
    // DimensionValue has no member for CSS functions, which react-native-web still renders as written.
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
    return cssValue as DimensionValue;
}

function createLiveSizeVariable(name: `--${string}`): LiveSizeVariable {
    const getReference = (size: number) => `var(${name}, ${size}px)`;

    return {
        write: (size) => document.documentElement.style.setProperty(name, `${size}px`),
        clear: () => document.documentElement.style.removeProperty(name),
        getReference,
        getStyleValue: (size, offset = 0) => toDimensionValue(offset === 0 ? getReference(size) : `calc(${getReference(size)} + ${offset}px)`),
    };
}

export default createLiveSizeVariable;
export {toDimensionValue};
export type {LiveSizeVariable};
