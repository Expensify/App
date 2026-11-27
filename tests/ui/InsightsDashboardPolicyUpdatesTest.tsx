/** Keeps the Insights dashboard from rendering on policy writes that change nothing it shows. */
import {act, render, screen} from '@testing-library/react-native';

import MockText from '@components/Text';

import INSIGHTS_DASHBOARD_SPECS from '@pages/Insights/dashboardSpecs';
import InsightsDashboard from '@pages/Insights/InsightsDashboard';
import DEFAULT_INSIGHTS_FILTERS from '@pages/Insights/insightsFilters';
import {buildInsightsQueryString} from '@pages/Insights/insightsQueries';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy} from '@src/types/onyx';

import type * as NativeNavigation from '@react-navigation/native';
import type {ScrollViewProps, View as NativeView} from 'react-native';

import React, {Profiler} from 'react';
import Onyx from 'react-native-onyx';

import createRandomPolicy from '../utils/collections/policies';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

jest.mock('@components/ScreenWrapper', () => jest.requireActual<{View: typeof NativeView}>('react-native').View);
jest.mock('@components/ScrollView', () => jest.requireActual<{ScrollView: React.ComponentType<ScrollViewProps>}>('react-native').ScrollView);
jest.mock('@components/Navigation/TopBar', () => () => null);
jest.mock('@components/Navigation/TabBarBottomContent/TabRootScrollViewMarker', () => jest.requireActual<{View: typeof NativeView}>('react-native').View);
jest.mock('@components/Navigation/TabBarBottomContent/useTabRootScreenWrapperProps', () => () => ({}));
jest.mock('@components/Navigation/TabBarBottomContent/useTabRootScrollProps', () => (contentContainerStyle: unknown) => ({contentContainerStyle}));
jest.mock('@hooks/useCurrentUserPersonalDetails', () => () => ({}));
jest.mock('@hooks/useIsTabVisible', () => () => false);
jest.mock('@hooks/useLocalize', () => () => ({translate: (key: string) => key, numberFormat: String}));
jest.mock('@hooks/useMultipleSnapshots', () => () => ({}));
jest.mock('@hooks/useNetwork', () => () => ({isOffline: false}));
jest.mock('@hooks/useScrollEventEmitter', () => () => jest.fn());
jest.mock('@react-navigation/native', () => ({
    ...jest.requireActual<typeof NativeNavigation>('@react-navigation/native'),
    useIsFocused: () => true,
}));
jest.mock('@pages/Insights/charts/InsightsChartWidget', () => () => null);
jest.mock('@pages/Insights/controls/InsightsPageControls', () => () => null);
jest.mock('@pages/Insights/InsightsTagPolicyLoader', () => () => null);
jest.mock('@pages/Insights/states/InsightsEmptyState', () => () => null);
jest.mock('@pages/Insights/states/InsightsUpsellState', () => ({upgradeablePolicyIDs}: {upgradeablePolicyIDs: string[]}) => (
    <MockText>{`Upgrade ${upgradeablePolicyIDs.join(',')}`}</MockText>
));
jest.mock('@pages/Insights/useInsightsExport', () => () => ({}));

const POLICY_ID = '1';
const POLICY_KEY = `${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}` as const;
const OTHER_POLICY_ID = '2';
const COMPLIANCE = CONST.INSIGHTS.DASHBOARD.COMPLIANCE;

/** Builds a Collect workspace the user administers, which Compliance can offer for the Control upgrade. */
function buildCollectPolicy(id: string): Policy {
    return {...createRandomPolicy(Number(id), CONST.POLICY.TYPE.TEAM), id, role: CONST.POLICY.ROLE.ADMIN};
}

/** Stores the workspace filter the way a control saves it, which is where the real filters hook reads it from. */
async function selectWorkspaces(policyIDs: string[]) {
    const query = buildInsightsQueryString({...DEFAULT_INSIGHTS_FILTERS[COMPLIANCE], groupCurrency: CONST.CURRENCY.USD, policyIDs});
    await act(async () => {
        await Onyx.merge(ONYXKEYS.SEARCH_FILTERS, {[INSIGHTS_DASHBOARD_SPECS[COMPLIANCE].searchKey]: {query}});
        await waitForBatchedUpdates();
    });
}

/** Renders Compliance, the dashboard whose upsell depends on the workspaces' plans, and counts its commits. */
function renderDashboard() {
    const onRender = jest.fn();
    render(
        <Profiler
            id="InsightsDashboard"
            onRender={onRender}
        >
            <InsightsDashboard
                dashboardID={COMPLIANCE}
                accessibleDashboards={[COMPLIANCE]}
            />
        </Profiler>,
    );
    return onRender;
}

async function mergePolicy(update: Partial<Policy>) {
    await act(async () => {
        await Onyx.merge(POLICY_KEY, update);
        await waitForBatchedUpdates();
    });
}

describe('Insights dashboard policy updates', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        await Onyx.clear();
        // A Collect workspace the user administers and has as their default, so Compliance opens on the upsell and offers it for
        // the upgrade, and the filters hook reads it for the default currency. The page's own subscriptions stay unmocked.
        await Onyx.merge(POLICY_KEY, buildCollectPolicy(POLICY_ID));
        await Onyx.merge(ONYXKEYS.NVP_ACTIVE_POLICY_ID, POLICY_ID);
        await waitForBatchedUpdates();
    });

    it.each<[string, Partial<Policy>]>([
        ['its name', {name: 'Renamed workspace'}],
        ['a pending field', {pendingFields: {name: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE}}],
    ])('does not render when the default workspace changes %s', async (_field, update) => {
        // Given a dashboard that has settled on the upsell
        const onRender = renderDashboard();
        await screen.findByText(`Upgrade ${POLICY_ID}`);
        const settledRenderCount = onRender.mock.calls.length;

        // When a write to the workspace users edit most changes a field the dashboard decides nothing from
        await mergePolicy(update);

        // Then the dashboard does not render, because such writes are frequent and a render redraws every chart
        expect(onRender).toHaveBeenCalledTimes(settledRenderCount);
        expect(screen.getByText(`Upgrade ${POLICY_ID}`)).toBeOnTheScreen();
    });

    it('drops the upsell when the workspace moves to Control', async () => {
        // Given a dashboard that has settled on the upsell
        renderDashboard();
        await screen.findByText(`Upgrade ${POLICY_ID}`);

        // When the workspace is upgraded, which is one of the fields the upsell is decided from
        await mergePolicy({type: CONST.POLICY.TYPE.CORPORATE});

        // Then the upsell goes away, since a Control workspace can now feed the dashboard
        expect(screen.queryByText(`Upgrade ${POLICY_ID}`)).toBeNull();
    });

    it('stops offering a workspace for the upgrade once the user can no longer edit it', async () => {
        // Given a dashboard whose upsell offers the administered workspace
        renderDashboard();
        await screen.findByText(`Upgrade ${POLICY_ID}`);

        // When the user is demoted to a member, who cannot open the workspace's upgrade page
        await mergePolicy({role: CONST.POLICY.ROLE.USER});

        // Then the upsell stays, since there is still no Control workspace, but it has no workspace to send the user to
        expect(screen.getByText('Upgrade ')).toBeOnTheScreen();
    });

    it('offers only the workspaces the filter selects for the upgrade', async () => {
        // Given two administered Collect workspaces, both offered while the filter covers every workspace
        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${OTHER_POLICY_ID}`, buildCollectPolicy(OTHER_POLICY_ID));
            await waitForBatchedUpdates();
        });
        renderDashboard();
        await screen.findByText(`Upgrade ${POLICY_ID},${OTHER_POLICY_ID}`);

        // When the user narrows the filter to one of them, which changes no policy
        await selectWorkspaces([OTHER_POLICY_ID]);

        // Then the upsell offers only the selected workspace, even though no policy changed
        expect(screen.getByText(`Upgrade ${OTHER_POLICY_ID}`)).toBeOnTheScreen();
    });
});
