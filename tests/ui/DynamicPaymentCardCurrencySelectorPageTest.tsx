import {render} from '@testing-library/react-native';

import useDynamicBackPath from '@hooks/useDynamicBackPath';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';

import {setDraftValues} from '@libs/actions/FormActions';
import Navigation from '@libs/Navigation/Navigation';

import DynamicPaymentCardCurrencySelectorPage from '@pages/settings/Subscription/PaymentCard/DynamicPaymentCardCurrencySelectorPage';

import {setPaymentMethodCurrency} from '@userActions/PaymentMethods';

import ONYXKEYS from '@src/ONYXKEYS';

import React from 'react';

type CurrencyOption = {text: string; value: string; keyForList: string; isSelected: boolean};

let capturedData: CurrencyOption[] = [];
let capturedOnSelectRow: ((option: CurrencyOption) => void) | undefined;
let capturedCustomListHeader: React.ReactNode;

jest.mock('@hooks/usePermissions', () => jest.fn(() => ({isBetaEnabled: () => false})));

jest.mock('@hooks/useLocalize', () =>
    jest.fn(() => ({
        translate: (key: string) => key,
    })),
);

jest.mock('@hooks/useThemeStyles', () =>
    jest.fn(
        () =>
            new Proxy(
                {},
                {
                    get: () => ({}),
                },
            ),
    ),
);

jest.mock('@hooks/useOnyx', () => jest.fn());

jest.mock('@hooks/useDynamicBackPath', () => jest.fn(() => 'settings/subscription/change-billing-currency'));

jest.mock('@libs/actions/FormActions', () => ({
    setDraftValues: jest.fn(),
}));

jest.mock('@userActions/PaymentMethods', () => ({
    setPaymentMethodCurrency: jest.fn(),
}));

jest.mock('@libs/Navigation/Navigation', () => ({
    goBack: jest.fn(),
}));

jest.mock('@components/ScreenWrapper', () => {
    function MockScreenWrapper({children}: {children: React.ReactNode}) {
        return children;
    }
    return MockScreenWrapper;
});

jest.mock('@components/HeaderWithBackButton', () => {
    function MockHeader({title}: {title: string}) {
        return title;
    }
    return MockHeader;
});

jest.mock('@components/SelectionList', () => {
    function MockSelectionList({data, onSelectRow, customListHeader}: {data: CurrencyOption[]; onSelectRow: (option: CurrencyOption) => void; customListHeader?: React.ReactNode}) {
        capturedData = data ?? [];
        capturedOnSelectRow = onSelectRow;
        capturedCustomListHeader = customListHeader;
        return (data ?? []).map((item) => item.text).join(',');
    }
    return MockSelectionList;
});

jest.mock('@components/SelectionList/ListItem/SingleSelectListItem', () => 'SingleSelectListItem');

jest.mock('@components/AddPaymentCard/PaymentCardCurrencyHeader', () => 'PaymentCardCurrencyHeader');

const mockUsePermissions = jest.mocked(usePermissions);
const mockUseOnyx = jest.mocked(useOnyx);
const mockUseDynamicBackPath = jest.mocked(useDynamicBackPath);
const mockSetDraftValues = jest.mocked(setDraftValues);
const mockSetPaymentMethodCurrency = jest.mocked(setPaymentMethodCurrency);
const mockGoBack = jest.mocked(Navigation.goBack);

/**
 * The selector is shared by two flows and scopes its read/write to the active one (via backPath):
 * the change-billing flow uses the CHANGE_BILLING_CURRENCY draft, every other entry point (add
 * payment card / workspace owner change) uses the ADD_PAYMENT_CARD draft. The fund list provides
 * the billing-card fallback used by usePreferredCurrency when the active draft is empty.
 */
const mockOnyx = (formDraftCurrency?: string, addCardDraftCurrency?: string, billingCardCurrency?: string) => {
    mockUseOnyx.mockImplementation((key: string) => {
        if (key === ONYXKEYS.FORMS.CHANGE_BILLING_CURRENCY_FORM_DRAFT) {
            return [formDraftCurrency ? {currency: formDraftCurrency} : undefined, {status: 'loaded'}] as ReturnType<typeof useOnyx>;
        }
        if (key === ONYXKEYS.FORMS.ADD_PAYMENT_CARD_FORM_DRAFT) {
            return [addCardDraftCurrency ? {currency: addCardDraftCurrency} : undefined, {status: 'loaded'}] as ReturnType<typeof useOnyx>;
        }
        if (key === ONYXKEYS.FUND_LIST) {
            return [billingCardCurrency ? {card1: {accountData: {additionalData: {isBillingCard: true}, currency: billingCardCurrency}}} : undefined, {status: 'loaded'}] as ReturnType<
                typeof useOnyx
            >;
        }
        return [undefined, {status: 'loaded'}] as ReturnType<typeof useOnyx>;
    });
};

describe('DynamicPaymentCardCurrencySelectorPage', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        capturedData = [];
        capturedOnSelectRow = undefined;
        capturedCustomListHeader = undefined;
        mockUsePermissions.mockReturnValue({isBetaEnabled: () => false});
        mockUseDynamicBackPath.mockReturnValue('settings/subscription/change-billing-currency');
        mockOnyx();
    });

    it('hides EUR when the EUR billing beta is disabled', () => {
        render(<DynamicPaymentCardCurrencySelectorPage />);

        const currencies = capturedData.map((option) => option.value);
        expect(currencies).toEqual(['USD', 'AUD', 'GBP', 'NZD']);
        expect(currencies).not.toContain('EUR');
    });

    it('shows EUR when the EUR billing beta is enabled', () => {
        mockUsePermissions.mockReturnValue({isBetaEnabled: () => true});

        render(<DynamicPaymentCardCurrencySelectorPage />);

        expect(capturedData.map((option) => option.value)).toContain('EUR');
    });

    it('marks the form draft currency as selected', () => {
        mockOnyx('AUD');

        render(<DynamicPaymentCardCurrencySelectorPage />);

        const selected = capturedData.filter((option) => option.isSelected);
        expect(selected).toHaveLength(1);
        expect(selected.at(0)?.value).toBe('AUD');
    });

    it('ignores the add-payment-card draft in the change-billing flow and falls back to the billing card currency', () => {
        // Change-billing flow (default back path); a leftover add-card pick (NZD) must not leak into this flow's selection.
        mockOnyx(undefined, 'NZD', 'GBP');

        render(<DynamicPaymentCardCurrencySelectorPage />);

        expect(capturedData.find((option) => option.isSelected)?.value).toBe('GBP');
    });

    it('selects the add-payment-card draft currency in the add payment card flow', () => {
        mockUseDynamicBackPath.mockReturnValue('settings/subscription/add-payment-card');
        mockOnyx(undefined, 'NZD');

        render(<DynamicPaymentCardCurrencySelectorPage />);

        expect(capturedData.find((option) => option.isSelected)?.value).toBe('NZD');
    });

    it('clamps a EUR preferred currency to USD in the add payment card flow when the beta is disabled', () => {
        mockUseDynamicBackPath.mockReturnValue('settings/subscription/add-payment-card');
        // No add-card draft, so usePreferredCurrency resolves to the billing card currency (EUR).
        mockOnyx(undefined, undefined, 'EUR');

        render(<DynamicPaymentCardCurrencySelectorPage />);

        const currencies = capturedData.map((option) => option.value);
        expect(currencies).not.toContain('EUR');
        expect(capturedData.find((option) => option.isSelected)?.value).toBe('USD');
    });

    it('does not clamp a EUR preferred currency in the change-billing flow (keeps the existing card currency)', () => {
        // Default back path is change-billing; preferred currency resolves to the existing EUR card.
        mockOnyx(undefined, undefined, 'EUR');

        render(<DynamicPaymentCardCurrencySelectorPage />);

        // EUR is still filtered out of the options when the beta is off, but the current value is NOT clamped to USD
        // (unlike the add-card flow), so USD must not be pre-selected.
        expect(capturedData.find((option) => option.value === 'USD')?.isSelected).toBe(false);
        expect(capturedData.find((option) => option.isSelected)).toBeUndefined();
    });

    it('writes only the change-billing draft (not the add-card draft) on select in the change-billing flow', () => {
        render(<DynamicPaymentCardCurrencySelectorPage />);

        const aud = capturedData.find((option) => option.value === 'AUD');
        expect(aud).toBeDefined();
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        capturedOnSelectRow?.(aud!);

        expect(mockSetDraftValues).toHaveBeenCalledWith(ONYXKEYS.FORMS.CHANGE_BILLING_CURRENCY_FORM, {currency: 'AUD'});
        expect(mockSetPaymentMethodCurrency).not.toHaveBeenCalled();
        expect(mockGoBack).toHaveBeenCalledWith('settings/subscription/change-billing-currency');
    });

    it('writes only the add-card draft (not the change-billing draft) on select in the add payment card flow', () => {
        mockUseDynamicBackPath.mockReturnValue('settings/subscription/add-payment-card');

        render(<DynamicPaymentCardCurrencySelectorPage />);

        const aud = capturedData.find((option) => option.value === 'AUD');
        expect(aud).toBeDefined();
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        capturedOnSelectRow?.(aud!);

        expect(mockSetPaymentMethodCurrency).toHaveBeenCalledWith('AUD');
        expect(mockSetDraftValues).not.toHaveBeenCalled();
        expect(mockGoBack).toHaveBeenCalledWith('settings/subscription/add-payment-card');
    });

    it('shows the currency note when opened from a flow that does not already display it (e.g. add payment card)', () => {
        mockUseDynamicBackPath.mockReturnValue('settings/subscription/add-payment-card');

        render(<DynamicPaymentCardCurrencySelectorPage />);

        const header = capturedCustomListHeader as React.ReactElement<{isSectionList?: boolean}>;
        expect(header).toBeTruthy();
        expect(header.type).toBe('PaymentCardCurrencyHeader');
        expect(header.props.isSectionList).toBe(true);
    });

    it('hides the currency note when opened from change billing currency, which already shows it on the form', () => {
        // The default mocked back path is the change-billing-currency screen.
        render(<DynamicPaymentCardCurrencySelectorPage />);

        expect(capturedCustomListHeader).toBeUndefined();
    });
});
