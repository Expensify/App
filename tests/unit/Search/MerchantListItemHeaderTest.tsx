/* eslint-disable @typescript-eslint/naming-convention, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call */
import {render, screen} from '@testing-library/react-native';
import React from 'react';
import MerchantListItemHeader from '@components/SelectionListWithSections/Search/MerchantListItemHeader';
import type {TransactionMerchantGroupListItemType} from '@components/SelectionListWithSections/types';
import CONST from '@src/CONST';

// Mock all necessary components to avoid rendering issues
jest.mock('@components/Checkbox', () => {
    function MockCheckbox({onPress, isChecked, disabled, accessibilityLabel}: any) {
        const RN = jest.requireActual('react-native');
        const Pressable = RN.Pressable;
        const Text = RN.Text;
        return (
            <Pressable
                onPress={onPress}
                disabled={disabled}
                accessibilityLabel={accessibilityLabel}
                accessibilityState={{checked: isChecked, disabled}}
                testID="checkbox"
            >
                <Text>{isChecked ? 'checked' : 'unchecked'}</Text>
            </Pressable>
        );
    }
    MockCheckbox.displayName = 'MockCheckbox';
    return {
        __esModule: true,
        default: MockCheckbox,
    };
});

jest.mock('@components/Icon', () => {
    function MockIcon() {
        return null;
    }
    MockIcon.displayName = 'MockIcon';
    return {
        __esModule: true,
        default: MockIcon,
    };
});

jest.mock('@components/TextWithTooltip', () => {
    function MockTextWithTooltip({text}: any) {
        const RN = jest.requireActual('react-native');
        const Text = RN.Text;
        return <Text>{text}</Text>;
    }
    MockTextWithTooltip.displayName = 'MockTextWithTooltip';
    return {
        __esModule: true,
        default: MockTextWithTooltip,
    };
});

jest.mock('@components/SelectionListWithSections/Search/TextCell', () => {
    function MockTextCell({text}: any) {
        const RN = jest.requireActual('react-native');
        const Text = RN.Text;
        return <Text testID="TextCell">{text}</Text>;
    }
    MockTextCell.displayName = 'MockTextCell';
    return {
        __esModule: true,
        default: MockTextCell,
    };
});

jest.mock('@components/SelectionListWithSections/Search/TotalCell', () => {
    function MockTotalCell({total}: any) {
        const RN = jest.requireActual('react-native');
        const Text = RN.Text;
        const formatted = `$${(total / 100).toFixed(2)}`;
        return <Text testID="TotalCell">{formatted}</Text>;
    }
    MockTotalCell.displayName = 'MockTotalCell';
    return {
        __esModule: true,
        default: MockTotalCell,
    };
});

jest.mock('@components/SelectionListWithSections/Search/ExpandCollapseArrowButton', () => {
    function MockExpandCollapseArrowButton() {
        return null;
    }
    MockExpandCollapseArrowButton.displayName = 'MockExpandCollapseArrowButton';
    return {
        __esModule: true,
        default: MockExpandCollapseArrowButton,
    };
});

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
        render(
            <MerchantListItemHeader
                merchant={mockMerchant}
                canSelectMultiple={false}
            />,
        );

        expect(screen.getByText('Test Merchant')).toBeTruthy();
    });

    it('should render checkbox when canSelectMultiple is true', () => {
        render(
            <MerchantListItemHeader
                merchant={mockMerchant}
                canSelectMultiple
            />,
        );

        expect(screen.getByLabelText('common.select')).toBeTruthy();
    });

    it('should not render checkbox when canSelectMultiple is false', () => {
        render(
            <MerchantListItemHeader
                merchant={mockMerchant}
                canSelectMultiple={false}
            />,
        );

        expect(screen.queryByLabelText('common.select')).toBeNull();
    });

    it('should use formattedMerchant when available', () => {
        const merchantWithFormatted: TransactionMerchantGroupListItemType = {
            ...mockMerchant,
            merchant: 'Raw Merchant',
            formattedMerchant: 'Formatted Merchant',
        };

        render(
            <MerchantListItemHeader
                merchant={merchantWithFormatted}
                canSelectMultiple={false}
            />,
        );

        expect(screen.getByText('Formatted Merchant')).toBeTruthy();
    });

    it('should handle disabled state', () => {
        render(
            <MerchantListItemHeader
                merchant={mockMerchant}
                canSelectMultiple
                isDisabled
            />,
        );

        const checkbox = screen.getByLabelText('common.select');
        expect(checkbox.props.accessibilityState?.disabled).toBe(true);
    });

    it('should handle checked state', () => {
        render(
            <MerchantListItemHeader
                merchant={mockMerchant}
                canSelectMultiple
                isSelectAllChecked
            />,
        );

        const checkbox = screen.getByLabelText('common.select');
        expect(checkbox.props.accessibilityState?.checked).toBe(true);
    });

    it('should render expense count in large screen columns', () => {
        const mockUseResponsiveLayout = jest.requireMock('@hooks/useResponsiveLayout').default;
        mockUseResponsiveLayout.mockReturnValueOnce({
            isLargeScreenWidth: true,
            isSmallScreenWidth: false,
            isMediumScreenWidth: false,
            shouldUseNarrowLayout: false,
        });

        const columns = [CONST.SEARCH.TABLE_COLUMNS.GROUP_EXPENSES];

        render(
            <MerchantListItemHeader
                merchant={mockMerchant}
                canSelectMultiple={false}
                columns={columns}
            />,
        );

        // The count is rendered as text
        expect(screen.getByText('5')).toBeTruthy();
    });
});
