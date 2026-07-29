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
 * The page reads three Onyx keys in order: the CHANGE_BILLING_CURRENCY form draft, the in-flight
 * ADD_PAYMENT_CARD form, and the fund list (for the billing card fallback).
 */
const mockOnyx = (formDraftCurrency?: string, addCardCurrency?: string, billingCardCurrency?: string) => {
    mockUseOnyx.mockImplementation((key: string) => {
        if (key === ONYXKEYS.FORMS.CHANGE_BILLING_CURRENCY_FORM_DRAFT) {
            return [formDraftCurrency ? {currency: formDraftCurrency} : undefined, {status: 'loaded'}] as ReturnType<typeof useOnyx>;
        }
        if (key === ONYXKEYS.FORMS.ADD_PAYMENT_CARD_FORM) {
            return [addCardCurrency ? {currency: addCardCurrency} : undefined, {status: 'loaded'}] as ReturnType<typeof useOnyx>;
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

    it('falls back to the add-payment-card form currency when the draft is empty', () => {
        mockOnyx(undefined, 'NZD');

        render(<DynamicPaymentCardCurrencySelectorPage />);

        expect(capturedData.find((option) => option.isSelected)?.value).toBe('NZD');
    });

    it('falls back to the billing card currency when both the draft and the add-card form are empty', () => {
        mockOnyx(undefined, undefined, 'GBP');

        render(<DynamicPaymentCardCurrencySelectorPage />);

        expect(capturedData.find((option) => option.isSelected)?.value).toBe('GBP');
    });

    it('writes the chosen currency to both flows and navigates back on select', () => {
        render(<DynamicPaymentCardCurrencySelectorPage />);

        const aud = capturedData.find((option) => option.value === 'AUD');
        expect(aud).toBeDefined();
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        capturedOnSelectRow?.(aud!);

        expect(mockSetDraftValues).toHaveBeenCalledWith(ONYXKEYS.FORMS.CHANGE_BILLING_CURRENCY_FORM, {currency: 'AUD'});
        expect(mockSetPaymentMethodCurrency).toHaveBeenCalledWith('AUD');
        expect(mockGoBack).toHaveBeenCalledWith('settings/subscription/change-billing-currency');
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
