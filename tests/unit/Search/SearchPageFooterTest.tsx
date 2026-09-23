import {fireEvent, render, screen, within} from '@testing-library/react-native';

import SearchPageFooter from '@components/Search/SearchPageFooter';
import type {SearchFooterCount, SearchFooterTotal} from '@components/Search/types';

import CONST from '@src/CONST';

import React from 'react';

type CapturedPopupProps = {
    countType?: SearchFooterCount;
    defaultCountType?: SearchFooterCount;
    totalType?: SearchFooterTotal;
    isTotalLoading?: boolean;
    currency?: string;
};

const mockCapturedPopupProps: {current: CapturedPopupProps | undefined} = {current: undefined};
const mockCapturedSkeletonProps: {current: {height?: number} | undefined} = {current: undefined};

type MockFilterPopupButtonProps = {
    PopoverComponent: (props: {closeOverlay: () => void; isExpanded: boolean}) => React.ReactNode;
    renderButton: (props: {onPress: () => void; ref: React.RefObject<null>; isExpanded: boolean}) => React.ReactNode;
};

// Any style/theme key resolves, so the real Text and View render without a theme provider.
jest.mock('@hooks/useThemeStyles', () => ({__esModule: true, default: () => new Proxy({}, {get: () => ({})})}));
jest.mock('@hooks/useStyleUtils', () => ({__esModule: true, default: () => new Proxy({}, {get: () => () => ({})})}));
jest.mock('@hooks/useTheme', () => ({__esModule: true, default: () => new Proxy({}, {get: () => 'transparent'})}));
jest.mock('@hooks/useNetwork', () => ({__esModule: true, default: () => ({isOffline: false})}));
jest.mock('@hooks/useResponsiveLayout', () => ({__esModule: true, default: () => ({shouldUseNarrowLayout: false, isSmallScreenWidth: false})}));
jest.mock('@hooks/useKeyboardShortcut', () => ({__esModule: true, default: () => {}}));
jest.mock('@hooks/useLazyAsset', () => ({useMemoizedLazyExpensifyIcons: () => new Proxy({}, {get: () => undefined})}));
jest.mock('@hooks/useLocalize', () => ({
    __esModule: true,
    default: () => ({translate: (key: string) => key}),
}));
jest.mock('@hooks/useCurrencyList', () => ({
    useCurrencyListActions: () => ({convertToDisplayString: (amount: number | undefined, currency: string | undefined) => `${currency ?? ''}${amount ?? 0}`}),
}));
// The whole footer content is the button, so the tests reach the count and the total through it. Only the icon, which
// has nothing to assert on, renders as nothing.
jest.mock('@components/Button', () => {
    const ReactModule = require<typeof React>('react');
    const {View: MockView, Text: MockText} = require<typeof import('react-native')>('react-native');

    function MockButton({children}: {children?: React.ReactNode}) {
        return ReactModule.createElement(MockView, {testID: 'searchPageFooterTrigger'}, children);
    }
    function MockButtonText({children}: {children?: React.ReactNode}) {
        return ReactModule.createElement(MockText, null, children);
    }
    function MockButtonIcon() {
        return null;
    }
    MockButton.Text = MockButtonText;
    MockButton.Icon = MockButtonIcon;
    return {__esModule: true, default: MockButton};
});
jest.mock('@components/Search/SearchPageFooterSkeleton', () => ({
    __esModule: true,
    default: (props: {height?: number}) => {
        mockCapturedSkeletonProps.current = props;
        return null;
    },
}));
jest.mock('@components/Search/FilterDropdowns/FilterPopupButton', () => {
    // Render both halves so the trigger and the popover's props can both be reached.
    function MockFilterPopupButton({PopoverComponent, renderButton}: MockFilterPopupButtonProps) {
        return (
            <>
                {renderButton({onPress: () => {}, ref: {current: null}, isExpanded: false})}
                {PopoverComponent({closeOverlay: () => {}, isExpanded: false})}
            </>
        );
    }
    return {__esModule: true, default: MockFilterPopupButton};
});
jest.mock('@components/Search/FilterDropdowns/SearchFooterPopup', () => ({
    __esModule: true,
    default: (props: CapturedPopupProps) => {
        mockCapturedPopupProps.current = props;
        return null;
    },
}));

const defaultProps = {
    count: 1204,
    countType: CONST.SEARCH.FOOTER_COUNT.EXPENSES,
    defaultCountType: CONST.SEARCH.FOOTER_COUNT.EXPENSES,
    totalType: CONST.SEARCH.FOOTER_TOTAL.TOTAL,
    onTotalChange: () => {},
    total: -192000,
    currency: CONST.CURRENCY.USD,
    defaultCurrency: CONST.CURRENCY.USD,
    isTotalLoading: false,
    onCurrencyChange: () => {},
    onCountChange: () => {},
};

describe('SearchPageFooter', () => {
    beforeEach(() => {
        mockCapturedPopupProps.current = undefined;
        mockCapturedSkeletonProps.current = undefined;
    });

    it('labels the count with the unit the footer is displaying', () => {
        render(<SearchPageFooter {...defaultProps} />);

        expect(screen.getByText('common.expenses:')).toBeOnTheScreen();
        expect(screen.getByText('1204')).toBeOnTheScreen();
    });

    it('labels the count as reports when the footer is displaying the report count', () => {
        render(
            <SearchPageFooter
                {...defaultProps}
                count={87}
                countType={CONST.SEARCH.FOOTER_COUNT.REPORTS}
                defaultCountType={CONST.SEARCH.FOOTER_COUNT.REPORTS}
            />,
        );

        expect(screen.getByText('common.reports:')).toBeOnTheScreen();
        expect(screen.getByText('87')).toBeOnTheScreen();
    });

    it('falls back to the expenses label when no count selection applies', () => {
        render(
            <SearchPageFooter
                {...defaultProps}
                countType={undefined}
            />,
        );

        expect(screen.getByText('common.expenses:')).toBeOnTheScreen();
        // The popup hides its count row on an undefined selection, so the footer offers currency only.
        expect(mockCapturedPopupProps.current?.countType).toBeUndefined();
    });

    it('labels the total with the aggregate the footer is displaying', () => {
        render(
            <SearchPageFooter
                {...defaultProps}
                totalType={CONST.SEARCH.FOOTER_TOTAL.REIMBURSABLE}
            />,
        );

        expect(screen.getByText('common.reimbursable:')).toBeOnTheScreen();
        expect(screen.queryByText('common.totalSpend:')).not.toBeOnTheScreen();
    });

    it('labels the default total as total spend, including when no total selection applies', () => {
        render(
            <SearchPageFooter
                {...defaultProps}
                totalType={undefined}
            />,
        );

        expect(screen.getByText('common.totalSpend:')).toBeOnTheScreen();
    });

    it('keeps the count and both labels while the total reloads', () => {
        render(
            <SearchPageFooter
                {...defaultProps}
                isTotalLoading
            />,
        );

        // Only the total's value is replaced by the skeleton: the count and the labels hold their place.
        expect(screen.getByText('common.expenses:')).toBeOnTheScreen();
        expect(screen.getByText('1204')).toBeOnTheScreen();
        expect(screen.getByText('common.totalSpend:')).toBeOnTheScreen();
        // The menu stays reachable while the total reloads: it is the total's own row that goes inert, not the trigger.
        expect(mockCapturedPopupProps.current?.isTotalLoading).toBe(true);
    });

    it('makes the whole footer content the trigger, so the count opens the menu too', () => {
        render(<SearchPageFooter {...defaultProps} />);

        const trigger = within(screen.getByTestId('searchPageFooterTrigger'));
        expect(trigger.getByText('common.expenses:')).toBeOnTheScreen();
        expect(trigger.getByText('1204')).toBeOnTheScreen();
        expect(trigger.getByText('common.totalSpend:')).toBeOnTheScreen();
        expect(trigger.getByText('USD-192000')).toBeOnTheScreen();
    });

    it('stands the skeleton in at the height the real total was measured at, so the row does not grow', () => {
        const {rerender} = render(<SearchPageFooter {...defaultProps} />);

        // The layout pass the real total goes through is what reports the height the skeleton has to match.
        fireEvent(screen.getByTestId('searchPageFooterTotal'), 'layout', {nativeEvent: {layout: {width: 87, height: 16, x: 0, y: 0}}});

        rerender(
            <SearchPageFooter
                {...defaultProps}
                isTotalLoading
            />,
        );

        expect(mockCapturedSkeletonProps.current?.height).toBe(16);
    });

    it('hands the display menu the current and default count selections', () => {
        render(
            <SearchPageFooter
                {...defaultProps}
                countType={CONST.SEARCH.FOOTER_COUNT.EXPENSES}
                defaultCountType={CONST.SEARCH.FOOTER_COUNT.REPORTS}
            />,
        );

        expect(mockCapturedPopupProps.current).toEqual(
            expect.objectContaining({
                countType: CONST.SEARCH.FOOTER_COUNT.EXPENSES,
                defaultCountType: CONST.SEARCH.FOOTER_COUNT.REPORTS,
                currency: CONST.CURRENCY.USD,
            }),
        );
    });
});
