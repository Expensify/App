import {render} from '@testing-library/react-native';
import React from 'react';
import Navigation from '@libs/Navigation/Navigation';
import type QuickbooksOnlineSetupPageType from '@pages/workspace/accounting/qbo/QuickbooksOnlineSetupPage';
import ROUTES from '@src/ROUTES';

type RunAfterTransitionsArg = {callback: () => void};

// Jest (jest-expo) resolves the `.native` variant by default, so we require the web entry point
// explicitly (with its `.tsx` extension) to exercise the web implementation.
// eslint-disable-next-line import/extensions
const quickbooksOnlineSetupPageModule: unknown = require('@pages/workspace/accounting/qbo/QuickbooksOnlineSetupPage/index.tsx');

// The `require` above yields `any`, and narrowing it to the module shape needs a type assertion that
// can't be avoided for this test-only web-entry-point escape hatch, so disable the rule on this line.
// eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
const QuickbooksOnlineSetupPage = (quickbooksOnlineSetupPageModule as {default: typeof QuickbooksOnlineSetupPageType}).default;

const POLICY_ID = '123';

jest.mock('@libs/Navigation/Navigation', () => ({
    goBack: jest.fn(),
}));
jest.mock('@libs/Navigation/TransitionTracker', () => ({
    __esModule: true,
    default: {
        runAfterTransitions: jest.fn(({callback}: RunAfterTransitionsArg) => {
            callback();
            return {cancel: jest.fn()};
        }),
    },
}));

const mockRoute = {
    key: 'test-route',
    name: 'Workspace_Accounting_Quickbooks_Online_Setup',
    params: {
        policyID: POLICY_ID,
    },
};

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

    it('returns to the workspace accounting page', () => {
        renderQuickbooksOnlineSetupPage();

        expect(mockedGoBack).toHaveBeenCalledWith(ROUTES.POLICY_ACCOUNTING.getRoute(POLICY_ID));
    });

    it('renders nothing', () => {
        const {toJSON} = renderQuickbooksOnlineSetupPage();

        expect(toJSON()).toBeNull();
    });
});
