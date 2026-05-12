import {render} from '@testing-library/react-native';
import React from 'react';
import ConnectToSageIntacctFlow from '@components/ConnectToSageIntacctFlow';
import useHasReusablePoliciesConnectedTo from '@hooks/useHasReusablePoliciesConnectedTo';
import useOnyx from '@hooks/useOnyx';
import Navigation from '@libs/Navigation/Navigation';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES, {DYNAMIC_ROUTES} from '@src/ROUTES';

jest.mock('@hooks/useHasReusablePoliciesConnectedTo');
jest.mock('@hooks/useOnyx');
jest.mock('@libs/Navigation/Navigation', () => ({
    navigate: jest.fn(),
}));

const mockedUseHasReusablePoliciesConnectedTo = jest.mocked(useHasReusablePoliciesConnectedTo);
const mockedUseOnyx = jest.mocked(useOnyx);
const mockedNavigate = jest.mocked(Navigation.navigate);

const getUseOnyxResult = (value: unknown) => [value] as unknown as ReturnType<typeof useOnyx>;

describe('ConnectToSageIntacctFlow', () => {
    const policyID = '123';

    beforeEach(() => {
        jest.clearAllMocks();
        mockedUseHasReusablePoliciesConnectedTo.mockReturnValue(false);
        mockedUseOnyx.mockImplementation((key) => {
            if (key === `${ONYXKEYS.COLLECTION.POLICY}${policyID}`) {
                return getUseOnyxResult({});
            }
            return getUseOnyxResult(undefined);
        });
    });

    it('routes proactive credential updates directly to the credential form', () => {
        mockedUseHasReusablePoliciesConnectedTo.mockReturnValue(true);

        render(
            <ConnectToSageIntacctFlow
                policyID={policyID}
                entryPoint="credentials"
            />,
        );

        expect(mockedNavigate).toHaveBeenCalledWith(ROUTES.POLICY_ACCOUNTING_SAGE_INTACCT_ENTER_CREDENTIALS.getRoute(policyID));
    });

    it('routes authentication errors to the credential form', () => {
        mockedUseOnyx.mockReturnValue(getUseOnyxResult(
            {
                connections: {
                    intacct: {
                        lastSync: {
                            isAuthenticationError: true,
                        },
                    },
                },
            },
        ));

        render(<ConnectToSageIntacctFlow policyID={policyID} />);

        expect(mockedNavigate).toHaveBeenCalledWith(ROUTES.POLICY_ACCOUNTING_SAGE_INTACCT_ENTER_CREDENTIALS.getRoute(policyID));
    });

    it('routes to prerequisites when no reusable Sage Intacct workspace exists', () => {
        render(<ConnectToSageIntacctFlow policyID={policyID} />);

        expect(mockedNavigate).toHaveBeenCalledWith(`${ROUTES.POLICY_ACCOUNTING.getRoute(policyID)}/${DYNAMIC_ROUTES.SAGE_INTACCT_PREREQUISITES.path}`);
    });

    it('routes to reusable connections when eligible Sage Intacct workspaces exist', () => {
        mockedUseHasReusablePoliciesConnectedTo.mockReturnValue(true);

        render(<ConnectToSageIntacctFlow policyID={policyID} />);

        expect(mockedNavigate).toHaveBeenCalledWith(ROUTES.POLICY_ACCOUNTING_SAGE_INTACCT_EXISTING_CONNECTIONS.getRoute(policyID));
    });
});
