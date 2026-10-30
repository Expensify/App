import type {screen} from '@testing-library/react-native';

type TestInstance = ReturnType<typeof screen.getByTestId>;

/** Value a style prop ends up with for one property, read from the last style that sets it, the way React Native applies them. */
function getStyleProperty(style: unknown, property: string): unknown {
    if (Array.isArray(style)) {
        return style.reduce<unknown>((value, nestedStyle) => getStyleProperty(nestedStyle, property) ?? value, undefined);
    }
    if (typeof style !== 'object' || style === null) {
        return undefined;
    }
    return Reflect.get(style, property);
}

/**
 * Walks up from a rendered node to the closest host element above it whose style sets the given property to the given value,
 * so a layout test can find the column or container that actually wraps an element instead of asserting on a hand-built tree.
 */
function findAncestorWithStyle(node: TestInstance, property: string, value: unknown): TestInstance | undefined {
    let current: TestInstance | null = node.parent;
    while (current) {
        if (typeof current.type === 'string' && getStyleProperty(current.props.style, property) === value) {
            return current;
        }
        current = current.parent;
    }
    return undefined;
}

export default findAncestorWithStyle;
