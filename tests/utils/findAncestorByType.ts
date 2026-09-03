import type {screen} from '@testing-library/react-native';

import type {ElementType} from 'react';

type TestInstance = ReturnType<typeof screen.getByTestId>;

/**
 * Walks up from a rendered node to the closest ancestor whose component type is one of the given ones, so a test
 * can read the wrapper a navigator actually picked for a screen instead of asserting on a hand-built tree.
 */
function findAncestorByType(node: TestInstance, types: readonly ElementType[]): TestInstance | undefined {
    let current: TestInstance | null = node;
    while (current) {
        if (types.includes(current.type)) {
            return current;
        }
        current = current.parent;
    }
    return undefined;
}

export default findAncestorByType;
