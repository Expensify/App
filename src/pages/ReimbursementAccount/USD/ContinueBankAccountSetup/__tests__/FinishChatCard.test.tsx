import React from 'react';
import {render, fireEvent} from '@testing-library/react-native';
import Onyx from 'react-native-onyx';
import FinishChatCard from '../FinishChatCard';
import Navigation from '@libs/Navigation/Navigation';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

jest.mock('@libs/Navigation/Navigation', () => ({
    navigate: jest.fn(),
}));

const mockReimbursementAccount = {
    achData: {
        bankAccountID: 12345,
        status: CONST.BANK_ACCOUNT.STATUS.PENDING,
    },
};

describe('FinishChatCard', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should navigate to Personal Info RHP when bank account is pending', () => {
        render(<FinishChatCard reimbursementAccount={mockReimbursementAccount} />);
        
        const updateDetailsButton = screen.getByText('Update details');
        fireEvent.press(updateDetailsButton);
        
        expect(Navigation.navigate).toHaveBeenCalledWith(
            ROUTES.BANK_ACCOUNT_PERSONAL_INFO.getRoute(12345)
        );
    });

    it('should navigate to bank account setup flow when bank account is not pending', () => {
        const verifiedAccount = {
            achData: {
                bankAccountID: 12345,
                status: CONST.BANK_ACCOUNT.STATUS.VERIFIED,
            },
        };
        
        render(<FinishChatCard reimbursementAccount={verifiedAccount} />);
        
        const updateDetailsButton = screen.getByText('Update details');
        fireEvent.press(updateDetailsButton);
        
        expect(Navigation.navigate).toHaveBeenCalledWith(
            ROUTES.BANK_ACCOUNT_WITH_STEP_TO_OPEN.getRoute(12345, 'PersonalInfo')
        );
    });

    it('should not navigate when bankAccountID is missing', () => {
        const accountWithoutID = {
            achData: {
                status: CONST.BANK_ACCOUNT.STATUS.PENDING,
            },
        };
        
        render(<FinishChatCard reimbursementAccount={accountWithoutID} />);
        
        const updateDetailsButton = screen.getByText('Update details');
        fireEvent.press(updateDetailsButton);
        
        expect(Navigation.navigate).not.toHaveBeenCalled();
    });
});