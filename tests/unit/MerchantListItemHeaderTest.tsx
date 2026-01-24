import React from 'react';
import {render} from '@testing-library/react-native';
import MerchantListItemHeader from '@components/SelectionListWithSections/Search/MerchantListItemHeader';
import type {TransactionMerchantGroupListItemType} from '@components/SelectionListWithSections/types';
import CONST from '@src/CONST';

// Mock all necessary components to avoid rendering issues
jest.mock('@components/Checkbox', () => ({
    __esModule: true,
    default: ({onPress, isChecked, isIndeterminate, disabled, accessibilityLabel}: any) => {
        const React = require('react');
        const {Pressable, Text} = require('react-native');
        return React.createElement(Pressable, {
            onPress,
            disabled,
            accessibilityLabel,
            accessibilityState: {checked: isChecked, disabled},
            testID: 'checkbox',
        }, React.createElement(Text, {}, isChecked ? 'checked' : 'unchecked'));
    },
}));

jest.mock('@components/Icon', () => ({
    __esModule: true,
    default: () => null,
}));

jest.mock('@components/TextWithTooltip', () => ({
    __esModule: true,
    default: ({text}: any) => {
        const React = require('react');
        const {Text} = require('react-native');
        return React.createElement(Text, {}, text);
    },
}));

jest.mock('@components/SelectionListWithSections/Search/TextCell', () => ({
    __esModule: true,
    default: ({text}: any) => {
        const React = require('react');
        const {Text} = require('react-native');
        return React.createElement(Text, {testID: 'TextCell'}, text);
    },
}));

jest.mock('@components/SelectionListWithSections/Search/TotalCell', () => ({
    __esModule: true,
    default: ({total, currency}: any) => {
        const React = require('react');
        const {Text} = require('react-native');
        const formatted = `$${(total / 100).toFixed(2)}`;
        return React.createElement(Text, {testID: 'TotalCell'}, formatted);
    },
}));

jest.mock('@components/SelectionListWithSections/Search/ExpandCollapseArrowButton', () => ({
    __esModule: true,
    default: () => null,
}));

// Mock necessary dependencies
jest.mock('@hooks/useLocalize', () => ({
    __esModule: true,
    default: () => ({
        translate: jest.fn((key: string) => key),
    }),
}));

jest.mock('@hooks/useResponsiveLayout', () => ({
    __esModule: true,
    default: jest.fn(() => ({
        isLargeScreenWidth: false,
        isSmallScreenWidth: false,
        isMediumScreenWidth: false,
        shouldUseNarrowLayout: false,
    })),
}));

jest.mock('@hooks/useTheme', () => ({
    __esModule: true,
    default: () => ({
        icon: '#000000',
    }),
}));

jest.mock('@hooks/useThemeStyles', () => ({
    __esModule: true,
    default: () => ({}),
}));

jest.mock('@hooks/useStyleUtils', () => ({
    __esModule: true,
    default: () => ({
        getReportTableColumnStyles: jest.fn(() => ({})),
        getIconWidthAndHeightStyle: jest.fn(() => ({width: 36, height: 36})),
        getWidthAndHeightStyle: jest.fn(() => ({})),
    }),
}));

describe('MerchantListItemHeader', () => {
    const mockMerchant: TransactionMerchantGroupListItemType = {
        merchant: 'Test Merchant',
        formattedMerchant: 'Test Merchant',
        total: 10000,
        currency: 'USD',
        count: 5,
        keyForList: 'test-merchant',
        transactions: [],
        groupedBy: 'merchant',
    };

    it('should render merchant name', () => {
        const {getByText} = render(
            <MerchantListItemHeader
                merchant={mockMerchant}
                canSelectMultiple={false}
            />,
        );

        expect(getByText('Test Merchant')).toBeTruthy();
    });

    it('should render checkbox when canSelectMultiple is true', () => {
        const {getByLabelText} = render(
            <MerchantListItemHeader
                merchant={mockMerchant}
                canSelectMultiple
            />,
        );

        expect(getByLabelText('common.select')).toBeTruthy();
    });

    it('should not render checkbox when canSelectMultiple is false', () => {
        const {queryByLabelText} = render(
            <MerchantListItemHeader
                merchant={mockMerchant}
                canSelectMultiple={false}
            />,
        );

        expect(queryByLabelText('common.select')).toBeNull();
    });

    it('should use formattedMerchant when available', () => {
        const merchantWithFormatted: TransactionMerchantGroupListItemType = {
            ...mockMerchant,
            merchant: 'Raw Merchant',
            formattedMerchant: 'Formatted Merchant',
        };

        const {getByText} = render(
            <MerchantListItemHeader
                merchant={merchantWithFormatted}
                canSelectMultiple={false}
            />,
        );

        expect(getByText('Formatted Merchant')).toBeTruthy();
    });

    it('should handle disabled state', () => {
        const {getByLabelText} = render(
            <MerchantListItemHeader
                merchant={mockMerchant}
                canSelectMultiple
                isDisabled
            />,
        );

        const checkbox = getByLabelText('common.select');
        expect(checkbox.props.accessibilityState?.disabled).toBe(true);
    });

    it('should handle checked state', () => {
        const {getByLabelText} = render(
            <MerchantListItemHeader
                merchant={mockMerchant}
                canSelectMultiple
                isSelectAllChecked
            />,
        );

        const checkbox = getByLabelText('common.select');
        expect(checkbox.props.accessibilityState?.checked).toBe(true);
    });

    it('should render expense count in large screen columns', () => {
        // Update the mock for this specific test
        const mockUseResponsiveLayout = require('@hooks/useResponsiveLayout').default;
        mockUseResponsiveLayout.mockReturnValueOnce({
            isLargeScreenWidth: true,
            isSmallScreenWidth: false,
            isMediumScreenWidth: false,
            shouldUseNarrowLayout: false,
        });

        const columns = [CONST.SEARCH.TABLE_COLUMNS.GROUP_EXPENSES];

        const {getByText} = render(
            <MerchantListItemHeader
                merchant={mockMerchant}
                canSelectMultiple={false}
                columns={columns}
            />,
        );

        // The count is rendered as text
        expect(getByText('5')).toBeTruthy();
    });
});
