import {render, waitFor} from '@testing-library/react-native';

import ConnectToDigitsFlow from '@components/ConnectToDigitsFlow';
import {ModalActions} from '@components/Modal/Global/ModalContext';

import Navigation from '@libs/Navigation/Navigation';

import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

import React from 'react';

const POLICY_ID = '123';

const mockStartDigitsOAuth = jest.fn();
const mockShowConfirmModal = jest.fn(() => Promise.resolve({action: 'CLOSE'}));
let mockOutputCurrency: string = CONST.CURRENCY.USD;
let mockHasReusablePolicies = false;
let mockIsConnectedToDigits = false;

jest.mock('@hooks/useLocalize', () => () => ({translate: (key: string) => key}));
jest.mock('@hooks/useConfirmModal', () => () => ({showConfirmModal: mockShowConfirmModal}));
// Runs the flow's selector on a policy built from the test's state, so the tests cover the values the flow actually reads
jest.mock('@hooks/useOnyx', () => (key: string, options?: {selector?: (policy: unknown) => unknown}) => {
    const policy = {id: '123', outputCurrency: mockOutputCurrency, connections: mockIsConnectedToDigits ? {digits: {}} : undefined};
    return [options?.selector ? options.selector(policy) : policy];
});
jest.mock('@hooks/useHasReusablePoliciesConnectedTo', () => () => mockHasReusablePolicies);
jest.mock('@hooks/useShouldBlockCurrencyChange', () => () => false);
jest.mock('@pages/workspace/accounting/digits/useStartDigitsOAuth', () => () => mockStartDigitsOAuth);
jest.mock('@libs/Navigation/Navigation', () => ({navigate: jest.fn()}));
// The flow starts from the Connections page, so the currency page has to open on top of it
jest.mock('@libs/Navigation/helpers/getActiveRoute', () => () => 'workspaces/123/connections');

const mockedNavigate = jest.mocked(Navigation.navigate);

function renderInStrictMode() {
    return render(
        <React.StrictMode>
            <ConnectToDigitsFlow policyID={POLICY_ID} />
        </React.StrictMode>,
    );
}

describe('ConnectToDigitsFlow', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockOutputCurrency = CONST.CURRENCY.USD;
        mockHasReusablePolicies = false;
        mockIsConnectedToDigits = false;
    });

    it('should open the Digits sign-in once when Strict Mode replays the mount effect', () => {
        // Given a USD workspace with no other Digits connection to copy, so the flow goes straight to the sign-in
        // When the flow mounts under Strict Mode, which runs mount effects twice in development
        renderInStrictMode();

        // Then the sign-in opens once, because a second run would open a second browser tab
        expect(mockStartDigitsOAuth).toHaveBeenCalledTimes(1);
        expect(mockStartDigitsOAuth).toHaveBeenCalledWith(POLICY_ID);
    });

    it('should show the currency prompt once for a workspace that is not in USD', () => {
        // Given a workspace in EUR, which Digits can't connect to
        mockOutputCurrency = CONST.CURRENCY.EUR;

        // When the flow mounts under Strict Mode
        renderInStrictMode();

        // Then a single currency prompt shows and the sign-in never opens
        expect(mockShowConfirmModal).toHaveBeenCalledTimes(1);
        expect(mockStartDigitsOAuth).not.toHaveBeenCalled();
    });

    it('should open the currency page on top of the Connections page when the admin agrees to change the currency', async () => {
        // Given a workspace in EUR whose admin agrees to update the workspace currency
        mockOutputCurrency = CONST.CURRENCY.EUR;
        mockShowConfirmModal.mockResolvedValueOnce({action: ModalActions.CONFIRM});

        // When the flow mounts and the admin confirms the prompt
        renderInStrictMode();

        // Then the currency page opens on top of the Connections page instead of on Overview's route, so a reload keeps Connections under it
        await waitFor(() => expect(mockedNavigate).toHaveBeenCalledWith('workspaces/123/connections/workspace-currency'));
    });

    it('should navigate to the existing connections once when another workspace is connected to Digits', () => {
        // Given a USD workspace whose admin has another workspace connected to Digits
        mockHasReusablePolicies = true;

        // When the flow mounts under Strict Mode
        renderInStrictMode();

        // Then the existing connections page opens once instead of being pushed twice
        expect(mockedNavigate).toHaveBeenCalledTimes(1);
        expect(mockedNavigate).toHaveBeenCalledWith(ROUTES.POLICY_ACCOUNTING_DIGITS_EXISTING_CONNECTIONS.getRoute(POLICY_ID));
    });

    it('should go straight to the sign-in when the workspace is already connected to Digits', () => {
        // Given a workspace already connected to Digits, whose admin also has another Digits workspace
        mockIsConnectedToDigits = true;
        mockHasReusablePolicies = true;

        // When "Enter your credentials" starts the flow
        renderInStrictMode();

        // Then the sign-in opens for the current connection instead of offering to copy another workspace's connection
        expect(mockedNavigate).not.toHaveBeenCalled();
        expect(mockStartDigitsOAuth).toHaveBeenCalledWith(POLICY_ID);
    });

    it('should run again for the next Connect press', () => {
        // Given a flow that already opened the sign-in and was unmounted
        const {unmount} = renderInStrictMode();
        unmount();

        // When the admin presses Connect again, which mounts a new flow
        renderInStrictMode();

        // Then the sign-in opens again, because the guard belongs to one flow and not to the whole app
        expect(mockStartDigitsOAuth).toHaveBeenCalledTimes(2);
    });
});
