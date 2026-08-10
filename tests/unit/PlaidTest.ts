import {read} from '@libs/API';
import {READ_COMMANDS} from '@libs/API/types';
import getPlaidLinkTokenParameters from '@libs/getPlaidLinkTokenParameters';

import {openPlaidBankLogin, openPlaidCompanyCardLogin} from '@libs/actions/Plaid';

jest.mock('@libs/API');

// Mirror the real web helper: the personal Plaid redirect (`bank-account/personal-info`) is only used
// when the caller explicitly asks for the Personal Bank Account flow. This lets us assert which redirect
// each Plaid flow ends up requesting without depending on the platform-specific implementation.
jest.mock('@libs/getPlaidLinkTokenParameters', () => ({
    __esModule: true,
    default: jest.fn((isPersonalBankAccount = false) => ({
        redirectURI: isPersonalBankAccount ? 'https://new.expensify.com/bank-account/personal-info' : 'https://new.expensify.com/bank-account',
    })),
}));

const mockRead = jest.mocked(read);
const mockGetPlaidLinkTokenParameters = jest.mocked(getPlaidLinkTokenParameters);

describe('Plaid', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('openPlaidCompanyCardLogin', () => {
        it('never requests the personal bank account redirect, even for a personal card', () => {
            openPlaidCompanyCardLogin('US', '', undefined, true);

            expect(mockGetPlaidLinkTokenParameters).toHaveBeenCalledWith(false);
            expect(mockRead).toHaveBeenCalledWith(
                READ_COMMANDS.OPEN_PLAID_CARDS_BANK_LOGIN,
                expect.objectContaining({redirectURI: expect.not.stringContaining('personal-info')}),
                expect.anything(),
            );
        });

        it('never requests the personal bank account redirect for a company card', () => {
            openPlaidCompanyCardLogin('US', 'domain.com', undefined, false);

            expect(mockRead).toHaveBeenCalledWith(
                READ_COMMANDS.OPEN_PLAID_CARDS_BANK_LOGIN,
                expect.objectContaining({redirectURI: expect.not.stringContaining('personal-info')}),
                expect.anything(),
            );
        });
    });

    describe('openPlaidBankLogin', () => {
        it('requests the personal bank account redirect for the Personal Bank Account flow', () => {
            openPlaidBankLogin(false, 0, true);

            expect(mockGetPlaidLinkTokenParameters).toHaveBeenCalledWith(true);
            expect(mockRead).toHaveBeenCalledWith(
                READ_COMMANDS.OPEN_PLAID_BANK_LOGIN,
                expect.objectContaining({redirectURI: expect.stringContaining('personal-info')}),
                expect.anything(),
            );
        });

        it('requests the default bank account redirect for business and wallet flows', () => {
            openPlaidBankLogin(false, 0, false);

            expect(mockRead).toHaveBeenCalledWith(
                READ_COMMANDS.OPEN_PLAID_BANK_LOGIN,
                expect.objectContaining({redirectURI: expect.not.stringContaining('personal-info')}),
                expect.anything(),
            );
        });

        it('defaults to the non-personal redirect when the flow is not specified', () => {
            openPlaidBankLogin(false, 0);

            expect(mockGetPlaidLinkTokenParameters).toHaveBeenCalledWith(false);
        });
    });
});
