import React from 'react';
import {render, screen} from '@testing-library/react-native';
import InvoiceStatusIndicator from '@components/InvoiceStatusIndicator';
import CONST from '@src/CONST';

describe('InvoiceStatusIndicator', () => {
    it('renders pending status correctly', () => {
        render(<InvoiceStatusIndicator status={CONST.INVOICE.STATUS.PENDING} />);

        expect(screen.getByText('Pending')).toBeTruthy();
        expect(screen.getByTestId('invoice-status-indicator')).toHaveStyle({
            backgroundColor: '#FFA500',
        });
    });

    it('renders paid status correctly', () => {
        render(<InvoiceStatusIndicator status={CONST.INVOICE.STATUS.PAID} />);

        expect(screen.getByText('Paid')).toBeTruthy();
        expect(screen.getByTestId('invoice-status-indicator')).toHaveStyle({
            backgroundColor: '#03D47C',
        });
    });

    it('renders overdue status correctly', () => {
        render(<InvoiceStatusIndicator status={CONST.INVOICE.STATUS.OVERDUE} />);

        expect(screen.getByText('Overdue')).toBeTruthy();
        expect(screen.getByTestId('invoice-status-indicator')).toHaveStyle({
            backgroundColor: '#FF5B55',
        });
    });

    it('renders processing status correctly', () => {
        render(<InvoiceStatusIndicator status={CONST.INVOICE.STATUS.PROCESSING} />);

        expect(screen.getByText('Processing')).toBeTruthy();
        expect(screen.getByTestId('invoice-status-indicator')).toHaveStyle({
            backgroundColor: '#FFD23D',
        });
    });

    it('renders void status correctly', () => {
        render(<InvoiceStatusIndicator status={CONST.INVOICE.STATUS.VOID} />);

        expect(screen.getByText('Void')).toBeTruthy();
        expect(screen.getByTestId('invoice-status-indicator')).toHaveStyle({
            backgroundColor: '#8B8B8B',
        });
    });

    it('displays payment method when invoice is paid from reimbursement account', () => {
        render(
            <InvoiceStatusIndicator
                status={CONST.INVOICE.STATUS.PAID}
                paymentMethod={CONST.IOU.PAYMENT_TYPE.EXPENSIFY}
                showPaymentMethod
            />
        );

        expect(screen.getByText('Paid via Expensify')).toBeTruthy();
    });

    it('displays payment method when invoice is paid externally', () => {
        render(
            <InvoiceStatusIndicator
                status={CONST.INVOICE.STATUS.PAID}
                paymentMethod={CONST.IOU.PAYMENT_TYPE.ELSEWHERE}
                showPaymentMethod
            />
        );

        expect(screen.getByText('Paid elsewhere')).toBeTruthy();
    });

    it('handles payment discrepancy warning for external payments', () => {
        render(
            <InvoiceStatusIndicator
                status={CONST.INVOICE.STATUS.PAID}
                paymentMethod={CONST.IOU.PAYMENT_TYPE.ELSEWHERE}
                showPaymentMethod
                hasPaymentDiscrepancy
            />
        );

        expect(screen.getByText('Paid elsewhere')).toBeTruthy();
        expect(screen.getByTestId('payment-discrepancy-icon')).toBeTruthy();
    });

    it('renders correct status when marked paid outside Expensify despite reimbursement account payment', () => {
        render(
            <InvoiceStatusIndicator
                status={CONST.INVOICE.STATUS.PAID}
                paymentMethod={CONST.IOU.PAYMENT_TYPE.ELSEWHERE}
                actualPaymentMethod={CONST.IOU.PAYMENT_TYPE.EXPENSIFY}
                showPaymentMethod
                hasPaymentDiscrepancy
            />
        );

        expect(screen.getByText('Paid elsewhere')).toBeTruthy();
        expect(screen.getByTestId('payment-discrepancy-icon')).toBeTruthy();
    });

    it('does not show payment method when showPaymentMethod is false', () => {
        render(
            <InvoiceStatusIndicator
                status={CONST.INVOICE.STATUS.PAID}
                paymentMethod={CONST.IOU.PAYMENT_TYPE.EXPENSIFY}
                showPaymentMethod={false}
            />
        );

        expect(screen.getByText('Paid')).toBeTruthy();
        expect(screen.queryByText('via Expensify')).toBeFalsy();
    });

    it('applies custom style when provided', () => {
        const customStyle = {marginTop: 10};

        render(
            <InvoiceStatusIndicator
                status={CONST.INVOICE.STATUS.PENDING}
                style={customStyle}
            />
        );

        expect(screen.getByTestId('invoice-status-indicator')).toHaveStyle(customStyle);
    });

    it('renders with accessibility label', () => {
        render(<InvoiceStatusIndicator status={CONST.INVOICE.STATUS.PAID} />);

        expect(screen.getByLabelText('Invoice status: Paid')).toBeTruthy();
    });
});
