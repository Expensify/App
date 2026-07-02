import {render} from '@testing-library/react-native';
import React from 'react';
import type ConnectToQuickbooksOnlineFlowType from '@components/ConnectToQuickbooksOnlineFlow';
import {getQuickbooksOnlineSetupLink} from '@libs/actions/connections/QuickbooksOnline';
import Navigation from '@libs/Navigation/Navigation';
import {openLink} from '@userActions/Link';
import {enablePolicyTaxes} from '@userActions/Policy/Policy';

// Jest (jest-expo) resolves the `.native` variant by default, so we require the web entry point
// explicitly (with its `.tsx` extension) to exercise the web implementation.
// eslint-disable-next-line import/extensions
const connectToQuickbooksOnlineFlowModule: unknown = require('@components/ConnectToQuickbooksOnlineFlow/index.tsx');

// The `require` above yields `any`, and narrowing it to the module shape needs a type assertion that
// can't be avoided for this test-only web-entry-point escape hatch, so disable the rule on this line.
// eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
const ConnectToQuickbooksOnlineFlow = (connectToQuickbooksOnlineFlowModule as {default: typeof ConnectToQuickbooksOnlineFlowType}).default;

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
}));

const mockedGetQuickbooksOnlineSetupLink = jest.mocked(getQuickbooksOnlineSetupLink);
const mockedOpenLink = jest.mocked(openLink);
const mockedEnablePolicyTaxes = jest.mocked(enablePolicyTaxes);
const mockedNavigate = jest.mocked(Navigation.navigate);

describe('ConnectToQuickbooksOnlineFlow (web)', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('disables taxes and opens the QBO setup link inline on mount', () => {
        render(<ConnectToQuickbooksOnlineFlow policyID={POLICY_ID} />);

        expect(mockedEnablePolicyTaxes).toHaveBeenCalledWith(POLICY_ID, false);
        expect(mockedGetQuickbooksOnlineSetupLink).toHaveBeenCalledWith(POLICY_ID);
        expect(mockedOpenLink).toHaveBeenCalledWith(`https://qbo-setup.example/${POLICY_ID}`, ENVIRONMENT_URL);
    });

    it('does not navigate to a setup screen', () => {
        render(<ConnectToQuickbooksOnlineFlow policyID={POLICY_ID} />);

        expect(mockedNavigate).not.toHaveBeenCalled();
    });
});
