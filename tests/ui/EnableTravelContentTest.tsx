import {render, screen} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';

import EnableTravelContent from '@pages/Travel/EnableTravel/EnableTravelContent';

import CONST from '@src/CONST';
import IntlStore from '@src/languages/IntlStore';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Account, Policy, PrivatePersonalDetails} from '@src/types/onyx';

import {PortalProvider} from '@gorhom/portal';
import React from 'react';
import Onyx from 'react-native-onyx';

import createRandomPolicy from '../utils/collections/policies';
import * as TestHelper from '../utils/TestHelper';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

const POLICY_ID = 'testPolicy123';

let mockRouteParams: {subPage?: string; action?: 'edit'} = {subPage: CONST.TRAVEL.ENABLE_FLOW.PAGE_NAME.TERMS};

jest.mock('@react-navigation/native', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const actualNav = jest.requireActual('@react-navigation/native');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return {
        ...actualNav,
        useRoute: () => ({key: 'test-route', name: 'Travel_Enable', params: mockRouteParams}),
        useNavigation: () => ({setParams: jest.fn()}),
        usePreventRemove: jest.fn(),
    };
});

jest.mock('@libs/Navigation/Navigation', () => ({
    __esModule: true,
    default: {
        navigate: jest.fn(),
        goBack: jest.fn(),
        closeRHPFlow: jest.fn(),
        getActiveRoute: jest.fn(() => ''),
        getActiveRouteWithoutParams: jest.fn(() => ''),
        isNavigationReady: jest.fn(() => Promise.resolve()),
        isTopmostRouteModalScreen: jest.fn(() => false),
    },
}));

jest.mock('@hooks/useConfirmModal', () => jest.fn().mockImplementation(() => ({showConfirmModal: jest.fn(), closeModal: jest.fn()})));

jest.mock('@components/RenderHTML', () => {
    const ReactMock = require('react') as typeof React;
    const {Text} = require('react-native') as {Text: React.ComponentType<{children?: React.ReactNode}>};

    return ({html}: {html: string}) => {
        const plainText = html.replaceAll(/<[^>]*>/g, '');
        return ReactMock.createElement(Text, null, plainText);
    };
});

// A workspace that is already provisioned in Spotnana, so domain selection, address and tax ID are never needed.
const PROVISIONED_POLICY: Policy = {
    ...createRandomPolicy(1, CONST.POLICY.TYPE.CORPORATE),
    id: POLICY_ID,
    outputCurrency: CONST.CURRENCY.USD,
    travelSettings: {spotnanaCompanyID: 'spotnana-company-uuid'},
};

const VALIDATED_ACCOUNT: Partial<Account> = {validated: true, primaryLogin: 'admin@company.com'};
const COMPLETE_PERSONAL_DETAILS: Partial<PrivatePersonalDetails> = {legalFirstName: 'Test', legalLastName: 'User'};

function renderContent(policy: Policy, account: Partial<Account>, privatePersonalDetails: Partial<PrivatePersonalDetails>) {
    return render(
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider]}>
            <PortalProvider>
                <EnableTravelContent
                    policy={policy}
                    policyID={POLICY_ID}
                    account={account}
                    privatePersonalDetails={privatePersonalDetails}
                    travelProvisioning={undefined}
                />
            </PortalProvider>
        </ComposeProviders>,
    );
}

describe('EnableTravelContent', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
        return IntlStore.load(CONST.LOCALES.EN);
    });

    afterEach(async () => {
        mockRouteParams = {subPage: CONST.TRAVEL.ENABLE_FLOW.PAGE_NAME.TERMS};
        jest.clearAllMocks();
        await Onyx.clear();
    });

    it('hides the progress stepper and shows only the terms step when no other step is needed', async () => {
        renderContent(PROVISIONED_POLICY, VALIDATED_ACCOUNT, COMPLETE_PERSONAL_DETAILS);
        await waitForBatchedUpdatesWithAct();

        // A single-step flow is not meaningful, so no progress dots should render
        expect(screen.queryAllByRole('group')).toHaveLength(0);
        expect(screen.getByText(TestHelper.translateLocal('travel.termsAndConditions.title'))).toBeTruthy();
    });

    it('shows a 2-step progress bar when only the legal name is missing', async () => {
        renderContent(PROVISIONED_POLICY, VALIDATED_ACCOUNT, {});
        await waitForBatchedUpdatesWithAct();

        expect(screen.queryAllByRole('group')).toHaveLength(2);
    });

    it('shows a 2-step progress bar when only account verification is needed', async () => {
        renderContent(PROVISIONED_POLICY, {validated: false, primaryLogin: 'admin@company.com'}, COMPLETE_PERSONAL_DETAILS);
        await waitForBatchedUpdatesWithAct();

        expect(screen.queryAllByRole('group')).toHaveLength(2);
    });

    it('does not require a domain selector, address, or tax ID step for an already-provisioned workspace regardless of currency or domains', async () => {
        const policy: Policy = {
            ...PROVISIONED_POLICY,
            outputCurrency: 'GBP',
            address: undefined,
            employeeList: {
                'admin1@domain-a.com': {role: CONST.POLICY.ROLE.ADMIN},
                'admin2@domain-b.com': {role: CONST.POLICY.ROLE.ADMIN},
            },
        };
        renderContent(policy, VALIDATED_ACCOUNT, COMPLETE_PERSONAL_DETAILS);
        await waitForBatchedUpdatesWithAct();

        expect(screen.queryAllByRole('group')).toHaveLength(0);
    });

    it('shows a step for every applicable condition on an unprovisioned, non-USD workspace with multiple admin domains and no address', async () => {
        const policy: Policy = {
            ...createRandomPolicy(2, CONST.POLICY.TYPE.CORPORATE),
            id: POLICY_ID,
            outputCurrency: 'GBP',
            travelSettings: {},
            address: undefined,
            employeeList: {
                'admin1@domain-a.com': {role: CONST.POLICY.ROLE.ADMIN},
                'admin2@domain-b.com': {role: CONST.POLICY.ROLE.ADMIN},
            },
        };
        renderContent(policy, {validated: false, primaryLogin: 'admin1@domain-a.com'}, {});
        await waitForBatchedUpdatesWithAct();

        // legal name, verify account, domain selector, workspace address, tax ID, terms
        expect(screen.queryAllByRole('group')).toHaveLength(6);
    });
});
