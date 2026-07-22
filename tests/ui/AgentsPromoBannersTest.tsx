import {act, render, screen} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';

import PolicyRulesPage from '@pages/workspace/rules/PolicyRulesPage';

import CONST from '@src/CONST';
import en from '@src/languages/en';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';
import type {Policy} from '@src/types/onyx';

import React from 'react';
import Onyx from 'react-native-onyx';

import createRandomPolicy from '../utils/collections/policies';
import {buildPersonalDetails} from '../utils/TestHelper';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

const POLICY_ID = 'agents-banner-policy';
const USER_EMAIL = 'admin@example.com';
const USER_ACCOUNT_ID = 42;

jest.mock('@react-navigation/native', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const actualNav = jest.requireActual('@react-navigation/native');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return {
        ...actualNav,
        useIsFocused: () => true,
        usePreventRemove: jest.fn(),
    };
});

jest.mock('@libs/Navigation/Navigation', () => ({
    goBack: jest.fn(),
    navigate: jest.fn(),
    getActiveRouteWithoutParams: jest.fn(() => ''),
    isNavigationReady: jest.fn(() => Promise.resolve()),
    setNavigationActionToMicrotaskQueue: (cb: () => void) => cb(),
}));

jest.mock('@libs/actions/Policy/Rules', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const actual = jest.requireActual('@libs/actions/Policy/Rules');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return {
        ...actual,
        openPolicyRulesPage: jest.fn(),
    };
});

jest.mock('@components/RenderHTML', () => {
    const ReactMock = require('react') as typeof React;

    const {Text} = require('react-native') as {Text: React.ComponentType<{children?: React.ReactNode}>};

    return ({html}: {html: string}) => {
        const plainText = html.replaceAll(/<[^>]*>/g, '');
        return ReactMock.createElement(Text, null, plainText);
    };
});

function buildPolicy(): Policy {
    const base = createRandomPolicy(1);
    return {
        ...base,
        id: POLICY_ID,
        name: 'Test Workspace',
        type: CONST.POLICY.TYPE.CORPORATE,
        role: CONST.POLICY.ROLE.ADMIN,
        owner: USER_EMAIL,
        outputCurrency: 'USD',
        approvalMode: CONST.POLICY.APPROVAL_MODE.BASIC,
        isPolicyExpenseChatEnabled: true,
        areWorkflowsEnabled: true,
        areRulesEnabled: true,
        pendingAction: null,
        errors: {},
        errorFields: {},
        employeeList: {
            [USER_EMAIL]: {
                email: USER_EMAIL,
                role: CONST.POLICY.ROLE.ADMIN,
            },
        },
    } as Policy;
}

const rulesRoute = {
    key: 'rules-route',
    name: SCREENS.WORKSPACE.RULES,
    params: {policyID: POLICY_ID},
} as never;

const renderRulesPage = () =>
    render(
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider]}>
            {/* @ts-expect-error - navigation prop is not used by the page in tests */}
            <PolicyRulesPage route={rulesRoute} />
        </ComposeProviders>,
    );

async function setupOnyxBaseline({withCustomAgentBeta}: {withCustomAgentBeta: boolean}) {
    await Onyx.clear();
    await Onyx.set(ONYXKEYS.HAS_LOADED_APP, true);
    await Onyx.set(ONYXKEYS.IS_LOADING_REPORT_DATA, false);
    await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, buildPolicy());
    await Onyx.set(ONYXKEYS.PERSONAL_DETAILS_LIST, {
        [USER_ACCOUNT_ID]: buildPersonalDetails(USER_EMAIL, USER_ACCOUNT_ID, 'Admin'),
    });
    await Onyx.merge(ONYXKEYS.SESSION, {email: USER_EMAIL, accountID: USER_ACCOUNT_ID});
    if (withCustomAgentBeta) {
        await Onyx.set(ONYXKEYS.BETAS, [CONST.BETAS.CUSTOM_AGENT]);
    }
}

describe('Agents promo banners', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    afterEach(async () => {
        jest.clearAllMocks();
        await act(async () => {
            await Onyx.clear();
            await waitForBatchedUpdatesWithAct();
        });
    });

    it('renders agentsRulesBanner above IndividualExpenseRulesSection when customAgent beta is active, and hides it after dismissal', async () => {
        await act(async () => {
            await setupOnyxBaseline({withCustomAgentBeta: true});
            await waitForBatchedUpdatesWithAct();
        });

        renderRulesPage();
        await waitForBatchedUpdatesWithAct();

        // Title includes a nested "New" badge, so match on subtitle instead of the full title string.
        expect(screen.getByText(en.workspace.rules.agentsPromoBanner.subtitle)).toBeTruthy();
        // Section title for IndividualExpenseRulesSection sits below the banner.
        expect(screen.getByText(en.workspace.rules.individualExpenseRules.title)).toBeTruthy();

        await act(async () => {
            await Onyx.merge(ONYXKEYS.NVP_DISMISSED_PRODUCT_TRAINING, {
                [CONST.AGENTS_RULES_BANNER]: {timestamp: '2026-05-20', dismissedMethod: 'x'},
            });
            await waitForBatchedUpdatesWithAct();
        });

        expect(screen.queryByText(en.workspace.rules.agentsPromoBanner.subtitle)).toBeNull();
    });

    it('does not render the agents rules banner when customAgent beta is inactive', async () => {
        await act(async () => {
            await setupOnyxBaseline({withCustomAgentBeta: false});
            await waitForBatchedUpdatesWithAct();
        });

        renderRulesPage();
        await waitForBatchedUpdatesWithAct();
        expect(screen.queryByText(en.workspace.rules.agentsPromoBanner.subtitle)).toBeNull();
    });
});
