// BankAccountSelection.js

import React, { useState, useEffect } from 'react';

const BankAccountSelection = ({ bankAccounts, selectedAccountId, onSelect }) => {
  const [selectedAccount, setSelectedAccount] = useState(null);

  useEffect(() => {
    // Update selected account when prop changes
    const account = bankAccounts.find(account => account.id === selectedAccountId);
    setSelectedAccount(account);
  }, [selectedAccountId, bankAccounts]);

  const handleAccountSelect = (accountId) => {
    const account = bankAccounts.find(acc => acc.id === accountId);
    setSelectedAccount(account);
    onSelect(accountId);
  };

  return (
    <div className='bank-account-selection'>
      <select value={selectedAccount ? selectedAccount.id : ''} onChange={(e) => handleAccountSelect(e.target.value)}>
        <option value=''>Select Account</option>
        {bankAccounts.map(account => (
          <option key={account.id} value={account.id}>
            {account.name} - {account.last4}
          </option>
        ))}
      </select>
    </div>
  );
};

export default BankAccountSelection;
