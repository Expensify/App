import {render} from '@testing-library/react-native';

import BulkActionBar from '@components/BulkActionBar';
import ButtonWithDropdownMenu from '@components/ButtonWithDropdownMenu';
import MoneyReportHeaderKYCDropdown from '@components/MoneyReportHeaderKYCDropdown';
import SelectionBulkActionBar from '@components/MoneyRequestReportView/SelectionToolbar/SelectionBulkActionBar';
import type {PopoverMenuItem} from '@components/PopoverMenu';

import CONST from '@src/CONST';

import type {GestureResponderEvent} from 'react-native';

import React from 'react';

jest.mock('@hooks/useNetwork', () => jest.fn(() => ({isOffline: false})));
jest.mock('@hooks/useLocalize', () => jest.fn(() => ({translate: (key: string) => key})));
jest.mock('@hooks/useResponsiveLayout', () => jest.fn(() => ({shouldUseNarrowLayout: false, isMediumScreenWidth: false, isInLandscapeMode: false})));

// useThemeStyles throws without a <ThemeStylesProvider>; return a proxy that yields an empty style object for any key.
jest.mock('@hooks/useThemeStyles', () => {
    const styleProxy = new Proxy({}, {get: () => ({})});
    return jest.fn(() => styleProxy);
});

jest.mock('@components/ReportSubmitToPopoverAnchor', () => ({
    __esModule: true,
    useReportSubmitToPopoverAnchorRef: jest.fn(() => undefined),
}));

// The KYC wall renders its children straight away with a KYC trigger the test can watch.
const mockTriggerKYCFlow = jest.fn();
jest.mock('@components/KYCWall', () => ({
    __esModule: true,
    default: ({children}: {children: (triggerKYCFlow: jest.Mock, buttonRef: undefined) => React.ReactNode}) => children(mockTriggerKYCFlow, undefined),
}));

jest.mock('@components/BulkActionBar', () => jest.fn(() => null));
jest.mock('@components/ButtonWithDropdownMenu', () => jest.fn(() => null));

const mockedBulkActionBar = jest.mocked(BulkActionBar);
const mockedButtonWithDropdownMenu = jest.mocked(ButtonWithDropdownMenu);

type OnSubItemSelected = (item: PopoverMenuItem, index: number, event?: GestureResponderEvent | KeyboardEvent) => void;

function getOnSubItemSelected(onSubItemSelected: OnSubItemSelected | undefined): OnSubItemSelected {
    if (!onSubItemSelected) {
        throw new Error('onSubItemSelected was not passed to the menu');
    }
    return onSubItemSelected;
}

// An invoice's "Mark as paid" item, which pays from its own onSelected when the menu runs it.
const invoicePayElsewhereItem = {text: 'Mark as paid', value: CONST.IOU.PAYMENT_TYPE.ELSEWHERE, onSelected: jest.fn()};

// A regular payment option, which has no onSelected and relies on the parent to pay.
const payElsewhereItem = {text: 'Mark as paid', value: CONST.IOU.PAYMENT_TYPE.ELSEWHERE};

function renderBulkActionBar(onSelectionModePaymentSelect: jest.Mock): OnSubItemSelected {
    render(
        <SelectionBulkActionBar
            chatReport={undefined}
            report={undefined}
            selectedTransactionsOptions={[]}
            selectedTransactionIDs={['tx-1']}
            onSelectionModePaymentSelect={onSelectionModePaymentSelect}
            selectionModeKYCSuccess={jest.fn()}
            onWorkspacePolicySelect={jest.fn()}
            kycWallRef={{current: null}}
            onClearSelection={jest.fn()}
        />,
    );
    return getOnSubItemSelected(mockedBulkActionBar.mock.calls.at(-1)?.at(0)?.onSubItemSelected);
}

function renderKYCDropdown(onPaymentSelect: jest.Mock): OnSubItemSelected {
    render(
        <MoneyReportHeaderKYCDropdown
            primaryAction=""
            applicableSecondaryActions={[]}
            onPaymentSelect={onPaymentSelect}
            onSuccessfulKYC={jest.fn()}
            ref={{current: null}}
        />,
    );
    return getOnSubItemSelected(mockedButtonWithDropdownMenu.mock.calls.at(-1)?.at(0)?.onSubItemSelected);
}

describe('Payment options that pay from their own onSelected', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('pays an invoice only once from the bulk action bar', () => {
        // Given the bulk action bar of a single-expense invoice in the table view
        const onSelectionModePaymentSelect = jest.fn();
        const onSubItemSelected = renderBulkActionBar(onSelectionModePaymentSelect);

        // When the user picks the invoice's "Mark as paid", which pays from its own onSelected
        onSubItemSelected(invoicePayElsewhereItem, 0);

        // Then the bar doesn't pay again, so only one PayInvoice request is sent
        expect(onSelectionModePaymentSelect).not.toHaveBeenCalled();
    });

    it('still pays a regular payment option from the bulk action bar', () => {
        // Given the bulk action bar of a selection that can be paid
        const onSelectionModePaymentSelect = jest.fn();
        const onSubItemSelected = renderBulkActionBar(onSelectionModePaymentSelect);

        // When the user picks a payment option that has no onSelected of its own
        onSubItemSelected(payElsewhereItem, 0);

        // Then the bar pays, as nothing else will
        expect(onSelectionModePaymentSelect).toHaveBeenCalledWith(undefined, CONST.IOU.PAYMENT_TYPE.ELSEWHERE, mockTriggerKYCFlow);
    });

    it('pays an invoice only once from the header dropdown', () => {
        // Given the header dropdown of a single-expense invoice, as shown on narrow layouts while it is selected
        const onPaymentSelect = jest.fn();
        const onSubItemSelected = renderKYCDropdown(onPaymentSelect);

        // When the user picks the invoice's "Mark as paid", which pays from its own onSelected
        onSubItemSelected(invoicePayElsewhereItem, 0);

        // Then the dropdown doesn't pay again, so only one PayInvoice request is sent
        expect(onPaymentSelect).not.toHaveBeenCalled();
    });

    it('still pays a regular payment option from the header dropdown', () => {
        // Given the header dropdown of a report that can be paid
        const onPaymentSelect = jest.fn();
        const onSubItemSelected = renderKYCDropdown(onPaymentSelect);

        // When the user picks a payment option that has no onSelected of its own
        onSubItemSelected(payElsewhereItem, 0);

        // Then the dropdown pays, as nothing else will
        expect(onPaymentSelect).toHaveBeenCalledWith(undefined, CONST.IOU.PAYMENT_TYPE.ELSEWHERE, mockTriggerKYCFlow);
    });
});
