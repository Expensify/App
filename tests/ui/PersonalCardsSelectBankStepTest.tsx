import {render} from '@testing-library/react-native';

import SelectionList from '@components/SelectionList';

import openBankConnection from '@pages/settings/Wallet/PersonalCards/steps/BankConnection/openBankConnection';
import SelectBankStep from '@pages/settings/Wallet/PersonalCards/steps/SelectBankStep';

import {setAddNewPersonalCardStepAndData} from '@userActions/PersonalCards';

import CONST from '@src/CONST';

import React from 'react';

const mockBankConnectionURL = 'https://example.com/mock-bank';
const mockSelectedBank = 'Mock Bank';

jest.mock('@components/HeaderWithBackButton', () => jest.fn(() => null));
jest.mock('@components/ScreenWrapper', () => jest.fn(({children}: {children: React.ReactNode}) => children));
jest.mock('@components/SelectionList', () => jest.fn(() => null));
jest.mock('@hooks/useCompanyCardIcons', () => ({useCompanyCardBankIcons: jest.fn(() => ({}))}));
jest.mock('@hooks/useLocalize', () => jest.fn(() => ({translate: (key: string) => key})));
jest.mock('@hooks/useNetwork', () => jest.fn(() => ({isOffline: false})));
jest.mock('@hooks/useOnyx', () => jest.fn(() => [{data: {selectedBank: mockSelectedBank}}]));
jest.mock('@hooks/useThemeIllustrations', () => jest.fn(() => ({})));
jest.mock('@hooks/useThemeStyles', () => jest.fn(() => new Proxy({}, {get: () => ({})})));
jest.mock('@libs/CardUtils', () => ({getPersonalBankCardDetailsImage: jest.fn()}));
jest.mock('@userActions/getCompanyCardBankConnection', () => ({getPersonalCardBankConnection: jest.fn(() => mockBankConnectionURL)}));
jest.mock('@userActions/PersonalCards', () => ({setAddNewPersonalCardStepAndData: jest.fn()}));
jest.mock('@pages/settings/Wallet/PersonalCards/steps/BankConnection/openBankConnection', () => jest.fn());

describe('SelectBankStep', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('opens the bank connection popup from the confirmation action', () => {
        // Given a connectable bank is selected
        render(<SelectBankStep />);
        const confirm = jest.mocked(SelectionList).mock.calls.at(-1)?.at(0)?.confirmButtonOptions?.onConfirm;

        // When the user confirms the bank selection
        confirm?.();

        // Then the popup opens synchronously before navigating to the connection step
        expect(openBankConnection).toHaveBeenCalledWith(mockBankConnectionURL, true);
        expect(setAddNewPersonalCardStepAndData).toHaveBeenCalledWith({
            step: CONST.PERSONAL_CARDS.STEP.BANK_CONNECTION,
            data: {
                selectedBank: CONST.PERSONAL_CARDS.BANKS.MOCK_BANK,
                cardTitle: CONST.PERSONAL_CARDS.BANKS.MOCK_BANK,
            },
            isEditing: false,
        });
        expect(jest.mocked(openBankConnection).mock.invocationCallOrder.at(0)).toBeLessThan(jest.mocked(setAddNewPersonalCardStepAndData).mock.invocationCallOrder.at(0) ?? Infinity);
    });
});
