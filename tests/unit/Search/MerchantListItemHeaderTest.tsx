import {render, screen} from '@testing-library/react-native';
import React from 'react';
import MerchantListItemHeader from '@components/SelectionListWithSections/Search/MerchantListItemHeader';
import type {TransactionMerchantGroupListItemType} from '@components/SelectionListWithSections/types';
import CONST from '@src/CONST';

jest.mock('@components/Checkbox', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, react/function-component-definition -- test mock
    const MockCheckbox = ({onPress, isChecked, disabled, accessibilityLabel}: any) => {
        // eslint-disable-next-line no-restricted-imports, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access -- using RN primitives in test
        const {Pressable, Text} = require('react-native');
        return (
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- test mock
            <Pressable
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- test mock
                onPress={onPress}
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- test mock
                disabled={disabled}
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- test mock
                accessibilityLabel={accessibilityLabel}
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- test mock
                accessibilityState={{checked: isChecked, disabled}}
                testID="checkbox"
            >
                <Text>{isChecked ? 'checked' : 'unchecked'}</Text>
            </Pressable>
        );
    };
    return MockCheckbox;
});

jest.mock('@components/Icon', () => () => null);

jest.mock('@components/TextWithTooltip', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, react/function-component-definition -- test mock
    const MockTextWithTooltip = ({text}: any) => {
        // eslint-disable-next-line no-restricted-imports, @typescript-eslint/no-unsafe-assignment -- test mock
        const {Text} = require('react-native');
        return <Text>{text}</Text>;
    };
    return MockTextWithTooltip;
});

jest.mock('@components/SelectionListWithSections/Search/TextCell', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, react/function-component-definition -- test mock
    const MockTextCell = ({text}: any) => {
        // eslint-disable-next-line no-restricted-imports, @typescript-eslint/no-unsafe-assignment -- test mock
        const {Text} = require('react-native');
        return <Text testID="TextCell">{text}</Text>;
    };
    return MockTextCell;
});

jest.mock('@components/SelectionListWithSections/Search/TotalCell', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, react/function-component-definition -- test mock
    const MockTotalCell = ({total}: any) => {
        // eslint-disable-next-line no-restricted-imports, @typescript-eslint/no-unsafe-assignment -- test mock
        const {Text} = require('react-native');
        return <Text testID="TotalCell">{`$${(total / 100).toFixed(2)}`}</Text>;
    };
    return MockTotalCell;
});

jest.mock('@components/SelectionListWithSections/Search/ExpandCollapseArrowButton', () => () => null);

jest.mock('@hooks/useLocalize', () => () => ({
    translate: (key: string) => key,
}));

jest.mock('@hooks/useResponsiveLayout', () => ({
    // eslint-disable-next-line @typescript-eslint/naming-convention -- CJS interop
    __esModule: true,
    default: jest.fn(() => ({
        isLargeScreenWidth: false,
        isSmallScreenWidth: false,
        isMediumScreenWidth: false,
        shouldUseNarrowLayout: false,
    })),
}));

jest.mock('@hooks/useTheme', () => () => ({
    icon: '#000000',
}));

jest.mock('@hooks/useThemeStyles', () => () => ({}));

jest.mock('@hooks/useStyleUtils', () => () => ({
    getReportTableColumnStyles: () => ({}),
    getIconWidthAndHeightStyle: () => ({width: 36, height: 36}),
    getWidthAndHeightStyle: () => ({}),
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
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access -- test props check
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
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access -- test props check
        expect(checkbox.props.accessibilityState?.checked).toBe(true);
    });

    it('should render expense count in large screen columns', () => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access -- test mock
        const mockUseResponsiveLayout = jest.requireMock('@hooks/useResponsiveLayout').default;
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access -- test mock
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
        expect(screen.getByText('5')).toBeTruthy();
    });
});
