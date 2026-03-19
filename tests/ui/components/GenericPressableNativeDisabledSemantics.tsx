import React from 'react';
import type {ReactNode} from 'react';
import renderer from 'react-test-renderer';
import GenericPressable from '@components/Pressable/GenericPressable/implementation/BaseGenericPressable';
import CONST from '@src/CONST';

type MockPressableProps = {
    children?: ReactNode | ((state: {pressed: boolean}) => ReactNode);
} & Record<string, unknown>;
type MockPressableRenderState = {pressed: boolean};
type MockPressableChildrenFn = (mockPressableState: MockPressableRenderState) => ReactNode;

const mockReactNativePressable = jest.fn<void, [Record<string, unknown>]>();

jest.mock('react-native/Libraries/Components/Pressable/Pressable', () => {
    const ReactImport = jest.requireActual<{forwardRef: typeof React.forwardRef}>('react');
    const ReactNative = jest.requireActual<{View: React.ComponentType<{children?: ReactNode; ref?: unknown; testID?: string}>}>('react-native');
    const {View} = ReactNative;

    const MockPressable = ReactImport.forwardRef<unknown, MockPressableProps>(({children, ...props}, ref) => {
        mockReactNativePressable(props);
        const mockPressableState = {pressed: false};
        const content = (typeof children === 'function' ? (children as MockPressableChildrenFn)(mockPressableState) : children) as ReactNode;

        return (
            <View
                ref={ref}
                testID="mock-react-native-pressable"
            >
                {content}
            </View>
        );
    });

    return {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        __esModule: true,
        default: MockPressable,
    };
});

jest.mock('@hooks/useSingleExecution', () => () => ({
    isExecuting: false,
    singleExecution: (callback: (...args: unknown[]) => unknown) => callback,
}));

jest.mock('@hooks/useStyleUtils', () => () => ({
    parseStyleFromFunction: (style: unknown, state: unknown) => {
        if (typeof style === 'function') {
            return (style as (mockPressableState: unknown) => unknown)(state);
        }

        return style;
    },
}));

jest.mock('@hooks/useThemeStyles', () => () => ({
    noSelect: {},
    userSelectNone: {},
}));

jest.mock('@libs/Accessibility', () => ({
    // eslint-disable-next-line @typescript-eslint/naming-convention
    __esModule: true,
    default: {
        useScreenReaderStatus: () => false,
        useAutoHitSlop: () => [undefined, jest.fn()] as const,
        moveAccessibilityFocus: jest.fn(),
    },
}));

jest.mock('@libs/HapticFeedback', () => ({
    // eslint-disable-next-line @typescript-eslint/naming-convention
    __esModule: true,
    default: {
        press: jest.fn(),
        longPress: jest.fn(),
    },
}));

jest.mock('@libs/KeyboardShortcut', () => ({
    // eslint-disable-next-line @typescript-eslint/naming-convention
    __esModule: true,
    default: {
        subscribe: jest.fn(() => jest.fn()),
    },
}));

function renderGenericPressable(props: Partial<React.ComponentProps<typeof GenericPressable>>) {
    renderer.act(() => {
        renderer.create(
            <GenericPressable
                accessibilityLabel="Next"
                accessibilityRole={CONST.ROLE.BUTTON}
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...(props as React.ComponentProps<typeof GenericPressable>)}
            >
                Next
            </GenericPressable>,
        );
    });
}

function getLastReactNativePressableProps() {
    const lastCall = mockReactNativePressable.mock.calls.at(-1);

    if (!lastCall) {
        return {};
    }

    return lastCall[0];
}

describe('GenericPressable native disabled semantics', () => {
    beforeEach(() => {
        mockReactNativePressable.mockClear();
    });

    it('keeps native Pressable disabled undefined for soft-disabled controls', () => {
        renderGenericPressable({disabled: true});

        expect(getLastReactNativePressableProps()).toEqual(
            expect.objectContaining({
                disabled: undefined,
                accessibilityState: expect.objectContaining({
                    disabled: true,
                }),
            }),
        );
    });

    it('passes native Pressable disabled when fullDisabled is requested', () => {
        renderGenericPressable({disabled: true, fullDisabled: true});

        expect(getLastReactNativePressableProps()).toEqual(
            expect.objectContaining({
                disabled: true,
                accessibilityState: expect.objectContaining({
                    disabled: true,
                }),
            }),
        );
    });

    it('does not allow caller accessibilityState.disabled to mask a computed disabled state', () => {
        renderGenericPressable({disabled: true, accessibilityState: {disabled: false, selected: true}});

        expect(getLastReactNativePressableProps()).toEqual(
            expect.objectContaining({
                accessibilityState: expect.objectContaining({
                    disabled: true,
                    selected: true,
                }),
            }),
        );
    });
});
