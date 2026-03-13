// BankAccountSelection.test.js

import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import BankAccountSelection from '../index';

describe('BankAccountSelection', () => {
  const mockOnSelect = jest.fn();
  const bankAccounts = [
    { id: 1, name: 'Bank 1', last4: '1234' },
    { id: 2, name: 'Bank 2', last4: '5678' },
  ];

  it('renders the bank account options', () => {
    render(<BankAccountSelection bankAccounts={bankAccounts} selectedAccountId={1} onSelect={mockOnSelect} />);
    expect(screen.getByText('Bank 1 - 1234')).toBeInTheDocument();
    expect(screen.getByText('Bank 2 - 5678')).toBeInTheDocument();
  });

  it('selects the correct bank account', () => {
    render(<BankAccountSelection bankAccounts={bankAccounts} selectedAccountId={1} onSelect={mockOnSelect} />);
    fireEvent.change(screen.getByRole('combobox'), { target: { value: '2' } });
    expect(mockOnSelect).toHaveBeenCalledWith('2');
  });
});
