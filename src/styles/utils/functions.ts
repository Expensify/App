/**
 * Converts a color in hexadecimal notation into RGB notation.
 *
 * @param hexadecimal A color in hexadecimal notation.
 * @returns `undefined` if the input color is not in hexadecimal notation. Otherwise, the RGB components of the input color.
 */
function hexadecimalToRGBArray(hexadecimal: string): number[] | undefined {
    const components = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hexadecimal);

    if (components === null) {
        return undefined;
    }

    return components.slice(1).map((component) => parseInt(component, 16));
}

// eslint-disable-next-line import/prefer-default-export
export {hexadecimalToRGBArray};
