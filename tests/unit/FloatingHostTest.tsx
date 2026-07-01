import {render} from '@testing-library/react-native';
import React from 'react';
import {View} from 'react-native';
import FloatingHost from '@components/Overlay/FloatingHost';
import Text from '@components/Text';
import CONST from '@src/CONST';

type PositionState = {
    style: Record<string, number>;
    available: {height: number; width: number};
    isPositioned: boolean;
    onContentLayout: jest.Mock;
};

const mockPositionState: {current: PositionState} = {
    current: {
        style: {top: 100, left: 100},
        available: {height: 500, width: 300},
        isPositioned: false,
        onContentLayout: jest.fn(),
    },
};

jest.mock('@components/Overlay/hooks/useAnchoredPosition', () => () => mockPositionState.current);
jest.mock('@components/Overlay/hooks/useOverlayEntry', () => () => {});

jest.mock('@components/Overlay/AnimatedSurface', () => {
    const Mock = ({children}: {children: React.ReactNode}) => children;
    return {
        __esModule: true,
        default: Mock,
        FADE_ONLY_ENTER_SPEC: {},
        FADE_ONLY_EXIT_SPEC: {},
    };
});
jest.mock('@components/Overlay/DismissableLayer', () => {
    const Mock = ({children}: {children: React.ReactNode}) => children;
    Mock.Floating = ({children}: {children: React.ReactNode}) => children;
    Mock.Modal = ({children}: {children: React.ReactNode}) => children;
    return {__esModule: true, default: Mock};
});
jest.mock(
    '@components/Overlay/Portal',
    () =>
        ({children}: {children: React.ReactNode}) =>
            children,
);
jest.mock(
    '@components/Overlay/Presence',
    () =>
        ({children, present}: {children: React.ReactNode; present: boolean}) =>
            present ? children : null,
);
jest.mock(
    '@components/FocusTrap/FocusTrapForModal',
    () =>
        ({children}: {children: React.ReactNode}) =>
            children,
);

type TestInstance = ReturnType<typeof render>['root'];

function findLayoutView(root: TestInstance): TestInstance {
    const matches = root.findAll((node) => node.type === View && typeof node.props.onLayout === 'function');
    const match = matches.at(0);
    if (!match) {
        throw new Error('FloatingHost did not render a View with onLayout');
    }
    return match;
}

function flattenStyle(style: unknown): Record<string, unknown> {
    const parts: unknown[] = Array.isArray(style) ? style : [style];
    const objects = parts.filter((part): part is Record<string, unknown> => part !== null && typeof part === 'object');
    return objects.reduce<Record<string, unknown>>((acc, part) => {
        Object.assign(acc, part);
        return acc;
    }, {});
}

beforeEach(() => {
    mockPositionState.current = {
        style: {top: 100, left: 100},
        available: {height: 500, width: 300},
        isPositioned: false,
        onContentLayout: jest.fn(),
    };
});

describe('FloatingHost — maxHeight/maxWidth gating', () => {
    it('does NOT apply maxHeight/maxWidth while isPositioned is false (lets the first onLayout measure natural size)', () => {
        const {root} = render(
            <FloatingHost
                isOpen
                anchor={null}
                anchorRect={{top: 0, bottom: 40, left: 0, right: 100, width: 100, height: 40}}
                alignment={{horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.LEFT, vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.TOP}}
                onDismiss={jest.fn()}
                stackId="test-host"
            >
                <Text>menu</Text>
            </FloatingHost>,
        );

        const style = flattenStyle(findLayoutView(root).props.style);
        expect(style.maxHeight).toBeUndefined();
        expect(style.maxWidth).toBeUndefined();
        expect(style.opacity).toBe(0);
    });

    it('applies available.height/width as maxHeight/maxWidth once isPositioned becomes true', () => {
        mockPositionState.current = {
            ...mockPositionState.current,
            isPositioned: true,
            available: {height: 420, width: 300},
        };

        const {root} = render(
            <FloatingHost
                isOpen
                anchor={null}
                anchorRect={{top: 0, bottom: 40, left: 0, right: 100, width: 100, height: 40}}
                alignment={{horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.LEFT, vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.TOP}}
                onDismiss={jest.fn()}
                stackId="test-host"
            >
                <Text>menu</Text>
            </FloatingHost>,
        );

        const style = flattenStyle(findLayoutView(root).props.style);
        expect(style.maxHeight).toBe(420);
        expect(style.maxWidth).toBe(300);
        expect(style.opacity).toBe(1);
    });
});
