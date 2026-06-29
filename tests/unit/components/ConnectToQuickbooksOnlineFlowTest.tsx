import {render} from '@testing-library/react-native';
import React from 'react';
import ConnectToQuickbooksOnlineFlow from '@components/ConnectToQuickbooksOnlineFlow';
import Navigation from '@libs/Navigation/Navigation';
import ROUTES from '@src/ROUTES';

jest.mock('@libs/Navigation/Navigation', () => ({
    navigate: jest.fn(),
}));

const mockedNavigate = jest.mocked(Navigation.navigate);

describe('ConnectToQuickbooksOnlineFlow', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('navigates to the QBO setup page on mount', () => {
        const policyID = '123';

        render(<ConnectToQuickbooksOnlineFlow policyID={policyID} />);

        expect(mockedNavigate).toHaveBeenCalledWith(ROUTES.POLICY_ACCOUNTING_QUICKBOOKS_ONLINE_SETUP.getRoute(policyID));
    });
});
