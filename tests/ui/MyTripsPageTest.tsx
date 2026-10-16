import {render, screen} from '@testing-library/react-native';

import Navigation from '@libs/Navigation/Navigation';

import MyTripsPage from '@pages/Travel/MyTripsPage';
import type {MyTripsPageProps} from '@pages/Travel/MyTripsPage';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy} from '@src/types/onyx';

import React from 'react';
import Onyx from 'react-native-onyx';

import createRandomPolicy from '../utils/collections/policies';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

const PERSONAL_POLICY_ID = 'personalPolicy123';
const PENDING_POLICY_ID = 'pendingPolicy456';
const PAID_POLICY_ID = 'paidPolicy789';
const DEFAULT_POLICY_ID = 'defaultPolicy000';
const OTHER_TRAVEL_POLICY_ID = 'otherTravelPolicy111';
const ROUTE_KEY = 'Travel_MyTrips-route-key';

let mockIsFocused = true;

jest.mock('@react-navigation/native', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const actualNav = jest.requireActual('@react-navigation/native');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return {
        ...actualNav,
        useIsFocused: () => mockIsFocused,
    };
});

jest.mock('@libs/Navigation/Navigation', () => ({
    __esModule: true,
    default: {
        setParams: jest.fn(),
        navigate: jest.fn(),
        goBack: jest.fn(),
        getActiveRoute: jest.fn(() => ''),
        getActiveRouteWithoutParams: jest.fn(() => ''),
        isNavigationReady: jest.fn(() => Promise.resolve()),
    },
}));

// The page is only responsible for picking the policyID it hands down, so the wrapper and the content are stubbed out
// with a marker that exposes the resolved value.
jest.mock('@pages/workspace/AccessOrNotFoundWrapper', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
    const ReactMock = require('react') as typeof React;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
    const {Text} = require('react-native') as {Text: React.ComponentType<{testID?: string; children?: React.ReactNode}>};

    return ({policyID, children}: {policyID?: string; children: React.ReactNode}) =>
        ReactMock.createElement(ReactMock.Fragment, null, ReactMock.createElement(Text, {testID: 'wrapper-policyID'}, policyID ?? 'undefined'), children);
});

jest.mock('@pages/Travel/ManageTrips', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
    const ReactMock = require('react') as typeof React;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
    const {Text} = require('react-native') as {Text: React.ComponentType<{testID?: string; children?: React.ReactNode}>};

    return ({policyID}: {policyID: string}) => ReactMock.createElement(Text, {testID: 'manage-trips-policyID'}, policyID);
});

jest.mock('@components/ScreenWrapper', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
    const ReactMock = require('react') as typeof React;
    return ({children}: {children: React.ReactNode}) => ReactMock.createElement(ReactMock.Fragment, null, children);
});

jest.mock('@components/HeaderWithBackButton', () => () => null);

const personalPolicy: Policy = {
    ...createRandomPolicy(1, CONST.POLICY.TYPE.PERSONAL),
    id: PERSONAL_POLICY_ID,
    pendingAction: null,
};

// A workspace the backend rejected stays in Onyx with a pending add action.
const pendingPolicy: Policy = {
    ...createRandomPolicy(2, CONST.POLICY.TYPE.TEAM),
    id: PENDING_POLICY_ID,
    pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
};

const paidPolicy: Policy = {
    ...createRandomPolicy(3, CONST.POLICY.TYPE.CORPORATE),
    id: PAID_POLICY_ID,
    pendingAction: null,
};

// Two workspaces that can both book travel: the default one and another one the user can open the page with.
const travelSettings = {spotnanaCompanyID: 'spotnana-company-uuid', associatedTravelDomainAccountID: 'spotnana-entity-uuid', hasAcceptedTerms: true};

const defaultPolicy: Policy = {
    ...createRandomPolicy(4, CONST.POLICY.TYPE.TEAM),
    id: DEFAULT_POLICY_ID,
    pendingAction: null,
    isTravelEnabled: true,
    travelSettings,
};

const otherTravelEnabledPolicy: Policy = {
    ...createRandomPolicy(5, CONST.POLICY.TYPE.CORPORATE),
    id: OTHER_TRAVEL_POLICY_ID,
    pendingAction: null,
    isTravelEnabled: true,
    travelSettings,
};

function renderMyTripsPage(policyID?: string): ReturnType<typeof render> {
    return render(
        <MyTripsPage
            // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
            {...({
                route: {key: ROUTE_KEY, name: 'Travel_MyTrips', params: policyID ? {policyID} : {}},
                navigation: {},
            } as unknown as MyTripsPageProps)}
        />,
    );
}

async function setupOnyx(activePolicyID?: string) {
    await Onyx.multiSet({
        [`${ONYXKEYS.COLLECTION.POLICY}${PERSONAL_POLICY_ID}`]: personalPolicy,
        [`${ONYXKEYS.COLLECTION.POLICY}${PENDING_POLICY_ID}`]: pendingPolicy,
        [`${ONYXKEYS.COLLECTION.POLICY}${PAID_POLICY_ID}`]: paidPolicy,
        [`${ONYXKEYS.COLLECTION.POLICY}${DEFAULT_POLICY_ID}`]: defaultPolicy,
        [`${ONYXKEYS.COLLECTION.POLICY}${OTHER_TRAVEL_POLICY_ID}`]: otherTravelEnabledPolicy,
        ...(activePolicyID ? {[ONYXKEYS.NVP_ACTIVE_POLICY_ID]: activePolicyID} : {}),
    });
    await waitForBatchedUpdatesWithAct();
}

describe('MyTripsPage', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        mockIsFocused = true;
        jest.clearAllMocks();
        await Onyx.clear();
        await waitForBatchedUpdatesWithAct();
    });

    it('falls back to the default workspace when the params hold a personal workspace', async () => {
        await setupOnyx(DEFAULT_POLICY_ID);

        renderMyTripsPage(PERSONAL_POLICY_ID);
        await waitForBatchedUpdatesWithAct();

        expect(screen.getByTestId('manage-trips-policyID')).toHaveTextContent(DEFAULT_POLICY_ID);
        expect(screen.getByTestId('wrapper-policyID')).toHaveTextContent(DEFAULT_POLICY_ID);
        expect(Navigation.setParams).toHaveBeenCalledWith({policyID: DEFAULT_POLICY_ID}, ROUTE_KEY);
    });

    it('falls back to the default workspace when the params hold a workspace that was never created', async () => {
        await setupOnyx(DEFAULT_POLICY_ID);

        renderMyTripsPage(PENDING_POLICY_ID);
        await waitForBatchedUpdatesWithAct();

        expect(screen.getByTestId('manage-trips-policyID')).toHaveTextContent(DEFAULT_POLICY_ID);
        expect(Navigation.setParams).toHaveBeenCalledWith({policyID: DEFAULT_POLICY_ID}, ROUTE_KEY);
    });

    it('keeps a paid workspace from the params even when it is not the default one', async () => {
        await setupOnyx(DEFAULT_POLICY_ID);

        renderMyTripsPage(PAID_POLICY_ID);
        await waitForBatchedUpdatesWithAct();

        expect(screen.getByTestId('manage-trips-policyID')).toHaveTextContent(PAID_POLICY_ID);
        expect(Navigation.setParams).not.toHaveBeenCalled();
    });

    it('keeps the non-default workspace when the user opens the page with one of two travel enabled workspaces', async () => {
        await setupOnyx(DEFAULT_POLICY_ID);

        renderMyTripsPage(OTHER_TRAVEL_POLICY_ID);
        await waitForBatchedUpdatesWithAct();

        expect(screen.getByTestId('manage-trips-policyID')).toHaveTextContent(OTHER_TRAVEL_POLICY_ID);
        expect(screen.getByTestId('wrapper-policyID')).toHaveTextContent(OTHER_TRAVEL_POLICY_ID);
        expect(Navigation.setParams).not.toHaveBeenCalled();
    });

    it('keeps an unknown workspace from the params so it still resolves to the not found page', async () => {
        await setupOnyx(DEFAULT_POLICY_ID);

        renderMyTripsPage('unknownPolicyID');
        await waitForBatchedUpdatesWithAct();

        expect(screen.getByTestId('manage-trips-policyID')).toHaveTextContent('unknownPolicyID');
        expect(screen.getByTestId('wrapper-policyID')).toHaveTextContent('unknownPolicyID');
        expect(Navigation.setParams).not.toHaveBeenCalled();
    });

    it('keeps the personal workspace when there is no default workspace to fall back to', async () => {
        await setupOnyx();

        renderMyTripsPage(PERSONAL_POLICY_ID);
        await waitForBatchedUpdatesWithAct();

        expect(screen.getByTestId('manage-trips-policyID')).toHaveTextContent(PERSONAL_POLICY_ID);
        expect(Navigation.setParams).not.toHaveBeenCalled();
    });

    it('does not rewrite the params when the personal workspace already is the default one', async () => {
        await setupOnyx(PERSONAL_POLICY_ID);

        renderMyTripsPage(PERSONAL_POLICY_ID);
        await waitForBatchedUpdatesWithAct();

        expect(screen.getByTestId('manage-trips-policyID')).toHaveTextContent(PERSONAL_POLICY_ID);
        expect(Navigation.setParams).not.toHaveBeenCalled();
    });

    it('does not rewrite the params while the screen is not focused', async () => {
        mockIsFocused = false;
        await setupOnyx(DEFAULT_POLICY_ID);

        renderMyTripsPage(PERSONAL_POLICY_ID);
        await waitForBatchedUpdatesWithAct();

        expect(screen.getByTestId('manage-trips-policyID')).toHaveTextContent(DEFAULT_POLICY_ID);
        expect(Navigation.setParams).not.toHaveBeenCalled();
    });
});
