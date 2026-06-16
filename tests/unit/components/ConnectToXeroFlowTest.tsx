import {render} from '@testing-library/react-native';
import React from 'react';
import ConnectToXeroFlow from '@components/ConnectToXeroFlow/index.native';
import Navigation from '@libs/Navigation/Navigation';
import ROUTES from '@src/ROUTES';

jest.mock('@libs/Navigation/Navigation', () => ({
    navigate: jest.fn(),
}));

const mockedNavigate = jest.mocked(Navigation.navigate);

describe('ConnectToXeroFlow (native)', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('navigates to the Xero setup page on mount', () => {
        const policyID = '123';

        render(<ConnectToXeroFlow policyID={policyID} />);

        expect(mockedNavigate).toHaveBeenCalledWith(ROUTES.POLICY_ACCOUNTING_XERO_SETUP.getRoute(policyID));
    });
});
