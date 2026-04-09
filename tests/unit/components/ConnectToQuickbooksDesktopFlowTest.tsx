import {render} from '@testing-library/react-native';
import React from 'react';
import ConnectToQuickbooksDesktopFlow from '@components/ConnectToQuickbooksDesktopFlow';
import useHasPoliciesConnectedToQBD from '@hooks/useHasPoliciesConnectedToQBD';
import Navigation from '@libs/Navigation/Navigation';
import ROUTES from '@src/ROUTES';

jest.mock('@hooks/useHasPoliciesConnectedToQBD');
jest.mock('@libs/Navigation/Navigation', () => ({
    navigate: jest.fn(),
}));

const mockedUseHasPoliciesConnectedToQBD = jest.mocked(useHasPoliciesConnectedToQBD);
const mockedNavigate = jest.mocked(Navigation.navigate);

describe('ConnectToQuickbooksDesktopFlow', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('routes to reusable connections when a QBD connection already exists', () => {
        const policyID = '123';
        mockedUseHasPoliciesConnectedToQBD.mockReturnValue(true);

        render(<ConnectToQuickbooksDesktopFlow policyID={policyID} />);

        expect(mockedNavigate).toHaveBeenCalledWith(ROUTES.POLICY_ACCOUNTING_QUICKBOOKS_DESKTOP_EXISTING_CONNECTIONS.getRoute(policyID));
    });
});
