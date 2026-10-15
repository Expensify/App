import {act, fireEvent, render, screen, within} from '@testing-library/react-native';

import TextInputFilterContent, {TextInputFilterContentFillHeight} from '@components/Search/FilterComponents/AdvancedFilters/TextInputFilterContent';
import TextInputFilterContentPopupWrapper from '@components/Search/FilterDropdowns/SearchAdvancedFiltersPopup/TextInputFilterContentPopupWrapper';
import TextFilterPopup from '@components/Search/FilterDropdowns/TextFilterPopup';
import type * as TextFilterValidationModule from '@components/Search/hooks/useTextFilterValidation';

import {buildSearchQueryJSON, sanitizeSearchValue} from '@libs/SearchQueryUtils';

import TextInputFilterContentPageWrapper from '@pages/Search/SearchAdvancedFiltersContentPage/TextInputFilterContentPageWrapper';

import variables from '@styles/variables';

import CONST from '@src/CONST';

import React from 'react';
import {View} from 'react-native';

type ButtonMockProps = {
    onPress?: () => void;
    children?: React.ReactNode;
};

type NativeButtonMockComponents = {
    Pressable: React.ComponentType<ButtonMockProps & {testID?: string}>;
    Text: React.ComponentType<{children: React.ReactNode}>;
};

type NegatableFilterMockProps = {
    children?: React.ReactNode;
    isNegated?: boolean;
    style?: unknown;
    onNegationChange?: (nextIsNegated: boolean) => void;
};

type TextInputMockProps = {
    value?: string;
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
let mockShouldFooterBeInsideList = false;

jest.mock('@components/AutoGrowHeightInputContainer', () => ({
    __esModule: true,
    default: ({children}: {children: (height: number) => React.ReactNode}) => {
        const MockReact = jest.requireActual<typeof React>('react');
        return MockReact.createElement(MockView, {testID: 'auto-grow-container'}, children(420));
    },
}));
jest.mock('@components/Button', () => {
    function MockButton(props: ButtonMockProps) {
        const MockReact = jest.requireActual<typeof React>('react');
        const {Pressable: MockPressable} = jest.requireActual<NativeButtonMockComponents>('react-native');
        mockButton(props);
        return MockReact.createElement(MockPressable, {testID: 'confirm-button', onPress: props.onPress}, props.children);
    }

    MockButton.KeyboardShortcut = () => {
        mockKeyboardShortcut();
        return null;
    };
    MockButton.Text = ({children}: {children: React.ReactNode}) => {
        const MockReact = jest.requireActual<typeof React>('react');
        const {Text: MockText} = jest.requireActual<NativeButtonMockComponents>('react-native');
        return MockReact.createElement(MockText, null, children);
    };

    return {
        __esModule: true,
        default: MockButton,
    };
});
jest.mock('@components/Search/FilterDropdowns/BasePopup', () => ({
    __esModule: true,
    default: ({children}: {children?: React.ReactNode}) => {
        const MockReact = jest.requireActual<typeof React>('react');
        return MockReact.createElement(MockView, null, children);
    },
}));
jest.mock('@components/ScrollView', () => ({
    __esModule: true,
    default: ({children}: {children: React.ReactNode}) => {
        const MockReact = jest.requireActual<typeof React>('react');
        return MockReact.createElement(MockView, {testID: 'search-scroll-view'}, children);
    },
}));
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
jest.mock('@components/Search/hooks/useTextFilterValidation', () => {
    const {default: useActualValidation} = jest.requireActual<typeof TextFilterValidationModule>('@components/Search/hooks/useTextFilterValidation');
    return (filterKey: Parameters<typeof useActualValidation>[0], value: string | undefined) => {
        const error = useActualValidation(filterKey, value);
        return mockValidationError || error;
    };
});
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
jest.mock('@hooks/useShouldFooterBeInsideList', () => () => mockShouldFooterBeInsideList);
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
        mockShouldFooterBeInsideList = false;
    });

    describe.each([
        ['narrow RHP', TextInputFilterContentPageWrapper],
        ['wide popup', TextInputFilterContentPopupWrapper],
    ] as const)('%s growing filter behavior', (_name, Wrapper) => {
        it.each([CONST.SEARCH.SYNTAX_FILTER_KEYS.DESCRIPTION, CONST.SEARCH.SYNTAX_FILTER_KEYS.TITLE])('preserves %s validation and normalized Enter submission', (baseFilterKey) => {
            // Given a growing filter with an existing value and negation.
            const onChange = jest.fn<void, [string | undefined, boolean]>();
            render(
                <Wrapper
                    baseFilterKey={baseFilterKey}
                    value="Prose"
                    isNegated
                    onChange={onChange}
                />,
            );
            // When multiline text is pasted and confirmed with Enter.
            act(() => mockTextInput.mock.calls.at(-1)?.[0].onChangeText?.('Long\nprose'));
            mockTextInput.mock.calls.at(-1)?.[0].onSubmitEditing?.();
            // Then wrapping does not split the saved query value or lose negation.
            expect(onChange).toHaveBeenCalledWith('Long prose', true);
            expect(mockTextInput.mock.calls.at(-1)?.[0].autoGrowHeight).toBe(true);

            // When an over-limit value is entered, existing validation still blocks submission.
            onChange.mockClear();
            const maxLength = baseFilterKey === CONST.SEARCH.SYNTAX_FILTER_KEYS.TITLE ? CONST.TASK_TITLE_CHARACTER_LIMIT : CONST.DESCRIPTION_LIMIT;
            act(() => mockTextInput.mock.calls.at(-1)?.[0].onChangeText?.('x'.repeat(maxLength + 1)));
            mockTextInput.mock.calls.at(-1)?.[0].onSubmitEditing?.();
            // Then the error remains visible and no value is accepted.
            expect(mockTextInput.mock.calls.at(-1)?.[0].hasError).toBe(true);
            expect(onChange).not.toHaveBeenCalled();
        });
    });

    it.each([CONST.SEARCH.SYNTAX_FILTER_KEYS.DESCRIPTION, CONST.SEARCH.SYNTAX_FILTER_KEYS.TITLE])('keeps the growing %s chip editor normalized and validated', (baseFilterKey) => {
        // Given an applied negated prose filter opened through its chip.
        const updateFilterForm = jest.fn();
        const closeOverlay = jest.fn();
        render(
            <TextFilterPopup
                baseFilterKey={baseFilterKey}
                values={{[`${baseFilterKey}Not`]: 'Prose'}}
                label="Prose"
                updateFilterForm={updateFilterForm}
                closeOverlay={closeOverlay}
            />,
        );
        // When multiline input is confirmed with Enter.
        act(() => mockTextInput.mock.calls.at(-1)?.[0].onChangeText?.('Long\r\nprose'));
        mockTextInput.mock.calls.at(-1)?.[0].onSubmitEditing?.();
        // Then one normalized, negated filter is applied and the popup closes once.
        expect(mockTextInput.mock.calls.at(-1)?.[0].autoGrowHeight).toBe(true);
        expect(mockTextInput.mock.calls.at(-1)?.[0].maxAutoGrowHeight).toBe(variables.textInputAutoGrowMaxHeight);
        expect(updateFilterForm).toHaveBeenCalledWith({[baseFilterKey]: undefined, [`${baseFilterKey}Not`]: 'Long prose'});
        expect(updateFilterForm).toHaveBeenCalledTimes(1);
        expect(closeOverlay).toHaveBeenCalledTimes(1);

        // When the same editor contains an over-limit value.
        updateFilterForm.mockClear();
        closeOverlay.mockClear();
        const maxLength = baseFilterKey === CONST.SEARCH.SYNTAX_FILTER_KEYS.TITLE ? CONST.TASK_TITLE_CHARACTER_LIMIT : CONST.DESCRIPTION_LIMIT;
        act(() => mockTextInput.mock.calls.at(-1)?.[0].onChangeText?.('x'.repeat(maxLength + 1)));
        mockTextInput.mock.calls.at(-1)?.[0].onSubmitEditing?.();
        // Then validation keeps the popup open without applying anything.
        expect(mockTextInput.mock.calls.at(-1)?.[0].hasError).toBe(true);
        expect(updateFilterForm).not.toHaveBeenCalled();
        expect(closeOverlay).not.toHaveBeenCalled();
    });

    it.each([CONST.SEARCH.SYNTAX_FILTER_KEYS.KEYWORD, CONST.SEARCH.SYNTAX_FILTER_KEYS.REPORT_ID])('keeps the %s chip input compact', (baseFilterKey) => {
        // Given a non-prose filter opened through its chip.
        // When the editor renders its existing applied value.
        render(
            <TextFilterPopup
                baseFilterKey={baseFilterKey}
                values={{[baseFilterKey]: '123'}}
                label="Filter"
                updateFilterForm={jest.fn()}
                closeOverlay={jest.fn()}
            />,
        );
        // Then it remains single-line and leaves keyboard submission with its existing action button.
        expect(mockTextInput.mock.calls.at(-1)?.[0].autoGrowHeight).toBe(false);
        expect(mockTextInput.mock.calls.at(-1)?.[0].onSubmitEditing).toBeUndefined();
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

    describe.each([
        ['RHP', TextInputFilterContentFillHeight],
        ['popup', TextInputFilterContent],
    ] as const)('%s submission', (_name, FilterContent) => {
        it('keeps the custom action and entered value when the landscape keyboard moves the footer', () => {
            // Given a filter with a custom action initially outside the scroll view.
            const onChange = jest.fn<void, [string | undefined, boolean]>();
            const filter = () => (
                <FilterContent
                    baseFilterKey={CONST.SEARCH.SYNTAX_FILTER_KEYS.MERCHANT}
                    value=""
                    isNegated
                    buttonText="Save filter"
                    onChange={onChange}
                />
            );
            const {rerender} = render(filter());
            expect(screen.getByText('Save filter')).toBeTruthy();
            expect(within(screen.getByTestId('search-scroll-view')).queryByTestId('confirm-button')).toBeNull();

            // When entered text is followed by a landscape keyboard transition.
            act(() => mockTextInput.mock.calls.at(-1)?.[0].onChangeText?.('Acme\nOffice'));
            mockShouldFooterBeInsideList = true;
            rerender(filter());
            // Then the action scrolls with the filter and submits its preserved, normalized value.
            expect(within(screen.getByTestId('search-scroll-view')).getByText('Save filter')).toBeTruthy();
            expect(mockTextInput.mock.calls.at(-1)?.[0].value).toBe('Acme\nOffice');
            fireEvent.press(screen.getByTestId('confirm-button'));
            expect(onChange).toHaveBeenCalledWith('Acme Office', true);

            mockShouldFooterBeInsideList = false;
            rerender(filter());
            expect(within(screen.getByTestId('search-scroll-view')).queryByTestId('confirm-button')).toBeNull();
            expect(mockTextInput.mock.calls.at(-1)?.[0].value).toBe('Acme\nOffice');
        });

        it.each(['\n', '\r\n', '\r', '\u2028'])('keeps a pasted %j line break inside one merchant filter', (lineBreak) => {
            const onChange = jest.fn<void, [string | undefined, boolean]>();
            const inputValue = `Acme${lineBreak}Office`;
            render(
                <FilterContent
                    baseFilterKey={CONST.SEARCH.SYNTAX_FILTER_KEYS.MERCHANT}
                    value=""
                    isNegated
                    onChange={onChange}
                />,
            );

            act(() => mockTextInput.mock.calls.at(-1)?.[0].onChangeText?.(inputValue));
            expect(mockTextInput.mock.calls.at(-1)?.[0].value).toBe(inputValue);
            mockButton.mock.calls.at(-1)?.[0].onPress?.();

            expect(onChange).toHaveBeenCalledWith('Acme Office', true);
            const savedValue = onChange.mock.calls.at(-1)?.[0] ?? '';
            const query = `merchant:${sanitizeSearchValue(savedValue)}`;
            expect(buildSearchQueryJSON(query, query)?.rawFilterList).toEqual([expect.objectContaining({key: 'merchant', value: 'Acme Office'})]);
        });

        it.each([undefined, '', 'Coffee'])('preserves %j when no normalization is needed', (value) => {
            const onChange = jest.fn<void, [string | undefined, boolean]>();
            render(
                <FilterContent
                    baseFilterKey={CONST.SEARCH.SYNTAX_FILTER_KEYS.MERCHANT}
                    value={value}
                    isNegated={false}
                    onChange={onChange}
                />,
            );
            mockButton.mock.calls.at(-1)?.[0].onPress?.();
            expect(onChange).toHaveBeenCalledWith(value, false);
        });
    });

    it('validates and submits the normalized value at the merchant byte limit using Enter', () => {
        const onChange = jest.fn<void, [string | undefined, boolean]>();
        const prefix = 'a'.repeat(CONST.MERCHANT_NAME_MAX_BYTES - 2);
        render(
            <TextInputFilterContentFillHeight
                baseFilterKey={CONST.SEARCH.SYNTAX_FILTER_KEYS.MERCHANT}
                value=""
                isNegated={false}
                onChange={onChange}
            />,
        );

        act(() => mockTextInput.mock.calls.at(-1)?.[0].onChangeText?.(`${prefix}\r\nb`));
        expect(mockTextInput.mock.calls.at(-1)?.[0].hasError).toBe(false);
        mockTextInput.mock.calls.at(-1)?.[0].onSubmitEditing?.();
        expect(onChange).toHaveBeenCalledWith(`${prefix} b`, false);

        onChange.mockClear();
        act(() => mockTextInput.mock.calls.at(-1)?.[0].onChangeText?.(`${prefix}\r\nbc`));
        expect(mockTextInput.mock.calls.at(-1)?.[0].hasError).toBe(true);
        mockTextInput.mock.calls.at(-1)?.[0].onSubmitEditing?.();
        expect(onChange).not.toHaveBeenCalled();
    });
});
