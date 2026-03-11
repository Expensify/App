/* eslint-disable @typescript-eslint/naming-convention */
import {act, render, screen} from '@testing-library/react-native';
import React from 'react';
import Onyx from 'react-native-onyx';
import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import GetStartedTravel from '@pages/workspace/travel/BookOrManageYourTrip';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy} from '@src/types/onyx';
import createRandomPolicy from '../utils/collections/policies';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

const POLICY_ID = 'testPolicy123';
const WORKSPACE_ACCOUNT_ID = 999888;

jest.mock('@react-navigation/native', () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-unsafe-assignment
    const actualNav = jest.requireActual('@react-navigation/native');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return {
        ...actualNav,
        useIsFocused: () => true,
        useRoute: () => ({
            key: 'test-route',
            name: 'Workspace_Travel',
            params: {policyID: 'testPolicy123'},
        }),
        usePreventRemove: jest.fn(),
    };
});

jest.mock('@src/hooks/useResponsiveLayout');

jest.mock('@hooks/useWorkspaceAccountID', () => ({
    __esModule: true,
    default: () => 999888,
}));

jest.mock('@hooks/useScreenWrapperTransitionStatus', () => ({
    __esModule: true,
    default: () => ({didScreenTransitionEnd: true}),
}));

jest.mock('@hooks/useLazyAsset', () => ({
    useMemoizedLazyExpensifyIcons: jest.fn(() => ({
        LuggageWithLines: 'LuggageWithLines',
        NewWindow: 'NewWindow',
    })),
    useMemoizedLazyIllustrations: jest.fn(() => ({
        RocketDude: 'RocketDude',
    })),
}));

jest.mock('@libs/openTravelDotLink', () => ({
    openTravelDotLink: jest.fn(),
}));

const mockPolicy: Policy = {
    ...createRandomPolicy(parseInt(POLICY_ID, 10) || 1),
    type: CONST.POLICY.TYPE.CORPORATE,
    pendingAction: null,
    role: CONST.POLICY.ROLE.ADMIN,
};

const renderGetStartedTravel = () => {
    return render(
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider]}>
            <GetStartedTravel policyID={POLICY_ID} />
        </ComposeProviders>,
    );
};

describe('BookOrManageYourTrip', () => {
    beforeAll(async () => {
        Onyx.init({keys: ONYXKEYS});
    });

    afterEach(async () => {
        jest.clearAllMocks();
        await act(async () => {
            await Onyx.clear();
            await waitForBatchedUpdatesWithAct();
        });
    });

    describe('Booking section', () => {
        it('renders without the travel invoicing beta', async () => {
            await act(async () => {
                await Onyx.merge(ONYXKEYS.BETAS, []);
                await waitForBatchedUpdatesWithAct();
            });

            renderGetStartedTravel();
            await waitForBatchedUpdatesWithAct();

            expect(screen.getByText('Travel booking')).toBeTruthy();
            expect(screen.getByText('Book or manage')).toBeTruthy();
        });

        it('renders with the travel invoicing beta', async () => {
            await act(async () => {
                await Onyx.merge(ONYXKEYS.BETAS, [CONST.BETAS.TRAVEL_INVOICING]);
                await waitForBatchedUpdatesWithAct();
            });

            renderGetStartedTravel();
            await waitForBatchedUpdatesWithAct();

            expect(screen.getByText('Travel booking')).toBeTruthy();
            expect(screen.getByText('Book or manage')).toBeTruthy();
        });
    });

    describe('Invoicing section beta gate', () => {
        it('is hidden without the travel invoicing beta', async () => {
            await act(async () => {
                await Onyx.merge(ONYXKEYS.BETAS, []);
                await waitForBatchedUpdatesWithAct();
            });

            renderGetStartedTravel();
            await waitForBatchedUpdatesWithAct();

            expect(screen.queryByText('Central invoicing')).toBeNull();
        });

        it('is visible with the travel invoicing beta', async () => {
            await act(async () => {
                await Onyx.merge(ONYXKEYS.BETAS, [CONST.BETAS.TRAVEL_INVOICING]);
                await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, mockPolicy);
                await waitForBatchedUpdatesWithAct();
            });

            renderGetStartedTravel();
            await waitForBatchedUpdatesWithAct();

            expect(screen.getByText('Central invoicing')).toBeTruthy();
        });
    });
});
