/* eslint-disable @typescript-eslint/naming-convention, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, no-restricted-imports, react/no-unused-prop-types */
import {fireEvent, render, screen} from '@testing-library/react-native';
import React from 'react';
import type {ReactNode} from 'react';
import type * as ReactNativeModule from 'react-native';
import DateFilterBase from '@components/Search/FilterComponents/DateFilterBase';
import DateSelectPopup from '@components/Search/FilterDropdowns/DateSelectPopup';
import type {SearchDateValues} from '@libs/SearchQueryUtils';
import CONST from '@src/CONST';

const createEmptyDateValues = (): SearchDateValues => ({
    [CONST.SEARCH.DATE_MODIFIERS.ON]: undefined,
    [CONST.SEARCH.DATE_MODIFIERS.AFTER]: undefined,
    [CONST.SEARCH.DATE_MODIFIERS.BEFORE]: undefined,
    [CONST.SEARCH.DATE_MODIFIERS.RANGE]: undefined,
});

const mockStyles = new Proxy(
    {},
    {
        get: () => ({}),
    },
);
const mockReactNative = require('react-native') as typeof ReactNativeModule;

let mockCurrentDateValues: SearchDateValues = createEmptyDateValues();
let mockLatestDatePresetFilterBaseProps: {
    selectedDateModifier?: string | null;
    onDateValuesChange?: (values: SearchDateValues) => void;
} | null = null;

const mockGetDateValues = jest.fn<SearchDateValues, []>();
const mockGetRangeDisplayText = jest.fn<string, []>();
const mockClearDateValues = jest.fn();
const mockSetDateValueOfSelectedDateModifier = jest.fn();
const mockClearDateValueOfSelectedDateModifier = jest.fn();
const mockRestoreRangeToEntrySnapshot = jest.fn();
const mockResetDateValuesToDefault = jest.fn();
const mockValidate = jest.fn<boolean, []>();

jest.mock('@hooks/useLocalize', () => ({
    __esModule: true,
    default: () => ({
        translate: (key: string) => key,
    }),
}));

jest.mock('@hooks/useThemeStyles', () => ({
    __esModule: true,
    default: () => mockStyles,
}));

jest.mock('@hooks/useTheme', () => ({
    __esModule: true,
    default: () => ({
        icon: '#000000',
    }),
}));

jest.mock('@hooks/useResponsiveLayout', () => ({
    __esModule: true,
    default: () => ({
        isSmallScreenWidth: false,
    }),
}));

jest.mock('@hooks/useWindowDimensions', () => ({
    __esModule: true,
    default: () => ({
        windowHeight: 800,
    }),
}));

jest.mock('@hooks/useLazyAsset', () => ({
    __esModule: true,
    useMemoizedLazyExpensifyIcons: () => ({
        BackArrow: 'BackArrow',
    }),
}));

jest.mock('@components/Button', () => ({
    __esModule: true,
    default: ({text, onPress, sentryLabel}: {text: string; onPress?: () => void; sentryLabel?: string}) => (
        <mockReactNative.Pressable
            accessibilityRole="button"
            onPress={onPress}
            testID={sentryLabel}
        >
            <mockReactNative.Text>{text}</mockReactNative.Text>
        </mockReactNative.Pressable>
    ),
}));

jest.mock('@components/FormAlertWithSubmitButton', () => ({
    __esModule: true,
    default: ({buttonText, onSubmit}: {buttonText: string; onSubmit?: () => void}) => (
        <mockReactNative.Pressable
            accessibilityRole="button"
            onPress={onSubmit}
        >
            <mockReactNative.Text>{buttonText}</mockReactNative.Text>
        </mockReactNative.Pressable>
    ),
}));

jest.mock('@components/HeaderWithBackButton', () => ({
    __esModule: true,
    default: ({title, subtitle, onBackButtonPress}: {title?: string; subtitle?: string; onBackButtonPress?: () => void}) => (
        <mockReactNative.View>
            {!!title && <mockReactNative.Text>{title}</mockReactNative.Text>}
            {!!subtitle && <mockReactNative.Text>{subtitle}</mockReactNative.Text>}
            <mockReactNative.Pressable
                accessibilityRole="button"
                onPress={onBackButtonPress}
            >
                <mockReactNative.Text>back</mockReactNative.Text>
            </mockReactNative.Pressable>
        </mockReactNative.View>
    ),
}));

jest.mock('@components/ScrollView', () => ({
    __esModule: true,
    default: ({children}: {children?: ReactNode}) => <mockReactNative.View>{children}</mockReactNative.View>,
}));

jest.mock('@components/Icon', () => ({
    __esModule: true,
    default: () => null,
}));

jest.mock('@components/Pressable/PressableWithoutFeedback', () => ({
    __esModule: true,
    default: ({children, onPress}: {children?: ReactNode; onPress?: () => void}) => (
        <mockReactNative.Pressable
            accessibilityRole="button"
            onPress={onPress}
        >
            <mockReactNative.Text>{children}</mockReactNative.Text>
        </mockReactNative.Pressable>
    ),
}));

jest.mock('@components/Text', () => ({
    __esModule: true,
    default: ({children, testID}: {children?: ReactNode; testID?: string}) => <mockReactNative.Text testID={testID}>{children}</mockReactNative.Text>,
}));

jest.mock('@libs/SearchQueryUtils', () => ({
    __esModule: true,
    getDateModifierTitle: (dateModifier: string | null, title: string) => dateModifier ?? title,
    getDateRangeDisplayValueFromFormValue: (range?: string) => range ?? '',
    getEmptyDateValues: () => ({
        on: undefined,
        after: undefined,
        before: undefined,
        range: undefined,
    }),
}));

jest.mock('@components/Search/FilterComponents/DatePresetFilterBase', () => {
    const ReactModule = require('react') as typeof React;
    const {Pressable: NativePressable, Text: NativeText, View: NativeView} = require('react-native') as typeof ReactNativeModule;
    const CONSTModule = require('@src/CONST').default as {
        SEARCH: {
            DATE_MODIFIERS: {
                RANGE: string;
            };
        };
    };

    function MockDatePresetFilterBase({
        ref,
        selectedDateModifier,
        onSelectDateModifier,
        onDateValuesChange,
    }: {
        ref?: React.Ref<unknown>;
        selectedDateModifier: string | null;
        onSelectDateModifier: (dateModifier: string | null) => void;
        onDateValuesChange?: (values: SearchDateValues) => void;
    }) {
        ReactModule.useEffect(() => {
            mockLatestDatePresetFilterBaseProps = {
                selectedDateModifier,
                onDateValuesChange,
            };
        }, [onDateValuesChange, selectedDateModifier]);

        ReactModule.useImperativeHandle(ref, () => ({
            getDateValues: mockGetDateValues,
            getRangeDisplayText: mockGetRangeDisplayText,
            clearDateValues: mockClearDateValues,
            setDateValueOfSelectedDateModifier: mockSetDateValueOfSelectedDateModifier,
            clearDateValueOfSelectedDateModifier: mockClearDateValueOfSelectedDateModifier,
            restoreRangeToEntrySnapshot: mockRestoreRangeToEntrySnapshot,
            resetDateValuesToDefault: mockResetDateValuesToDefault,
            validate: mockValidate,
        }));

        return (
            <NativeView>
                <NativeText testID="selected-date-modifier">{selectedDateModifier ?? 'none'}</NativeText>
                <NativePressable
                    testID="select-range"
                    onPress={() => onSelectDateModifier(CONSTModule.SEARCH.DATE_MODIFIERS.RANGE)}
                >
                    <NativeText>Select range</NativeText>
                </NativePressable>
            </NativeView>
        );
    }

    return {
        __esModule: true,
        default: MockDatePresetFilterBase,
    };
});

describe('Date filter reset flows', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockCurrentDateValues = {
            ...createEmptyDateValues(),
            [CONST.SEARCH.DATE_MODIFIERS.RANGE]: '2024-01-01:2024-01-31',
        };
        mockLatestDatePresetFilterBaseProps = null;

        mockGetDateValues.mockImplementation(() => mockCurrentDateValues);
        mockGetRangeDisplayText.mockImplementation(() => mockCurrentDateValues[CONST.SEARCH.DATE_MODIFIERS.RANGE] ?? '');
        mockValidate.mockImplementation(() => !!mockCurrentDateValues[CONST.SEARCH.DATE_MODIFIERS.RANGE]);
        mockClearDateValues.mockImplementation(() => {
            mockCurrentDateValues = createEmptyDateValues();
            mockLatestDatePresetFilterBaseProps?.onDateValuesChange?.(mockCurrentDateValues);
        });
        mockClearDateValueOfSelectedDateModifier.mockImplementation(() => {
            const selectedDateModifier = mockLatestDatePresetFilterBaseProps?.selectedDateModifier;

            if (!selectedDateModifier) {
                return;
            }

            mockCurrentDateValues = {
                ...mockCurrentDateValues,
                [selectedDateModifier]: undefined,
            };
            mockLatestDatePresetFilterBaseProps?.onDateValuesChange?.(mockCurrentDateValues);
        });
    });

    it('lets DateFilterBase save a cleared range after reset exits modifier mode', () => {
        const onSubmit = jest.fn();
        const onDateModifierChange = jest.fn();

        render(
            <DateFilterBase
                defaultDateValues={mockCurrentDateValues}
                presets={[]}
                onSubmit={onSubmit}
                onDateModifierChange={onDateModifierChange}
            />,
        );

        fireEvent.press(screen.getByTestId('select-range'));

        expect(screen.getByTestId('selected-date-modifier').props.children).toBe(CONST.SEARCH.DATE_MODIFIERS.RANGE);

        fireEvent.press(screen.getByText('common.reset'));

        expect(mockClearDateValueOfSelectedDateModifier).toHaveBeenCalledTimes(1);
        expect(screen.getByTestId('selected-date-modifier').props.children).toBe('none');
        expect(onDateModifierChange).toHaveBeenLastCalledWith(false);

        fireEvent.press(screen.getByText('common.save'));

        expect(onSubmit).toHaveBeenCalledWith({
            ...createEmptyDateValues(),
        });
    });

    it('propagates a cleared range and closes the popup when reset from DateSelectPopup modifier view', () => {
        const onChange = jest.fn();
        const closeOverlay = jest.fn();

        render(
            <DateSelectPopup
                label="Date"
                value={mockCurrentDateValues}
                onChange={onChange}
                closeOverlay={closeOverlay}
            />,
        );

        fireEvent.press(screen.getByTestId('select-range'));

        expect(screen.getByTestId('selected-date-modifier').props.children).toBe(CONST.SEARCH.DATE_MODIFIERS.RANGE);

        fireEvent.press(screen.getByText('common.reset'));

        expect(mockClearDateValueOfSelectedDateModifier).toHaveBeenCalledTimes(1);
        expect(screen.getByTestId('selected-date-modifier').props.children).toBe('none');
        expect(onChange).toHaveBeenCalledWith({
            ...createEmptyDateValues(),
        });
        expect(closeOverlay).toHaveBeenCalledTimes(1);
    });
});
