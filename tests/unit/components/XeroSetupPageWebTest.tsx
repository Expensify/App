import {render} from '@testing-library/react-native';
import React from 'react';
import {getXeroSetupLink} from '@libs/actions/connections/Xero';
import Navigation from '@libs/Navigation/Navigation';
import type XeroSetupPageType from '@pages/workspace/accounting/xero/XeroSetupPage';
import {openLink} from '@userActions/Link';
import ROUTES from '@src/ROUTES';

// Jest (jest-expo) resolves the `.native` variant by default, so we require the web entry point
// explicitly (with its `.tsx` extension) to exercise the web implementation.
// eslint-disable-next-line import/extensions
const xeroSetupPageModule: unknown = require('@pages/workspace/accounting/xero/XeroSetupPage/index.tsx');

// The `require` above yields `any`, and narrowing it to the module shape needs a type assertion that
// can't be avoided for this test-only web-entry-point escape hatch, so disable the rule on this line.
// eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
const XeroSetupPage = (xeroSetupPageModule as {default: typeof XeroSetupPageType}).default;

const ENVIRONMENT_URL = 'https://new.expensify.com';
const POLICY_ID = '123';

jest.mock('@hooks/useEnvironment', () => () => ({
    environmentURL: 'https://new.expensify.com',
}));
jest.mock('@libs/actions/connections/Xero', () => ({
    getXeroSetupLink: jest.fn((policyID: string) => `https://xero-setup.example/${policyID}`),
}));
jest.mock('@userActions/Link', () => ({
    openLink: jest.fn(),
}));
jest.mock('@libs/Navigation/Navigation', () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
    runAfterUpcomingTransition: jest.fn((callback: () => void) => {
        callback();
        return {cancel: jest.fn()};
    }),
}));

const mockRoute = {
    key: 'test-route',
    name: 'Workspace_Accounting_Xero_Setup',
    params: {
        policyID: POLICY_ID,
    },
};

const mockedGetXeroSetupLink = jest.mocked(getXeroSetupLink);
const mockedOpenLink = jest.mocked(openLink);
const mockedGoBack = jest.mocked(Navigation.goBack);

const renderXeroSetupPage = () =>
    render(
        <XeroSetupPage
            // @ts-expect-error - route type from navigator
            route={mockRoute}
        />,
    );

describe('XeroSetupPage (web)', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('opens the Xero setup link for the given policy in the current environment', () => {
        renderXeroSetupPage();

        expect(mockedGetXeroSetupLink).toHaveBeenCalledWith(POLICY_ID);
        expect(mockedOpenLink).toHaveBeenCalledWith(`https://xero-setup.example/${POLICY_ID}`, ENVIRONMENT_URL);
    });

    it('closes the RHP and returns to the accounting page so no empty backdrop is left behind', () => {
        renderXeroSetupPage();

        expect(mockedGoBack).toHaveBeenCalledWith(ROUTES.POLICY_ACCOUNTING.getRoute(POLICY_ID));
    });

    it('renders nothing', () => {
        const {toJSON} = renderXeroSetupPage();

        expect(toJSON()).toBeNull();
    });
});
