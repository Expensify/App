import {fireEvent, render, screen} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';

import Navigation from '@libs/Navigation/Navigation';

import InsightsUpsellState from '@pages/Insights/states/InsightsUpsellState';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

import React from 'react';
import Onyx from 'react-native-onyx';

import * as TestHelper from '../utils/TestHelper';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

jest.mock('@libs/Navigation/Navigation');

jest.mock('@hooks/useLazyAsset', () => ({
    useMemoizedLazyIllustrations: jest.fn((illustrations: string[]) => Object.fromEntries(illustrations.map((name) => [name, 1]))),
    useMemoizedLazyExpensifyIcons: jest.fn((icons: string[]) => Object.fromEntries(icons.map((name) => [name, 1]))),
    useMemoizedLazyAsset: jest.fn(() => ({asset: 1})),
}));

const INSIGHTS_ROUTE = `/${ROUTES.INSIGHTS.getRoute(CONST.INSIGHTS.DASHBOARD.COMPLIANCE)}`;

async function renderAndPressUpgrade(upgradeablePolicyIDs: string[]) {
    render(
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider]}>
            <InsightsUpsellState upgradeablePolicyIDs={upgradeablePolicyIDs} />
        </ComposeProviders>,
    );
    await waitForBatchedUpdatesWithAct();
    fireEvent.press(screen.getByText(TestHelper.translateLocal('insightsPage.upsellState.button')));
}

describe('InsightsUpsellState', () => {
    beforeAll(() => Onyx.init({keys: ONYXKEYS}));

    beforeEach(() => {
        jest.mocked(Navigation.getActiveRoute).mockReturnValue(INSIGHTS_ROUTE);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('returns to the Insights dashboard after upgrading the one workspace in scope', async () => {
        // Given the user is on the Compliance dashboard with a single workspace they could upgrade
        // When they press the upgrade button
        await renderAndPressUpgrade(['1']);

        // Then the upgrade page receives the dashboard as backTo, because without it a Rules upgrade sends the user to More features
        expect(Navigation.navigate).toHaveBeenCalledWith(ROUTES.WORKSPACE_UPGRADE.getRoute('1', CONST.UPGRADE_FEATURE_INTRO_MAPPING.rules.alias, INSIGHTS_ROUTE));
    });

    it('keeps the dashboard as backTo on the generic Control pitch when several workspaces qualify', async () => {
        // Given the user could upgrade more than one workspace, so the upsell cannot pick one for them
        // When they press the upgrade button
        await renderAndPressUpgrade(['1', '2']);

        // Then the generic pitch still knows the dashboard, so its workspace list can lead back to Insights
        expect(Navigation.navigate).toHaveBeenCalledWith(ROUTES.WORKSPACE_UPGRADE.getRoute(undefined, CONST.UPGRADE_FEATURE_INTRO_MAPPING.rules.alias, INSIGHTS_ROUTE));
    });
});
