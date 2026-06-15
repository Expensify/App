import {render} from '@testing-library/react-native';
import React from 'react';
import {getQuickbooksOnlineSetupLink} from '@libs/actions/connections/QuickbooksOnline';
import Navigation from '@libs/Navigation/Navigation';
import type QuickbooksOnlineSetupPageType from '@pages/workspace/accounting/qbo/QuickbooksOnlineSetupPage';
import {openLink} from '@userActions/Link';
import {enablePolicyTaxes} from '@userActions/Policy/Policy';

// Jest (jest-expo) resolves the `.native` variant by default, so we require the web entry point
// explicitly (with its `.tsx` extension) to exercise the web implementation.
// eslint-disable-next-line import/extensions
const QuickbooksOnlineSetupPage = (require('@pages/workspace/accounting/qbo/QuickbooksOnlineSetupPage/index.tsx') as unknown as {default: typeof QuickbooksOnlineSetupPageType}).default;

const ENVIRONMENT_URL = 'https://new.expensify.com';
const POLICY_ID = '123';

jest.mock('@hooks/useEnvironment', () => () => ({
    environmentURL: 'https://new.expensify.com',
}));
jest.mock('@libs/actions/connections/QuickbooksOnline', () => ({
    getQuickbooksOnlineSetupLink: jest.fn((policyID: string) => `https://qbo-setup.example/${policyID}`),
}));
jest.mock('@userActions/Link', () => ({
    openLink: jest.fn(),
}));
jest.mock('@userActions/Policy/Policy', () => ({
    enablePolicyTaxes: jest.fn(),
}));
jest.mock('@libs/Navigation/Navigation', () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
}));

const mockRoute = {
    key: 'test-route',
    name: 'Workspace_Accounting_Quickbooks_Online_Setup',
    params: {
        policyID: POLICY_ID,
    },
};

const mockedGetQuickbooksOnlineSetupLink = jest.mocked(getQuickbooksOnlineSetupLink);
const mockedEnablePolicyTaxes = jest.mocked(enablePolicyTaxes);
const mockedOpenLink = jest.mocked(openLink);
const mockedGoBack = jest.mocked(Navigation.goBack);

const renderQuickbooksOnlineSetupPage = () =>
    render(
        <QuickbooksOnlineSetupPage
            // @ts-expect-error - route type from navigator
            route={mockRoute}
        />,
    );

describe('QuickbooksOnlineSetupPage (web)', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('disables policy taxes because QBO does not support them', () => {
        renderQuickbooksOnlineSetupPage();

        expect(mockedEnablePolicyTaxes).toHaveBeenCalledWith(POLICY_ID, false);
    });

    it('opens the QuickBooks Online setup link for the given policy in the current environment', () => {
        renderQuickbooksOnlineSetupPage();

        expect(mockedGetQuickbooksOnlineSetupLink).toHaveBeenCalledWith(POLICY_ID);
        expect(mockedOpenLink).toHaveBeenCalledWith(`https://qbo-setup.example/${POLICY_ID}`, ENVIRONMENT_URL);
    });

    it('navigates back after opening the setup link', () => {
        renderQuickbooksOnlineSetupPage();

        expect(mockedGoBack).toHaveBeenCalled();
    });

    it('renders nothing', () => {
        const {toJSON} = renderQuickbooksOnlineSetupPage();

        expect(toJSON()).toBeNull();
    });
});
