import {act, render} from '@testing-library/react-native';

import TextInputFilterContent, {TextInputFilterContentFillHeight} from '@components/Search/FilterComponents/AdvancedFilters/TextInputFilterContent';

import variables from '@styles/variables';

import CONST from '@src/CONST';

import React from 'react';
import {View} from 'react-native';

type ButtonMockProps = {
    children?: React.ReactNode;
};

type NegatableFilterMockProps = {
    children?: React.ReactNode;
    isNegated?: boolean;
    style?: unknown;
    onNegationChange?: (nextIsNegated: boolean) => void;
};

type TextInputMockProps = {
    accessibilityLabel?: string;
    autoGrowHeight?: boolean;
    errorText?: string;
    hasError?: boolean;
    maxAutoGrowHeight?: number;
    onChangeText?: (nextValue: string) => void;
    onSubmitEditing?: () => void;
    submitBehavior?: string;
    textInputContainerStyles?: unknown;
};

const mockButton = jest.fn<void, [ButtonMockProps]>();
const mockKeyboardShortcut = jest.fn();
const mockNegatableFilter = jest.fn<void, [NegatableFilterMockProps]>();
const mockTextInput = jest.fn<void, [TextInputMockProps]>();
const MockView = View;
let mockValidationError = '';

jest.mock('@components/AutoGrowHeightInputContainer', () => ({
    __esModule: true,
    default: ({children}: {children: (height: number) => React.ReactNode}) => {
        const MockReact = jest.requireActual<typeof React>('react');
        return MockReact.createElement(MockView, {testID: 'auto-grow-container'}, children(420));
    },
}));
jest.mock('@components/ButtonComposed', () => {
    function MockButton(props: ButtonMockProps) {
        mockButton(props);
        return props.children;
    }

    MockButton.KeyboardShortcut = () => {
        mockKeyboardShortcut();
        return null;
    };
    MockButton.Text = ({children}: {children: React.ReactNode}) => children;

    return {
        __esModule: true,
        default: MockButton,
    };
});
jest.mock('@components/Search/FilterComponents/NegatableFilter', () => {
    const MockReact = jest.requireActual<typeof React>('react');
    return {
        __esModule: true,
        default: (props: NegatableFilterMockProps) => {
            mockNegatableFilter(props);
            return MockReact.createElement(MockReact.Fragment, null, props.children);
        },
    };
});
jest.mock('@components/Search/hooks/useTextFilterValidation', () => () => mockValidationError);
jest.mock('@components/TextInput', () => ({
    __esModule: true,
    default: (props: TextInputMockProps) => {
        mockTextInput(props);
        return null;
    },
}));
jest.mock('@hooks/useAutoFocusInput', () => () => ({
    inputCallbackRef: jest.fn(),
}));
jest.mock('@hooks/useLocalize', () => () => ({
    translate: (key: string) => key,
}));
jest.mock('@hooks/useThemeStyles', () => () => ({
    flex1: {flex: 1},
    justifyContentBetween: {},
    ph5: {},
    pt3: {paddingTop: 12},
    pb5: {},
}));

describe('TextInputFilterContent', () => {
    beforeEach(() => {
        mockButton.mockClear();
        mockKeyboardShortcut.mockClear();
        mockNegatableFilter.mockClear();
        mockTextInput.mockClear();
        mockValidationError = '';
    });

    it('passes the measured height to a populated Search RHP text input', () => {
        render(
            <TextInputFilterContentFillHeight
                baseFilterKey={CONST.SEARCH.SYNTAX_FILTER_KEYS.KEYWORD}
                value="long value"
                isNegated={false}
                onChange={jest.fn()}
            />,
        );

        expect(mockTextInput.mock.calls.at(-1)?.[0]).toEqual(
            expect.objectContaining({
                autoGrowHeight: true,
                maxAutoGrowHeight: 420,
                textInputContainerStyles: [{paddingTop: 12}],
            }),
        );
    });

    it('uses a compact fallback without replacing the auto-growing input while it is empty', () => {
        render(
            <TextInputFilterContentFillHeight
                baseFilterKey={CONST.SEARCH.SYNTAX_FILTER_KEYS.KEYWORD}
                value={undefined}
                isNegated={false}
                onChange={jest.fn()}
            />,
        );

        expect(mockTextInput.mock.calls.at(-1)?.[0]).toEqual(
            expect.objectContaining({
                autoGrowHeight: true,
                maxAutoGrowHeight: variables.componentSizeLarge,
                textInputContainerStyles: [{paddingTop: 12}],
            }),
        );
    });

    it('preserves negation controls in the fill-height Search RHP layout', () => {
        render(
            <TextInputFilterContentFillHeight
                baseFilterKey={CONST.SEARCH.SYNTAX_FILTER_KEYS.MERCHANT}
                value="Coffee"
                isNegated
                onChange={jest.fn()}
            />,
        );

        expect(mockNegatableFilter.mock.calls.at(-1)?.[0]).toEqual(expect.objectContaining({isNegated: true, style: {flex: 1}}));
        expect(mockTextInput.mock.calls.at(-1)?.[0]).toEqual(expect.objectContaining({autoGrowHeight: true, maxAutoGrowHeight: 420}));
    });

    it('preserves Enter-to-confirm for the multiline Search RHP input', () => {
        const onChange = jest.fn<void, [string | undefined, boolean]>();
        render(
            <TextInputFilterContentFillHeight
                baseFilterKey={CONST.SEARCH.SYNTAX_FILTER_KEYS.MERCHANT}
                value="Coffee"
                isNegated
                onChange={onChange}
            />,
        );

        const textInputProps = mockTextInput.mock.calls.at(-1)?.[0];
        expect(textInputProps?.submitBehavior).toBe('submit');
        expect(typeof textInputProps?.onSubmitEditing).toBe('function');
        expect(mockKeyboardShortcut).not.toHaveBeenCalled();

        act(() => {
            mockTextInput.mock.calls.at(-1)?.[0].onChangeText?.('Tea');
            mockNegatableFilter.mock.calls.at(-1)?.[0].onNegationChange?.(false);
        });
        mockTextInput.mock.calls.at(-1)?.[0].onSubmitEditing?.();
        expect(onChange).toHaveBeenCalledTimes(1);
        expect(onChange).toHaveBeenCalledWith('Tea', false);
    });

    it('preserves built-in validation semantics in the fill-height path', () => {
        mockValidationError = 'Invalid search term';

        const onChange = jest.fn<void, [string | undefined, boolean]>();

        render(
            <TextInputFilterContentFillHeight
                baseFilterKey={CONST.SEARCH.SYNTAX_FILTER_KEYS.KEYWORD}
                value="near-cap value"
                isNegated={false}
                onChange={onChange}
            />,
        );

        expect(mockTextInput.mock.calls.at(-1)?.[0]).toEqual(
            expect.objectContaining({
                errorText: 'Invalid search term',
                hasError: true,
                accessibilityLabel: 'search.filters.keyword',
                maxAutoGrowHeight: 420,
            }),
        );
        mockTextInput.mock.calls.at(-1)?.[0].onSubmitEditing?.();
        expect(onChange).not.toHaveBeenCalled();
    });

    it('keeps the compact popup path single-line', () => {
        mockValidationError = 'Invalid search term';

        render(
            <TextInputFilterContent
                baseFilterKey={CONST.SEARCH.SYNTAX_FILTER_KEYS.KEYWORD}
                value="compact"
                isNegated={false}
                onChange={jest.fn()}
            />,
        );

        expect(mockTextInput.mock.calls.at(-1)?.[0]).toEqual(
            expect.objectContaining({
                autoGrowHeight: undefined,
                errorText: 'Invalid search term',
                maxAutoGrowHeight: undefined,
                submitBehavior: undefined,
                onSubmitEditing: undefined,
            }),
        );
        expect(mockKeyboardShortcut).toHaveBeenCalledTimes(1);
    });
});
