import {render} from '@testing-library/react-native';

import CONST from '@src/CONST';

import {NavigationRouteContext} from '@react-navigation/native';
import React from 'react';

jest.mock('@libs/NavigationFocusReturn', () => ({
    __esModule: true,
    registerPressable: () => () => {},
    notifyPressedTrigger: jest.fn(),
}));

jest.mock('@libs/Accessibility', () => ({
    __esModule: true,
    default: {
        useScreenReaderStatus: () => false,
        useScreenReaderState: () => 'disabled',
        useAutoHitSlop: () => [undefined, jest.fn()],
    },
}));

jest.mock('@hooks/useRouteKey', () => ({__esModule: true, default: () => undefined}));
jest.mock('@hooks/useThemeStyles', () => () => ({
    userSelectNone: {userSelect: 'none'},
    cursorPointer: {},
    cursorDefault: {},
    cursorDisabled: {},
    cursorText: {},
    noSelect: {},
}));
jest.mock('@hooks/useStyleUtils', () => () => ({parseStyleFromFunction: (style: unknown) => style}));
jest.mock('@hooks/useKeyboardShortcut', () => ({__esModule: true, default: () => {}}));
jest.mock('@libs/HapticFeedback', () => ({__esModule: true, default: {press: jest.fn(), longPress: jest.fn()}}));
jest.mock('@hooks/useSingleExecution', () => ({
    __esModule: true,
    default: () => ({isExecuting: false, singleExecution: (fn: (...args: unknown[]) => unknown) => fn}),
}));

const GenericPressable = require<{default: React.ComponentType<Record<string, unknown>>}>('../../src/components/Pressable/GenericPressable/implementation/BaseGenericPressable').default;

function renderInsideRoute(node: React.ReactElement) {
    return render(<NavigationRouteContext.Provider value={{key: 'route-A', name: 'A', params: undefined}}>{node}</NavigationRouteContext.Provider>);
}

describe('BaseGenericPressable — shouldAllowTextSelection', () => {
    it('applies selection suppression when accessibilityRole is button', () => {
        const {toJSON} = renderInsideRoute(
            <GenericPressable
                accessibilityLabel="Row"
                role={CONST.ROLE.BUTTON}
                testID="row-pressable"
            />,
        );

        const serialized = JSON.stringify(toJSON());
        expect(serialized).toContain(CONST.SELECTION_SCRAPER_HIDDEN_ELEMENT);
    });

    it('skips selection suppression when shouldAllowTextSelection is true', () => {
        const {toJSON} = renderInsideRoute(
            <GenericPressable
                accessibilityLabel="Row"
                role={CONST.ROLE.BUTTON}
                shouldAllowTextSelection
                testID="row-pressable"
            />,
        );

        const serialized = JSON.stringify(toJSON());
        expect(serialized).not.toContain(CONST.SELECTION_SCRAPER_HIDDEN_ELEMENT);
    });
});
