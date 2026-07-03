import {render} from '@testing-library/react-native';

import FloatingHost from '@components/Overlay/FloatingHost';
import Text from '@components/Text';

import CONST from '@src/CONST';

import React from 'react';
import {View} from 'react-native';

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

const mockPresenceExiting = {current: false};

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
            present || mockPresenceExiting.current ? children : null,
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
    mockPresenceExiting.current = false;
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

describe('FloatingHost — exit placement retention', () => {
    it('holds the last committed placement while exiting (isOpen→false, anchorRect cleared) so the surface fades from where it was', () => {
        mockPositionState.current = {
            style: {top: 100, left: 100},
            available: {height: 500, width: 300},
            isPositioned: true,
            onContentLayout: jest.fn(),
        };
        mockPresenceExiting.current = true;

        const {root, rerender} = render(
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

        expect(flattenStyle(findLayoutView(root).props.style).opacity).toBe(1);

        mockPositionState.current = {
            style: {top: 0, left: 0},
            available: {height: 0, width: 0},
            isPositioned: false,
            onContentLayout: jest.fn(),
        };
        rerender(
            <FloatingHost
                isOpen={false}
                anchor={null}
                anchorRect={null}
                alignment={{horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.LEFT, vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.TOP}}
                onDismiss={jest.fn()}
                stackId="test-host"
            >
                <Text>menu</Text>
            </FloatingHost>,
        );

        const exitStyle = flattenStyle(findLayoutView(root).props.style);
        expect(exitStyle.opacity).toBe(1);
        expect(exitStyle.top).toBe(100);
        expect(exitStyle.left).toBe(100);
        expect(exitStyle.maxHeight).toBe(500);
        expect(exitStyle.maxWidth).toBe(300);
    });

    it('does not retain a stale placement on reopen — a fresh open re-runs the measure-gate (opacity 0 until positioned)', () => {
        mockPositionState.current = {
            style: {top: 100, left: 100},
            available: {height: 500, width: 300},
            isPositioned: true,
            onContentLayout: jest.fn(),
        };

        const {root, rerender} = render(
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

        mockPositionState.current = {
            style: {top: 0, left: 0},
            available: {height: 0, width: 0},
            isPositioned: false,
            onContentLayout: jest.fn(),
        };
        rerender(
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
        expect(style.opacity).toBe(0);
        expect(style.maxHeight).toBeUndefined();
        expect(style.maxWidth).toBeUndefined();
    });
});
